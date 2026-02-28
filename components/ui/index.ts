// ═══════════════════════════════════════════════════════════════════════════
// UI Components - Lukess Inventory System
// ═══════════════════════════════════════════════════════════════════════════

// ── Design System (BLOCK 11-A) ─────────────────────────────────────────────
export { Button } from "./Button";
export { Badge } from "./Badge";
export { Input } from "./Input";
export { Select } from "./Select";
export { Label } from "./Label";

// ── Componentes existentes ─────────────────────────────────────────────────
export { ConfirmModal } from "./ConfirmModal";
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
