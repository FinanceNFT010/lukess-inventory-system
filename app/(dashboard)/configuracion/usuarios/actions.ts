"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth";

export async function updateUserRole(
  userId: string,
  newRole: "admin" | "manager" | "staff"
) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") throw new Error("Sin autorización");

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

export async function createUserFromRequest(
  email: string,
  fullName: string,
  role: "manager" | "staff",
  temporaryPassword: string
) {
  try {
    const adminClient = createAdminClient();

    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createError || !newUser.user) {
      return { error: createError?.message ?? "Error al crear usuario" };
    }

    await adminClient
      .from("profiles")
      .update({ role, full_name: fullName })
      .eq("id", newUser.user.id);

    revalidatePath("/configuracion/usuarios");

    return {
      success: true,
      userId: newUser.user.id,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Error al crear usuario" };
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
