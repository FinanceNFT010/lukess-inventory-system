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
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

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
  cash: "#3B82F6",
  qr: "#8B5CF6",
  card: "#F59E0B",
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
];

// ── Component ────────────────────────────────────────────────────────────────

export default function ReportsClient({
  sales,
  saleItems,
  locations,
}: ReportsClientProps) {
  const [selectedRange, setSelectedRange] = useState(7);

  // ── Filter sales by date range ─────────────────────────────────────────────

  const filteredSales = useMemo(() => {
    const cutoff = startOfDay(subDays(new Date(), selectedRange));
    return sales.filter((s) => new Date(s.created_at) >= cutoff);
  }, [sales, selectedRange]);

  const filteredItems = useMemo(() => {
    const cutoff = startOfDay(subDays(new Date(), selectedRange));
    return saleItems.filter(
      (item) => item.sales && new Date(item.sales.created_at) >= cutoff
    );
  }, [saleItems, selectedRange]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = filteredSales.length;
  const avgTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const totalItemsSold = filteredItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

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
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === "ventas"
              ? `Bs ${entry.value.toFixed(2)}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Análisis de ventas e inventario
          </p>
        </div>

        {/* Date range selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {DATE_RANGES.map((range) => (
              <button
                key={range.days}
                onClick={() => setSelectedRange(range.days)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  selectedRange === range.days
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">
              Ingresos Totales
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            Bs {totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">
              Total Ventas
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalSalesCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">
              Ticket Promedio
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            Bs {avgTicket.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">
              Ítems Vendidos
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalItemsSold}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trend - Line chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">
              Ventas por Día
            </h2>
          </div>

          {salesByDay.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No hay datos de ventas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickFormatter={(v) => `Bs ${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ fill: "#3B82F6", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#2563EB" }}
                  name="ventas"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment methods - Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Métodos de Pago</h2>
          </div>

          {paymentData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No hay datos
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `Bs ${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="space-y-2 mt-2">
                {paymentData.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        Bs {entry.value.toFixed(0)}
                      </span>
                      <span className="text-gray-400 ml-1">
                        ({entry.count})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-900">
              Top 5 Productos Vendidos
            </h2>
          </div>

          {topProducts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No hay datos de productos
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => {
                const maxRevenue = topProducts[0]?.revenue || 1;
                const pct = (product.revenue / maxRevenue) * 100;

                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-5">
                          #{i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.sku} · {product.qty} unid.
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-2">
                        Bs {product.revenue.toFixed(0)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-7">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sales by location - Bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">
              Ventas por Ubicación
            </h2>
          </div>

          {salesByLocation.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No hay datos
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesByLocation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickFormatter={(v) => `Bs ${v}`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "ventas"
                        ? `Bs ${value.toFixed(2)}`
                        : value,
                      name === "ventas" ? "Ingresos" : "Cantidad",
                    ]}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "ventas" ? "Ingresos" : "Cantidad"
                    }
                  />
                  <Bar
                    dataKey="ventas"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    name="ventas"
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Location summary table */}
              <div className="mt-4 border-t border-gray-100 pt-3">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">
                        Ubicación
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">
                        Ventas
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">
                        Ingresos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {salesByLocation.map((loc, i) => (
                      <tr key={i}>
                        <td className="py-2 text-sm font-medium text-gray-900">
                          {loc.fullName}
                        </td>
                        <td className="py-2 text-sm text-gray-600 text-right">
                          {loc.cantidad}
                        </td>
                        <td className="py-2 text-sm font-semibold text-gray-900 text-right">
                          Bs {loc.ventas.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200">
                      <td className="py-2 text-sm font-bold text-gray-900">
                        Total
                      </td>
                      <td className="py-2 text-sm font-bold text-gray-900 text-right">
                        {salesByLocation.reduce(
                          (sum, l) => sum + l.cantidad,
                          0
                        )}
                      </td>
                      <td className="py-2 text-sm font-bold text-gray-900 text-right">
                        Bs{" "}
                        {salesByLocation
                          .reduce((sum, l) => sum + l.ventas, 0)
                          .toFixed(2)}
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
