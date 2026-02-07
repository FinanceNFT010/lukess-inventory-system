import { createClient } from "@/lib/supabase/server";
import POSClient from "./pos-client";

export default async function VentasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const orgId = profile!.organization_id;
  const locationId = profile!.location_id;

  // Fetch products with inventory for the user's location
  const { data: products } = await supabase
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
    .eq("inventory.location_id", locationId!)
    .order("name");

  // Fetch categories for filtering
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("organization_id", orgId)
    .order("name");

  return (
    <POSClient
      initialProducts={products || []}
      categories={categories || []}
      profileId={user!.id}
      organizationId={orgId}
      locationId={locationId!}
    />
  );
}
