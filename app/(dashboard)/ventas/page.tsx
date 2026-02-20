import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import POSClient from "./pos-client";
import { MapPin } from "lucide-react";

export default async function VentasPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  const locationId = profile.location_id as string | null;
  const userRole = profile.role as string;

  // Staff without assigned location cannot sell
  const isStaffWithoutLocation = userRole === "staff" && !locationId;

  if (isStaffWithoutLocation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Puesto no asignado
          </h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            Todavía no tienes un puesto de venta asignado.
            Comunícate con el administrador para que te asigne
            tu ubicación y puedas comenzar a registrar ventas.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-700 text-sm font-medium">
              📍 Sin puesto asignado
            </p>
            <p className="text-amber-600 text-xs mt-1">
              El administrador puede asignarte un puesto desde
              Configuración → Usuarios
            </p>
          </div>
        </div>
      </div>
    );
  }

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
