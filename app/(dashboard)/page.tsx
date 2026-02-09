import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Package,
  Boxes,
  TrendingUp,
  AlertTriangle,
  TrendingDown,
  CreditCard,
  Banknote,
  QrCode,
  ShoppingBag,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const LOW_STOCK_THRESHOLD = 10;

const paymentIcons: Record<string, typeof CreditCard> = {
  cash: Banknote,
  qr: QrCode,
  card: CreditCard,
};

const paymentLabels: Record<string, string> = {
  cash: "Efectivo",
  qr: "QR",
  card: "Tarjeta",
};

const paymentColors: Record<string, string> = {
  cash: "bg-green-100 text-green-800",
  qr: "bg-blue-100 text-blue-800",
  card: "bg-purple-100 text-purple-800",
};

// Helper para formatear números con separadores de miles
function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-BO").format(num);
}

// Helper para formatear moneda boliviana
function formatCurrency(amount: number): string {
  return `Bs ${new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

// Helper para obtener iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user's profile for organization_id
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const orgId = profile!.organization_id;

  // ── Parallel data fetching ────────────────────────────────────────────────

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    productsResult,
    inventoryResult,
    salesTodayResult,
    lowStockResult,
    recentSalesResult,
  ] = await Promise.all([
    // Total products
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("is_active", true),

    // Total stock (sum of all inventory)
    supabase
      .from("inventory")
      .select("quantity, product_id, products!inner(organization_id)")
      .eq("products.organization_id", orgId),

    // Today's sales
    supabase
      .from("sales")
      .select("total")
      .eq("organization_id", orgId)
      .gte("created_at", todayStart.toISOString()),

    // Low stock products
    supabase
      .from("inventory")
      .select(
        `
        quantity,
        min_stock,
        location_id,
        locations(name),
        products!inner(id, name, sku, organization_id)
      `
      )
      .eq("products.organization_id", orgId)
      .lt("quantity", LOW_STOCK_THRESHOLD)
      .order("quantity", { ascending: true })
      .limit(10),

    // Last 5 sales
    supabase
      .from("sales")
      .select(
        `
        id,
        total,
        subtotal,
        discount,
        payment_method,
        created_at,
        customer_name,
        profiles(full_name),
        locations(name),
        sale_items(quantity)
      `
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // ── Compute stats ─────────────────────────────────────────────────────────

  const totalProducts = productsResult.count || 0;

  const totalStock =
    inventoryResult.data?.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    ) || 0;

  const salesTodayTotal =
    salesTodayResult.data?.reduce((sum, sale) => sum + sale.total, 0) || 0;
  const salesTodayCount = salesTodayResult.data?.length || 0;

  const lowStockCount = lowStockResult.data?.length || 0;
  const lowStockItems = lowStockResult.data || [];
  const recentSales = recentSalesResult.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen general de tu negocio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Productos"
          value={formatNumber(totalProducts)}
          icon={Package}
          color="blue"
          subtitle="Productos activos"
          delay={0}
        />
        <StatsCard
          title="Stock Total"
          value={formatNumber(totalStock)}
          icon={Boxes}
          color="green"
          subtitle="Unidades en inventario"
          delay={100}
        />
        <StatsCard
          title="Ventas Hoy"
          value={formatCurrency(salesTodayTotal)}
          icon={TrendingUp}
          color="purple"
          subtitle={`${salesTodayCount} venta${salesTodayCount !== 1 ? "s" : ""}`}
          delay={200}
        />
        <StatsCard
          title="Bajo Stock"
          value={lowStockCount}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? "red" : "green"}
          subtitle={
            lowStockCount > 0 ? "Requieren atención" : "Todo en orden"
          }
          delay={300}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
                Stock Bajo
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              &lt; {LOW_STOCK_THRESHOLD} uds.
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                ¡Todo en orden!
              </p>
              <p className="text-xs text-gray-500">
                No hay productos con stock bajo
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStockItems.map((item: any, i: number) => {
                const qty = item.quantity;
                const badgeColor =
                  qty <= 3
                    ? "bg-red-100 text-red-800"
                    : qty <= 7
                      ? "bg-amber-100 text-amber-800"
                      : "bg-amber-100 text-amber-700";

                return (
                  <div
                    key={i}
                    className="px-4 sm:px-6 py-3 hover:bg-gray-50 transition-all duration-200 flex items-center justify-between gap-3"
                    style={{
                      animation: `fadeIn 0.4s ease-out ${i * 0.1}s both`,
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.products?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.products?.sku} · {(item.locations as any)?.name || "—"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${badgeColor}`}
                    >
                      {qty} {qty === 1 ? "ud" : "uds"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Últimas Ventas</h2>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                No hay ventas registradas
              </p>
              <p className="text-xs text-gray-500">
                ¡Empieza a vender!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentSales.map((sale: any, idx: number) => {
                const PayIcon =
                  paymentIcons[sale.payment_method] || CreditCard;
                const totalItems =
                  sale.sale_items?.reduce(
                    (sum: number, item: any) => sum + item.quantity,
                    0
                  ) || 0;
                const staffName = (sale.profiles as any)?.full_name || "Staff";
                const initials = getInitials(staffName);
                const paymentColor =
                  paymentColors[sale.payment_method] ||
                  "bg-gray-100 text-gray-800";
                const paymentLabel =
                  paymentLabels[sale.payment_method] || "Otro";

                return (
                  <div
                    key={sale.id}
                    className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
                    style={{
                      animation: `fadeIn 0.4s ease-out ${idx * 0.1}s both`,
                    }}
                  >
                    {/* Mobile: stacked layout / Desktop: horizontal */}
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs sm:text-sm shadow-sm">
                        {initials}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {sale.customer_name || "Venta directa"}
                          </p>
                          {sale.discount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800">
                              {((sale.discount / sale.subtotal) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${paymentColor}`}
                          >
                            <PayIcon className="w-3 h-3" />
                            {paymentLabel}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {(sale.locations as any)?.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            · {totalItems} ítem{totalItems !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(sale.total)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatDistanceToNow(new Date(sale.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
