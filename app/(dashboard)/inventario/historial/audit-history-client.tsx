"use client";

import React, { useState } from "react";
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
  AlertTriangle,
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
  categoriesMap: Map<string, string>;
  locationsMap: Map<string, string>;
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
  categoriesMap,
  locationsMap,
}: AuditHistoryClientProps) {
  // Todos colapsados por defecto
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

  // Función para calcular porcentaje de cambio
  const calculatePercentageChange = (oldValue: number, newValue: number) => {
    if (!oldValue || oldValue === 0) return null;
    const change = ((newValue - oldValue) / oldValue) * 100;
    return change;
  };

  // Función para comparar arrays
  const arraysEqual = (a: any[], b: any[]) => {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  // Función para renderizar cambios de forma amigable
  const renderChanges = (log: AuditLog) => {
    if (log.action === "create") {
      // Producto creado - mostrar datos principales
      const data = log.new_data;
      return (
        <div className="space-y-4">
          {/* Imagen del producto */}
          {data.image_url && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">Imagen del Producto</p>
              <img
                src={data.image_url}
                alt="Producto"
                className="w-32 h-32 object-cover rounded-lg border-2 border-blue-300 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {data.name && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Nombre</p>
                <p className="text-sm text-green-900">{data.name}</p>
              </div>
            )}
            {data.sku && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">SKU</p>
                <p className="text-sm text-green-900 font-mono">{data.sku}</p>
              </div>
            )}
            {data.price && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Precio</p>
                <p className="text-sm text-green-900 font-bold">Bs {data.price}</p>
              </div>
            )}
            {data.cost && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Costo</p>
                <p className="text-sm text-green-900 font-bold">Bs {data.cost}</p>
              </div>
            )}
            {data.brand && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Marca</p>
                <p className="text-sm text-green-900">{data.brand}</p>
              </div>
            )}
            {data.category_id && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Categoría</p>
                <p className="text-sm text-green-900">{categoriesMap.get(data.category_id) || data.category_id}</p>
              </div>
            )}
          </div>

          {/* Tallas y Color */}
          <div className="grid grid-cols-2 gap-3">
            {data.sizes?.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-purple-700 mb-2">Tallas</p>
                <div className="flex flex-wrap gap-1">
                  {data.sizes.map((size: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.color && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-pink-700 mb-2">Color</p>
                <span className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-sm font-bold border border-pink-300">
                  {data.color}
                </span>
              </div>
            )}
            {data.sku_group && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-indigo-700 mb-2">Grupo SKU</p>
                <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-mono font-bold">
                  {data.sku_group}
                </span>
              </div>
            )}
          </div>

          {/* Stock inicial */}
          {(data.stock_by_location_and_size || data.initial_stock) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-2">Stock Inicial</p>
              <div className="space-y-2">
                {data.stock_by_location_and_size ? (
                  // Stock por ubicación y talla
                  Object.entries(data.stock_by_location_and_size).map(([locId, sizeStock]: [string, any]) => (
                    <div key={locId} className="bg-white rounded-lg p-2 border border-emerald-200">
                      <p className="text-xs font-bold text-emerald-900 mb-1">
                        {locationsMap.get(locId) || `Ubicación ${locId.slice(0, 8)}...`}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(sizeStock).map(([size, qty]: [string, any]) => (
                          <span key={size} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                            {size}: {qty}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // Stock simple por ubicación (legacy)
                  Object.entries(data.initial_stock).map(([locId, qty]: [string, any]) => (
                    <div key={locId} className="flex justify-between text-sm">
                      <span className="text-emerald-900">{locationsMap.get(locId) || `Ubicación ${locId.slice(0, 8)}...`}</span>
                      <span className="font-bold text-emerald-900">{qty} unidades</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Nota de auditoría */}
          {data.audit_note && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">📝</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Nota:</p>
                  <p className="text-sm text-yellow-900 italic">&quot;{data.audit_note}&quot;</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else if (log.action === "update") {
      // Producto modificado - mostrar solo lo que cambió
      const before = log.old_data || {};
      const after = log.new_data || {};
      const changes = [];

      // Detectar cambios importantes
      if (before.name !== after.name && (before.name || after.name)) {
        changes.push({ 
          type: "text",
          field: "Nombre", 
          before: before.name, 
          after: after.name, 
          important: true 
        });
      }
      
      if (before.sku !== after.sku && (before.sku || after.sku)) {
        changes.push({ 
          type: "text",
          field: "SKU", 
          before: before.sku, 
          after: after.sku, 
          important: true 
        });
      }
      
      if (before.price !== after.price && (before.price || after.price)) {
        const percentChange = calculatePercentageChange(before.price, after.price);
        changes.push({ 
          type: "price",
          field: "Precio", 
          before: before.price, 
          after: after.price, 
          percentChange,
          important: true, 
          critical: true 
        });
      }
      
      if (before.cost !== after.cost && (before.cost || after.cost)) {
        const percentChange = calculatePercentageChange(before.cost, after.cost);
        changes.push({ 
          type: "price",
          field: "Costo", 
          before: before.cost, 
          after: after.cost, 
          percentChange,
          important: true, 
          critical: true 
        });
      }
      
      if (before.brand !== after.brand && (before.brand || after.brand)) {
        changes.push({ 
          type: "text",
          field: "Marca", 
          before: before.brand || "Sin marca", 
          after: after.brand || "Sin marca", 
          important: true 
        });
      }
      
      if (before.category_id !== after.category_id && (before.category_id || after.category_id)) {
        changes.push({ 
          type: "text",
          field: "Categoría", 
          before: categoriesMap.get(before.category_id) || before.category_id || "Sin categoría", 
          after: categoriesMap.get(after.category_id) || after.category_id || "Sin categoría", 
          important: true 
        });
      }
      
      if (before.description !== after.description && (before.description || after.description)) {
        changes.push({ 
          type: "text",
          field: "Descripción", 
          before: before.description || "Sin descripción", 
          after: after.description || "Sin descripción", 
          important: false 
        });
      }
      
      if (before.image_url !== after.image_url && (before.image_url || after.image_url)) {
        changes.push({ 
          type: "image",
          field: "Imagen", 
          before: before.image_url, 
          after: after.image_url, 
          important: true 
        });
      }

      // Cambios en tallas
      if (!arraysEqual(before.sizes || [], after.sizes || [])) {
        changes.push({
          type: "array",
          field: "Tallas",
          before: before.sizes || [],
          after: after.sizes || [],
          important: true
        });
      }

      // Cambios en color único
      if (before.color !== after.color && (before.color || after.color)) {
        changes.push({
          type: "text",
          field: "Color",
          before: before.color || "Sin color",
          after: after.color || "Sin color",
          important: true
        });
      }

      // Cambios en SKU Group
      if (before.sku_group !== after.sku_group && (before.sku_group || after.sku_group)) {
        changes.push({
          type: "text",
          field: "Grupo SKU",
          before: before.sku_group || "Sin grupo",
          after: after.sku_group || "Sin grupo",
          important: false
        });
      }

      // Cambios de stock — usar datos precalculados para mostrar solo cambios reales
      if (after.stock_edit_summary?.stock_changes?.length > 0) {
        const stockChanges = after.stock_edit_summary.stock_changes.map((sc: any) => ({
          location: sc.location_name,
          size: sc.size,
          before: sc.before,
          after: sc.after,
          diff: sc.diff,
        }));
        changes.push({
          type: "stock",
          field: "Stock por Ubicación",
          stockChanges,
          warning: after.stock_edit_summary.warning || null,
          important: true,
        });
      }

      if (changes.length === 0) {
        return (
          <div className="text-sm text-gray-500 italic">
            No se detectaron cambios significativos
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {/* Nota de auditoría al inicio si existe */}
          {after.audit_note && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">📝</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Nota del cambio:</p>
                  <p className="text-sm text-yellow-900 italic">&quot;{after.audit_note}&quot;</p>
                </div>
              </div>
            </div>
          )}

          {changes.map((change: any, idx) => {
            // Renderizar según el tipo de cambio
            if (change.type === "image") {
              return (
                <div key={idx} className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-bold text-blue-700 uppercase">{change.field}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      🖼️ Imagen actualizada
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-2">Antes:</p>
                      {change.before ? (
                        <img
                          src={change.before}
                          alt="Antes"
                          className="w-full h-48 object-contain rounded-lg border-2 border-blue-300 shadow-md bg-white"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Sin imagen</text></svg>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-2">Ahora:</p>
                      {change.after ? (
                        <img
                          src={change.after}
                          alt="Ahora"
                          className="w-full h-48 object-contain rounded-lg border-2 border-green-300 shadow-md bg-white"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Sin imagen</text></svg>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            } else if (change.type === "price") {
              const isIncrease = change.after > change.before;
              const percentChange = change.percentChange;
              return (
                <div key={idx} className="border-2 border-amber-300 rounded-lg p-4 bg-amber-50">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-bold text-amber-800 uppercase">{change.field}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      💰 Cambio de {change.field.toLowerCase()}
                    </span>
                    {percentChange !== null && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isIncrease 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isIncrease ? '📈' : '📉'} {isIncrease ? '+' : ''}{percentChange.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <p className="text-xs text-amber-600 font-semibold mb-1">Antes:</p>
                      <p className="text-lg text-gray-900 font-bold line-through">Bs {change.before}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border-2 border-amber-400">
                      <p className="text-xs text-amber-600 font-semibold mb-1">Ahora:</p>
                      <p className="text-lg text-amber-900 font-bold">Bs {change.after}</p>
                    </div>
                  </div>
                </div>
              );
            } else if (change.type === "array") {
              const removed = change.before.filter((item: string) => !change.after.includes(item));
              const added = change.after.filter((item: string) => !change.before.includes(item));
              const isPurpleField = change.field === "Tallas";
              const colorClass = isPurpleField ? "purple" : "pink";
              
              return (
                <div key={idx} className={`border-2 border-${colorClass}-300 rounded-lg p-4 bg-${colorClass}-50`}>
                  <div className="flex items-center gap-2 mb-3">
                    <p className={`text-xs font-bold text-${colorClass}-700 uppercase`}>{change.field}</p>
                  </div>
                  <div className="space-y-3">
                    {removed.length > 0 && (
                      <div>
                        <p className="text-xs text-red-600 font-semibold mb-2">❌ Eliminados:</p>
                        <div className="flex flex-wrap gap-1">
                          {removed.map((item: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium line-through">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {added.length > 0 && (
                      <div>
                        <p className="text-xs text-green-600 font-semibold mb-2">✅ Agregados:</p>
                        <div className="flex flex-wrap gap-1">
                          {added.map((item: string, i: number) => (
                            <span key={i} className={`px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium`}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {removed.length === 0 && added.length === 0 && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-2">Actuales:</p>
                        <div className="flex flex-wrap gap-1">
                          {change.after.map((item: string, i: number) => (
                            <span key={i} className={`px-2 py-1 bg-${colorClass}-100 text-${colorClass}-700 rounded text-xs font-medium`}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else if (change.type === "stock") {
              // Cambios de stock por ubicación (y talla si aplica)
              return (
                <div key={idx} className="border-2 border-emerald-300 rounded-lg p-4 bg-emerald-50">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-bold text-emerald-700 uppercase">{change.field}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                      📦 Movimiento de stock
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Movimiento de Stock
                    </p>
                    {change.stockChanges.map((stockChange: any, i: number) => {
                      // Support both location_name (new) and location (legacy)
                      const locationName = stockChange.location_name || stockChange.location;
                      return (
                        <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-emerald-200">
                          <span className="text-sm font-medium text-gray-700">
                            📍 {locationName}
                            {stockChange.size && stockChange.size !== "Única"
                              ? ` · Talla ${stockChange.size}`
                              : ""}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 line-through">
                              {stockChange.before}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className={`text-sm font-bold ${
                              stockChange.diff > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {stockChange.after}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              stockChange.diff > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {stockChange.diff > 0 ? `+${stockChange.diff}` : stockChange.diff}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {change.warning && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-700">{change.warning}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              // Cambio de texto normal
              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-3 ${
                    change.important
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-bold text-gray-700 uppercase">{change.field}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Antes:</p>
                      <p className="text-sm text-gray-900 font-medium line-through">{change.before}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ahora:</p>
                      <p className="text-sm text-gray-900 font-bold">{change.after}</p>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      );
    } else if (log.action === "delete") {
      // Producto desactivado
      const productName = log.new_data?.product_name || "Producto";
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-900">
            El producto <span className="font-bold">{productName}</span> fue desactivado y ya no aparece en el inventario ni en el punto de venta.
          </p>
        </div>
      );
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
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`hover:bg-blue-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-100/50 border-l-4 border-blue-600' : ''}`}
                        onClick={() => toggleExpand(log.id)}
                      >
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
                          <div className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-600">Ocultar</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                <span>Ver cambios</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Detalles expandibles inmediatamente debajo */}
                      {isExpanded && (
                        <tr key={`${log.id}-details`} className="bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-blue-600">
                          <td colSpan={5} className="px-8 py-5">
                            <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
                              {renderChanges(log)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
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
