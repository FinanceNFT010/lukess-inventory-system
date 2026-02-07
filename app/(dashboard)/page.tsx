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
  cash: "bg-success-100 text-success-800",
  qr: "bg-brand-100 text-brand-800",
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
        {/* Low Stock Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-gray-900">
                Productos con Stock Bajo
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              &lt; {LOW_STOCK_THRESHOLD} unidades
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
            <div className="table-container">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                      Producto
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                      Ubicación
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStockItems.map((item: any, i: number) => {
                    const qty = item.quantity;
                    const badgeColor =
                      qty <= 3
                        ? "bg-danger-100 text-danger-800"
                        : qty <= 7
                          ? "bg-warning-100 text-warning-800"
                          : "bg-warning-100 text-warning-700";

                    return (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {item.products?.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.products?.sku}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(item.locations as any)?.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${badgeColor}`}
                          >
                            {qty} {qty === 1 ? "unidad" : "unidades"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-gray-900">Últimas Ventas</h2>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                No hay ventas registradas hoy
              </p>
              <p className="text-xs text-gray-500">
                ¡Empieza a vender!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentSales.map((sale: any) => {
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
                    className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar con iniciales */}
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {sale.customer_name || "Venta directa"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-xs text-gray-500">
                            {staffName}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500">
                            {(sale.locations as any)?.name}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500">
                            {totalItems} ítem{totalItems !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Badge de método de pago */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${paymentColor}`}
                      >
                        <PayIcon className="w-3.5 h-3.5" />
                        {paymentLabel}
                      </span>

                      {/* Monto y fecha */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(sale.total)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
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
