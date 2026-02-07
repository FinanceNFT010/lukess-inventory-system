import { createClient } from "@/lib/supabase/server";
import NewProductForm from "./new-product-form";

export default async function NuevoProductoPage() {
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

  const [categoriesResult, locationsResult, productCountResult] =
    await Promise.all([
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
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),
    ]);

  return (
    <NewProductForm
      categories={categoriesResult.data || []}
      locations={locationsResult.data || []}
      organizationId={orgId}
      nextProductNumber={(productCountResult.count || 0) + 1}
    />
  );
}
