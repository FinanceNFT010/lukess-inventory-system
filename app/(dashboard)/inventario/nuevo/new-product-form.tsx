"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import type { Category, Location } from "@/lib/types";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Wand2,
  Plus,
  X,
  Package,
  DollarSign,
  Tag,
  Palette,
  Ruler,
  MapPin,
} from "lucide-react";
import Link from "next/link";

// ── Schema ───────────────────────────────────────────────────────────────────

const productSchema = z.object({
  sku: z
    .string()
    .min(3, "El SKU debe tener al menos 3 caracteres")
    .max(20, "El SKU no puede exceder 20 caracteres"),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  category_id: z.string().optional(),
  brand: z.string().max(50, "Máximo 50 caracteres").optional(),
  price: z
    .number({ invalid_type_error: "Ingresa un precio válido" })
    .positive("El precio debe ser mayor a 0"),
  cost: z
    .number({ invalid_type_error: "Ingresa un costo válido" })
    .min(0, "El costo no puede ser negativo"),
  min_stock: z
    .number({ invalid_type_error: "Ingresa un valor válido" })
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo"),
});

type ProductFormData = z.infer<typeof productSchema>;

// ── Props ────────────────────────────────────────────────────────────────────

interface NewProductFormProps {
  categories: Category[];
  locations: Location[];
  organizationId: string;
  nextProductNumber: number;
}

// ── Predefined options ───────────────────────────────────────────────────────

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"];
const COMMON_COLORS = [
  { name: "Negro", hex: "#000000" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Gris", hex: "#9CA3AF" },
  { name: "Rojo", hex: "#EF4444" },
  { name: "Azul", hex: "#3B82F6" },
  { name: "Verde", hex: "#22C55E" },
  { name: "Amarillo", hex: "#EAB308" },
  { name: "Rosa", hex: "#EC4899" },
  { name: "Morado", hex: "#A855F7" },
  { name: "Naranja", hex: "#F97316" },
  { name: "Beige", hex: "#D4A574" },
  { name: "Café", hex: "#92400E" },
  { name: "Celeste", hex: "#7DD3FC" },
  { name: "Marino", hex: "#1E3A5F" },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function NewProductForm({
  categories,
  locations,
  organizationId,
  nextProductNumber,
}: NewProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState("");
  const [stockByLocation, setStockByLocation] = useState<
    Record<string, number>
  >(
    locations.reduce(
      (acc, loc) => ({ ...acc, [loc.id]: 0 }),
      {} as Record<string, number>
    )
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category_id: "",
      brand: "",
      price: 0,
      cost: 0,
      min_stock: 5,
    },
  });

  const currentSku = watch("sku");

  // ── Auto-generate SKU ──────────────────────────────────────────────────────

  const generateSku = () => {
    const prefix = "LH";
    const num = String(nextProductNumber).padStart(4, "0");
    const generated = `${prefix}-${num}`;
    setValue("sku", generated);
  };

  // ── Sizes ──────────────────────────────────────────────────────────────────

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addCustomSize = () => {
    const trimmed = customSize.trim().toUpperCase();
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
      setCustomSize("");
    }
  };

  // ── Colors ─────────────────────────────────────────────────────────────────

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);

    try {
      const supabase = createClient();

      // 1. Create product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          organization_id: organizationId,
          sku: data.sku,
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          brand: data.brand || null,
          price: data.price,
          cost: data.cost,
          sizes: selectedSizes,
          colors: selectedColors,
        })
        .select()
        .single();

      if (productError) {
        if (productError.code === "23505") {
          toast.error("Ya existe un producto con ese SKU");
        } else {
          toast.error(`Error al crear producto: ${productError.message}`);
        }
        setSaving(false);
        return;
      }

      // 2. Create inventory for each location
      const inventoryInserts = locations.map((loc) => ({
        product_id: product.id,
        location_id: loc.id,
        quantity: stockByLocation[loc.id] || 0,
        min_stock: data.min_stock,
      }));

      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert(inventoryInserts);

      if (inventoryError) {
        toast.error(`Producto creado pero error en inventario: ${inventoryError.message}`);
        setSaving(false);
        return;
      }

      toast.success("Producto creado exitosamente");
      router.push("/inventario");
      router.refresh();
    } catch {
      toast.error("Error inesperado al guardar");
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/inventario"
          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Completa la información del producto
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Información básica ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Package className="w-4 h-4 text-blue-600" />
            Información básica
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              SKU <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                {...register("sku")}
                placeholder="LH-0001"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400 font-mono"
              />
              <button
                type="button"
                onClick={generateSku}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
                title="Autogenerar SKU"
              >
                <Wand2 className="w-4 h-4" />
                Auto
              </button>
            </div>
            {errors.sku && (
              <p className="text-xs text-red-600">{errors.sku.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="Ej: Camisa Oxford Azul"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Descripción breve del producto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-gray-900 placeholder:text-gray-400"
            />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category + Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                {...register("category_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-700"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Marca
              </label>
              <input
                {...register("brand")}
                placeholder="Ej: Levi's"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* ── Precios ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <DollarSign className="w-4 h-4 text-green-600" />
            Precios
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Precio de venta (Bs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
              />
              {errors.price && (
                <p className="text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Costo (Bs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register("cost", { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
              />
              {errors.cost && (
                <p className="text-xs text-red-600">{errors.cost.message}</p>
              )}
            </div>
          </div>

          {/* Margin preview */}
          {watch("price") > 0 && watch("cost") >= 0 && (
            <div className="bg-gray-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm text-gray-600">Margen de ganancia</span>
              <span
                className={`text-sm font-semibold ${
                  watch("price") - watch("cost") > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Bs {(watch("price") - watch("cost")).toFixed(2)} (
                {watch("cost") > 0
                  ? (
                      ((watch("price") - watch("cost")) / watch("cost")) *
                      100
                    ).toFixed(1)
                  : "∞"}
                %)
              </span>
            </div>
          )}
        </div>

        {/* ── Tallas ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Ruler className="w-4 h-4 text-purple-600" />
            Tallas
            {selectedSizes.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {selectedSizes.length}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  selectedSizes.includes(size)
                    ? "bg-purple-50 border-purple-300 text-purple-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Custom size input */}
          <div className="flex gap-2">
            <input
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSize();
                }
              }}
              placeholder="Talla personalizada..."
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={addCustomSize}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium text-purple-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          </div>

          {/* Selected sizes display */}
          {selectedSizes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedSizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => toggleSize(size)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Colores ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Palette className="w-4 h-4 text-pink-600" />
            Colores
            {selectedColors.length > 0 && (
              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                {selectedColors.length}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleColor(color.name)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  selectedColors.includes(color.name)
                    ? "bg-pink-50 border-pink-300 text-pink-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>

          {selectedColors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedColors.map((color) => {
                const colorObj = COMMON_COLORS.find((c) => c.name === color);
                return (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-pink-100 text-pink-700"
                  >
                    {colorObj && (
                      <span
                        className="w-3 h-3 rounded-full border border-pink-200"
                        style={{ backgroundColor: colorObj.hex }}
                      />
                    )}
                    {color}
                    <button
                      type="button"
                      onClick={() => toggleColor(color)}
                      className="hover:text-pink-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Stock por ubicación ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Stock inicial por ubicación
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                Umbral bajo stock:
              </span>
              <input
                type="number"
                {...register("min_stock", { valueAsNumber: true })}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              />
            </div>
          </div>
          {errors.min_stock && (
            <p className="text-xs text-red-600">{errors.min_stock.message}</p>
          )}

          <div className="space-y-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {loc.name}
                  </p>
                  {loc.address && (
                    <p className="text-xs text-gray-400">{loc.address}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setStockByLocation((prev) => ({
                        ...prev,
                        [loc.id]: Math.max(0, (prev[loc.id] || 0) - 1),
                      }))
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition text-sm font-medium"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={stockByLocation[loc.id] || 0}
                    onChange={(e) =>
                      setStockByLocation((prev) => ({
                        ...prev,
                        [loc.id]: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setStockByLocation((prev) => ({
                        ...prev,
                        [loc.id]: (prev[loc.id] || 0) + 1,
                      }))
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition text-sm font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stock total preview */}
          <div className="bg-emerald-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-emerald-700 font-medium">
              Stock total inicial
            </span>
            <span className="text-sm font-bold text-emerald-700">
              {Object.values(stockByLocation).reduce((sum, q) => sum + q, 0)}{" "}
              unidades
            </span>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Link
            href="/inventario"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition shadow-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Guardando..." : "Crear Producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
