"use client";

import { useState, useMemo } from "react";
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
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Banknote,
  QrCode,
  CreditCard,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface SaleItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    sku: string;
    image_url: string | null;
  };
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
  location_id: string;
  sold_by: string;
  location: { id: string; name: string } | null;
  seller: { id: string; full_name: string; role: string } | null;
  sale_items: SaleItem[];
}

interface SalesHistoryClientProps {
  initialSales: Sale[];
  locations: { id: string; name: string }[];
  sellers: { id: string; full_name: string; role: string }[];
}

type DateRange = "today" | "week" | "month" | "all";

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
}: SalesHistoryClientProps) {
  const [sales] = useState<Sale[]>(initialSales);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

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

    return filtered;
  }, [sales, searchQuery, dateRange, locationFilter, paymentFilter, sellerFilter]);

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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Historial de Ventas</h1>
            <p className="text-purple-100">
              Registro completo de todas las transacciones
            </p>
          </div>
          <button
            onClick={exportToExcel}
            className="bg-white text-purple-600 hover:bg-purple-50 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar Todo (Excel)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por cliente, ID o producto..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            />
          </div>

          {/* Date Range */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as DateRange);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none bg-white"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Últimos 7 días</option>
              <option value="month">Últimos 30 días</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none bg-white"
            >
              <option value="">Todas las ubicaciones</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none bg-white"
            >
              <option value="">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="qr">QR</option>
              <option value="card">Tarjeta</option>
            </select>
          </div>

          {/* Seller */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={sellerFilter}
              onChange={(e) => {
                setSellerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none bg-white"
            >
              <option value="">Todos los vendedores</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar filtros
          </button>
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

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  ID
                </th>
                <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Fecha/Hora
                </th>
                <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Cliente
                </th>
                <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Ubicación
                </th>
                <th className="text-left text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Vendedor
                </th>
                <th className="text-center text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Items
                </th>
                <th className="text-right text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Subtotal
                </th>
                <th className="text-center text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Descuento
                </th>
                <th className="text-right text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Total
                </th>
                <th className="text-center text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Pago
                </th>
                <th className="text-center text-xs font-bold text-purple-900 uppercase tracking-wider px-6 py-4">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
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

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-purple-50 transition-all"
                      style={{
                        animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                      }}
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-semibold text-gray-600">
                          {sale.id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(sale.created_at), "d MMM", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(sale.created_at), "HH:mm")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {sale.customer_name || "Cliente general"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          <MapPin className="w-3.5 h-3.5" />
                          {sale.location?.name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {getInitials(sale.seller?.full_name || "?")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {sale.seller?.full_name || "—"}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {sale.seller?.role || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {totalItems}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-gray-700">
                          {formatCurrency(sale.subtotal)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {sale.discount > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            -{formatCurrency(sale.discount)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-base font-bold text-purple-600">
                          {formatCurrency(sale.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${paymentColor}`}
                          >
                            <PayIcon className="w-3.5 h-3.5" />
                            {paymentConfig[sale.payment_method]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-2 rounded-lg hover:bg-purple-100 text-purple-600 hover:text-purple-700 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-5 h-5" />
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
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          currentPage === page
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border bg-white ${
                          paymentConfig[selectedSale.payment_method]?.color
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
              <div className="p-6 space-y-6">
                {/* General Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Cliente</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedSale.customer_name || "Cliente general"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                    <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {selectedSale.location?.name || "—"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Vendedor</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {getInitials(selectedSale.seller?.full_name || "?")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedSale.seller?.full_name || "—"}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {selectedSale.seller?.role || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Método de Pago</p>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const PayIcon =
                          paymentConfig[selectedSale.payment_method]?.icon ||
                          CreditCard;
                        return <PayIcon className="w-5 h-5 text-gray-500" />;
                      })()}
                      <p className="text-base font-semibold text-gray-900">
                        {paymentConfig[selectedSale.payment_method]?.label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Productos Vendidos
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-3">
                            Producto
                          </th>
                          <th className="text-center text-xs font-semibold text-gray-600 uppercase px-4 py-3">
                            Cantidad
                          </th>
                          <th className="text-right text-xs font-semibold text-gray-600 uppercase px-4 py-3">
                            Precio Unit.
                          </th>
                          <th className="text-right text-xs font-semibold text-gray-600 uppercase px-4 py-3">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedSale.sale_items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {item.product.image_url ? (
                                    <img
                                      src={item.product.image_url}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    SKU: {item.product.sku}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-gray-700">
                                {formatCurrency(item.unit_price)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-bold text-gray-900">
                                {formatCurrency(item.subtotal)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Subtotal
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(selectedSale.subtotal)}
                        </span>
                      </div>

                      {selectedSale.discount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-700">
                            Descuento (
                            {(
                              (selectedSale.discount / selectedSale.subtotal) *
                              100
                            ).toFixed(0)}
                            %)
                          </span>
                          <span className="text-sm font-semibold text-red-700">
                            -{formatCurrency(selectedSale.discount)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                        <span className="text-lg font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-purple-600">
                          {formatCurrency(selectedSale.total)}
                        </span>
                      </div>
                    </div>
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
