import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import SalesHistoryClient from "./sales-history-client";
import { MapPin } from "lucide-react";

export default async function SalesHistoryPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  const userRole = profile.role as string;
  const staffLocationId = profile.location_id as string | null;
  const isStaff = userRole === "staff";

  // Staff without assigned location cannot view sales history
  const isStaffWithoutLocation = isStaff && !staffLocationId;

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
      ),
      order:orders(
        id,
        delivery_method,
        shipping_cost,
        shipping_address,
        shipping_district,
        payment_method
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
