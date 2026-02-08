"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, Location } from "@/lib/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Package,
  Filter,
  ChevronDown,
  AlertTriangle,
  Edit,
  MapPin,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PackageX,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: string;
  quantity: number;
  min_stock: number;
  location_id: string;
  locations: { id: string; name: string } | null;
}

interface ProductWithRelations {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  brand: string | null;
  sizes: string[];
  colors: string[];
  image_url: string | null;
  is_active: boolean;
  organization_id: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  categories: { id: string; name: string } | null;
  inventory: InventoryItem[];
}

interface InventoryClientProps {
  initialProducts: ProductWithRelations[];
  categories: Category[];
  locations: Location[];
  userRole: "admin" | "manager" | "staff";
  userLocationId: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function InventoryClient({
  initialProducts,
  categories,
  locations,
  userRole,
  userLocationId,
}: InventoryClientProps) {
  const router = useRouter();
  const [products, setProducts] =
    useState<ProductWithRelations[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState(
    userRole === "staff" && userLocationId ? userLocationId : ""
  );
  const [showFilters, setShowFilters] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"name" | "sku" | "price" | "stock">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({
    isOpen: false,
    productId: null,
    productName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 20;

  // ── Supabase Realtime ──────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("inventory-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory" },
        async () => {
          // Refetch products when inventory changes
          const { data } = await supabase
            .from("products")
            .select(
              `
              *,
              categories(id, name),
              inventory(id, quantity, min_stock, location_id, locations(id, name))
            `
            )
            .eq("organization_id", initialProducts[0]?.organization_id || "")
            .eq("is_active", true)
            .order("name");

          if (data) setProducts(data as ProductWithRelations[]);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        async () => {
          const { data } = await supabase
            .from("products")
            .select(
              `
              *,
              categories(id, name),
              inventory(id, quantity, min_stock, location_id, locations(id, name))
            `
            )
            .eq("organization_id", initialProducts[0]?.organization_id || "")
            .eq("is_active", true)
            .order("name");

          if (data) setProducts(data as ProductWithRelations[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialProducts]);

  // ── Filtering & Sorting ───────────────────────────────────────────────────

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        (product.brand && product.brand.toLowerCase().includes(searchLower));

      // Category filter
      const matchesCategory =
        !categoryFilter || product.category_id === categoryFilter;

      // Location filter — show only products that have inventory in this location
      const matchesLocation =
        !locationFilter ||
        product.inventory.some((inv) => inv.location_id === locationFilter);

      // Low stock filter
      const matchesLowStock =
        !onlyLowStock ||
        product.inventory.some((inv) => inv.quantity < inv.min_stock);

      return matchesSearch && matchesCategory && matchesLocation && matchesLowStock;
    });

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "sku":
          compareValue = a.sku.localeCompare(b.sku);
          break;
        case "price":
          compareValue = a.price - b.price;
          break;
        case "stock":
          const stockA = getTotalStock(a);
          const stockB = getTotalStock(b);
          compareValue = stockA - stockB;
          break;
      }

      return sortDirection === "asc" ? compareValue : -compareValue;
    });

    return filtered;
  }, [products, search, categoryFilter, locationFilter, onlyLowStock, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, locationFilter, onlyLowStock]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getStockForLocation = (product: ProductWithRelations, locId: string) => {
    const inv = product.inventory.find((i) => i.location_id === locId);
    return inv?.quantity ?? 0;
  };

  const getTotalStock = (product: ProductWithRelations) => {
    return product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
  };

  const isLowStock = (product: ProductWithRelations) => {
    return product.inventory.some(
      (inv) => inv.quantity < inv.min_stock
    );
  };

  const getStockBadgeColor = (quantity: number, minStock: number) => {
    if (quantity === 0) return "bg-red-100 text-red-800";
    if (quantity < minStock) return "bg-red-100 text-red-800";
    if (quantity < minStock * 2) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const activeLocationFilter = locationFilter
    ? locations.find((l) => l.id === locationFilter)
    : null;

  const activeCategoryFilter = categoryFilter
    ? categories.find((c) => c.id === categoryFilter)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredAndSortedProducts.length} producto
            {filteredAndSortedProducts.length !== 1 ? "s" : ""}
            {search || categoryFilter || locationFilter || onlyLowStock
              ? " encontrados"
              : " en total"}
          </p>
        </div>
        <button
          onClick={() => router.push("/inventario/nuevo")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por SKU, nombre o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
              showFilters || categoryFilter || locationFilter
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {(categoryFilter || locationFilter) && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(categoryFilter ? 1 : 0) + (locationFilter ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter dropdowns */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
            {/* Category */}
            <div className="relative flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Categoría
              </label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-700"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            {(userRole === "admin" || userRole === "manager") && (
              <div className="relative flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Ubicación
                </label>
                <div className="relative">
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-700"
                  >
                    <option value="">Todas las ubicaciones</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Low Stock Toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={onlyLowStock}
                  onChange={(e) => setOnlyLowStock(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo bajo stock
                </span>
              </label>
            </div>

            {/* Clear filters */}
            {(categoryFilter || locationFilter || onlyLowStock) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setCategoryFilter("");
                    setLocationFilter(
                      userRole === "staff" && userLocationId
                        ? userLocationId
                        : ""
                    );
                    setOnlyLowStock(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active filter badges */}
        {(activeCategoryFilter || activeLocationFilter) && !showFilters && (
          <div className="flex flex-wrap gap-2">
            {activeCategoryFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {activeCategoryFilter.name}
                <button
                  onClick={() => setCategoryFilter("")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {activeLocationFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <MapPin className="w-3 h-3" />
                {activeLocationFilter.name}
                <button
                  onClick={() =>
                    setLocationFilter(
                      userRole === "staff" && userLocationId
                        ? userLocationId
                        : ""
                    )
                  }
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="p-16 text-center">
            <PackageX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {products.length === 0
                ? "No hay productos registrados"
                : "No se encontraron productos"}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {products.length === 0
                ? "Agrega tu primer producto para comenzar"
                : "Intenta con otro término de búsqueda o ajusta los filtros"}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => router.push("/inventario/nuevo")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Agregar Primer Producto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 hover:text-gray-900 transition"
                    >
                      Producto
                      {sortField === "name" && (
                        <span className="text-blue-600">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    <button
                      onClick={() => handleSort("sku")}
                      className="flex items-center gap-1 hover:text-gray-900 transition"
                    >
                      SKU
                      {sortField === "sku" && (
                        <span className="text-blue-600">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    Categoría
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    <button
                      onClick={() => handleSort("price")}
                      className="flex items-center gap-1 ml-auto hover:text-gray-900 transition"
                    >
                      Precio
                      {sortField === "price" && (
                        <span className="text-blue-600">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    <button
                      onClick={() => handleSort("stock")}
                      className="flex items-center gap-1 ml-auto hover:text-gray-900 transition"
                    >
                      {locationFilter ? "Stock" : "Stock Total"}
                      {sortField === "stock" && (
                        <span className="text-blue-600">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product) => {
                  const stock = locationFilter
                    ? getStockForLocation(product, locationFilter)
                    : getTotalStock(product);
                  const lowStock = isLowStock(product);
                  const minStock = product.inventory[0]?.min_stock || 10;
                  const badgeColor = getStockBadgeColor(stock, minStock);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Imagen del producto */}
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-50 group-hover:to-blue-100 transition-all overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {product.name}
                            </p>
                            {product.brand && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {product.brand}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono font-medium">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.categories ? (
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                            {product.categories.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          Bs {product.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lowStock && (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}
                          >
                            {stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/inventario/${product.id}`)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Editar producto"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                productId: product.id,
                                productName: product.name,
                              })
                            }
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredAndSortedProducts.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold text-gray-900">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                {" - "}
                <span className="font-semibold text-gray-900">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAndSortedProducts.length
                  )}
                </span>
                {" de "}
                <span className="font-semibold text-gray-900">
                  {filteredAndSortedProducts.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first, last, current, and pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      // Add ellipsis
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with stock breakdown by location */}
        {!locationFilter && filteredAndSortedProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-700">Stock por ubicación:</span>
              {locations.map((loc) => {
                const locStock = filteredAndSortedProducts.reduce(
                  (sum, p) => sum + getStockForLocation(p, loc.id),
                  0
                );
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setLocationFilter(loc.id);
                      setShowFilters(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white hover:text-blue-600 transition-all hover:shadow-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{loc.name}:</span>
                    <span className="font-bold">{locStock}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, productId: null, productName: "" })
        }
        onConfirm={async () => {
          if (!deleteModal.productId) return;
          
          setIsDeleting(true);
          const supabase = createClient();
          
          try {
            // 1. Verify no sales exist for this product
            const { data: salesData } = await supabase
              .from("sale_items")
              .select("id")
              .eq("product_id", deleteModal.productId)
              .limit(1);

            if (salesData && salesData.length > 0) {
              toast.error("No se puede eliminar: el producto tiene ventas registradas");
              setIsDeleting(false);
              return;
            }

            // 2. Delete related inventory records first
            await supabase
              .from("inventory")
              .delete()
              .eq("product_id", deleteModal.productId);

            // 3. Delete the product
            const { error: productError } = await supabase
              .from("products")
              .delete()
              .eq("id", deleteModal.productId);

            if (productError) {
              if (productError.code === "23503") {
                toast.error("No se puede eliminar: el producto está siendo usado en otro registro");
              } else {
                toast.error(productError.message || "Error al eliminar el producto");
              }
              throw productError;
            }

            toast.success("Producto eliminado correctamente");
            setDeleteModal({ isOpen: false, productId: null, productName: "" });
            router.refresh();
          } catch (error: any) {
            console.error("Error al eliminar producto:", error);
            toast.error(error.message || "Error al eliminar el producto");
          } finally {
            setIsDeleting(false);
          }
        }}
        title="¿Eliminar producto?"
        message={`¿Estás seguro de que deseas eliminar "${deleteModal.productName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
