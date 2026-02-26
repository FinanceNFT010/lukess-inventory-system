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
