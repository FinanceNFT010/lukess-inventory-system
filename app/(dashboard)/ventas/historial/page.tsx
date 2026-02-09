import { createClient } from "@/lib/supabase/server";
import SalesHistoryClient from "./sales-history-client";

export default async function SalesHistoryPage() {
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

  // Fetch all data in parallel
  const [salesResult, locationsResult, sellersResult] = await Promise.all([
    // Fetch all sales with relations
    supabase
      .from("sales")
      .select(
        `
        *,
        location:locations(id, name),
        seller:profiles!sales_sold_by_fkey(id, full_name, role),
        sale_items(
          id,
          quantity,
          unit_price,
          subtotal,
          product:products(id, name, sku, image_url)
        )
      `
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),

    // Fetch locations
    supabase
      .from("locations")
      .select("id, name")
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("name"),

    // Fetch sellers
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("organization_id", orgId)
      .order("full_name"),
  ]);

  return (
    <SalesHistoryClient
      initialSales={salesResult.data || []}
      locations={locationsResult.data || []}
      sellers={sellersResult.data || []}
    />
  );
}
