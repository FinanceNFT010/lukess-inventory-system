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
  TrendingUp,
  ImageIcon,
  AlertTriangle,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { togglePublishedToLanding } from "../actions";

// ── Schema ───────────────────────────────────────────────────────────────────

const productSchema = z.object({
  sku: z.string().min(1, "SKU es requerido").max(50, "Máximo 50 caracteres"),
  sku_group: z.string().max(50, "Máximo 50 caracteres").optional().nullable(),
  name: z.string().min(1, "Nombre es requerido").max(200, "Máximo 200 caracteres"),
  description: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  category_id: z.string().optional().nullable().transform(val => val === "" ? null : val),
  brand: z.string().max(50, "Máximo 50 caracteres").optional(),
  image_url: z.string().optional().or(z.literal("")),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  cost: z.coerce.number().positive("El costo debe ser mayor a 0").optional(),
  color: z.string().max(50, "Máximo 50 caracteres").optional().nullable(),
  sizes: z.array(z.string()).optional().default([]),
  low_stock_threshold: z.coerce.number().int().min(1, "Mínimo 1").default(5),
  discount: z.coerce.number().min(0, "Mínimo 0").optional(),
  discount_expires_at: z.string().optional().nullable(),
  is_new: z.boolean().default(false),
  is_new_until: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
});

// ── Types ────────────────────────────────────────────────────────────────────

interface StockChange {
  location_name: string;
  size: string;
  before: number;
  after: number;
  diff: number;
}

interface EditProductFormProps {
  product: any;
  categories: Category[];
  locations: Location[];
  organizationId: string;
}

// ── Predefined options ───────────────────────────────────────────────────────

const ALLOWED_SIZES = ["S", "M", "L", "XL", "38", "40", "42", "44"];
const COMMON_COLORS = [
  "Negro",
  "Blanco",
  "Gris",
  "Azul",
  "Azul marino",
  "Verde",
  "Verde militar",
  "Rojo",
  "Beige",
  "Café",
  "Celeste",
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
  const [auditNote, setAuditNote] = useState("");
  const [publishedToLanding, setPublishedToLanding] = useState<boolean>(
    product.published_to_landing ?? false
  );
  const [togglingLanding, setTogglingLanding] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customSize, setCustomSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(product.color || "");
  const [customColorInput, setCustomColorInput] = useState<string>("");
  const [pendingStockWarning, setPendingStockWarning] = useState<{
    stockChanges: StockChange[];
    totalDiff: number;
    onConfirm: () => void;
  } | null>(null);

  // Stock por ubicación y talla: { locationId: { size: quantity } }
  const [stockByLocationAndSize, setStockByLocationAndSize] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};

    console.log('📦 Inventory recibido:', product.inventory);

    // Cargar stock real desde inventory
    if (product.inventory && Array.isArray(product.inventory)) {
      product.inventory.forEach((inv: any) => {
        console.log('  - Procesando inv:', inv);
        if (!initial[inv.location_id]) {
          initial[inv.location_id] = {};
        }
        const size = inv.size || 'Unitalla';
        const currentQty = initial[inv.location_id][size] || 0;
        initial[inv.location_id][size] = currentQty + (inv.quantity || 0);
      });
    }

    console.log('📦 Stock final cargado:', initial);
    return initial;
  });


  const form = useForm({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      sku: product.sku || "",
      sku_group: product.sku_group || "",
      name: product.name || "",
      description: product.description || "",
      category_id: product.category_id || "",
      brand: product.brand || "",
      image_url: product.image_url || "",
      price: product.price || 0,
      cost: product.cost || 0,
      color: product.color || "",
      sizes: product.sizes || [],
      low_stock_threshold: product.low_stock_threshold || 5,
      discount: product.discount || 0,
      discount_expires_at: product.discount_expires_at ? product.discount_expires_at.slice(0, 16) : "",
      is_new: product.is_new || false,
      is_new_until: product.is_new_until ? product.is_new_until.slice(0, 16) : "",
      is_featured: product.is_featured || false,
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;


  // Upload image to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Solo se permiten imágenes (JPG, PNG, WebP, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede pesar más de 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${organizationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      setValue("image_url", urlData.publicUrl);
      toast.success("Imagen subida correctamente");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(`Error al subir imagen: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleLanding = async () => {
    if (!product.is_active && !publishedToLanding) {
      toast.error("Activa el producto primero para publicarlo en la tienda");
      return;
    }
    setTogglingLanding(true);
    const prev = publishedToLanding;
    setPublishedToLanding(!prev);

    const result = await togglePublishedToLanding(product.id, prev);
    if (!result.success) {
      setPublishedToLanding(prev);
      toast.error(result.error || "Error al cambiar estado de la tienda");
    } else {
      toast.success(
        !prev ? "Publicado en la tienda online ✅" : "Ocultado de la tienda online 🔒"
      );
    }
    setTogglingLanding(false);
  };

  // Update form when sizes change
  useEffect(() => {
    setValue("sizes", selectedSizes);
  }, [selectedSizes, setValue]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const performSave = async (
    data: any,
    stockChanges: StockChange[],
    totalDiff: number,
    stockWarning: string | null
  ) => {
    setSaving(true);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No se pudo obtener el usuario");
        setSaving(false);
        return;
      }

      const originalData = {
        sku: product.sku,
        sku_group: product.sku_group,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        brand: product.brand,
        image_url: product.image_url,
        price: product.price,
        cost: product.cost,
        color: product.color,
        sizes: product.sizes,
        discount: product.discount,
        discount_expires_at: product.discount_expires_at,
        is_new: product.is_new,
        is_new_until: product.is_new_until,
        is_featured: product.is_featured,
      };

      const { error: productError } = await supabase
        .from("products")
        .update({
          sku: data.sku,
          sku_group: data.sku_group || null,
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          brand: data.brand || null,
          image_url: data.image_url || null,
          price: data.price,
          cost: data.cost,
          color: selectedColor || null,
          sizes: selectedSizes,
          discount: data.discount || null,
          discount_expires_at: data.discount_expires_at ? new Date(data.discount_expires_at).toISOString() : null,
          is_new: data.is_new,
          is_new_until: data.is_new_until ? new Date(data.is_new_until).toISOString() : null,
          is_featured: data.is_featured,
        })
        .eq("id", product.id)
        .eq("organization_id", organizationId);

      if (productError) throw productError;

      const { error: deleteError } = await supabase
        .from("inventory")
        .delete()
        .eq("product_id", product.id);

      if (deleteError) {
        console.error("Error al eliminar inventory:", deleteError);
        throw deleteError;
      }

      const inventoryInserts: any[] = [];
      // Accesorios: sizes vacío o ['Unitalla'] → guardar con size='Unitalla'
      const isAccessoryProduct = selectedSizes.length === 0 ||
        (selectedSizes.length === 1 && selectedSizes[0] === 'Unitalla');
      const sizesToInsert = isAccessoryProduct ? ["Unitalla"] : selectedSizes;

      locations.forEach((loc) => {
        sizesToInsert.forEach((size) => {
          const quantity = stockByLocationAndSize[loc.id]?.[size] || 0;
          inventoryInserts.push({
            product_id: product.id,
            location_id: loc.id,
            size: size,
            color: selectedColor || null,
            quantity: quantity,
            min_stock: data.low_stock_threshold,
          });
        });
      });

      const { error: inventoryError } = await supabase
        .from("inventory")
        .upsert(inventoryInserts, { onConflict: "product_id,location_id,size,color" });

      if (inventoryError) throw inventoryError;

      await supabase.from("audit_log").insert({
        organization_id: organizationId,
        user_id: user.id,
        action: "update",
        table_name: "products",
        record_id: product.id,
        old_data: originalData,
        new_data: {
          sku: data.sku,
          sku_group: data.sku_group,
          name: data.name,
          description: data.description,
          category_id: data.category_id,
          brand: data.brand,
          image_url: data.image_url,
          price: data.price,
          cost: data.cost,
          color: selectedColor,
          sizes: selectedSizes,
          discount: data.discount || null,
          discount_expires_at: data.discount_expires_at ? new Date(data.discount_expires_at).toISOString() : null,
          is_new: data.is_new,
          is_new_until: data.is_new_until ? new Date(data.is_new_until).toISOString() : null,
          is_featured: data.is_featured,
          audit_note: auditNote || null,
          ...(stockChanges.length > 0 && {
            stock_edit_summary: {
              type: "stock_edit",
              stock_changes: stockChanges,
              total_diff: totalDiff,
              warning: stockWarning,
            },
          }),
        },
        ip_address: null,
      });

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

  const onSubmit = async (data: any) => {
    const originalInventory: Record<string, Record<string, number>> = {};
    if (product.inventory && Array.isArray(product.inventory)) {
      product.inventory.forEach((inv: any) => {
        if (!originalInventory[inv.location_id]) {
          originalInventory[inv.location_id] = {};
        }
        const size = inv.size || "Unitalla";
        originalInventory[inv.location_id][size] =
          (originalInventory[inv.location_id][size] || 0) + (inv.quantity || 0);
      });
    }

    const isAccessoryForDiff = selectedSizes.length === 0 ||
      (selectedSizes.length === 1 && selectedSizes[0] === 'Unitalla');
    const sizesToUse = isAccessoryForDiff ? ["Unitalla"] : selectedSizes;
    const stockChanges: StockChange[] = [];

    locations.forEach((loc) => {
      sizesToUse.forEach((size) => {
        const oldQty = originalInventory[loc.id]?.[size] ?? 0;
        const newQty = stockByLocationAndSize[loc.id]?.[size] ?? 0;
        if (oldQty !== newQty) {
          stockChanges.push({
            location_name: loc.name,
            size,
            before: oldQty,
            after: newQty,
            diff: newQty - oldQty,
          });
        }
      });
    });

    const totalDiff = stockChanges.reduce((sum, c) => sum + c.diff, 0);
    let stockWarning: string | null = null;
    if (totalDiff > 0) {
      stockWarning = `Esta edición agrega ${totalDiff} unidad(es) al stock total`;
    } else if (totalDiff < 0) {
      stockWarning = `Esta edición elimina ${Math.abs(totalDiff)} unidad(es) del stock total`;
    }

    if (stockChanges.length > 0 && totalDiff !== 0) {
      setPendingStockWarning({
        stockChanges,
        totalDiff,
        onConfirm: () => {
          setPendingStockWarning(null);
          performSave(data, stockChanges, totalDiff, stockWarning);
        },
      });
      return;
    }

    performSave(data, stockChanges, totalDiff, stockWarning);
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
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-gray-900 placeholder:text-gray-400"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                {...register("brand")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
                placeholder="Ej: Columbia, Nike, Adidas"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Imagen del producto (opcional)
              </div>
            </label>

            {/* File Upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="edit-image-upload"
              />
              <label
                htmlFor="edit-image-upload"
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploadingImage
                    ? "border-blue-400 bg-blue-50"
                    : watch("image_url")
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400"
                  }`}
              >
                {uploadingImage ? (
                  <>
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm font-medium text-blue-700">Subiendo imagen...</p>
                  </>
                ) : watch("image_url") ? (
                  <>
                    <img
                      src={watch("image_url")}
                      alt="Preview"
                      className="w-24 h-24 object-contain rounded-lg mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <p className="text-xs text-green-700 font-medium">
                      Clic para cambiar imagen
                    </p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Haz clic o arrastra una imagen aquí
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP, GIF — Máx. 5MB
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* URL alternativa */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">o pega una URL</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <input
              type="url"
              {...register("image_url")}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
            />
            {errors.image_url && (
              <p className="text-xs text-red-600 mt-1">{errors.image_url.message as string}</p>
            )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Margin preview */}
          {watch("price") > 0 && watch("cost") > 0 && (
            <div className={`rounded-xl px-6 py-4 flex items-center justify-between border-2 transition-all duration-300 ${watch("price") - watch("cost") > 0
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
              }`}>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${watch("price") - watch("cost") > 0 ? "text-green-600" : "text-red-600"
                  }`} />
                <span className="text-sm font-semibold text-gray-700">Margen de ganancia</span>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${watch("price") - watch("cost") > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                  +Bs {(watch("price") - watch("cost")).toFixed(2)}
                </span>
                <span className={`text-base ml-2 ${watch("price") - watch("cost") > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                  ({watch("cost") > 0
                    ? (((watch("price") - watch("cost")) / watch("cost")) * 100).toFixed(1)
                    : "∞"}%)
                </span>
              </div>
            </div>
          )}

          {/* Promociones y Visibilidad */}
          <div className="bg-white border-2 border-indigo-100 rounded-xl p-5 space-y-5">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              Promociones y Visibilidad
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Discount */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Descuento (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.01"
                    {...register("discount")}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    placeholder="0"
                  />
                  <div className="flex-1">
                    {watch("discount") > 0 && (
                      <div className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg inline-block">
                        Precio final: Bs {(Number(watch("price")) * (1 - Number(watch("discount")) / 100)).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                {watch("discount") > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1 leading-tight">Válido hasta (Opcional)</label>
                    <input
                      type="datetime-local"
                      {...register("discount_expires_at")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-center gap-4">
                {/* is_new */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("is_new")}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-800">Etiqueta "Nuevo"</span>
                      <span className="block text-xs text-gray-500">Destaca el producto en la tienda</span>
                    </div>
                  </label>
                  {watch("is_new") && (
                    <div className="mt-2 pl-8">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Mostrar etiqueta hasta (Opcional)</label>
                      <input
                        type="datetime-local"
                        {...register("is_new_until")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      />
                    </div>
                  )}
                </div>

                {/* is_featured */}
                <label className="flex items-center gap-3 cursor-pointer pt-3 border-t border-gray-200">
                  <input
                    type="checkbox"
                    {...register("is_featured")}
                    className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-gray-300"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-800">Producto Destacado</span>
                    <span className="block text-xs text-gray-500">Muestra el producto en portada</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tallas disponibles
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Selecciona las tallas disponibles para este producto:
            </p>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {ALLOWED_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-3 rounded-lg text-sm font-bold border-2 transition-all ${selectedSizes.includes(size)
                      ? "bg-purple-600 border-purple-600 text-white shadow-md transform scale-105"
                      : "bg-white border-gray-300 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              S, M, L, XL → para ropa superior | 38, 40, 42, 44 → para pantalones y calzado
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); } }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
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
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="hover:text-blue-900"
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

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de este producto <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
              {COMMON_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all ${selectedColor === color
                      ? "border-pink-600 bg-pink-50 shadow-md transform scale-105"
                      : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                    }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" style={{
                    backgroundColor: color === 'Negro' ? '#000' :
                      color === 'Blanco' ? '#FFF' :
                        color === 'Gris' ? '#9CA3AF' :
                          color === 'Azul' ? '#3B82F6' :
                            color === 'Azul marino' ? '#1E3A8A' :
                              color === 'Verde' ? '#22C55E' :
                                color === 'Verde militar' ? '#4D7C0F' :
                                  color === 'Rojo' ? '#EF4444' :
                                    color === 'Beige' ? '#D4A574' :
                                      color === 'Café' ? '#92400E' :
                                        color === 'Celeste' ? '#7DD3FC' : '#CCC'
                  }} />
                  <span className="text-sm font-medium text-gray-700">{color}</span>
                </button>
              ))}
            </div>

            {/* Color personalizado */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                ¿No encuentras el color? Escríbelo aquí:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (customColorInput.trim()) {
                        setSelectedColor(customColorInput.trim());
                        setCustomColorInput("");
                      }
                    }
                  }}
                  placeholder="Ej: Gris Oxford, Verde esmeralda..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customColorInput.trim()) {
                      setSelectedColor(customColorInput.trim());
                      setCustomColorInput("");
                    }
                  }}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg text-sm transition"
                >
                  Usar
                </button>
              </div>
            </div>

            {/* Color seleccionado */}
            {selectedColor && (
              <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-pink-900">Color actual:</span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold bg-pink-100 text-pink-700 border border-pink-300">
                    {selectedColor}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedColor("")}
                  className="text-pink-600 hover:text-pink-800 font-semibold text-sm"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* SKU Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupo de variantes (Opcional)
            </label>
            <input
              type="text"
              {...register("sku_group")}
              placeholder="Ej: JEAN-LEV-501"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 placeholder:text-gray-400 font-mono uppercase"
            />
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Umbral de Stock Bajo
            </label>
            <input
              type="number"
              {...register("low_stock_threshold")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
              placeholder="5"
            />
          </div>

          {/* Stock por Talla y Ubicación */}
          {/* isAccessory: sin tallas (array vacío) o solo tiene 'Unitalla' */}
          {(() => {
            const isAccessory = selectedSizes.length === 0 ||
              (selectedSizes.length === 1 && selectedSizes[0] === 'Unitalla');
            return (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {isAccessory ? "Stock por Ubicación" : "Stock por Talla y Ubicación"}
                </label>

                {isAccessory ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 italic">
                      Accesorio sin talla — el stock se registra directamente por ubicación.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {locations.map((loc) => (
                        <div key={loc.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                            {(loc as any).address && <p className="text-xs text-gray-500">{(loc as any).address}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={stockByLocationAndSize[loc.id]?.['Unitalla'] ?? 0}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setStockByLocationAndSize(prev => ({
                                  ...prev,
                                  [loc.id]: {
                                    ...prev[loc.id],
                                    'Unitalla': value
                                  }
                                }));
                              }}
                              className="w-20 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-900"
                            />
                            <span className="text-xs text-gray-600">uds</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSizes.map((size) => (
                      <div key={size} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/30">
                        <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                          <Ruler className="w-4 h-4" />
                          Talla {size}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {locations.map((loc) => (
                            <div key={loc.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                                {loc.address && <p className="text-xs text-gray-500">{loc.address}</p>}
                              </div>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={stockByLocationAndSize[loc.id]?.[size] || 0}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    setStockByLocationAndSize(prev => ({
                                      ...prev,
                                      [loc.id]: {
                                        ...prev[loc.id],
                                        [size]: value
                                      }
                                    }));
                                  }}
                                  className="w-20 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-900"
                                />
                                <span className="text-xs text-gray-600">uds</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-emerald-50 rounded-lg px-4 py-2.5 flex items-center justify-between border-2 border-emerald-200">
                  <span className="text-sm text-emerald-700 font-medium">
                    Stock total
                  </span>
                  <span className="text-lg font-bold text-emerald-700">
                    {Object.values(stockByLocationAndSize).reduce((total, sizeStock) =>
                      total + Object.values(sizeStock).reduce((sum, qty) => sum + qty, 0), 0
                    )} unidades
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Tienda Online */}
          <div className={`rounded-xl border-2 p-5 ${publishedToLanding
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${publishedToLanding ? "bg-green-100" : "bg-gray-100"
                  }`}>
                  <Globe className={`w-5 h-5 ${publishedToLanding ? "text-green-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Tienda Online</p>
                  <p className="text-xs text-gray-500 mt-0.5">Publicar en la landing page</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleLanding}
                disabled={togglingLanding || (!product.is_active && !publishedToLanding)}
                title={
                  !product.is_active && !publishedToLanding
                    ? "Activa el producto primero"
                    : publishedToLanding
                      ? "Ocultar de la tienda online"
                      : "Publicar en la tienda online"
                }
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${publishedToLanding ? "bg-green-500" : "bg-gray-300"
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${publishedToLanding ? "translate-x-8" : "translate-x-1"
                    } ${togglingLanding ? "animate-pulse" : ""}`}
                />
              </button>
            </div>
            {!product.is_active && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Solo productos activos pueden aparecer en la tienda online
              </div>
            )}
          </div>

          {/* Nota de auditoría */}
          <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-yellow-900">
              📝 Nota para el historial (opcional)
            </div>
            <textarea
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
              rows={3}
              placeholder="Ej: Bajé el precio porque es cliente fiel, envío de stock al puesto 2..."
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-none text-gray-900 placeholder:text-gray-400 bg-white"
            />
            <p className="text-xs text-yellow-700">
              Esta nota aparecerá en el historial de cambios para explicar el motivo de la modificación.
            </p>
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

      {/* Modal de advertencia de cambio de stock */}
      {pendingStockWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Cambio de stock detectado
                </h3>
                <p className="text-sm text-gray-500">
                  Revisa los movimientos antes de guardar
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {pendingStockWarning.stockChanges.map((change) => (
                <div
                  key={`${change.location_name}-${change.size}`}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-gray-700">
                    📍 {change.location_name}
                    {change.size && change.size !== "Única" ? ` · Talla ${change.size}` : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 line-through">
                      {change.before}
                    </span>
                    <span className="text-gray-400 text-xs">→</span>
                    <span className={`text-sm font-bold ${change.diff > 0 ? "text-green-600" : "text-red-600"}`}>
                      {change.after}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${change.diff > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                      {change.diff > 0 ? `+${change.diff}` : `${change.diff}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-5 ${pendingStockWarning.totalDiff > 0
                ? "bg-amber-50 border border-amber-200"
                : "bg-red-50 border border-red-200"
              }`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${pendingStockWarning.totalDiff > 0 ? "text-amber-500" : "text-red-500"
                }`} />
              <p className={`text-sm font-medium ${pendingStockWarning.totalDiff > 0 ? "text-amber-700" : "text-red-700"
                }`}>
                {pendingStockWarning.totalDiff > 0
                  ? `Se agregarán ${pendingStockWarning.totalDiff} unidad(es) al stock total. ¿Es correcto? (Ej: ingreso de nueva mercadería)`
                  : `Se eliminarán ${Math.abs(pendingStockWarning.totalDiff)} unidad(es) del stock total. ¿Es correcto? (Ej: producto dañado o pérdida)`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingStockWarning(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={pendingStockWarning.onConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity"
              >
                Sí, guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
