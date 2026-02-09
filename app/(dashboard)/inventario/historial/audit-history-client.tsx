"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Package,
  AlertCircle,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: "create" | "update" | "delete";
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

interface AuditHistoryClientProps {
  auditLogs: AuditLog[];
  productsMap: Map<string, { id: string; name: string; sku: string }>;
}

const actionLabels: Record<string, { label: string; icon: any; color: string }> = {
  create: {
    label: "Crear",
    icon: Plus,
    color: "text-green-600 bg-green-50 border-green-200",
  },
  update: {
    label: "Modificar",
    icon: Edit,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  delete: {
    label: "Eliminar",
    icon: Trash2,
    color: "text-red-600 bg-red-50 border-red-200",
  },
};

export default function AuditHistoryClient({
  auditLogs,
  productsMap,
}: AuditHistoryClientProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleExpand = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-BO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getProductName = (recordId: string) => {
    const product = productsMap.get(recordId);
    return product ? `${product.name} (${product.sku})` : "Producto desconocido";
  };

  const getChangesDisplay = (log: AuditLog) => {
    if (log.action === "create") {
      return log.new_data;
    } else if (log.action === "update") {
      return { before: log.old_data, after: log.new_data };
    } else if (log.action === "delete") {
      return { before: log.old_data, after: log.new_data };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/inventario"
          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Cambios</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Registro de todas las modificaciones en productos
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {auditLogs.length === 0 ? (
          <div className="p-16 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              No hay registros de auditoría
            </p>
            <p className="text-sm text-gray-500">
              Los cambios en productos se mostrarán aquí
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    Fecha/Hora
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    Usuario
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    Acción
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    Producto
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => {
                  const actionInfo = actionLabels[log.action];
                  const ActionIcon = actionInfo?.icon || AlertCircle;
                  const isExpanded = expandedLogs.has(log.id);

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {log.profiles?.full_name || "Usuario desconocido"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.profiles?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${actionInfo?.color || "text-gray-600 bg-gray-50 border-gray-200"
                            }`}
                        >
                          <ActionIcon className="w-3.5 h-3.5" />
                          {actionInfo?.label || log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {getProductName(log.record_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ver cambios
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Expanded Details */}
            {auditLogs.map((log) => {
              const isExpanded = expandedLogs.has(log.id);
              if (!isExpanded) return null;

              const changes = getChangesDisplay(log);

              return (
                <div
                  key={`details-${log.id}`}
                  className="border-t border-gray-200 bg-gray-50 px-6 py-4"
                >
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Detalles del cambio:
                  </h4>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(changes, null, 2)}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Información sobre el historial</p>
          <p className="text-blue-700">
            Este registro muestra los últimos 100 cambios realizados en productos.
            Los cambios incluyen creación, modificación y eliminación (desactivación)
            de productos.
          </p>
        </div>
      </div>
    </div>
  );
}
