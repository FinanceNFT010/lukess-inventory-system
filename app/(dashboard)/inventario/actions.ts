"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth";

export async function togglePublishedToLanding(
  productId: string,
  currentValue: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return { success: false, error: "No autenticado" };

    if (profile.role !== "admin" && profile.role !== "manager") {
      return { success: false, error: "Sin permisos para esta acción" };
    }

    const supabase = await createClient();
    const newValue = !currentValue;

    // Si se quiere publicar, verificar que el producto esté activo
    if (newValue) {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("is_active, organization_id")
        .eq("id", productId)
        .single();

      if (fetchError || !product) {
        return { success: false, error: "Producto no encontrado" };
      }

      if (!product.is_active) {
        return {
          success: false,
          error: "Activa el producto primero antes de publicarlo en la tienda",
        };
      }
    }

    const { error } = await supabase
      .from("products")
      .update({ published_to_landing: newValue })
      .eq("id", productId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/inventario");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    console.error("togglePublishedToLanding error:", err);
    return { success: false, error: "Error inesperado" };
  }
}

export async function revalidateProductPaths(): Promise<void> {
  revalidatePath("/inventario");
  revalidatePath("/", "page");
}

export async function uploadImageFromUrl(
  url: string,
  organizationId: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return { success: false, error: "No autenticado" };

    if (profile.role !== "admin" && profile.role !== "manager") {
      return { success: false, error: "Sin permisos para esta acción" };
    }

    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: "No se pudo obtener la imagen del URL proporcionado" };
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const extension = contentType.split("/")[1] || "jpg";
    const buffer = await response.arrayBuffer();

    const supabase = await createClient();
    const fileName = `${organizationId}/${Date.now()}_external.${extension}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return { success: true, publicUrl: urlData.publicUrl };
  } catch (err: unknown) {
    console.error("uploadImageFromUrl error:", err);
    return { success: false, error: "Error al procesar la imagen del URL" };
  }
}
