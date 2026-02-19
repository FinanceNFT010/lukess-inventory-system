import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import ReportsClient from "./reports-client";

export default async function ReportesPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  // Date range: last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Parallel data fetching
  const [salesResult, saleItemsResult, locationsResult] = await Promise.all([
    // All sales in date range
    supabase
      .from("sales")
      .select(
        `
        id,
        total,
        payment_method,
        location_id,
        created_at,
        locations!inner(name)
      `
      )
      .eq("organization_id", orgId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true }),

    // Sale items with product info for top products
    supabase
      .from("sale_items")
      .select(
        `
        quantity,
        subtotal,
        product_id,
        products!inner(name, sku, organization_id),
        sales!inner(created_at, organization_id)
      `
      )
      .eq("products.organization_id", orgId)
      .gte("sales.created_at", sevenDaysAgo.toISOString()),

    // Locations
    supabase
      .from("locations")
      .select("id, name")
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("name"),
  ]);

  return (
    <ReportsClient
      sales={salesResult.data || []}
      saleItems={saleItemsResult.data || []}
      locations={locationsResult.data || []}
    />
  );
}
