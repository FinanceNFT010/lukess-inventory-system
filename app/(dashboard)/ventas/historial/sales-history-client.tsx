"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Download,
  MapPin,
  User,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Banknote,
  QrCode,
  CreditCard,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────────────────────

interface SaleItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  size: string | null;
  color: string | null;
  location_id: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
    image_url: string | null;
  };
  location: { name: string } | null;
}

interface Sale {
  id: string;
  created_at: string;
  customer_name: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: "cash" | "qr" | "card";
  location_id: string | null;
  sold_by: string | null;
  canal: "online" | "fisico" | null;
  order_id: string | null;
  notes: string | null;
  location: { id: string; name: string } | null;
  seller: { id: string; full_name: string; role: string } | null;
  sale_items: SaleItem[];
  order: {
    id: string;
    delivery_method: string | null;
    shipping_cost: number | null;
    shipping_address: string | null;
    shipping_district: string | null;
    payment_method: string | null;
  } | null;
}

interface SalesHistoryClientProps {
  initialSales: Sale[];
  locations: { id: string; name: string }[];
  sellers: { id: string; full_name: string; role: string }[];
  userRole: string;
  staffLocationId: string | null;
}

interface DispatchLocation {
  product_name: string;
  size: string | null;
  location_name: string;
  quantity: number;
}

type DateRange = "today" | "week" | "month" | "all";
type CanalFilter = "all" | "fisico" | "online";

// ── Payment config ───────────────────────────────────────────────────────────

const paymentConfig = {
  cash: {
    label: "Efectivo",
    icon: Banknote,
    color: "bg-green-100 text-green-700 border-green-300",
  },
  qr: {
    label: "QR",
    icon: QrCode,
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  card: {
    label: "Tarjeta",
    icon: CreditCard,
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `Bs ${new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDateRangeFilter(range: DateRange): Date | null {
  const now = new Date();
  switch (range) {
    case "today":
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    case "week":
      const week = new Date();
      week.setDate(now.getDate() - 7);
      return week;
    case "month":
      const month = new Date();
      month.setDate(now.getDate() - 30);
      return month;
    case "all":
      return null;
    default:
      return null;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SalesHistoryClient({
  initialSales,
  locations,
  sellers,
  userRole,
  staffLocationId,
}: SalesHistoryClientProps) {
  const isStaff = userRole === "staff";
  const [sales] = useState<Sale[]>(initialSales);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [canalFilter, setCanalFilter] = useState<CanalFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dispatchLocations, setDispatchLocations] = useState<DispatchLocation[] | null>(null);
  const [loadingDispatch, setLoadingDispatch] = useState(false);

  // Cargar ubicaciones de despacho para ventas online
  useEffect(() => {
    if (!selectedSale || (selectedSale.canal ?? "fisico") !== "online" || !selectedSale.order_id) {
      setDispatchLocations(null);
      return;
    }

    setLoadingDispatch(true);
    const supabase = createClient();
    supabase
      .from("inventory_reservations")
      .select("quantity, size, status, locations:location_id(name), products:product_id(name)")
      .eq("order_id", selectedSale.order_id)
      .in("status", ["completed", "confirmed", "reserved"])
      .then(({ data }) => {
        setDispatchLocations(
          (data ?? []).map((r) => ({
            product_name: (r.products as unknown as { name: string } | null)?.name ?? "Producto",
            size: r.size as string | null,
            location_name: (r.locations as unknown as { name: string } | null)?.name ?? "Ubicación",
            quantity: r.quantity as number,
          }))
        );
        setLoadingDispatch(false);
      });
  }, [selectedSale]);

  const itemsPerPage = 15;

  // ── Filtered sales ───────────────────────────────────────────────────────────

  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sale) => {
        const matchesId = sale.id.toLowerCase().includes(query);
        const matchesCustomer =
          sale.customer_name?.toLowerCase().includes(query) || false;
        const matchesProduct = sale.sale_items.some((item) =>
          item.product.name.toLowerCase().includes(query)
        );
        return matchesId || matchesCustomer || matchesProduct;
      });
    }

    // Date range filter
    const dateFrom = getDateRangeFilter(dateRange);
    if (dateFrom) {
      filtered = filtered.filter(
        (sale) => new Date(sale.created_at) >= dateFrom
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter((sale) => sale.location_id === locationFilter);
    }

    // Payment method filter
    if (paymentFilter) {
      filtered = filtered.filter((sale) => sale.payment_method === paymentFilter);
    }

    // Seller filter
    if (sellerFilter) {
      filtered = filtered.filter((sale) => sale.sold_by === sellerFilter);
    }

    // Canal filter
    if (canalFilter !== "all") {
      filtered = filtered.filter((sale) => {
        const saleCanal = sale.canal ?? "fisico";
        return saleCanal === canalFilter;
      });
    }

    return filtered;
  }, [sales, searchQuery, dateRange, locationFilter, paymentFilter, sellerFilter, canalFilter]);

  // ── Statistics ───────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalSold = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = filteredSales.length;
    const avgTicket = totalSales > 0 ? totalSold / totalSales : 0;
    const totalItems = filteredSales.reduce(
      (sum, sale) =>
        sum + sale.sale_items.reduce((s, item) => s + item.quantity, 0),
      0
    );

    return { totalSold, totalSales, avgTicket, totalItems };
  }, [filteredSales]);

  // ── Pagination ───────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredSales.slice(start, end);
  }, [filteredSales, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Clear filters ────────────────────────────────────────────────────────────

  const clearFilters = () => {
    setSearchQuery("");
    setDateRange("all");
    setLocationFilter("");
    setPaymentFilter("");
    setSellerFilter("");
    setCanalFilter("all");
    setCurrentPage(1);
  };

  // ── Export to Excel ──────────────────────────────────────────────────────────

  const exportToExcel = () => {
    const data = filteredSales.map((sale) => ({
      ID: sale.id.substring(0, 8).toUpperCase(),
      Fecha: format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", {
        locale: es,
      }),
      Cliente: sale.customer_name || "Cliente general",
      Ubicación: sale.location?.name || "—",
      Vendedor: sale.seller?.full_name || "—",
      Items: sale.sale_items.reduce((sum, item) => sum + item.quantity, 0),
      Subtotal: sale.subtotal,
      Descuento: sale.discount,
      Total: sale.total,
      "Método de Pago": paymentConfig[sale.payment_method]?.label || sale.payment_method,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, `ventas-${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast.success("Excel descargado correctamente");
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Historial de Ventas</h1>
            <p className="text-purple-100 text-sm">
              Registro completo de todas las transacciones
            </p>
          </div>
          <button
            onClick={exportToExcel}
            className="bg-white text-purple-600 hover:bg-purple-50 font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
            <span className="sm:hidden">📥 Exportar</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Date Range */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as DateRange);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none bg-white text-sm font-medium text-gray-700"
            >
              <option value="all">📅 Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Últimos 7 días</option>
              <option value="month">Últimos 30 días</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar cliente o ID..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm font-medium text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Payment Method */}
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none bg-white text-sm font-medium text-gray-700"
            >
              <option value="">💳 Todos los pagos</option>
              <option value="cash">Efectivo</option>
              <option value="qr">QR</option>
              <option value="card">Tarjeta</option>
            </select>
          </div>

          {/* Location — hidden for staff */}
          {!isStaff && (
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none bg-white text-sm font-medium text-gray-700"
              >
                <option value="">📍 Todas las ubicaciones</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Seller — hidden for staff */}
          {!isStaff && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={sellerFilter}
                onChange={(e) => {
                  setSellerFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none bg-white text-sm font-medium text-gray-700"
              >
                <option value="">👤 Todos los vendedores</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* When staff: only 3 filters, fill last slot with clear */}
          {isStaff && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>

        {/* Canal filter pills — visible for all roles */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
            Canal:
          </span>
          {(["all", "fisico", "online"] as CanalFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => { setCanalFilter(c); setCurrentPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${canalFilter === c
                  ? c === "fisico"
                    ? "bg-blue-600 border-blue-600 text-white shadow-md"
                    : c === "online"
                      ? "bg-green-600 border-green-600 text-white shadow-md"
                      : "bg-purple-600 border-purple-600 text-white shadow-md"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
            >
              {c === "all" && "Todos"}
              {c === "fisico" && <><span>🏪</span> Físico</>}
              {c === "online" && <><span>🌐</span> Online</>}
            </button>
          ))}
        </div>

        {/* Clear button for admin/manager */}
        {!isStaff && (
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Summary bar */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500 font-medium flex-wrap">
          <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
            {filteredSales.length} {filteredSales.length === 1 ? "venta" : "ventas"}
          </span>
          <span>·</span>
          <span>Total: <span className="font-bold text-gray-700">{formatCurrency(stats.totalSold)}</span></span>
          <span>·</span>
          <span>
            Período:{" "}
            <span className="font-semibold text-gray-700">
              {dateRange === "today" ? "Hoy" : dateRange === "week" ? "Últimos 7 días" : dateRange === "month" ? "Últimos 30 días" : "Todos"}
            </span>
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-purple-700 mb-1">
            Total Vendido
          </p>
          <p className="text-2xl font-bold text-purple-900">
            {formatCurrency(stats.totalSold)}
          </p>
          <p className="text-xs text-purple-600 mt-1">En período seleccionado</p>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm font-medium text-green-700 mb-1">
            Cantidad de Ventas
          </p>
          <p className="text-2xl font-bold text-green-900">{stats.totalSales}</p>
          <p className="text-xs text-green-600 mt-1">Transacciones completadas</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-blue-700 mb-1">
            Ticket Promedio
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(stats.avgTicket)}
          </p>
          <p className="text-xs text-blue-600 mt-1">Por transacción</p>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-sm font-medium text-amber-700 mb-1">
            Items Vendidos
          </p>
          <p className="text-2xl font-bold text-amber-900">{stats.totalItems}</p>
          <p className="text-xs text-amber-600 mt-1">Productos totales</p>
        </div>
      </div>

      {/* Sales Table — Desktop */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
                <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                  Fecha/Hora
                </th>
                <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                  Cliente
                </th>
                <th className="text-center text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                  Items
                </th>
                {!isStaff && (
                  <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                    Puesto
                  </th>
                )}
                {!isStaff && (
                  <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                    Vendedor
                  </th>
                )}
                <th className="text-right text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                  Total
                </th>
                <th className="text-center text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                  Canal
                </th>
                <th className="text-center text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                  Pago
                </th>
                <th className="text-center text-xs font-bold text-purple-900 uppercase tracking-wider px-5 py-3.5">
                  Ver
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={isStaff ? 7 : 9} className="px-6 py-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      No se encontraron ventas
                    </p>
                    <p className="text-xs text-gray-500">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale, index) => {
                  const PayIcon = paymentConfig[sale.payment_method]?.icon || CreditCard;
                  const paymentColor = paymentConfig[sale.payment_method]?.color || "bg-gray-100 text-gray-700 border-gray-300";
                  const totalItems = sale.sale_items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );
                  const sellerFirstName = sale.seller?.full_name?.split(" ")[0] || "—";

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className="hover:bg-purple-50 transition-all cursor-pointer"
                      style={{
                        animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-900">
                          {format(new Date(sale.created_at), "d MMM", { locale: es })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(sale.created_at), "h:mm a")}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        {sale.customer_name ? (
                          <p className="text-sm font-medium text-gray-900">{sale.customer_name}</p>
                        ) : (
                          <p className="text-sm italic text-gray-400">Cliente anónimo</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {totalItems} {totalItems === 1 ? "item" : "items"}
                        </span>
                      </td>
                      {!isStaff && (
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {sale.location?.name || "—"}
                          </span>
                        </td>
                      )}
                      {!isStaff && (
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{sellerFirstName}</p>
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-base font-bold text-purple-700">
                          {formatCurrency(sale.total)}
                        </span>
                        {sale.discount > 0 && (
                          <p className="text-xs text-red-500 font-medium">
                            -{formatCurrency(sale.discount)} dto.
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          {(sale.canal ?? "fisico") === "online" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                              🌐 Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                              🏪 Físico
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${paymentColor}`}
                          >
                            <PayIcon className="w-3 h-3" />
                            {paymentConfig[sale.payment_method]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedSale(sale); }}
                            className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-gray-100">
          {paginatedSales.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">No se encontraron ventas</p>
            </div>
          ) : (
            paginatedSales.map((sale) => {
              const PayIcon = paymentConfig[sale.payment_method]?.icon || CreditCard;
              const paymentColor = paymentConfig[sale.payment_method]?.color || "bg-gray-100 text-gray-700 border-gray-300";
              const totalItems = sale.sale_items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="px-4 py-4 hover:bg-purple-50 transition active:bg-purple-100 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {format(new Date(sale.created_at), "d MMM · h:mm a", { locale: es })}
                      </p>
                      {sale.customer_name ? (
                        <p className="text-xs text-gray-600 mt-0.5">{sale.customer_name}</p>
                      ) : (
                        <p className="text-xs italic text-gray-400 mt-0.5">Cliente anónimo</p>
                      )}
                    </div>
                    <span className="text-base font-bold text-purple-700">{formatCurrency(sale.total)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                    {(sale.canal ?? "fisico") === "online" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                        🌐 Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                        🏪 Físico
                      </span>
                    )}
                    {!isStaff && sale.location?.name && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />{sale.location.name}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border ${paymentColor}`}>
                      <PayIcon className="w-3 h-3" />
                      {paymentConfig[sale.payment_method]?.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredSales.length)} de{" "}
              {filteredSales.length} ventas
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current, and adjacent pages
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center gap-2">
                      {showEllipsis && (
                        <span className="text-gray-400 px-2">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${currentPage === page
                            ? "bg-purple-600 text-white"
                            : "hover:bg-gray-100 text-gray-600"
                          }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSale && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setSelectedSale(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      Detalle de Venta #{selectedSale.id.substring(0, 8).toUpperCase()}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-purple-100">
                        {format(
                          new Date(selectedSale.created_at),
                          "d 'de' MMMM 'de' yyyy, HH:mm",
                          { locale: es }
                        )}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border bg-white ${paymentConfig[selectedSale.payment_method]?.color
                          }`}
                      >
                        {(() => {
                          const PayIcon =
                            paymentConfig[selectedSale.payment_method]?.icon ||
                            CreditCard;
                          return <PayIcon className="w-3.5 h-3.5" />;
                        })()}
                        {paymentConfig[selectedSale.payment_method]?.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Canal badge */}
                {(selectedSale.canal ?? "fisico") === "online" && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <span className="text-lg">🌐</span>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Pedido Online</p>
                      {selectedSale.notes && (
                        <p className="text-xs text-green-600">{selectedSale.notes}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Info row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                    <span className="text-lg">👤</span>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Cliente</p>
                      {selectedSale.customer_name ? (
                        <p className="text-sm font-semibold text-gray-900">{selectedSale.customer_name}</p>
                      ) : (
                        <p className="text-sm italic text-gray-400">Cliente anónimo</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                    <span className="text-lg">📍</span>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Puesto</p>
                      {(selectedSale.canal ?? "fisico") === "online" ? (
                        <p className="text-sm font-semibold text-green-700">🌐 Pedido Online</p>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900">{selectedSale.location?.name || "—"}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                    <span className="text-lg">👷</span>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Vendedor</p>
                      {(selectedSale.canal ?? "fisico") === "online" ? (
                        <p className="text-sm font-semibold text-gray-700">🤖 Sistema automático</p>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-gray-900">{selectedSale.seller?.full_name || "—"}</p>
                          <p className="text-xs text-gray-400 capitalize">{selectedSale.seller?.role}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                    <span className="text-lg">💳</span>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Pago</p>
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const PayIcon = paymentConfig[selectedSale.payment_method]?.icon || CreditCard;
                          return <PayIcon className="w-4 h-4 text-gray-600" />;
                        })()}
                        <p className="text-sm font-semibold text-gray-900">
                          {paymentConfig[selectedSale.payment_method]?.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery info for online orders */}
                {(selectedSale.canal ?? "fisico") === "online" && selectedSale.order && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                    <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                      Información de Entrega
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedSale.order.delivery_method && (
                        <div>
                          <p className="text-xs text-blue-600">Método</p>
                          <p className="font-semibold text-blue-900 capitalize">
                            {selectedSale.order.delivery_method === "delivery"
                              ? "📦 Delivery"
                              : "🏪 Retiro en tienda"}
                          </p>
                        </div>
                      )}
                      {selectedSale.order.shipping_district && (
                        <div>
                          <p className="text-xs text-blue-600">Zona</p>
                          <p className="font-semibold text-blue-900">{selectedSale.order.shipping_district}</p>
                        </div>
                      )}
                      {selectedSale.order.shipping_address && (
                        <div className="col-span-2">
                          <p className="text-xs text-blue-600">Dirección</p>
                          <p className="font-semibold text-blue-900">{selectedSale.order.shipping_address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Products */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Productos
                  </h3>
                  <div className="space-y-2">
                    {selectedSale.sale_items.length === 0 ? (
                      <p className="text-sm text-gray-400 italic text-center py-4">Sin productos registrados</p>
                    ) : (
                      selectedSale.sale_items.map((item) => (
                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.product.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {item.size ? (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                  Talla: {item.size}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Sin talla</span>
                              )}
                              {item.color && (
                                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">
                                  {item.color}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {item.quantity} ud{item.quantity > 1 ? "s" : ""} · {formatCurrency(item.unit_price)} c/u
                              </span>
                            </div>
                            {/* Solo mostrar ubicación por ítem para ventas físicas */}
                            {item.location?.name && (selectedSale.canal ?? "fisico") !== "online" && (
                              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                Despachado desde: <span className="font-semibold">{item.location.name}</span>
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Despacho multi-ubicación (solo online) */}
                {(selectedSale.canal ?? "fisico") === "online" && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                      📦 Despacho
                    </h3>
                    {loadingDispatch ? (
                      <div className="flex items-center gap-2 text-gray-400 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Cargando ubicaciones...</span>
                      </div>
                    ) : !dispatchLocations || dispatchLocations.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Sin información de despacho</p>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl divide-y divide-blue-100 overflow-hidden">
                        {/* Resumen por ubicación (suma de todos los productos) */}
                        {Array.from(
                          dispatchLocations.reduce((map, d) => {
                            map.set(d.location_name, (map.get(d.location_name) ?? 0) + d.quantity);
                            return map;
                          }, new Map<string, number>())
                        ).map(([locationName, qty]) => (
                          <div key={locationName} className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-blue-900">{locationName}</span>
                            </div>
                            <span className="text-sm font-bold text-blue-700">
                              {qty} {qty === 1 ? "ud" : "uds"}
                            </span>
                          </div>
                        ))}
                        {/* Detalle por producto si hay más de uno */}
                        {dispatchLocations.length > 1 && (
                          <details className="px-4 py-2">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                              Ver detalle por producto
                            </summary>
                            <div className="mt-2 space-y-1">
                              {dispatchLocations.map((d, i) => (
                                <p key={i} className="text-xs text-blue-700">
                                  {d.product_name}{d.size ? ` · Talla ${d.size}` : ""} — {d.location_name}: {d.quantity} ud{d.quantity !== 1 ? "s" : ""}
                                </p>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Totals */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(selectedSale.subtotal)}</span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-600 font-medium">
                        Descuento ({((selectedSale.discount / selectedSale.subtotal) * 100).toFixed(0)}%)
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        -{formatCurrency(selectedSale.discount)}
                      </span>
                    </div>
                  )}
                  {(selectedSale.canal ?? "fisico") === "online" &&
                    selectedSale.order?.shipping_cost != null &&
                    Number(selectedSale.order.shipping_cost) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 font-medium">🚚 Envío</span>
                        <span className="text-sm font-semibold text-blue-600">
                          +{formatCurrency(Number(selectedSale.order.shipping_cost))}
                        </span>
                      </div>
                    )}
                  <div className="flex items-center justify-between pt-2 border-t-2 border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-purple-600">{formatCurrency(selectedSale.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t-2 border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
