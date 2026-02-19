import { redirect } from "next/navigation";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import UsuariosClient from "./usuarios-client";

export default async function UsuariosPage() {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/");

  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", orgId)
    .order("full_name");

  const { data: accessRequests } = await supabase
    .from("access_requests")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <UsuariosClient
      profiles={profiles || []}
      accessRequests={accessRequests || []}
      currentUserId={profile.id}
    />
  );
}
