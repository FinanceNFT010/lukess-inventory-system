import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import type { Profile, Location } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Get user's current location
  let currentLocation: Location | null = null;
  if (profile.location_id) {
    const { data: location } = await supabase
      .from("locations")
      .select("*")
      .eq("id", profile.location_id)
      .single();
    currentLocation = location;
  }

  // Get all locations for the organization (for admin/manager selector)
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .eq("is_active", true)
    .order("name");

  // Get low stock count for badge
  const LOW_STOCK_THRESHOLD = 10;
  const { data: lowStockItems } = await supabase
    .from("inventory")
    .select("id, products!inner(organization_id)")
    .eq("products.organization_id", profile.organization_id)
    .lt("quantity", LOW_STOCK_THRESHOLD);

  const lowStockCount = lowStockItems?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar profile={profile as Profile} lowStockCount={lowStockCount} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          profile={profile as Profile}
          currentLocation={currentLocation}
          locations={(locations as Location[]) || []}
        />

        <main className="flex-1 p-4 pt-20 lg:pt-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
