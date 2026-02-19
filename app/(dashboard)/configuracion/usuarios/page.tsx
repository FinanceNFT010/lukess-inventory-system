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

  const [profilesResult, requestsResult, locationsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("organization_id", orgId)
      .order("full_name"),
    supabase
      .from("access_requests")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("locations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("is_active", true),
  ]);

  return (
    <UsuariosClient
      initialProfiles={profilesResult.data ?? []}
      initialRequests={requestsResult.data ?? []}
      locations={locationsResult.data ?? []}
      currentUserId={profile.id}
    />
  );
}
