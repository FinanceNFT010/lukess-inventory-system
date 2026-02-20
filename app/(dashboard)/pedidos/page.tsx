import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PedidosClient from "./pedidos-client";
import type { OrderWithItems } from "@/lib/types";

export const metadata = {
  title: "Pedidos | Lukess Home",
};

export default async function PedidosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "staff") redirect("/ventas");

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        product:products (
          id,
          name,
          sku,
          image_url
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <PedidosClient
      initialOrders={(orders ?? []) as OrderWithItems[]}
      userRole={profile.role}
      userId={user.id}
    />
  );
}
