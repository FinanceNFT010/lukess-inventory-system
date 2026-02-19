import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import POSClient from "./pos-client";

export default async function VentasPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  const locationId = profile.location_id as string | null;

  // Fetch all locations for the org
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("name");

  // Fetch products with inventory
  // If locationId is set, filter by that location; otherwise fetch all inventory
  let productsQuery = supabase
    .from("products")
    .select(
      `
      id, sku, name, price, image_url, brand,
      categories(name),
      inventory!inner(quantity, location_id)
    `
    )
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("name");

  if (locationId) {
    productsQuery = productsQuery.eq("inventory.location_id", locationId);
  }

  const { data: products } = await productsQuery;

  // Fetch categories for filtering
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("organization_id", orgId)
    .order("name");

  return (
    <POSClient
      key={locationId || "all"}
      initialProducts={products || []}
      categories={categories || []}
      profileId={profile.id}
      organizationId={orgId}
      locationId={locationId}
      locations={locations || []}
    />
  );
}
