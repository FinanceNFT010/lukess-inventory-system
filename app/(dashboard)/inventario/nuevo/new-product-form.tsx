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
  Wand2,
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
  Globe,
} from "lucide-react";
import Link from "next/link";

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
  initial_stock: z.record(z.string(), z.coerce.number().int().min(0)).optional(),
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

// Solo 8 tallas permitidas
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

export default function NewProductForm({
  categories,
  locations,
  organizationId,
  nextProductNumber,
}: NewProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState("");
  const [recentBrands, setRecentBrands] = useState<string[]>([]);
  const [auditNote, setAuditNote] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customColorInput, setCustomColorInput] = useState<string>("");
  const [publishedToLanding, setPublishedToLanding] = useState(false);
  // Stock por ubicación y talla: { locationId: { size: quantity } }
  const [stockByLocationAndSize, setStockByLocationAndSize] = useState<Record<string, Record<string, number>>>({});

  // Load saved data from localStorage
  useEffect(() => {
    const savedBrands = localStorage.getItem("recentBrands");
    if (savedBrands) setRecentBrands(JSON.parse(savedBrands));
  }, []);

  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      sku: "",
      sku_group: "",
      name: "",
      description: "",
      category_id: undefined,
      brand: "",
      image_url: "",
      price: 0,
      cost: 0,
      color: "",
      sizes: [],
      low_stock_threshold: 5,
      initial_stock: {},
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  // Upload image to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Solo se permiten imágenes (JPG, PNG, WebP, GIF)");
      return;
    }

    // Validate file size (max 5MB)
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
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
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
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      setSelectedSizes((prev) => [...prev, customSize.trim()]);
      setCustomSize("");
    }
  };

  const removeSize = (size: string) => {
    setSelectedSizes((prev) => prev.filter((s) => s !== size));
  };

  const clearAllSizes = () => {
    setSelectedSizes([]);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: ProductFormData) => {
    // Save brand to localStorage
    if (data.brand && data.brand.trim()) {
      const updated = [data.brand, ...recentBrands.filter(b => b !== data.brand)].slice(0, 10);
      setRecentBrands(updated);
      localStorage.setItem("recentBrands", JSON.stringify(updated));
    }
    setSaving(true);

    try {
      const supabase = createClient();

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No se pudo obtener el usuario");
        setSaving(false);
        return;
      }

      // 1. Create product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          organization_id: organizationId,
          sku: data.sku,
          sku_group: data.sku_group || null,
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          brand: data.brand || null,
          image_url: data.image_url || null,
          price: data.price,
          cost: data.cost ?? 0,
          color: selectedColor || null,
          sizes: selectedSizes,
          is_active: true,
          published_to_landing: publishedToLanding,
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

      // 2. Create inventory for each location and size
      const inventoryInserts: any[] = [];
      // Accesorios sin tallas → guardar con size='Unitalla'
      const sizesToUse = selectedSizes.length > 0 ? selectedSizes : ['Unitalla'];
      
      locations.forEach((loc) => {
        sizesToUse.forEach((size) => {
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
        .insert(inventoryInserts);

      if (inventoryError) {
        toast.error(`Producto creado pero error en inventario: ${inventoryError.message}`);
        setSaving(false);
        return;
      }

      // 3. Registrar auditoría
      await supabase.from("audit_log").insert({
        organization_id: organizationId,
        user_id: user.id,
        action: "create",
        table_name: "products",
        record_id: product.id,
        old_data: null,
        new_data: {
          sku: data.sku,
          sku_group: data.sku_group,
          name: data.name,
          description: data.description,
          category_id: data.category_id,
          brand: data.brand,
          price: data.price,
          cost: data.cost,
          color: selectedColor,
          sizes: selectedSizes,
          stock_by_location_and_size: stockByLocationAndSize,
          audit_note: auditNote || null,
        },
        ip_address: null,
      });

      toast.success("Producto creado exitosamente");
      router.push("/inventario");
      router.refresh();
    } catch (error: any) {
      console.error("Error al crear producto:", error);
      toast.error(error.message || "Error inesperado al guardar");
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
              SKU (Código único) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                {...register("sku")}
                placeholder="JEAN-LEV-501-AZUL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400 font-mono uppercase"
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-900">📚 Guía para crear SKUs correctos:</p>
              <div className="space-y-1 text-xs text-blue-800">
                <p><strong>Formato:</strong> TIPO-MARCA-MODELO-COLOR</p>
                <p><strong>Ejemplos:</strong></p>
                <ul className="list-disc list-inside pl-2 space-y-0.5">
                  <li><code className="bg-blue-100 px-1 rounded">CAM-COL-001-AZUL</code> → Camisa Columbia modelo 001 azul</li>
                  <li><code className="bg-blue-100 px-1 rounded">JEAN-LEV-501-NEGRO</code> → Jean Levi's 501 negro</li>
                  <li><code className="bg-blue-100 px-1 rounded">POL-LAC-CLA-BLANCO</code> → Polo Lacoste clásico blanco</li>
                </ul>
                <p className="text-blue-700 mt-1"><strong>Importante:</strong> Usa MAYÚSCULAS y guiones (-) para separar</p>
              </div>
            </div>
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
                list="recentBrandsList"
                placeholder="Ej: Levi's"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
              />
              <datalist id="recentBrandsList">
                {recentBrands.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              {recentBrands.length > 0 && (
                <p className="text-xs text-gray-500">
                  Sugerencias: {recentBrands.slice(0, 3).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Imagen del producto ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            Imagen del producto
          </div>

          {/* Upload de archivo */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Subir imagen desde tu dispositivo
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  uploadingImage
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
              <p className="text-xs text-red-600">{errors.image_url.message}</p>
            )}
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
            <div className={`rounded-xl px-6 py-4 flex items-center justify-between border-2 transition-all duration-300 ${
              watch("price") - watch("cost") > 0
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${
                  watch("price") - watch("cost") > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`} />
                <span className="text-sm font-semibold text-gray-700">Margen de ganancia</span>
              </div>
              <span
                className={`text-xl font-bold flex items-center gap-2 ${
                  watch("price") - watch("cost") > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Bs {(watch("price") - watch("cost")).toFixed(2)}
                <span className="text-base">
                  ({watch("cost") > 0
                    ? (
                        ((watch("price") - watch("cost")) / watch("cost")) *
                        100
                      ).toFixed(1)
                    : "∞"}%)
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ── Tallas ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Ruler className="w-4 h-4 text-purple-600" />
              Tallas
              {selectedSizes.length > 0 && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {selectedSizes.length}
                </span>
              )}
            </div>
            {selectedSizes.length > 0 && (
              <button
                type="button"
                onClick={clearAllSizes}
                className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
              >
                Eliminar todas
              </button>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Selecciona las tallas disponibles para este producto:
            </p>
            <div className="grid grid-cols-4 gap-3">
              {ALLOWED_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                    selectedSizes.includes(size)
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
            {/* Talla personalizada */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSize();
                  }
                }}
                placeholder="Talla personalizada"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
                    onClick={() => removeSize(size)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Color del Producto ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Palette className="w-4 h-4 text-pink-600" />
            Color de este producto <span className="text-red-500">*</span>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Selecciona el color (solo uno):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {COMMON_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all ${
                    selectedColor === color
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
                  <span className="text-sm font-medium text-pink-900">Color seleccionado:</span>
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

            <p className="text-xs text-gray-500">
              💡 Tip: Si vendes el mismo modelo en varios colores, crea un producto separado para cada color y usa el mismo SKU Group
            </p>
          </div>
        </div>

        {/* ── SKU Group (Grupo de variantes) ──────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Tag className="w-4 h-4 text-indigo-600" />
            Grupo de variantes (Opcional)
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              SKU Base para agrupar variantes de color:
            </label>
            <input
              type="text"
              {...register("sku_group")}
              placeholder="JEAN-LEV-501"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 placeholder:text-gray-400 font-mono uppercase"
            />
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-indigo-900">💡 ¿Cuándo usar SKU Group?</p>
              <div className="text-xs text-indigo-800 space-y-1">
                <p><strong>Ejemplo:</strong> Vendes "Jean Levi's 501" en 3 colores:</p>
                <ul className="list-disc list-inside pl-2 space-y-0.5">
                  <li>Jean Levi's 501 - Azul → SKU: <code className="bg-indigo-100 px-1 rounded">JEAN-LEV-501-AZUL</code></li>
                  <li>Jean Levi's 501 - Negro → SKU: <code className="bg-indigo-100 px-1 rounded">JEAN-LEV-501-NEGRO</code></li>
                  <li>Jean Levi's 501 - Gris → SKU: <code className="bg-indigo-100 px-1 rounded">JEAN-LEV-501-GRIS</code></li>
                </ul>
                <p className="text-indigo-700 mt-2"><strong>SKU Group:</strong> <code className="bg-indigo-100 px-1 rounded">JEAN-LEV-501</code> (sin el color)</p>
                <p className="mt-1">Esto permite mostrarlos juntos en la web como variantes del mismo modelo.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stock Inicial por Talla y Ubicación ───────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Stock inicial por talla y ubicación
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                Umbral bajo stock:
              </span>
              <input
                type="number"
                {...register("low_stock_threshold", { valueAsNumber: true })}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              />
            </div>
          </div>
          {errors.low_stock_threshold && (
            <p className="text-xs text-red-600">{errors.low_stock_threshold.message}</p>
          )}

          {selectedSizes.length === 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 italic">
                Accesorio sin talla (cinturones, gorras, billeteras) — se guardará con talla "Unitalla" automáticamente.
              </p>
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
              Stock total inicial
            </span>
            <span className="text-lg font-bold text-emerald-700">
              {Object.values(stockByLocationAndSize).reduce((total, sizeStock) => 
                total + Object.values(sizeStock).reduce((sum, qty) => sum + qty, 0), 0
              )} unidades
            </span>
          </div>
        </div>

        {/* ── Tienda Online ─────────────────────────────────────────────── */}
        <div className={`rounded-xl border-2 p-5 ${
          publishedToLanding ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                publishedToLanding ? "bg-green-100" : "bg-gray-100"
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
              onClick={() => setPublishedToLanding((v) => !v)}
              title={publishedToLanding ? "Ocultar de la tienda online" : "Publicar en la tienda online"}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                publishedToLanding ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  publishedToLanding ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Nota de auditoría ────────────────────────────────────────── */}
        <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-yellow-900">
            📝 Nota para el historial (opcional)
          </div>
          <textarea
            value={auditNote}
            onChange={(e) => setAuditNote(e.target.value)}
            rows={3}
            placeholder="Ej: Cliente fiel, producto en promoción, pedido especial..."
            className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-none text-gray-900 placeholder:text-gray-400 bg-white"
          />
          <p className="text-xs text-yellow-700">
            Esta nota aparecerá en el historial de cambios para que todos sepan el motivo de la creación.
          </p>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Link
            href="/inventario"
            className="px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            Cancelar
          </Link>
          <LoadingButton
            type="submit"
            loading={saving}
            loadingText="Guardando..."
            variant="primary"
          >
            <Save className="w-5 h-5" />
            Crear Producto
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
