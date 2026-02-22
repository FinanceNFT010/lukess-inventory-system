import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import { format, startOfMonth, startOfWeek, subMonths, subDays } from "date-fns";
import FiltrosReportes from "@/components/reportes/FiltrosReportes";
import ReportesVentasClient from "./reports-client";

export const metadata = {
  title: "Reportes | Lukess Home",
};

interface SearchParams {
  desde?: string;
  hasta?: string;
  canal?: string;
}

function getDefaultDateRange(): { desde: string; hasta: string } {
  const today = new Date();
  const desde = format(startOfMonth(today), "yyyy-MM-dd");
  const hasta = format(today, "yyyy-MM-dd");
  return { desde, hasta };
}

function getPreviousPeriod(desde: string, hasta: string): { desde: string; hasta: string } {
  const start = new Date(desde);
  const end = new Date(hasta);
  const diff = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - diff);
  return {
    desde: format(prevStart, "yyyy-MM-dd"),
    hasta: format(prevEnd, "yyyy-MM-dd"),
  };
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");
  if (profile.role === "staff") redirect("/ventas");

  const orgId = (profile.organization_id ?? (await getDefaultOrgId())) as string | null;
  if (!orgId) redirect("/login");

  // Resolve date range
  const defaults = getDefaultDateRange();
  const desde = params.desde ?? defaults.desde;
  const hasta = params.hasta ?? defaults.hasta;
  const canalFilter = params.canal ?? "todos";

  // End of day for "hasta"
  const hastaFull = `${hasta}T23:59:59.999Z`;
  const desdeFull = `${desde}T00:00:00.000Z`;

  // Previous period for comparisons
  const prev = getPreviousPeriod(desde, hasta);
  const prevDesdeFull = `${prev.desde}T00:00:00.000Z`;
  const prevHastaFull = `${prev.hasta}T23:59:59.999Z`;

  // Build current period query
  let currentQuery = supabase
    .from("orders")
    .select("id, total, canal, created_at, status")
    .eq("organization_id", orgId)
    .eq("status", "completed")
    .gte("created_at", desdeFull)
    .lte("created_at", hastaFull);

  if (canalFilter !== "todos") {
    currentQuery = currentQuery.eq("canal", canalFilter);
  }

  // Previous period query (no canal filter for fair comparison)
  const prevQuery = supabase
    .from("orders")
    .select("id, total, canal, created_at, status")
    .eq("organization_id", orgId)
    .eq("status", "completed")
    .gte("created_at", prevDesdeFull)
    .lte("created_at", prevHastaFull);

  const [{ data: currentOrders }, { data: prevOrders }] = await Promise.all([
    currentQuery,
    prevQuery,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ventas online vs físico · pedidos completados
          </p>
        </div>
      </div>

      {/* Filtros (Client Component) */}
      <FiltrosReportes
        desdeActual={desde}
        hastaActual={hasta}
        canalActual={canalFilter}
      />

      {/* Charts + KPIs (Client Component) */}
      <ReportesVentasClient
        orders={currentOrders ?? []}
        prevOrders={prevOrders ?? []}
        desde={desde}
        hasta={hasta}
        canalFilter={canalFilter}
      />
    </div>
  );
}
