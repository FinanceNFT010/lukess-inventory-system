"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth";

export async function updateUserRole(
  userId: string,
  newRole: "admin" | "manager" | "staff"
) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") throw new Error("Sin autorización");
  if (userId === profile.id) throw new Error("No puedes cambiar tu propio rol");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId)
    .eq("organization_id", profile.organization_id);

  if (error) throw new Error(error.message);
  revalidatePath("/configuracion/usuarios");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") throw new Error("Sin autorización");
  if (userId === profile.id)
    throw new Error("No puedes desactivarte a ti mismo");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)
    .eq("organization_id", profile.organization_id);

  if (error) throw new Error(error.message);
  revalidatePath("/configuracion/usuarios");
}

export async function approveAccessRequest(
  requestId: string,
  assignedRole: "manager" | "staff"
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "admin") return { error: "Sin permisos" };

    const { data: request, error: reqError } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqError || !request) return { error: "Solicitud no encontrada" };
    if (request.status !== "pending")
      return { error: "Esta solicitud ya fue procesada" };

    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) return { error: "Error al actualizar solicitud" };

    return {
      success: true,
      approvedEmail: request.email as string,
      approvedName: request.full_name as string,
    };
  } catch (error) {
    console.error("Error approving request:", error);
    return { error: "Error interno al aprobar solicitud" };
  }
}

export async function updateUserLocation(
  userId: string,
  locationId: string | null
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", user.id)
      .single();

    if (adminProfile?.role !== "admin") return { error: "Sin permisos" };

    const { error } = await supabase
      .from("profiles")
      .update({ location_id: locationId })
      .eq("id", userId)
      .eq("organization_id", adminProfile.organization_id);

    if (error) return { error: error.message };
    revalidatePath("/configuracion/usuarios");
    return { success: true };
  } catch (error) {
    console.error("updateUserLocation error:", error);
    return { error: "Error interno" };
  }
}

export async function createUserFromRequest(
  email: string,
  fullName: string,
  role: "manager" | "staff",
  temporaryPassword: string,
  locationId?: string | null
) {
  try {
    console.log("[createUser] Starting for:", email, "role:", role);

    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    console.log("[createUser] Admin client created");

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log("[createUser] Service key present:", !!serviceKey);
    console.log("[createUser] Service key length:", serviceKey?.length);
    console.log("[createUser] First 20 chars:", serviceKey?.substring(0, 20));

    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    console.log("[createUser] Result:", {
      userId: newUser?.user?.id,
      error: createError?.message,
      errorCode: (createError as { code?: string } | null)?.code,
    });

    if (createError) {
      return {
        error: `Error Supabase: ${createError.message} (${(createError as { code?: string }).code})`,
      };
    }

    if (!newUser.user) {
      return { error: "Usuario no fue creado — respuesta vacía" };
    }

    console.log("[createUser] User created:", newUser.user.id);

    // Wait for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role,
        full_name: fullName,
        is_active: true,
        location_id: locationId ?? null,
      })
      .eq("id", newUser.user.id);

    console.log("[createUser] Profile update:", profileError?.message ?? "OK");

    if (profileError) {
      console.error("Profile update error:", profileError);
      return {
        success: true,
        warning: `Usuario creado pero rol no se actualizó: ${profileError.message}`,
        message: `Usuario ${email} creado. Contraseña: ${temporaryPassword}`,
      };
    }

    revalidatePath("/configuracion/usuarios");

    return {
      success: true,
      message: `Usuario ${email} creado con rol ${role}. Contraseña temporal: ${temporaryPassword}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[createUser] CATCH:", message);
    return { error: `Error interno: ${message}` };
  }
}

export async function rejectAccessRequest(requestId: string, reason: string) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") throw new Error("Sin autorización");

  const supabase = await createClient();
  const { error } = await supabase
    .from("access_requests")
    .update({
      status: "rejected",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/configuracion/usuarios");
}
