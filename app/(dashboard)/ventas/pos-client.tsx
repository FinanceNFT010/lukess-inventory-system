"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
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
  Scan,
  Printer,
  RotateCcw,
  Percent,
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
  color: string;
  bgColor: string;
}[] = [
  {
    value: "cash",
    label: "Efectivo",
    icon: Banknote,
    color: "text-success-600",
    bgColor: "bg-success-500",
  },
  {
    value: "qr",
    label: "QR",
    icon: QrCode,
    color: "text-brand-600",
    bgColor: "bg-brand-500",
  },
  {
    value: "card",
    label: "Tarjeta",
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-500",
  },
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
  const [discount, setDiscount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSale, setLastSale] = useState<{
    total: number;
    items: number;
    paymentMethod: PaymentMethod;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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
    setDiscount(0);
  };

  // ── Calculations ───────────────────────────────────────────────────────────

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Helper para formatear moneda
  const formatCurrency = (amount: number) => {
    return `Bs ${new Intl.NumberFormat("es-BO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

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
          discount: discountAmount,
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

      // Show success modal with confetti
      setLastSale({
        total,
        items: totalItems,
        paymentMethod,
      });
      setShowSuccessModal(true);
      setShowConfetti(true);

      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);

      clearCart();
    } catch {
      toast.error("Error inesperado al procesar la venta");
    } finally {
      setProcessing(false);
    }
  };

  const handleNewSale = () => {
    setShowSuccessModal(false);
    setLastSale(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        {/* ═══ LEFT COLUMN: Product Grid ═══ */}
        <div className="flex-1 lg:w-[60%] flex flex-col min-w-0 overflow-hidden">
          {/* Search + category tabs */}
          <div className="space-y-4 mb-4 flex-shrink-0">
            {/* Scanner-style search */}
            <div className="relative">
              <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" />
              <input
                type="text"
                placeholder="Escanear código de barras o buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400 shadow-sm"
              />
            </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                !categoryFilter
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
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
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat.name
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
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
                    className={`relative bg-white rounded-2xl border-2 p-4 text-left transition-all group ${
                      available <= 0
                        ? "border-gray-200 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-400 hover:shadow-lg cursor-pointer transform hover:scale-105"
                    }`}
                  >
                    {/* Image placeholder */}
                    <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3 flex items-center justify-center overflow-hidden group-hover:from-blue-50 group-hover:to-blue-100 transition-all">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-gray-300 group-hover:text-blue-400 transition" />
                      )}
                    </div>

                    {/* Info */}
                    <p className="text-xs text-gray-400 font-mono mb-1">
                      {product.sku}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate mb-1 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </p>
                    {product.brand && (
                      <p className="text-xs text-gray-500 truncate mb-2">
                        {product.brand}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-brand-600">
                        Bs {product.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          available <= 0
                            ? "bg-danger-100 text-danger-700"
                            : available <= 5
                              ? "bg-warning-100 text-warning-700"
                              : "bg-success-100 text-success-700"
                        }`}
                      >
                        {available}
                      </span>
                    </div>

                    {/* In cart badge */}
                    {inCart > 0 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg animate-bounce">
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
      <div className="lg:w-[40%] bg-white rounded-2xl border-2 border-gray-200 flex flex-col overflow-hidden shadow-xl">
        {/* Cart header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-purple-600 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-white" />
            <h2 className="font-bold text-white text-lg">Carrito</h2>
            {totalItems > 0 && (
              <span className="bg-white text-blue-600 text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                {totalItems}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-white hover:text-red-200 font-semibold hover:bg-white/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Vaciar
            </button>
          )}
        </div>

        {/* Customer name */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gray-50">
          <input
            type="text"
            placeholder="Nombre del cliente (opcional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400 bg-white"
          />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-base font-medium text-gray-900 mb-1">
                Carrito vacío
              </p>
              <p className="text-sm text-gray-500">
                Selecciona productos para agregar
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Mini image */}
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.product.price)} c/u
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-red-50 hover:border-red-300 transition-all"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-10 text-center text-base font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-green-50 hover:border-green-300 transition-all"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    {/* Item subtotal */}
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart footer */}
        {cart.length > 0 && (
          <div className="border-t-2 border-gray-200 flex-shrink-0 bg-gray-50">
            {/* Subtotal & Discount */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Subtotal
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {/* Discount input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(
                        Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                      )
                    }
                    placeholder="Descuento %"
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>
                {discount > 0 && (
                  <span className="text-sm font-semibold text-red-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-2 border-t-2 border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-blue-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="px-6 pb-4">
              <p className="text-sm font-bold text-gray-700 mb-3">
                Método de pago
              </p>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.value;
                  return (
                    <button
                      key={pm.value}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 text-sm font-bold transition-all transform ${
                        isSelected
                          ? `${pm.bgColor} text-white border-transparent shadow-lg scale-105`
                          : `bg-white border-gray-200 ${pm.color} hover:border-gray-300 hover:shadow-md`
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Finalize button */}
            <div className="px-6 pb-6">
              <button
                onClick={finalizeSale}
                disabled={processing || cart.length === 0}
                className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-2xl shadow-success-600/50 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-7 h-7" />
                    <span>Finalizar Venta — {formatCurrency(total)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Success Modal */}
      {showSuccessModal && lastSale && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              ¡Venta Completada!
            </h2>
            <p className="text-center text-gray-500 mb-6">
              La transacción se procesó exitosamente
            </p>

            {/* Sale summary */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Total de items
                </span>
                <span className="text-base font-bold text-gray-900">
                  {lastSale.items}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Método de pago
                </span>
                <span className="text-base font-bold text-gray-900 capitalize">
                  {paymentMethods.find((pm) => pm.value === lastSale.paymentMethod)
                    ?.label}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-success-600">
                  {formatCurrency(lastSale.total)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  // TODO: Implement print functionality
                  toast.success("Función de impresión próximamente");
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
              <button
                onClick={handleNewSale}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
