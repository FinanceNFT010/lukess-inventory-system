"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Calendar,
  TrendingUp,
  Search,
  X,
  PackageSearch,
  RefreshCw,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import type { OrderWithItems, OrderStatus } from "@/lib/types";
import { ORDER_STATUS_CONFIG } from "@/lib/types";
import { updateOrderStatus } from "./actions";
import OrderDetailModal from "./order-detail-modal";
import { createClient } from "@/lib/supabase/client";

interface PedidosClientProps {
  initialOrders: OrderWithItems[];
  userRole: string;
  userId: string;
}

type DateFilter = "today" | "7days" | "30days" | "all";
type PaymentFilter = "all" | "qr" | "efectivo" | "tarjeta";

const STATUS_TABS: { key: "all" | OrderStatus; label: string; icon?: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendientes", icon: "🕐" },
  { key: "confirmed", label: "Confirmados", icon: "✅" },
  { key: "shipped", label: "Enviados", icon: "🚚" },
  { key: "completed", label: "Completados", icon: "🎉" },
  { key: "cancelled", label: "Cancelados", icon: "❌" },
];

const STATUS_BORDER: Record<OrderStatus, string> = {
  pending: "border-l-amber-400",
  confirmed: "border-l-blue-400",
  shipped: "border-l-purple-400",
  completed: "border-l-green-400",
  cancelled: "border-l-red-300",
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "hace un momento";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return "ayer";

  return date.toLocaleDateString("es-BO", { day: "numeric", month: "short" });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getItemsSummary(order: OrderWithItems): string {
  if (!order.order_items?.length) return "Sin productos";
  const names = order.order_items
    .map((item) => {
      const name = item.product?.name ?? "Producto";
      const size = item.size ? ` ${item.size}` : "";
      return `${name}${size}`;
    })
    .join(", ");
  return names.length > 60 ? names.slice(0, 57) + "…" : names;
}

function sortOrders(orders: OrderWithItems[], status: "all" | OrderStatus): OrderWithItems[] {
  const sorted = [...orders];
  if (status === "confirmed" || status === "shipped") {
    return sorted.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
  return sorted.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export default function PedidosClient({
  initialOrders,
  userRole,
}: PedidosClientProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const canChangeStatus = userRole === "admin" || userRole === "manager";

  // Realtime subscription — new orders appear at top without page reload
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('pedidos-list')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const { data: newOrder } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                *,
                product:products (id, name, sku, image_url)
              )
            `)
            .eq('id', (payload.new as { id: string }).id)
            .single()

          if (newOrder) {
            setOrders((prev) => [newOrder as OrderWithItems, ...prev])
            toast.success(
              `Nuevo pedido de ${(newOrder as OrderWithItems).customer_name}`,
              { icon: '🛍️', duration: 4000 }
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const hasActiveFilters =
    searchQuery !== "" || dateFilter !== "all" || paymentFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setPaymentFilter("all");
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setSelectedOrder((prev) =>
      prev?.id === orderId ? { ...prev, status: newStatus } : prev
    );
  };

  const QUICK_ACTIONS: Partial<Record<OrderStatus, { nextStatus: OrderStatus; label: string; icon: string }>> = {
    pending:   { nextStatus: "confirmed",  label: "Confirmar",      icon: "✅" },
    confirmed: { nextStatus: "shipped",    label: "Marcar enviado", icon: "🚚" },
    shipped:   { nextStatus: "completed",  label: "Completado",     icon: "🎉" },
  };

  const QUICK_ACTION_MESSAGES: Partial<Record<OrderStatus, string>> = {
    confirmed: "Pedido confirmado",
    shipped:   "Pedido marcado como enviado",
    completed: "Pedido completado",
  };

  const handleQuickAction = async (
    orderId: string,
    newStatus: OrderStatus,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setConfirmingId(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(QUICK_ACTION_MESSAGES[newStatus] ?? "Estado actualizado");
        handleStatusChange(orderId, newStatus);
      }
    } finally {
      setConfirmingId(null);
    }
  };

  // Stats (based on live orders state)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const todayCount = orders.filter(
    (o) => new Date(o.created_at) >= startOfToday
  ).length;
  const monthRevenue = orders
    .filter(
      (o) =>
        o.status === "completed" && new Date(o.created_at) >= startOfMonth
    )
    .reduce((sum, o) => sum + o.total, 0);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.id.slice(0, 8).toLowerCase().includes(q)
      );
    }

    if (dateFilter !== "all") {
      const cutoff =
        dateFilter === "today"
          ? startOfToday
          : dateFilter === "7days"
          ? new Date(now.getTime() - 7 * 86400000)
          : new Date(now.getTime() - 30 * 86400000);
      result = result.filter((o) => new Date(o.created_at) >= cutoff);
    }

    if (paymentFilter !== "all") {
      const paymentMap: Record<PaymentFilter, string[]> = {
        all: [],
        qr: ["qr", "QR", "transferencia", "transfer"],
        efectivo: ["efectivo", "cash", "Efectivo"],
        tarjeta: ["tarjeta", "card", "Tarjeta"],
      };
      const matches = paymentMap[paymentFilter];
      result = result.filter((o) =>
        matches.some((m) => o.payment_method.toLowerCase().includes(m.toLowerCase()))
      );
    }

    return sortOrders(result, activeTab);
  }, [orders, activeTab, searchQuery, dateFilter, paymentFilter]);

  // Tab counts (apply search+date+payment, not tab itself)
  const tabCounts = useMemo(() => {
    const base = orders.filter((o) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (
          !o.customer_name.toLowerCase().includes(q) &&
          !o.customer_phone.includes(q) &&
          !o.id.slice(0, 8).toLowerCase().includes(q)
        )
          return false;
      }
      if (dateFilter !== "all") {
        const cutoff =
          dateFilter === "today"
            ? startOfToday
            : dateFilter === "7days"
            ? new Date(now.getTime() - 7 * 86400000)
            : new Date(now.getTime() - 30 * 86400000);
        if (new Date(o.created_at) < cutoff) return false;
      }
      if (paymentFilter !== "all") {
        const paymentMap: Record<PaymentFilter, string[]> = {
          all: [],
          qr: ["qr", "QR", "transferencia", "transfer"],
          efectivo: ["efectivo", "cash", "Efectivo"],
          tarjeta: ["tarjeta", "card", "Tarjeta"],
        };
        const matches = paymentMap[paymentFilter];
        if (!matches.some((m) => o.payment_method.toLowerCase().includes(m.toLowerCase())))
          return false;
      }
      return true;
    });

    return {
      all: base.length,
      pending: base.filter((o) => o.status === "pending").length,
      confirmed: base.filter((o) => o.status === "confirmed").length,
      shipped: base.filter((o) => o.status === "shipped").length,
      completed: base.filter((o) => o.status === "completed").length,
      cancelled: base.filter((o) => o.status === "cancelled").length,
    };
  }, [orders, searchQuery, dateFilter, paymentFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              📦 Pedidos Online
            </h1>
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Gestión de pedidos de la tienda online
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-6 h-6 text-amber-600" />
            <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
          </div>
          <p className="text-sm font-semibold text-amber-700">Pendientes</p>
          <p className="text-xs text-amber-500 mt-0.5">Requieren atención</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">{confirmedCount}</span>
          </div>
          <p className="text-sm font-semibold text-blue-700">Confirmados</p>
          <p className="text-xs text-blue-500 mt-0.5">En proceso</p>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">{todayCount}</span>
          </div>
          <p className="text-sm font-semibold text-purple-700">Hoy</p>
          <p className="text-xs text-purple-500 mt-0.5">Nuevos pedidos</p>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="text-lg font-bold text-green-700">
              Bs {formatCurrency(monthRevenue)}
            </span>
          </div>
          <p className="text-sm font-semibold text-green-700">Total del mes</p>
          <p className="text-xs text-green-500 mt-0.5">Ingresos confirmados</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o ID del pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]"
          >
            <option value="all">📅 Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
          >
            <option value="all">💳 Todos los pagos</option>
            <option value="qr">QR / Transfer</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Búsqueda: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dateFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                {dateFilter === "today" ? "Hoy" : dateFilter === "7days" ? "Últimos 7 días" : "Últimos 30 días"}
                <button onClick={() => setDateFilter("all")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {paymentFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Pago: {paymentFilter === "qr" ? "QR/Transfer" : paymentFilter === "efectivo" ? "Efectivo" : "Tarjeta"}
                <button onClick={() => setPaymentFilter("all")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {STATUS_TABS.map((tab) => {
            const count = tabCounts[tab.key];
            const isActive = activeTab === tab.key;
            const isPending = tab.key === "pending";

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2
                  ${
                    isActive
                      ? "bg-gradient-to-b from-white to-blue-50 border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
                style={
                  isActive
                    ? { WebkitTextFillColor: "transparent", backgroundClip: "text" }
                    : {}
                }
              >
                {tab.icon && <span className="text-base">{tab.icon}</span>}
                <span
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(to right, #2563eb, #9333ea)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }
                      : {}
                  }
                >
                  {tab.label}
                </span>
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isPending && count > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                  style={isActive ? { WebkitTextFillColor: "white" } : {}}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PackageSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No se encontraron pedidos
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Intenta con otros filtros
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const config = ORDER_STATUS_CONFIG[order.status as OrderStatus];
              const borderColor = STATUS_BORDER[order.status as OrderStatus];
              const isPending = order.status === "pending";
              const itemsCount = order.order_items?.length ?? 0;
              const itemsSummary = getItemsSummary(order);
              const isConfirming = confirmingId === order.id;
              const quickAction = QUICK_ACTIONS[order.status as OrderStatus];

              return (
                <div
                  key={order.id}
                  className={`
                    border border-gray-200 rounded-xl border-l-4 ${borderColor} overflow-hidden transition-shadow hover:shadow-md
                    ${isPending ? "bg-amber-50/40" : "bg-white"}
                  `}
                >
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                            ${config.bgColor} ${config.color} border ${config.borderColor}
                          `}
                        >
                          <span>{config.icon}</span>
                          {config.label}
                        </span>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                            ⚠ Requiere atención
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {formatRelativeTime(order.created_at)}
                      </span>
                    </div>

                    {/* Order ID */}
                    <p className="font-mono text-xs text-gray-400 mb-3">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>

                    {/* Customer */}
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        👤 {order.customer_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        📱 {order.customer_phone}
                      </span>
                    </div>

                    {/* Items */}
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">
                        📦 {itemsCount} {itemsCount === 1 ? "producto" : "productos"}:
                      </span>{" "}
                      <span className="text-gray-500">{itemsSummary}</span>
                    </p>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        Bs {formatCurrency(order.total)}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Quick action button for non-terminal orders */}
                        {quickAction && canChangeStatus && (
                          <button
                            onClick={(e) => handleQuickAction(order.id, quickAction.nextStatus, e)}
                            disabled={isConfirming}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isConfirming ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>{quickAction.icon}</span>
                            )}
                            {quickAction.label}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Ver detalle →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
        userRole={userRole as "admin" | "manager" | "staff"}
      />
    </div>
  );
}
