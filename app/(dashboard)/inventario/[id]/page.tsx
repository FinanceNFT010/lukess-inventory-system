import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditProductForm from "./edit-product-form";
import type { Category, Location } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get user and profile
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Get product with inventory
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(id, name),
      inventory(
        id,
        quantity,
        min_stock,
        location_id,
        size,
        color,
        locations(id, name)
      )
    `
    )
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (error || !product) {
    redirect("/inventario");
  }

  // Get categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("name");

  // Get locations
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("name");

  return (
    <EditProductForm
      product={product}
      categories={(categories as Category[]) || []}
      locations={(locations as Location[]) || []}
      organizationId={profile.organization_id}
    />
  );
}
