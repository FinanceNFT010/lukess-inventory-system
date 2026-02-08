"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { Search, Filter, Package } from "lucide-react";
import type { Product, Inventory, Category } from "@/lib/types";

interface ProductGridProps {
  products: (Product & {
    inventory?: Inventory[];
    category?: Category | null;
  })[];
  onProductSelect?: (product: Product) => void;
  variant?: "default" | "compact" | "detailed";
  showStock?: boolean;
  showProfitMargin?: boolean;
  enableSearch?: boolean;
  enableCategoryFilter?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  onProductSelect,
  variant = "default",
  showStock = true,
  showProfitMargin = false,
  enableSearch = true,
  enableCategoryFilter = true,
  emptyMessage = "No se encontraron productos",
}: ProductGridProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, string>();
    products.forEach((p) => {
      if (p.category) {
        uniqueCategories.set(p.category.id, p.category.name);
      }
    });
    return Array.from(uniqueCategories.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [products]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro de búsqueda
      const matchesSearch =
        search === "" ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(search.toLowerCase());

      // Filtro de categoría
      const matchesCategory =
        categoryFilter === "all" || product.category_id === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  // Determinar el grid según la variante
  const gridCols =
    variant === "compact"
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : variant === "detailed"
        ? "grid-cols-1"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      {(enableSearch || enableCategoryFilter) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          {enableSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Filtro de categoría */}
          {enableCategoryFilter && categories.length > 0 && (
            <div className="sm:w-64 relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors appearance-none bg-white"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Contador de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredProducts.length} producto
          {filteredProducts.length !== 1 ? "s" : ""} encontrado
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>

        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Grid de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">{emptyMessage}</p>
          {search && (
            <p className="text-gray-500 text-sm mt-2">
              Intenta con otros términos de búsqueda
            </p>
          )}
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={variant}
              showStock={showStock}
              showProfitMargin={showProfitMargin}
              onSelect={onProductSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
