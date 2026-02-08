// ═══════════════════════════════════════════════════════════════════════════
// UI Components - Lukess Inventory System
// ═══════════════════════════════════════════════════════════════════════════

// ── Componentes existentes ─────────────────────────────────────────────────
export { ConfirmModal } from "./ConfirmModal";
export { Input } from "./Input";
export { LoadingButton } from "./LoadingButton";
export { SkeletonCard } from "./SkeletonCard";

// ── Componentes de producto ────────────────────────────────────────────────
export { ProductCard } from "./ProductCard";
export { ProductGrid } from "./ProductGrid";
export { ProductQuickView } from "./ProductQuickView";

// ── Tipos (re-exportar para conveniencia) ──────────────────────────────────
export type {
  Product,
  Inventory,
  Category,
  ProductWithInventory,
} from "@/lib/types";
