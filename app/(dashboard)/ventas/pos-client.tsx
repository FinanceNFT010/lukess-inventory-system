"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle,
  Package,
  X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface POSProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  image_url: string | null;
  brand: string | null;
  categories: { name: string } | null;
  inventory: { quantity: number; location_id: string }[];
}

interface CartItem {
  product: POSProduct;
  quantity: number;
}

type PaymentMethod = "cash" | "qr" | "card";

interface POSClientProps {
  initialProducts: POSProduct[];
  categories: { id: string; name: string }[];
  profileId: string;
  organizationId: string;
  locationId: string;
}

// ── Payment config ───────────────────────────────────────────────────────────

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "qr", label: "QR", icon: QrCode },
  { value: "card", label: "Tarjeta", icon: CreditCard },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function POSClient({
  initialProducts,
  categories,
  profileId,
  organizationId,
  locationId,
}: POSClientProps) {
  const [products] = useState<POSProduct[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [processing, setProcessing] = useState(false);

  // ── Filtered products ──────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        (p.brand && p.brand.toLowerCase().includes(searchLower));

      const matchesCategory =
        !categoryFilter || p.categories?.name === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  // ── Cart operations ────────────────────────────────────────────────────────

  const getStock = (product: POSProduct): number => {
    const inv = product.inventory.find((i) => i.location_id === locationId);
    return inv?.quantity ?? 0;
  };

  const getCartQuantity = (productId: string): number => {
    return cart.find((item) => item.product.id === productId)?.quantity || 0;
  };

  const addToCart = (product: POSProduct) => {
    const stock = getStock(product);
    const currentQty = getCartQuantity(product.id);

    if (currentQty >= stock) {
      toast.error("No hay suficiente stock disponible");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    const stock = getStock(item.product);
    if (newQty > stock) {
      toast.error("No hay suficiente stock");
      return;
    }

    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQty } : i
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
  };

  // ── Calculations ───────────────────────────────────────────────────────────

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = subtotal; // Extensible: add tax/discount here
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Finalize sale ──────────────────────────────────────────────────────────

  const finalizeSale = async () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    setProcessing(true);

    try {
      const supabase = createClient();

      // 1. Create sale record
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          organization_id: organizationId,
          location_id: locationId,
          sold_by: profileId,
          customer_name: customerName || null,
          subtotal,
          discount: 0,
          tax: 0,
          total,
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (saleError) {
        toast.error(`Error al crear venta: ${saleError.message}`);
        setProcessing(false);
        return;
      }

      // 2. Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) {
        toast.error(`Error al crear ítems: ${itemsError.message}`);
        setProcessing(false);
        return;
      }

      // 3. Decrement inventory for each item
      for (const item of cart) {
        const currentStock = getStock(item.product);

        const { error: invError } = await supabase
          .from("inventory")
          .update({ quantity: currentStock - item.quantity })
          .eq("product_id", item.product.id)
          .eq("location_id", locationId);

        if (invError) {
          toast.error(
            `Error al actualizar inventario de ${item.product.name}`
          );
        }
      }

      toast.success(
        `Venta completada — Bs ${total.toFixed(2)}`,
        {
          duration: 4000,
          icon: "🎉",
        }
      );

      clearCart();
    } catch {
      toast.error("Error inesperado al procesar la venta");
    } finally {
      setProcessing(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* ═══ LEFT COLUMN: Product Grid ═══ */}
      <div className="flex-1 lg:w-[60%] flex flex-col min-w-0 overflow-hidden">
        {/* Search + category tabs */}
        <div className="space-y-3 mb-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                !categoryFilter
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setCategoryFilter(
                    categoryFilter === cat.name ? "" : cat.name
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  categoryFilter === cat.name
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-900">
                No se encontraron productos
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Intenta con otro término
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const stock = getStock(product);
                const inCart = getCartQuantity(product.id);
                const available = stock - inCart;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={available <= 0}
                    className={`relative bg-white rounded-xl border p-3 text-left transition group ${
                      available <= 0
                        ? "border-gray-200 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
                    }`}
                  >
                    {/* Image placeholder */}
                    <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2.5 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>

                    {/* Info */}
                    <p className="text-xs text-gray-400 font-mono">
                      {product.sku}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
                      {product.name}
                    </p>
                    {product.brand && (
                      <p className="text-xs text-gray-400 truncate">
                        {product.brand}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-blue-600">
                        Bs {product.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          available <= 0
                            ? "bg-red-100 text-red-600"
                            : available <= 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {available}
                      </span>
                    </div>

                    {/* In cart badge */}
                    {inCart > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        {inCart}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT COLUMN: Cart ═══ */}
      <div className="lg:w-[40%] bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Cart header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Carrito</h2>
            {totalItems > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-2 py-1 rounded transition"
            >
              Vaciar
            </button>
          )}
        </div>

        {/* Customer name */}
        <div className="px-4 py-2 border-b border-gray-50 flex-shrink-0">
          <input
            type="text"
            placeholder="Nombre del cliente (opcional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingCart className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                Selecciona productos para agregar
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition"
                >
                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Bs {item.product.price.toFixed(2)} c/u
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={getStock(item.product)}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.product.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-10 h-7 text-center text-sm font-medium border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
                    />
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>

                  {/* Item total */}
                  <div className="text-right flex-shrink-0 w-20">
                    <p className="text-sm font-semibold text-gray-900">
                      Bs {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 flex-shrink-0">
            {/* Subtotal */}
            <div className="px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium text-gray-700">
                  Bs {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-xl font-bold text-gray-900">
                  Bs {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="px-4 pb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Método de pago
              </p>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.value}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition ${
                        paymentMethod === pm.value
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Finalize button */}
            <div className="px-4 pb-4">
              <button
                onClick={finalizeSale}
                disabled={processing || cart.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-base shadow-lg shadow-green-600/25"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {processing
                  ? "Procesando..."
                  : `Finalizar Venta — Bs ${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
