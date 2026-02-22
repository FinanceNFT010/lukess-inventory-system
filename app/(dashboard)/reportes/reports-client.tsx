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
} from "lucide-react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderRow {
  id: string;
  total: number;
  canal: "online" | "fisico" | null;
  created_at: string;
  status: string;
}

interface ReportesVentasClientProps {
  orders: OrderRow[];
  prevOrders: OrderRow[];
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
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: number | null;
  color: "blue" | "green" | "purple" | "orange";
  delay?: number;
}) {
  const colors = {
    blue: "from-blue-500 to-blue-700",
    green: "from-green-500 to-green-700",
    purple: "from-purple-500 to-purple-700",
    orange: "from-orange-400 to-orange-600",
  };

  return (
    <div
      className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-md`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== null && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
              change >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {change >= 0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Custom tooltip for bar chart
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
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: p.fill }}
            />
            <span className="text-xs font-medium text-gray-600">{p.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-900">
            {formatBs(p.value)}
          </span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
        <span className="text-xs text-gray-500">Total</span>
        <span className="text-xs font-bold text-gray-900">{formatBs(total)}</span>
      </div>
    </div>
  );
}

// Custom label for center of donut
function DonutCenter({
  cx,
  cy,
  total,
}: {
  cx?: number;
  cy?: number;
  total: number;
}) {
  if (!cx || !cy) return null;
  return (
    <text textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} y={cy - 10} fontSize={11} fill="#6B7280" fontWeight={500}>
        Total
      </tspan>
      <tspan x={cx} y={cy + 10} fontSize={13} fill="#111827" fontWeight={700}>
        {formatBs(total)}
      </tspan>
    </text>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReportesVentasClient({
  orders,
  prevOrders,
  desde,
  hasta,
  canalFilter,
}: ReportesVentasClientProps) {
  // ── KPI calculations ───────────────────────────────────────────────────────

  const totalRevenue = useMemo(
    () => orders.reduce((s, o) => s + o.total, 0),
    [orders]
  );
  const totalOrders = orders.length;

  const onlineOrders = useMemo(
    () => orders.filter((o) => o.canal === "online" || o.canal === null),
    [orders]
  );
  const fisicoOrders = useMemo(
    () => orders.filter((o) => o.canal === "fisico"),
    [orders]
  );

  const onlineRevenue = useMemo(
    () => onlineOrders.reduce((s, o) => s + o.total, 0),
    [onlineOrders]
  );
  const fisicoRevenue = useMemo(
    () => fisicoOrders.reduce((s, o) => s + o.total, 0),
    [fisicoOrders]
  );

  // Previous period
  const prevRevenue = useMemo(
    () => prevOrders.reduce((s, o) => s + o.total, 0),
    [prevOrders]
  );
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
      prevOrders
        .filter((o) => o.canal === "fisico")
        .reduce((s, o) => s + o.total, 0),
    [prevOrders]
  );

  // ── Bar chart data (by day) ────────────────────────────────────────────────

  const barData = useMemo(() => {
    const start = parseISO(desde);
    const end = parseISO(hasta);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = orders.filter(
        (o) => format(parseISO(o.created_at), "yyyy-MM-dd") === dayStr
      );
      const online = dayOrders
        .filter((o) => o.canal === "online" || o.canal === null)
        .reduce((s, o) => s + o.total, 0);
      const fisico = dayOrders
        .filter((o) => o.canal === "fisico")
        .reduce((s, o) => s + o.total, 0);

      return {
        fecha: format(day, "dd/MM"),
        Online: online,
        Físico: fisico,
      };
    });
  }, [orders, desde, hasta]);

  // ── Donut data ─────────────────────────────────────────────────────────────

  const donutData = useMemo(() => {
    const data = [];
    if (onlineRevenue > 0) data.push({ name: "Online", value: onlineRevenue });
    if (fisicoRevenue > 0) data.push({ name: "Físico", value: fisicoRevenue });
    return data;
  }, [onlineRevenue, fisicoRevenue]);

  const DONUT_COLORS = ["#3B82F6", "#F97316"];

  // ── Table data (by day descending) ────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

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

  const onlinePct = totalRevenue > 0 ? (onlineRevenue / totalRevenue) * 100 : 0;
  const fisicoPct = totalRevenue > 0 ? (fisicoRevenue / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          icon={DollarSign}
          label="Ingresos totales"
          value={formatBs(totalRevenue)}
          change={pctChange(totalRevenue, prevRevenue)}
          color="blue"
          delay={0}
        />
        <KPICard
          icon={ShoppingBag}
          label="Pedidos totales"
          value={`${totalOrders}`}
          change={pctChange(totalOrders, prevCount)}
          color="green"
          delay={100}
        />
        <KPICard
          icon={Globe}
          label="Ventas Online"
          value={formatBs(onlineRevenue)}
          change={pctChange(onlineRevenue, prevOnlineRevenue)}
          color="purple"
          delay={200}
        />
        <KPICard
          icon={Store}
          label="Ventas Físico"
          value={formatBs(fisicoRevenue)}
          change={pctChange(fisicoRevenue, prevFisicoRevenue)}
          color="orange"
          delay={300}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Ingresos por día
              </h2>
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
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <Bar
                dataKey="Online"
                stackId="a"
                fill="#3B82F6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Físico"
                stackId="a"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
              />
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
                      <Cell
                        key={index}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                    {/* Center label via label prop */}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatBs(value),
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center label absolute */}
              <div className="-mt-[210px] mb-[210px] flex flex-col items-center justify-center pointer-events-none h-[210px]">
                <span className="text-xs text-gray-500 font-medium">Total</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatBs(totalRevenue)}
                </span>
              </div>

              {/* Legend */}
              <div className="mt-2 space-y-3">
                {donutData.map((entry, i) => {
                  const pct =
                    totalRevenue > 0
                      ? ((entry.value / totalRevenue) * 100).toFixed(1)
                      : "0";
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
                        <span className="text-sm font-semibold text-gray-700">
                          {entry.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900">
                          {pct}%
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({formatBs(entry.value)})
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

      {/* Detail table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Detalle por día
              </h2>
              <p className="text-xs text-gray-500">
                Máximo 30 días · ordenado descendente
              </p>
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
                <tr
                  key={row.date}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3.5 font-medium text-gray-900">
                    {row.dateFormatted}
                  </td>
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
                    <span className="text-blue-500 font-medium">
                      {row.onlineCount}
                    </span>
                    {" + "}
                    <span className="text-orange-400 font-medium">
                      {row.fisicoCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals row */}
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
