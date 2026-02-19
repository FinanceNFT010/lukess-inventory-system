import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import SalesHistoryClient from "./sales-history-client";

export default async function SalesHistoryPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  const userRole = profile.role as string;
  const staffLocationId = profile.location_id as string | null;
  const isStaff = userRole === "staff";

  // Build sales query — staff only sees their own location's sales
  let salesQuery = supabase
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
        size,
        color,
        location_id,
        product:products(id, name, sku, image_url)
      )
    `
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (isStaff && staffLocationId) {
    salesQuery = salesQuery.eq("location_id", staffLocationId);
  }

  // Fetch all data in parallel
  const [salesResult, locationsResult, sellersResult] = await Promise.all([
    salesQuery,

    // Fetch locations
    supabase
      .from("locations")
      .select("id, name")
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("name"),

    // Fetch sellers — staff only sees themselves
    isStaff
      ? supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", profile.id)
      : supabase
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
      userRole={userRole}
      staffLocationId={staffLocationId}
    />
  );
}
