"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import type { Category, Location } from "@/lib/types";
import toast from "react-hot-toast";
import { LoadingButton } from "@/components/ui/LoadingButton";
import {
  ArrowLeft,
  Save,
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
  sku: z.string().min(1, "SKU es requerido").max(50, "Máximo 50 caracteres"),
  name: z.string().min(1, "Nombre es requerido").max(200, "Máximo 200 caracteres"),
  description: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  category_id: z.string().uuid("Selecciona una categoría válida").optional().nullable(),
  brand: z.string().max(50, "Máximo 50 caracteres").optional(),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  cost: z.coerce.number().positive("El costo debe ser mayor a 0").optional(),
  sizes: z.array(z.string()).min(1, "Selecciona al menos una talla"),
  colors: z.array(z.string()).min(1, "Selecciona al menos un color"),
  low_stock_threshold: z.coerce.number().int().min(1, "Mínimo 1").default(5),
});

// ── Types ────────────────────────────────────────────────────────────────────

interface EditProductFormProps {
  product: any;
  categories: Category[];
  locations: Location[];
  organizationId: string;
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

export default function EditProductForm({
  product,
  categories,
  locations,
  organizationId,
}: EditProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product.sizes || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(product.colors || []);
  const [customSize, setCustomSize] = useState("");
  const [stockByLocation, setStockByLocation] = useState<Record<string, number>>(
    product.inventory.reduce(
      (acc: Record<string, number>, inv: any) => ({ ...acc, [inv.location_id]: inv.quantity }),
      {} as Record<string, number>
    )
  );

  const form = useForm({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      sku: product.sku || "",
      name: product.name || "",
      description: product.description || "",
      category_id: product.category_id || "",
      brand: product.brand || "",
      price: product.price || 0,
      cost: product.cost || 0,
      sizes: product.sizes || [],
      colors: product.colors || [],
      low_stock_threshold: product.low_stock_threshold || 5,
    },
  });

  const { register, handleSubmit, setValue, formState: { errors } } = form;

  // Update form when sizes/colors change
  useEffect(() => {
    setValue("sizes", selectedSizes);
  }, [selectedSizes, setValue]);

  useEffect(() => {
    setValue("colors", selectedColors);
  }, [selectedColors, setValue]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: any) => {
    setSaving(true);
    const supabase = createClient();

    try {
      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update({
          sku: data.sku,
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          brand: data.brand || null,
          price: data.price,
          cost: data.cost,
          sizes: selectedSizes,
          colors: selectedColors,
          low_stock_threshold: data.low_stock_threshold,
        })
        .eq("id", product.id)
        .eq("organization_id", organizationId);

      if (productError) throw productError;

      // Update inventory quantities
      for (const [locationId, quantity] of Object.entries(stockByLocation)) {
        const existingInv = product.inventory.find((inv: any) => inv.location_id === locationId);
        
        if (existingInv) {
          // Update existing
          const { error: invError } = await supabase
            .from("inventory")
            .update({ quantity })
            .eq("id", existingInv.id);
          
          if (invError) throw invError;
        } else if (quantity > 0) {
          // Create new
          const { error: invError } = await supabase
            .from("inventory")
            .insert({
              product_id: product.id,
              location_id: locationId,
              quantity,
              min_stock: data.low_stock_threshold,
            });
          
          if (invError) throw invError;
        }
      }

      toast.success("Producto actualizado correctamente");
      router.push("/inventario");
      router.refresh();
    } catch (error: any) {
      console.error("Error al actualizar producto:", error);
      toast.error(error.message || "Error al actualizar el producto");
    } finally {
      setSaving(false);
    }
  };

  // ── Size handlers ────────────────────────────────────────────────────────────

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addCustomSize = () => {
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      setSelectedSizes([...selectedSizes, customSize.trim()]);
      setCustomSize("");
    }
  };

  const removeSize = (size: string) => {
    setSelectedSizes(selectedSizes.filter((s) => s !== size));
  };

  // ── Color handlers ───────────────────────────────────────────────────────────

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/inventario"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inventario
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
            <p className="text-sm text-gray-500">Actualiza la información del producto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                {...register("sku")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="Ej: LH-0001"
              />
              {errors.sku && (
                <p className="text-xs text-red-600 mt-1">{errors.sku.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="Ej: Camisa Columbia Azul"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name.message as string}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition resize-none"
              placeholder="Descripción detallada del producto..."
            />
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                {...register("category_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition text-gray-700"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                {...register("brand")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="Ej: Columbia, Nike, Adidas"
              />
            </div>
          </div>

          {/* Price & Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta (Bs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-xs text-red-600 mt-1">{errors.price.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo (Bs)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("cost")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tallas <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                    selectedSizes.includes(size)
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSize())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="Talla personalizada"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {selectedSizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedSizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 text-xs font-medium rounded"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="hover:text-brand-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.sizes && (
              <p className="text-xs text-red-600 mt-1">{errors.sizes.message as string}</p>
            )}
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colores <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {COMMON_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => toggleColor(color.name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition ${
                    selectedColors.includes(color.name)
                      ? "border-brand-600 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-sm font-medium text-gray-700">{color.name}</span>
                </button>
              ))}
            </div>
            {errors.colors && (
              <p className="text-xs text-red-600 mt-1">{errors.colors.message as string}</p>
            )}
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Umbral de Stock Bajo
            </label>
            <input
              type="number"
              {...register("low_stock_threshold")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              placeholder="5"
            />
          </div>

          {/* Stock by Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Stock por Ubicación
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {location.name}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={stockByLocation[location.id] || 0}
                    onChange={(e) =>
                      setStockByLocation({
                        ...stockByLocation,
                        [location.id]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/inventario"
              className="px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              Cancelar
            </Link>
            <LoadingButton
              type="submit"
              loading={saving}
              loadingText="Actualizando..."
              variant="primary"
            >
              <Save className="w-5 h-5" />
              Actualizar Producto
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
