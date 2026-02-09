import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuditHistoryClient from "./audit-history-client";

export default async function AuditHistoryPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(id, name)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const orgId = profile.organization_id;

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

  const productsMap = new Map(products?.map((p) => [p.id, p]) || []);

  return (
    <AuditHistoryClient
      auditLogs={auditLogs || []}
      productsMap={productsMap}
    />
  );
}
