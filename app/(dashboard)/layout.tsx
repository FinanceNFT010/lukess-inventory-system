import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDefaultOrgId } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
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

  // Get user profile — never redirect for query errors, only for missing auth
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;

  // Get all locations for the organization (for admin/manager selector)
  const { data: locations } = orgId ? await supabase
    .from("locations")
    .select("*")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("name") : { data: null };

  // Get low stock count for badge
  const LOW_STOCK_THRESHOLD = 10;
  const { data: lowStockItems } = orgId ? await supabase
    .from("inventory")
    .select("id, products!inner(organization_id)")
    .eq("products.organization_id", orgId)
    .lt("quantity", LOW_STOCK_THRESHOLD) : { data: null };

  const lowStockCount = lowStockItems?.length || 0;

  return (
    <DashboardWrapper>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          profile={profile as Profile} 
          lowStockCount={lowStockCount}
          locations={(locations as Location[]) || []}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar profile={profile as Profile} />

          <main className="flex-1 p-4 pt-20 lg:pt-6 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardWrapper>
  );
}
