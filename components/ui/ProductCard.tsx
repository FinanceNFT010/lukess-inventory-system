"use client";

import { Package, TrendingUp, AlertTriangle } from "lucide-react";
import { Product, Inventory } from "@/lib/types";

interface ProductCardProps {
  product: Product & {
    inventory?: Inventory[];
    category?: { name: string } | null;
  };
  onSelect?: (product: Product) => void;
  showStock?: boolean;
  showProfitMargin?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export function ProductCard({
  product,
  onSelect,
  showStock = true,
  showProfitMargin = false,
  variant = "default",
  className = "",
}: ProductCardProps) {
  // Calcular stock total
  const totalStock =
    product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;

  // Calcular si está bajo en stock
  const minStock =
    product.inventory?.reduce((sum, inv) => sum + inv.min_stock, 0) || 0;
  const isLowStock = totalStock > 0 && totalStock <= minStock;

  // Calcular margen de ganancia
  const profitMargin =
    product.price && product.cost
      ? ((product.price - product.cost) / product.cost) * 100
      : 0;
  const profitAmount = product.price - product.cost;

  const handleClick = () => {
    if (onSelect) {
      onSelect(product);
    }
  };

  // Variante compacta (para POS)
  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={`w-full text-left bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mini imagen */}
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {product.name}
              </p>
              <p className="text-sm text-gray-500">{product.sku}</p>
              {product.category && (
                <p className="text-xs text-gray-400 mt-1">
                  {product.category.name}
                </p>
              )}
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="text-lg font-bold text-blue-600">
              Bs {product.price.toFixed(2)}
            </p>
            {showStock && (
              <p
                className={`text-sm font-medium ${isLowStock ? "text-red-600" : "text-green-600"
                  }`}
              >
                Stock: {totalStock}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  }

  // Variante detallada (para inventario)
  if (variant === "detailed") {
    return (
      <div
        className={`bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-6 ${className}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Imagen o placeholder */}
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`bg-blue-50 p-4 rounded-lg border-2 border-blue-200 flex-shrink-0 ${product.image_url ? 'hidden' : ''}`}>
              <Package className="w-10 h-10 text-blue-600" />
            </div>

            {/* Información del producto */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>

              {product.category && (
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                  {product.category.name}
                </span>
              )}

              {product.brand && (
                <p className="text-sm text-gray-500 mt-2">
                  Marca: {product.brand}
                </p>
              )}

              {product.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Alerta de bajo stock */}
          {isLowStock && (
            <div className="bg-red-50 p-2 rounded-lg border-2 border-red-200">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          )}
        </div>

        {/* Tallas y colores */}
        {(product.sizes.length > 0 || product.color) && (
          <div className="mb-4 space-y-2">
            {product.sizes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  Tallas:
                </span>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.color && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  Color:
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300">
                    {product.color}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Precios y stock */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-100">
          <div>
            <p className="text-sm text-gray-600 mb-1">Precio</p>
            <p className="text-xl font-bold text-blue-600">
              Bs {product.price.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Costo</p>
            <p className="text-xl font-bold text-gray-700">
              Bs {product.cost.toFixed(2)}
            </p>
          </div>

          {showStock && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Stock Total</p>
              <p
                className={`text-xl font-bold ${isLowStock
                  ? "text-red-600"
                  : totalStock === 0
                    ? "text-gray-400"
                    : "text-green-600"
                  }`}
              >
                {totalStock}
              </p>
            </div>
          )}
        </div>

        {/* Margen de ganancia */}
        {showProfitMargin && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Margen de Ganancia
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700 font-medium">
                  Ganancia por unidad
                </p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  +Bs {profitAmount.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
        )}

        {/* Inventario por ubicación */}
        {showStock && product.inventory && product.inventory.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-gray-100">
            <p className="text-sm text-gray-600 font-medium mb-2">
              Stock por ubicación:
            </p>
            <div className="space-y-1">
              {product.inventory.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">Ubicación {inv.location_id.slice(0, 8)}...</span>
                  <span
                    className={`font-semibold ${inv.quantity <= inv.min_stock
                      ? "text-red-600"
                      : "text-green-600"
                      }`}
                  >
                    {inv.quantity} unidades
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variante por defecto
  return (
    <button
      onClick={handleClick}
      className={`w-full text-left bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all overflow-hidden ${className}`}
    >
      {/* Imagen del producto */}
      {product.image_url ? (
        <div className="w-full h-48 bg-gray-100 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg></div>';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <Package className="w-12 h-12 text-gray-300" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 mb-1 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              {product.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                  {product.category.name}
                </span>
              )}
            </div>
          </div>

          {isLowStock && (
            <div className="bg-red-50 p-2 rounded-lg border-2 border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
          <div>
            <p className="text-sm text-gray-600">Precio</p>
            <p className="text-2xl font-bold text-blue-600">
              Bs {product.price.toFixed(2)}
            </p>
          </div>

          {showStock && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Stock</p>
              <p
                className={`text-2xl font-bold ${isLowStock
                  ? "text-red-600"
                  : totalStock === 0
                    ? "text-gray-400"
                    : "text-green-600"
                  }`}
              >
                {totalStock}
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
