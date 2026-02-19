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
  const userRole = profile.role as string;

  // Fetch all locations for the org
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("name");

  // Fetch products with inventory (including sizes and inventory size/color for variant picking)
  // Staff users only see products from their assigned location
  let productsQuery = supabase
    .from("products")
    .select(
      `
      id, sku, name, price, image_url, brand, sizes,
      categories(name),
      inventory!inner(quantity, location_id, size, color)
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
      userRole={userRole}
      locations={locations || []}
    />
  );
}
