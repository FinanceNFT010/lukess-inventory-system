import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import AuditHistoryClient from "./audit-history-client";

export default async function AuditHistoryPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  // Obtener historial de auditoría de productos
  const { data: auditLogs } = await supabase
    .from("audit_log")
    .select(
      `
      id,
      action,
      table_name,
      record_id,
      old_data,
      new_data,
      created_at,
      profiles!audit_log_user_id_fkey(id, full_name, email)
    `
    )
    .eq("organization_id", orgId)
    .eq("table_name", "products")
    .order("created_at", { ascending: false })
    .limit(100);

  // Obtener nombres de productos para mostrar en el historial
  const productIds = auditLogs?.map((log) => log.record_id).filter(Boolean) || [];
  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku")
    .in("id", productIds);

  // Obtener categorías y ubicaciones
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("organization_id", orgId);

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .eq("organization_id", orgId);

  const productsMap = new Map(products?.map((p) => [p.id, p]) || []);
  const categoriesMap = new Map(categories?.map((c) => [c.id, c.name]) || []);
  const locationsMap = new Map(locations?.map((l) => [l.id, l.name]) || []);

  return (
    <AuditHistoryClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auditLogs={(auditLogs ?? []) as any}
      productsMap={productsMap}
      categoriesMap={categoriesMap}
      locationsMap={locationsMap}
    />
  );
}
