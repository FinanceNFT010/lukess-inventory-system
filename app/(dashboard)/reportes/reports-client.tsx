"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface SaleRecord {
  id: string;
  total: number;
  payment_method: "cash" | "qr" | "card";
  location_id: string;
  created_at: string;
  locations: { name: string } | null;
}

interface SaleItemRecord {
  quantity: number;
  subtotal: number;
  product_id: string;
  products: { name: string; sku: string; organization_id: string } | null;
  sales: { created_at: string; organization_id: string } | null;
}

interface LocationInfo {
  id: string;
  name: string;
}

interface ReportsClientProps {
  sales: SaleRecord[];
  saleItems: SaleItemRecord[];
  locations: LocationInfo[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_COLORS: Record<string, string> = {
  cash: "#10B981",
  qr: "#3B82F6",
  card: "#8B5CF6",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  qr: "QR",
  card: "Tarjeta",
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

const DATE_RANGES = [
  { label: "7 días", days: 7 },
  { label: "14 días", days: 14 },
  { label: "30 días", days: 30 },
  { label: "Personalizado", days: 0 },
];

// Helper para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).format(amount).replace("BOB", "Bs");
}

// Helper para exportar a CSV
function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0] || {});
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReportsClient({
  sales,
  saleItems,
  locations,
}: ReportsClientProps) {
  const [selectedRange, setSelectedRange] = useState(7);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // ── Filter sales by date range ─────────────────────────────────────────────

  const filteredSales = useMemo(() => {
    if (selectedRange === 0 && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return sales.filter((s) => {
        const date = new Date(s.created_at);
        return date >= start && date <= end;
      });
    }
    const cutoff = startOfDay(subDays(new Date(), selectedRange));
    return sales.filter((s) => new Date(s.created_at) >= cutoff);
  }, [sales, selectedRange, customStartDate, customEndDate]);

  const filteredItems = useMemo(() => {
    if (selectedRange === 0 && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return saleItems.filter((item) => {
        if (!item.sales) return false;
        const date = new Date(item.sales.created_at);
        return date >= start && date <= end;
      });
    }
    const cutoff = startOfDay(subDays(new Date(), selectedRange));
    return saleItems.filter(
      (item) => item.sales && new Date(item.sales.created_at) >= cutoff
    );
  }, [saleItems, selectedRange, customStartDate, customEndDate]);

  // ── Previous period for comparison ─────────────────────────────────────────

  const previousPeriodSales = useMemo(() => {
    const cutoff = startOfDay(subDays(new Date(), selectedRange * 2));
    const periodStart = startOfDay(subDays(new Date(), selectedRange));
    return sales.filter((s) => {
      const date = new Date(s.created_at);
      return date >= cutoff && date < periodStart;
    });
  }, [sales, selectedRange]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = filteredSales.length;
  const avgTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const totalItemsSold = filteredItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Previous period stats for comparison
  const previousRevenue = previousPeriodSales.reduce(
    (sum, s) => sum + s.total,
    0
  );
  const revenueChange =
    previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  const previousSalesCount = previousPeriodSales.length;
  const salesCountChange =
    previousSalesCount > 0
      ? ((totalSalesCount - previousSalesCount) / previousSalesCount) * 100
      : 0;

  // ── Sales by day (Line chart) ──────────────────────────────────────────────

  const salesByDay = useMemo(() => {
    const days = eachDayOfInterval({
      start: startOfDay(subDays(new Date(), selectedRange - 1)),
      end: new Date(),
    });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const daySales = filteredSales.filter(
        (s) => format(new Date(s.created_at), "yyyy-MM-dd") === dayStr
      );
      return {
        date: format(day, "dd MMM", { locale: es }),
        ventas: daySales.reduce((sum, s) => sum + s.total, 0),
        cantidad: daySales.length,
      };
    });
  }, [filteredSales, selectedRange]);

  // ── Payment methods (Pie chart) ────────────────────────────────────────────

  const paymentData = useMemo(() => {
    const grouped: Record<string, { count: number; total: number }> = {};
    filteredSales.forEach((s) => {
      if (!grouped[s.payment_method]) {
        grouped[s.payment_method] = { count: 0, total: 0 };
      }
      grouped[s.payment_method].count++;
      grouped[s.payment_method].total += s.total;
    });

    return Object.entries(grouped).map(([method, data]) => ({
      name: PAYMENT_LABELS[method] || method,
      value: data.total,
      count: data.count,
      color: PAYMENT_COLORS[method] || "#9CA3AF",
    }));
  }, [filteredSales]);

  // ── Top 5 products ─────────────────────────────────────────────────────────

  const topProducts = useMemo(() => {
    const grouped: Record<
      string,
      { name: string; sku: string; qty: number; revenue: number }
    > = {};

    filteredItems.forEach((item) => {
      if (!item.products) return;
      const key = item.product_id;
      if (!grouped[key]) {
        grouped[key] = {
          name: item.products.name,
          sku: item.products.sku,
          qty: 0,
          revenue: 0,
        };
      }
      grouped[key].qty += item.quantity;
      grouped[key].revenue += item.subtotal;
    });

    return Object.values(grouped)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredItems]);

  // ── Sales by location (Bar chart) ──────────────────────────────────────────

  const salesByLocation = useMemo(() => {
    return locations.map((loc) => {
      const locSales = filteredSales.filter(
        (s) => s.location_id === loc.id
      );
      return {
        name: loc.name.replace("Puesto ", "P").replace(" - ", ": "),
        fullName: loc.name,
        ventas: locSales.reduce((sum, s) => sum + s.total, 0),
        cantidad: locSales.length,
      };
    });
  }, [filteredSales, locations]);

  // ── Custom tooltip ─────────────────────────────────────────────────────────

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4">
        <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-600">
              {entry.name === "ventas" ? "Ingresos" : entry.name}:
            </span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name === "ventas" || entry.dataKey === "ventas"
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Export to CSV
  const handleExport = () => {
    const exportData = filteredSales.map((sale) => ({
      Fecha: format(new Date(sale.created_at), "dd/MM/yyyy HH:mm"),
      Total: sale.total,
      "Método de Pago": PAYMENT_LABELS[sale.payment_method],
      Ubicación: sale.locations?.name || "N/A",
    }));

    exportToCSV(
      exportData,
      `ventas_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    toast.success("Reporte exportado exitosamente");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Análisis de ventas e inventario
            </p>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={filteredSales.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Exportar a Excel
          </button>
        </div>

        {/* Date range selector */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-gray-700">
                Rango de fechas
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.days}
                  onClick={() => setSelectedRange(range.days)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedRange === range.days
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom date inputs */}
            {selectedRange === 0 && (
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            {revenueChange !== 0 && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                  revenueChange > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {revenueChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {Math.abs(revenueChange).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Ingresos Totales
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        {/* Sales count card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            {salesCountChange !== 0 && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                  salesCountChange > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {salesCountChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {Math.abs(salesCountChange).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Total Ventas
          </p>
          <p className="text-2xl font-bold text-gray-900">{totalSalesCount}</p>
        </div>

        {/* Average ticket card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Ticket Promedio
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(avgTicket)}
          </p>
        </div>

        {/* Items sold card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Ítems Vendidos
          </p>
          <p className="text-2xl font-bold text-gray-900">{totalItemsSold}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trend - Area chart with gradient */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Ventas por Día
              </h2>
            </div>
          </div>

          {salesByDay.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-sm text-gray-400">
              No hay datos de ventas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                  tickLine={{ stroke: "#D1D5DB" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                  tickLine={{ stroke: "#D1D5DB" }}
                  tickFormatter={(v) => `Bs ${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorVentas)"
                  dot={{ fill: "#3B82F6", strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 7, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
                  name="ventas"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment methods - Donut chart */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Métodos de Pago</h2>
          </div>

          {paymentData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-sm text-gray-400">
              No hay datos
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend with percentages */}
              <div className="space-y-3 mt-4">
                {paymentData.map((entry, i) => {
                  const percentage = (
                    (entry.value / totalRevenue) *
                    100
                  ).toFixed(1);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {entry.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(entry.value)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 products */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Top 5 Productos Vendidos
            </h2>
          </div>

          {topProducts.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No hay datos de productos
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, i) => {
                const maxRevenue = topProducts[0]?.revenue || 1;
                const pct = (product.revenue / maxRevenue) * 100;
                const gradientId = `gradient-${i}`;

                return (
                  <div
                    key={i}
                    className="group hover:bg-gray-50 p-3 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {/* Ranking badge */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${CHART_COLORS[i]}, ${CHART_COLORS[i]}dd)`,
                        }}
                      >
                        {i + 1}
                      </div>

                      {/* Product image placeholder */}
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.sku} · {product.qty} unidades vendidas
                        </p>
                      </div>

                      {/* Revenue */}
                      <span className="text-base font-bold text-gray-900 flex-shrink-0">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>

                    {/* Progress bar with gradient */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-11">
                      <svg width="100%" height="100%">
                        <defs>
                          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={CHART_COLORS[i]} />
                            <stop offset="100%" stopColor={`${CHART_COLORS[i]}88`} />
                          </linearGradient>
                        </defs>
                        <rect
                          width={`${pct}%`}
                          height="100%"
                          fill={`url(#${gradientId})`}
                          rx="4"
                          className="transition-all duration-700"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sales by location - Bar chart */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Ventas por Ubicación
            </h2>
          </div>

          {salesByLocation.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No hay datos
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={salesByLocation}>
                  <defs>
                    {salesByLocation.map((_, i) => (
                      <linearGradient
                        key={i}
                        id={`barGradient${i}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
                    axisLine={{ stroke: "#D1D5DB" }}
                    tickLine={{ stroke: "#D1D5DB" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
                    axisLine={{ stroke: "#D1D5DB" }}
                    tickLine={{ stroke: "#D1D5DB" }}
                    tickFormatter={(v) => `Bs ${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="ventas"
                    fill="url(#barGradient0)"
                    radius={[8, 8, 0, 0]}
                    name="ventas"
                  >
                    {salesByLocation.map((_, index) => (
                      <Cell key={index} fill={`url(#barGradient${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Location summary table */}
              <div className="mt-6 border-t-2 border-gray-100 pt-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-bold text-gray-600 uppercase tracking-wider pb-3">
                        Ubicación
                      </th>
                      <th className="text-right text-xs font-bold text-gray-600 uppercase tracking-wider pb-3">
                        Ventas
                      </th>
                      <th className="text-right text-xs font-bold text-gray-600 uppercase tracking-wider pb-3">
                        Ingresos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {salesByLocation.map((loc, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="py-3 flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                          <span className="text-sm font-semibold text-gray-900">
                            {loc.fullName}
                          </span>
                        </td>
                        <td className="py-3 text-sm font-medium text-gray-700 text-right">
                          {loc.cantidad}
                        </td>
                        <td className="py-3 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(loc.ventas)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td className="py-3 text-sm font-bold text-gray-900">
                        Total
                      </td>
                      <td className="py-3 text-sm font-bold text-gray-900 text-right">
                        {salesByLocation.reduce((sum, l) => sum + l.cantidad, 0)}
                      </td>
                      <td className="py-3 text-base font-bold text-blue-600 text-right">
                        {formatCurrency(
                          salesByLocation.reduce((sum, l) => sum + l.ventas, 0)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
