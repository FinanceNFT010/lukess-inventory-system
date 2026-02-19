import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import InventoryClient from "./inventory-client";

export default async function InventarioPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  // Fetch initial data in parallel
  const [productsResult, categoriesResult, locationsResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name),
        inventory(id, quantity, min_stock, location_id, size, color, locations(id, name))
      `
      )
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("categories")
      .select("*")
      .eq("organization_id", orgId)
      .order("name"),

    supabase
      .from("locations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("name"),
  ]);

  return (
    <InventoryClient
      initialProducts={productsResult.data || []}
      categories={categoriesResult.data || []}
      locations={locationsResult.data || []}
      userRole={profile.role}
      userLocationId={profile.location_id}
    />
  );
}
