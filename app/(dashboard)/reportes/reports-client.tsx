"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Globe,
  Store,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  XCircle,
  Award,
  Tag,
  AlertTriangle,
  Package,
  Activity,
  Percent,
  TrendingDown,
} from "lucide-react";
import { format, eachDayOfInterval, parseISO, differenceInDays } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderRow {
  id: string;
  total: number;
  subtotal: number;
  discount: number;
  canal: "online" | "fisico" | null;
  created_at: string;
  status: string;
}

interface OrderItemRow {
  product_id: string;
  quantity: number;
  subtotal: number;
  products: {
    id: string;
    name: string;
    category_id: string | null;
    categories: { name: string } | null;
  } | null;
}

interface InventoryItemRow {
  product_id: string;
  quantity: number;
  min_stock: number;
  products: { id: string; name: string; sku: string } | null;
}

interface ReportesVentasClientProps {
  orders: OrderRow[];
  prevOrders: OrderRow[];
  allStatusOrders: { id: string; status: string }[];
  orderItems: OrderItemRow[];
  inventoryItems: InventoryItemRow[];
  recentlySoldProductIds: string[];
  desde: string;
  hasta: string;
  canalFilter: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBs(amount: number): string {
  return `Bs ${amount.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({
  icon: Icon,
  label,
  value,
  change,
  color,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: number | null;
  color: "blue" | "green" | "purple" | "orange" | "red";
  subtitle?: string;
}) {
  const gradients = {
    blue: "from-blue-500 to-blue-700",
    green: "from-green-500 to-green-700",
    purple: "from-purple-500 to-purple-700",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-500 to-red-700",
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 bg-gradient-to-br ${gradients[color]} rounded-xl flex items-center justify-center shadow-md`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== null && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
              change >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 min-w-[200px]">
      <p className="text-sm font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="text-xs font-medium text-gray-600">{p.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-900">{formatBs(p.value)}</span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
        <span className="text-xs text-gray-500">Total</span>
        <span className="text-xs font-bold text-gray-900">{formatBs(total)}</span>
      </div>
    </div>
  );
}

function SimpleTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl p-3">
      <p className="text-xs font-bold text-gray-800 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="text-xs text-gray-700">
          <span className="font-medium">{p.name}: </span>
          {formatBs(p.value)}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReportesVentasClient({
  orders,
  prevOrders,
  allStatusOrders,
  orderItems,
  inventoryItems,
  recentlySoldProductIds,
  desde,
  hasta,
  canalFilter,
}: ReportesVentasClientProps) {
  // ── Core KPI calculations ──────────────────────────────────────────────────

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const totalOrders = orders.length;

  const onlineOrders = useMemo(
    () => orders.filter((o) => o.canal === "online" || o.canal === null),
    [orders]
  );
  const fisicoOrders = useMemo(() => orders.filter((o) => o.canal === "fisico"), [orders]);

  const onlineRevenue = useMemo(() => onlineOrders.reduce((s, o) => s + o.total, 0), [onlineOrders]);
  const fisicoRevenue = useMemo(() => fisicoOrders.reduce((s, o) => s + o.total, 0), [fisicoOrders]);

  const prevRevenue = useMemo(() => prevOrders.reduce((s, o) => s + o.total, 0), [prevOrders]);
  const prevCount = prevOrders.length;
  const prevOnlineRevenue = useMemo(
    () =>
      prevOrders
        .filter((o) => o.canal === "online" || o.canal === null)
        .reduce((s, o) => s + o.total, 0),
    [prevOrders]
  );
  const prevFisicoRevenue = useMemo(
    () =>
      prevOrders.filter((o) => o.canal === "fisico").reduce((s, o) => s + o.total, 0),
    [prevOrders]
  );

  // ── New KPI: AOV & cancellation rate ──────────────────────────────────────

  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevAov = prevCount > 0 ? prevRevenue / prevCount : 0;

  const cancelledCount = allStatusOrders.filter((o) => o.status === "cancelled").length;
  const cancelRate =
    allStatusOrders.length > 0 ? (cancelledCount / allStatusOrders.length) * 100 : 0;

  // ── Bar chart by day ───────────────────────────────────────────────────────

  const barData = useMemo(() => {
    const start = parseISO(desde);
    const end = parseISO(hasta);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = orders.filter(
        (o) => format(parseISO(o.created_at), "yyyy-MM-dd") === dayStr
      );
      return {
        fecha: format(day, "dd/MM"),
        Online: dayOrders
          .filter((o) => o.canal === "online" || o.canal === null)
          .reduce((s, o) => s + o.total, 0),
        Físico: dayOrders.filter((o) => o.canal === "fisico").reduce((s, o) => s + o.total, 0),
      };
    });
  }, [orders, desde, hasta]);

  // ── Donut chart ────────────────────────────────────────────────────────────

  const donutData = useMemo(() => {
    const data = [];
    if (onlineRevenue > 0) data.push({ name: "Online", value: onlineRevenue });
    if (fisicoRevenue > 0) data.push({ name: "Físico", value: fisicoRevenue });
    return data;
  }, [onlineRevenue, fisicoRevenue]);

  const DONUT_COLORS = ["#3B82F6", "#F97316"];

  // ── Daily table ────────────────────────────────────────────────────────────

  const tableData = useMemo(() => {
    const map: Record<
      string,
      { online: number; fisico: number; onlineCount: number; fisicoCount: number }
    > = {};
    orders.forEach((o) => {
      const day = format(parseISO(o.created_at), "yyyy-MM-dd");
      if (!map[day]) map[day] = { online: 0, fisico: 0, onlineCount: 0, fisicoCount: 0 };
      if (o.canal === "fisico") {
        map[day].fisico += o.total;
        map[day].fisicoCount++;
      } else {
        map[day].online += o.total;
        map[day].onlineCount++;
      }
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 30)
      .map(([date, v]) => ({
        date,
        dateFormatted: format(parseISO(date), "dd/MM/yyyy"),
        online: v.online,
        fisico: v.fisico,
        total: v.online + v.fisico,
        onlineCount: v.onlineCount,
        fisicoCount: v.fisicoCount,
      }));
  }, [orders]);

  // ── Top 10 products ────────────────────────────────────────────────────────

  const top10 = useMemo(() => {
    const map: Record<
      string,
      { name: string; categoria: string; units: number; revenue: number }
    > = {};
    orderItems.forEach((item) => {
      const pid = item.product_id;
      if (!map[pid]) {
        map[pid] = {
          name: item.products?.name ?? "Producto eliminado",
          categoria: item.products?.categories?.name ?? "Sin categoría",
          units: 0,
          revenue: 0,
        };
      }
      map[pid].units += item.quantity;
      map[pid].revenue += item.subtotal;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b.units - a.units)
      .slice(0, 10)
      .map(([pid, v], i) => ({ pid, pos: i + 1, ...v }));
  }, [orderItems]);

  // ── Ventas por categoría ───────────────────────────────────────────────────

  const catData = useMemo(() => {
    const map: Record<string, number> = {};
    orderItems.forEach((item) => {
      const cat = item.products?.categories?.name ?? "Sin categoría";
      map[cat] = (map[cat] ?? 0) + item.subtotal;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([categoria, ingresos]) => ({ categoria, ingresos }));
  }, [orderItems]);

  // ── Actividad por día de semana ────────────────────────────────────────────

  const dowData = useMemo(() => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    orders.forEach((o) => {
      const d = parseISO(o.created_at).getDay();
      totals[d] += o.total;
    });
    return dias.map((dia, i) => ({ dia, total: totals[i] }));
  }, [orders]);

  const dowMax = Math.max(...dowData.map((d) => d.total));

  // ── Discount impact ────────────────────────────────────────────────────────

  const ingresosBrutos = useMemo(() => orders.reduce((s, o) => s + (o.subtotal ?? o.total), 0), [orders]);
  const totalDescuentos = ingresosBrutos - totalRevenue;
  const descuentoPct = ingresosBrutos > 0 ? (totalDescuentos / ingresosBrutos) * 100 : 0;

  const discountChartData = [
    { name: "Bruto", value: ingresosBrutos, fill: "#8B5CF6" },
    { name: "Neto", value: totalRevenue, fill: "#3B82F6" },
  ];

  // ── Inventory alerts ───────────────────────────────────────────────────────

  const periodDays = Math.max(1, differenceInDays(parseISO(hasta), parseISO(desde)) + 1);

  const avgDailySalesByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    orderItems.forEach((item) => {
      map[item.product_id] = (map[item.product_id] ?? 0) + item.quantity;
    });
    const result: Record<string, number> = {};
    Object.entries(map).forEach(([pid, total]) => {
      result[pid] = total / periodDays;
    });
    return result;
  }, [orderItems, periodDays]);

  // Aggregate inventory by product_id
  const aggregatedInventory = useMemo(() => {
    const map: Record<
      string,
      { quantity: number; min_stock: number; name: string; sku: string }
    > = {};
    inventoryItems.forEach((item) => {
      if (!item.products) return;
      const pid = item.product_id;
      if (!map[pid]) {
        map[pid] = {
          quantity: 0,
          min_stock: item.min_stock ?? 0,
          name: item.products.name,
          sku: item.products.sku,
        };
      }
      map[pid].quantity += item.quantity;
      if ((item.min_stock ?? 0) > map[pid].min_stock) {
        map[pid].min_stock = item.min_stock ?? 0;
      }
    });
    return map;
  }, [inventoryItems]);

  const criticalStockItems = useMemo(() => {
    return Object.entries(aggregatedInventory)
      .filter(([, v]) => v.min_stock > 0 && v.quantity < v.min_stock)
      .map(([pid, v]) => {
        const avgDaily = avgDailySalesByProduct[pid] ?? 0;
        const daysToStockout =
          avgDaily > 0 ? Math.round(v.quantity / avgDaily) : null;
        return { pid, ...v, daysToStockout };
      })
      .sort((a, b) => a.quantity - b.quantity);
  }, [aggregatedInventory, avgDailySalesByProduct]);

  const deadStockItems = useMemo(() => {
    const recentSet = new Set(recentlySoldProductIds);
    return Object.entries(aggregatedInventory)
      .filter(([pid, v]) => v.quantity > 0 && !recentSet.has(pid))
      .map(([pid, v]) => ({ pid, ...v }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [aggregatedInventory, recentlySoldProductIds]);

  // ── Empty state ────────────────────────────────────────────────────────────

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-400">Sin datos en este período</h3>
        <p className="text-sm text-gray-400 mt-1">
          No hay pedidos completados con el filtro seleccionado.
        </p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── 6 KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          icon={DollarSign}
          label="Ingresos totales"
          value={formatBs(totalRevenue)}
          change={pctChange(totalRevenue, prevRevenue)}
          color="blue"
        />
        <KPICard
          icon={ShoppingBag}
          label="Pedidos totales"
          value={`${totalOrders}`}
          change={pctChange(totalOrders, prevCount)}
          color="green"
        />
        <KPICard
          icon={Globe}
          label="Ventas Online"
          value={formatBs(onlineRevenue)}
          change={pctChange(onlineRevenue, prevOnlineRevenue)}
          color="purple"
        />
        <KPICard
          icon={Store}
          label="Ventas Físico"
          value={formatBs(fisicoRevenue)}
          change={pctChange(fisicoRevenue, prevFisicoRevenue)}
          color="orange"
        />
        <KPICard
          icon={Activity}
          label="Ticket Promedio"
          value={formatBs(aov)}
          change={pctChange(aov, prevAov)}
          color="blue"
          subtitle="por pedido"
        />
        <KPICard
          icon={XCircle}
          label="Tasa de Cancelación"
          value={`${cancelRate.toFixed(1)}%`}
          change={null}
          color={cancelRate > 20 ? "red" : "green"}
          subtitle={`${cancelledCount} cancelados`}
        />
      </div>

      {/* ── Charts row: bar + donut ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Ingresos por día</h2>
              <p className="text-xs text-gray-500">Barras apiladas online vs físico</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={{ stroke: "#D1D5DB" }}
                tickLine={false}
                interval={Math.max(0, Math.floor(barData.length / 8) - 1)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `Bs${v}`}
                width={60}
              />
              <Tooltip content={<BarTooltip />} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="Online" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Físico" stackId="a" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Proporción</h2>
              <p className="text-xs text-gray-500">Online vs Físico</p>
            </div>
          </div>

          {donutData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Sin datos
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                  >
                    {donutData.map((_, index) => (
                      <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [formatBs(value), name]} />
                </PieChart>
              </ResponsiveContainer>

              <div className="-mt-[210px] mb-[210px] flex flex-col items-center justify-center pointer-events-none h-[210px]">
                <span className="text-xs text-gray-500 font-medium">Total</span>
                <span className="text-sm font-bold text-gray-900">{formatBs(totalRevenue)}</span>
              </div>

              <div className="mt-2 space-y-3">
                {donutData.map((entry, i) => {
                  const pct =
                    totalRevenue > 0 ? ((entry.value / totalRevenue) * 100).toFixed(1) : "0";
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: DONUT_COLORS[i] }}
                        />
                        <span className="text-sm font-semibold text-gray-700">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900">{pct}%</span>
                        <span className="text-xs text-gray-500 ml-1">({formatBs(entry.value)})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Top 10 productos ─────────────────────────────────────────────── */}
      {top10.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Top 10 productos más vendidos</h2>
              <p className="text-xs text-gray-500">Por unidades · período seleccionado</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Categoría
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Unidades
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {top10.map((row) => {
                  const medalBg =
                    row.pos === 1
                      ? "bg-yellow-50"
                      : row.pos === 2
                      ? "bg-gray-100"
                      : row.pos === 3
                      ? "bg-orange-50"
                      : "";
                  const medalColor =
                    row.pos === 1
                      ? "bg-yellow-400 text-white"
                      : row.pos === 2
                      ? "bg-gray-400 text-white"
                      : row.pos === 3
                      ? "bg-orange-400 text-white"
                      : "bg-gray-100 text-gray-500";
                  return (
                    <tr key={row.pid} className={`${medalBg} hover:brightness-95 transition-all`}>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${medalColor}`}
                        >
                          {row.pos}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 max-w-[200px] truncate">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                          {row.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {row.units.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-green-700">
                        {formatBs(row.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Ventas por categoría + Actividad por día de semana ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por categoría — horizontal bar chart */}
        {catData.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Ventas por categoría</h2>
                <p className="text-xs text-gray-500">Ingresos totales por categoría</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(180, catData.length * 44)}>
              <BarChart
                data={catData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `Bs${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="categoria"
                  tick={{ fontSize: 12, fill: "#374151" }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<SimpleTooltip />} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Actividad por día de semana */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Actividad por día de semana</h2>
              <p className="text-xs text-gray-500">Ingresos acumulados · barra máxima resaltada</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dowData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
              <XAxis
                dataKey="dia"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={{ stroke: "#D1D5DB" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `Bs${v}`}
                width={55}
              />
              <Tooltip
                formatter={(value: number) => [formatBs(value), "Ingresos"]}
                labelFormatter={(label) => `Día: ${label}`}
              />
              <Bar dataKey="total" name="Ingresos" radius={[6, 6, 0, 0]}>
                {dowData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.total === dowMax && dowMax > 0 ? "#3B82F6" : "#BFDBFE"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Alertas de inventario + Impacto de descuentos ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas de inventario */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Alertas de inventario</h2>
              <p className="text-xs text-gray-500">
                Stock crítico · Dead stock (+60 días sin movimiento)
              </p>
            </div>
          </div>

          {criticalStockItems.length === 0 && deadStockItems.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-green-700">Inventario en buen estado</p>
              <p className="text-xs text-gray-400 mt-1">Sin alertas de stock crítico ni dead stock.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Stock crítico */}
              {criticalStockItems.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Stock crítico ({criticalStockItems.length})
                  </p>
                  <div className="space-y-2">
                    {criticalStockItems.map((item) => (
                      <div
                        key={item.pid}
                        className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.sku}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Stock actual</p>
                            <p className="text-sm font-bold text-red-600">{item.quantity} u.</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Mínimo</p>
                            <p className="text-sm font-bold text-gray-700">{item.min_stock} u.</p>
                          </div>
                          {item.daysToStockout !== null && (
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-gray-500">Agotamiento</p>
                              <p
                                className={`text-sm font-bold ${
                                  item.daysToStockout <= 7 ? "text-red-600" : "text-orange-500"
                                }`}
                              >
                                ~{item.daysToStockout}d
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dead stock */}
              {deadStockItems.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Dead stock — sin movimiento 60 días ({deadStockItems.length})
                  </p>
                  <div className="space-y-2">
                    {deadStockItems.slice(0, 8).map((item) => (
                      <div
                        key={item.pid}
                        className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.sku}</p>
                        </div>
                        <div className="shrink-0 ml-4 text-right">
                          <p className="text-xs text-gray-500">En stock</p>
                          <p className="text-sm font-bold text-orange-600">{item.quantity} u.</p>
                        </div>
                      </div>
                    ))}
                    {deadStockItems.length > 8 && (
                      <p className="text-xs text-gray-400 text-center pt-1">
                        +{deadStockItems.length - 8} productos más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Impacto de descuentos */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-700 rounded-xl flex items-center justify-center">
              <Percent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Impacto de descuentos</h2>
              <p className="text-xs text-gray-500">Bruto vs neto · período</p>
            </div>
          </div>

          {/* Mini bar chart */}
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={discountChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip formatter={(value: number) => [formatBs(value), ""]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {discountChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Summary stats */}
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Ingresos brutos</span>
              <span className="text-sm font-bold text-purple-700">{formatBs(ingresosBrutos)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Total descuentos</span>
              <span className="text-sm font-bold text-red-600">
                -{formatBs(totalDescuentos)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Ingresos netos</span>
              <span className="text-sm font-bold text-blue-700">{formatBs(totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-medium text-gray-500">% descuento promedio</span>
              <span
                className={`text-sm font-bold ${
                  descuentoPct > 15 ? "text-red-600" : "text-green-600"
                }`}
              >
                {descuentoPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detalle por día (existing) ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Detalle por día</h2>
              <p className="text-xs text-gray-500">Máximo 30 días · ordenado descendente</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              Físico
            </span>
          </div>
        </div>

        <div className="overflow-y-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Online (Bs.)
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-orange-500 uppercase tracking-wider">
                  Físico (Bs.)
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total (Bs.)
                </th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Pedidos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableData.map((row) => (
                <tr key={row.date} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-gray-900">{row.dateFormatted}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-blue-700">
                    {row.online > 0 ? formatBs(row.online) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-orange-600">
                    {row.fisico > 0 ? formatBs(row.fisico) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-gray-900">
                    {formatBs(row.total)}
                  </td>
                  <td className="px-6 py-3.5 text-right text-gray-400 hidden sm:table-cell">
                    <span className="text-blue-500 font-medium">{row.onlineCount}</span>
                    {" + "}
                    <span className="text-orange-400 font-medium">{row.fisicoCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200 sticky bottom-0">
              <tr>
                <td className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase">
                  Total período
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-bold text-blue-700">
                  {formatBs(onlineRevenue)}
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-bold text-orange-600">
                  {formatBs(fisicoRevenue)}
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-bold text-gray-900">
                  {formatBs(totalRevenue)}
                </td>
                <td className="px-6 py-3.5 text-right text-xs text-gray-500 hidden sm:table-cell">
                  {totalOrders} pedidos
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
