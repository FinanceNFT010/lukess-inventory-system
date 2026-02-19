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

export async function approveAccessRequest(requestId: string) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") throw new Error("Sin autorización");

  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("access_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) throw new Error("Solicitud no encontrada");

  const { error } = await supabase
    .from("access_requests")
    .update({
      status: "approved",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  const adminClient = createAdminClient();
  const { error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(request.email);

  if (inviteError) throw new Error(inviteError.message);

  revalidatePath("/configuracion/usuarios");
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
