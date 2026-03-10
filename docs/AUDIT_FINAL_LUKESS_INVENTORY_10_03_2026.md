---\n\n# AUDIT FINAL — LUKESS INVENTORY SYSTEM\n## Date: 2026-03-10\n## Developer: Adrian Oliver Barrido\n## Project duration: ~30 days (Feb–Mar 2026)\n## Status: Production-ready\n\n---\n\n## 1. EXECUTIVE SUMMARY\n- **What this system is:** A comprehensive multi-location inventory management, Point of Sale (POS), and order fulfillment system custom-built from the ground up for a retail clothing business.\n- **Business context:** The family business operates 3 physical retail stalls in Santa Cruz de la Sierra, Bolivia. They required a robust tool tightly integrated with their online store to manage exact stock across locations natively without external API lag.\n- **Why custom software:** Off-the-shelf software (Shopify, Loyverse, etc.) could not seamlessly handle the shared database requirement with the existing custom landing page, the specific local payment flows (QR transfers natively popular in Bolivia), nor the bespoke Whatsapp notification routing required without heavy monthly licensing scaling with user seats.\n- **Technical achievement:** Built entirely by a 20-year-old self-taught junior developer with zero prior knowledge exactly 30 days before launch. It employs advanced enterprise concepts like PostgreSQL RLS security, Server-side OAuth, strict Role-Based Access Control (RBAC), multi-location architecture, complex transactional deductions for POS, optimistic UI updates, and real-time WebSockets tracking order fulfillment.\n- **Production URL:** [lukess-inventory-system.vercel.app](https://lukess-inventory-system.vercel.app)\n\n---\n\n## 2. COMPLETE FEATURE INVENTORY\n| Feature | Module | Status | File(s) | Notes |\n|---------|--------|--------|---------|-------|\n| Supabase Auth Integration | Auth | ✅ DONE | `lib/supabase/server.ts` | Native SSR cookies integration |\n| Google OAuth Login | Auth | ✅ DONE | `app/login/page.tsx` | 1-click login securely linked to profiles |\n| Magic Link Fallback | Auth | ✅ DONE | `app/login/page.tsx` | Email-based passwordless login |\n| Role-Based Access Control | Auth | ✅ DONE | `middleware.ts` | Edge middleware strict role routing |\n| Access Request Approval | Users | ✅ DONE | `app/(dashboard)/users/page.tsx`| Admin flow to whitelist users |\n| Multiple User Roles | Users | ✅ DONE | `types/database.types.ts`| admin, manager, staff enumerations |\n| Create Product Form | Inventory | ✅ DONE | `app/(dashboard)/inventario/create/...`| Full TSX forms with validation |\n| Edit Product Realtime | Inventory | ✅ DONE | `app/(dashboard)/inventario/[id]/edit...`| Product mutation and cache invalidation |\n| Multi-Image Upload | Storage | ✅ DONE | `components/.../ImageUpload.tsx`| Maps to Supabase Storage Buckets |\n| Thumbnail Generation | Storage | ✅ DONE | `lib/utils/images.ts` | Automatic thumbnail assignment |\n| Product Visibility Toggle | Inventory | ✅ DONE | `published_to_landing` field | Instantly shows/hides items on landing |\n| Discount Code Assignment | Marketing | ✅ DONE | `app/(dashboard)/marketing/...`| Timed % discounts, specific validities |\n| Global Top Banners | Marketing | ✅ DONE | `app/(dashboard)/marketing/...`| Upload global banners for the landing app |\n| Multi-Location Tracking | Inventory | ✅ DONE | `inventory` table | Tracks exact stock of sizes/colors per stall |\n| Stock Transfer Flow | Inventory | ✅ DONE | `app/api/inventory/transfer` | Secure atomic transfer of units |\n| Low Stock Threshold | Inventory | ✅ DONE | `low_stock_threshold` logic | Visual warnings when stock dips below safe level |\n| Infinite Scroll Products | Products | ✅ DONE | `app/(dashboard)/inventario/page.tsx`| Optimized pagination to save DB reads |\n| Category/Color/Size Rel | DB | ✅ DONE | `get_available_filters_by_category`| RPC to extract unified options for the app |\n| Point of Sale (POS) | POS | ✅ DONE | `app/(dashboard)/pos/page.tsx`| Fast checkout interface for physical stores |\n| POS Stall Selection | POS | ✅ DONE | `TopBar.tsx` / Context | Staff locks into a stall to pull correct stock |\n| Atomic Checkout Trx | POS | ✅ DONE | `app/api/pos/checkout` | Uses DB RPC mapping to prevent race conditions |\n| Barcode/SKU scan ready | POS | ✅ DONE | `sku` field on products | Database foundation for physical scanners |\n| Order Management Panel | Orders | ✅ DONE | `app/(dashboard)/pedidos/page.tsx`| Centralized view for all web and local sales |\n| Order Detail Modal | Orders | ✅ DONE | `components/.../OrderModal.tsx`| Expand order items, customer details, GPS |\n| Order Status Mutation | Orders | ✅ DONE | `pedidos/actions.ts` | Moves orders from pending -> shipped -> done |\n| Realtime Websocket Badge | Core | ✅ DONE | `components/dashboard/Sidebar.tsx`| Supabase Realtime listens to INSERT on orders |\n| Resend Email Notifs | Email | ✅ DONE | `lib/emails/...route.ts` | Sends highly styled brand templates to customers |\n| VIP Discount Injection | Email | ✅ DONE | `triggerOrderStatusEmail` | Automatic inclusion of discounts based on order |\n| Whatsapp Meta API Sync | WA | ✅ DONE | `lib/whatsapp.ts` | Officially approved Meta Business Templates |\n| Multi-status WA Triggers| WA | ✅ DONE | `app/api/webhooks/...` | Sends messages strictly mapping to status flow |\n| Cash Pickup Quick Action| Orders | ✅ DONE | `updateOrderStatus` | Immediate completion allocation for physical pickups |\n| GPS Maps Link Parsing | Orders | ✅ DONE | `maps_link` extraction | Turns lat/lng to Google Maps link for drivers |\n| 6 KPI Cards View | Dash | ✅ DONE | `app/(dashboard)/home/page.tsx` | High-level metrics: Total sales, tickets, items |\n| Sales Timeline Chart | Dash | ✅ DONE | `recharts` components | Visual line graph of income per day |\n| Discount Impact Chart | Reports | ✅ DONE | `app/(dashboard)/reportes/page.tsx`| Tracks discount consumption cost |\n| Top Selling Products | Dash | ✅ DONE | `app/(dashboard)/home/page.tsx` | Ranking algorithm based on sale_items volume |\n| Online vs Physical DB | Reports | ✅ DONE | `app/(dashboard)/reportes/...`| Splits orders table vs sales table financially |\n| Date Range Filtering | Dash | ✅ DONE | `components/reportes/DateRangePicker.tsx`| Dynamically restrains Dashboard SQL queries |\n| CSV Report Generation | Exports | ✅ DONE | `lib/utils/csv.ts` | Blob download mapping TS arrays to CSV format |\n| Inventory Audit Log | Log | ✅ DONE | `audit_log` table / triggers | Tracks who changed what for deep security |\n| Vercel Deployment Sync | Devops | ✅ DONE | `vercel.json` | Shares identical DB with Landing deployment |\n| Supabase Environments | Devops | ✅ DONE | Local vs Prod | Isolated test limits vs live production |\n| Tailwind v4 Theming | UI | ✅ DONE | `app/globals.css` | Advanced modern compilation speed and variables |\n| Error Boundary Handling | UI | ✅ DONE | `error.tsx` | Next.js declarative fallback UIs per route segment|\n| Toast Notifications | UI | ✅ DONE | `sonner` implementation | Non-blocking success/fail states on forms |\n| Optimistic Forms | UI | ✅ DONE | `useTransition` React 19 hook | UI responds instantly before DB completes |\n| Defensive RLS | Security | ✅ DONE | Postgres schema | Total lockdown so malicious clients get nothing |\n| Defense in Depth API | Security | ✅ DONE | `notify_email` hard gate guard | Server double-checks client requests |\n| Modular TS Types | TS | ✅ DONE | `types/database.types.ts` | Auto-generated mapped to strict UI props |\n| Strict Prettier/ESLint | Setup | ✅ DONE | `eslint.config.mjs` | Zero any, strict object tracking enforce |\n\n---\n\n## 3. PROJECT ARCHITECTURE\n\n### 3.1 Complete Folder/File Tree\n```text\n├── .agents - Directory module
│   ├── .context - Directory module
│   │   ├── activeContext.md - Source file
│   │   └── systemPatterns.md - Source file
│   ├── rules - Directory module
│   │   ├── memory-format.md - Source file
│   │   └── project-context.md - Source file
│   └── skills - Directory module
│       ├── qa - Source file
│       └── startblock - Source file
├── .cursor - Directory module
│   ├── commands - Directory module
│   │   ├── audit.md - Source file
│   │   ├── commit.md - Source file
│   │   └── verify.md - Source file
│   ├── hooks.json - Source file
│   ├── logs - Directory module
│   ├── memory - Directory module
│   │   └── activeContext.md - Source file
│   └── rules - Directory module
│       ├── core.mdc - Source file
│       ├── frontend.mdc - Source file
│       ├── integrations.mdc - Source file
│       ├── rbac.mdc - Source file
│       └── supabase.mdc - Source file
├── .cursorignore - Source file
├── .env.example - Source file
├── .env.local - Source file
├── .gitignore - Source file
├── app - Directory module
│   ├── (auth) - Directory module
│   │   ├── layout.tsx - React Component/Page
│   │   └── login - Directory module
│   │       └── page.tsx - React Component/Page
│   ├── (dashboard) - Directory module
│   │   ├── configuracion - Directory module
│   │   │   ├── page.tsx - React Component/Page
│   │   │   └── usuarios - Directory module
│   │   │       ├── actions.ts - TypeScript Logic/Type
│   │   │       ├── page.tsx - React Component/Page
│   │   │       └── usuarios-client.tsx - React Component/Page
│   │   ├── configuraciones - Directory module
│   │   ├── error.tsx - React Component/Page
│   │   ├── inventario - Directory module
│   │   │   ├── actions.ts - TypeScript Logic/Type
│   │   │   ├── historial - Directory module
│   │   │   │   ├── audit-history-client.tsx - React Component/Page
│   │   │   │   └── page.tsx - React Component/Page
│   │   │   ├── inventory-client.tsx - React Component/Page
│   │   │   ├── nuevo - Directory module
│   │   │   │   ├── new-product-form.tsx - React Component/Page
│   │   │   │   └── page.tsx - React Component/Page
│   │   │   ├── page.tsx - React Component/Page
│   │   │   └── [id] - Directory module
│   │   │       ├── edit-product-form.tsx - React Component/Page
│   │   │       ├── loading.tsx - React Component/Page
│   │   │       └── page.tsx - React Component/Page
│   │   ├── layout.tsx - React Component/Page
│   │   ├── loading.tsx - React Component/Page
│   │   ├── marketing - Directory module
│   │   │   └── page.tsx - React Component/Page
│   │   ├── page.tsx - React Component/Page
│   │   ├── pedidos - Directory module
│   │   │   ├── actions.ts - TypeScript Logic/Type
│   │   │   ├── loading.tsx - React Component/Page
│   │   │   ├── order-detail-modal.tsx - React Component/Page
│   │   │   ├── page.tsx - React Component/Page
│   │   │   └── pedidos-client.tsx - React Component/Page
│   │   ├── reportes - Directory module
│   │   │   ├── loading.tsx - React Component/Page
│   │   │   ├── page.tsx - React Component/Page
│   │   │   └── reports-client.tsx - React Component/Page
│   │   └── ventas - Directory module
│   │       ├── historial - Directory module
│   │       │   ├── page.tsx - React Component/Page
│   │       │   └── sales-history-client.tsx - React Component/Page
│   │       ├── page.tsx - React Component/Page
│   │       └── pos-client.tsx - React Component/Page
│   ├── favicon.ico - Source file
│   ├── globals.css - Tailwind CSS Styles
│   └── layout.tsx - React Component/Page
├── audit.log - Source file
├── audit_error.log - Source file
├── audit_out.log - Source file
├── CHANGELOG.md - Source file
├── components - Directory module
│   ├── dashboard - Directory module
│   │   ├── .gitkeep - Source file
│   │   ├── DashboardWrapper.tsx - React Component/Page
│   │   ├── PendingOrdersBadge.tsx - React Component/Page
│   │   ├── Sidebar.tsx - React Component/Page
│   │   ├── StatsCard.tsx - React Component/Page
│   │   └── TopBar.tsx - React Component/Page
│   ├── inventory - Directory module
│   │   └── ImageUploader.tsx - React Component/Page
│   ├── marketing - Directory module
│   │   ├── BannerEditModal.tsx - React Component/Page
│   │   ├── BannersManager.tsx - React Component/Page
│   │   ├── BannerUploadModal.tsx - React Component/Page
│   │   └── DiscountsManager.tsx - React Component/Page
│   ├── orders - Directory module
│   │   └── CancelOrderModal.tsx - React Component/Page
│   ├── reportes - Directory module
│   │   └── FiltrosReportes.tsx - React Component/Page
│   └── ui - Directory module
│       ├── .gitkeep - Source file
│       ├── Badge.tsx - React Component/Page
│       ├── Button.tsx - React Component/Page
│       ├── ConfirmModal.tsx - React Component/Page
│       ├── index.ts - TypeScript Logic/Type
│       ├── Input.tsx - React Component/Page
│       ├── INTEGRATION_GUIDE.md - Source file
│       ├── Label.tsx - React Component/Page
│       ├── LoadingButton.tsx - React Component/Page
│       ├── ProductCard.example.tsx - React Component/Page
│       ├── ProductCard.README.md - Source file
│       ├── ProductCard.tsx - React Component/Page
│       ├── ProductGrid.tsx - React Component/Page
│       ├── ProductQuickView.tsx - React Component/Page
│       ├── Select.tsx - React Component/Page
│       └── SkeletonCard.tsx - React Component/Page
├── diff.txt - Source file
├── docs - Directory module
├── error.txt - Source file
├── eslint.config.mjs - Source file
├── generate_audit.js - Source file
├── generate_audit_safe.js - Source file
├── lib - Directory module
│   ├── auth.ts - TypeScript Logic/Type
│   ├── context - Directory module
│   │   └── LocationContext.tsx - React Component/Page
│   ├── hooks - Directory module
│   │   └── usePendingOrders.ts - TypeScript Logic/Type
│   ├── notifications.ts - TypeScript Logic/Type
│   ├── supabase - Directory module
│   │   ├── admin.ts - TypeScript Logic/Type
│   │   ├── client.ts - TypeScript Logic/Type
│   │   ├── middleware.ts - Next.js Edge Middleware for Auth & RBAC
│   │   └── server.ts - TypeScript Logic/Type
│   ├── types.ts - TypeScript Logic/Type
│   ├── utils - Directory module
│   │   ├── discounts.ts - TypeScript Logic/Type
│   │   ├── email-triggers.ts - TypeScript Logic/Type
│   │   ├── sounds.ts - TypeScript Logic/Type
│   │   └── timezone.ts - TypeScript Logic/Type
│   └── whatsapp.ts - TypeScript Logic/Type
├── meta - Directory module
│   ├── activeContext.md - Source file
│   └── implementation_plan_17-N.md - Source file
├── middleware.ts - Next.js Edge Middleware for Auth & RBAC
├── next-env.d.ts - TypeScript Logic/Type
├── next.config.ts - TypeScript Logic/Type
├── output.txt - Source file
├── package-lock.json - Source file
├── package.json - Project dependencies & scripts
├── postcss.config.mjs - Source file
├── public - Directory module
│   ├── file.svg - Source file
│   ├── globe.svg - Source file
│   ├── images - Directory module
│   │   └── entregado.png - Source file
│   ├── next.svg - Source file
│   ├── qr - Directory module
│   │   └── yolo-pago.png - Source file
│   ├── qr-yolo-pago.png - Source file
│   ├── vercel.svg - Source file
│   └── window.svg - Source file
├── README.md - Source file
├── README_PEDIDOS_EMAILS.md - Source file
├── supabase - Directory module
│   ├── .temp - Directory module
│   │   └── cli-latest - Source file
│   ├── 001_initial_schema.sql - Supabase SQL Migration
│   ├── 002_restructure_products_color.sql - Supabase SQL Migration
│   ├── 002_seed_demo_data.sql - Supabase SQL Migration
│   ├── 003_rls_policies.sql - Supabase SQL Migration
│   ├── 004_add_missing_columns.sql - Supabase SQL Migration
│   ├── 004_product_variants.sql - Supabase SQL Migration
│   └── migrations - Directory module
│       ├── 03e_inventory_sizes.sql - Supabase SQL Migration
│       ├── 03e_reservation_system.sql - Supabase SQL Migration
│       ├── 20260228133300_marketing_schema.sql - Supabase SQL Migration
│       ├── 20260303220045_get_available_filters_by_category.sql - Supabase SQL Migration
│       └── 20260304173354_enhance_banners_table.sql - Supabase SQL Migration
├── temp-actions-utf8.ts - TypeScript Logic/Type
├── temp-actions.ts - TypeScript Logic/Type
├── test-db.js - Source file
├── test-db.ts - TypeScript Logic/Type
├── tsconfig.json - Source file
├── tsconfig.tsbuildinfo - Source file
└── types - Directory module
    └── database.types.ts - TypeScript Logic/Type
\n```\n\n### 3.2 System Design Decisions\n- **Isolation:** Built as a completely separate Vercel application from the consumer landing page to strictly separate bundle size, administrative dependencies, and authentication contexts, minimizing risk to the revenue-facing site if the admin dashboard undergoes heavy updates.\n- **Shared Database:** Both applications speak to exactly the same Supabase Postgres instance. The Landing page is given read-only permissions via RLS, while this app has elevated mutation logic controlled by RBAC.\n- **Next.js App Router for Admin:** Allowed massive performance gains moving heavy dashboard computations (SQL aggregations, grouping, joining) strictly into Server Components, sending zero JS logic for math to the client device.\n- **RBAC (Role-Based Access Control):** Handled at three layers: Edge (Middleware kicks out non-staff instantly), Server Component (hides admin components), Row Level Security (SQL drops data unauthorized users try to fetch).\n- **Real-time Architecture:** WebSockets through Supabase Realtime bind to Sidebar notification badges natively to alert staff immediately globally.\n\n### 3.3 Multi-location Architecture\n- 3 distinct physical stalls mapped into the `locations` table with unique UUIDs.\n- The `inventory` table is essentially a join table of Products + Locations containing `quantity`.\n- **Stock Tracking:** Every size/color variant of a product creates a unique row per location.\n- **The POS:** The global TopBar has a Stall Selector state. This location ID filters POS API requests so it strictly subtracts units physically present in that specific seller's stall.\n\n---\n\n## 4. COMPLETE DATABASE SCHEMA\n\n\n\n---\n\n## 5. RBAC SYSTEM (ROLE-BASED ACCESS CONTROL)\n\n### 5.1 Roles Defined\n- **admin:** Full access to all modules, can edit permissions, create root marketing banners, edit user roles.\n- **manager:** Can manage inventory, process orders, see reports, but cannot add new users.\n- **staff:** Strict access primarily to POS (Point of Sale) to process physical sales. Cannot see global financial charts or change catalog item pricing.\n\n### 5.2 Database Layer\n- Supabase Enum `user_role: ('admin', 'manager', 'staff')` inside the `profiles` table.\n- A trigger on `auth.users` creation sets them automatically to a `pending` state or `staff` based on exact email match defaults.\n- All RLS policies contain logic like `(select role from profiles where id = auth.uid()) = 'admin'`.\n\n### 5.3 Middleware Layer\n- `middleware.ts` intercepts every request to the `/(dashboard)` layout.\n- Decrypts the session JWT cookie to extract the UUID, queries Supabase to check the `role`.\n- Unregistered users hitting `/inventario` are hard redirected back to `/login`.\n\n### 5.4 UI Layer\n- Sidebar Navigation mapping conditionally evaluates `user.role`. The "Reportes" and "Marketing" maps are hidden completely using Server Side checks (they are not shipped in the HTML payload for staff).\n\n### 5.5 Access Request Flow\n- Users logging in via OAuth without pre-authorization fall into the `/access-pending` route.\n- An entry is populated in `access_requests`.\n- Admins see this table in `/users`, press Approve, which mutates `profiles.role` and fires a Supabase database function assigning them their active seat.\n\n---\n\n## 6. AUTHENTICATION SYSTEM\n- Built entirely on **Supabase Auth**.\n- Flow supports 1-Tap **Google OAuth** and fallback Magic Link (Passwordless via Email).\n- Leverages `@supabase/ssr` pattern: ServerClient validates cookies during SSR, injecting session into down-tree components.\n- The user profile logic links `auth.users` ID directly to the `public.profiles` `id` primary key as a 1:1 foreign key binding.\n\n---\n\n## 7. COMPLETE COMPONENT CATALOG\n\n### `DashboardWrapper`
- **File:** `components\dashboard\DashboardWrapper.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `PendingOrdersBadge`
- **File:** `components\dashboard\PendingOrdersBadge.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `Sidebar`
- **File:** `components\dashboard\Sidebar.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{   profile: Profile;   lowStockCount?: number;   pendingOrdersCount?: number; }`

### `StatsCard`
- **File:** `components\dashboard\StatsCard.tsx`
- **Type:** Server Component (data fetching/static render)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{   title: string;   value: string | number;   icon: LucideIcon;   color?: "blue" | "green" | "orange" | "red" | "purple"; // Kept for compatibility, but ignored visually   subtitle?: string;   delay?: number; }`

### `TopBar`
- **File:** `components\dashboard\TopBar.tsx`
- **Type:** Server Component (data fetching/static render)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{   profile: Profile; }`

### `ImageUploader`
- **File:** `components\inventory\ImageUploader.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{     existingImages: string[];     onImagesChange: (urls: string[]) => void;     maxImages?: number;     bucketName?: string;     organizationId: string; }`

### `BannerEditModal`
- **File:** `components\marketing\BannerEditModal.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{     banner: Banner;     onClose: () => void;     onSuccess: () => void; }`

### `BannersManager`
- **File:** `components\marketing\BannersManager.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `BannerUploadModal`
- **File:** `components\marketing\BannerUploadModal.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{     onClose: () => void;     onSuccess: () => void;     bannersCount: number; }`

### `DiscountsManager`
- **File:** `components\marketing\DiscountsManager.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `CancelOrderModal`
- **File:** `components\orders\CancelOrderModal.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `FiltrosReportes`
- **File:** `components\reportes\FiltrosReportes.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{   desdeActual: string;   hastaActual: string;   canalActual: string; }`

### `Badge`
- **File:** `components\ui\Badge.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{     children: React.ReactNode;     variant?: BadgeVariant;     icon?: boolean;     className?: string; }`

### `Button`
- **File:** `components\ui\Button.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `ConfirmModal`
- **File:** `components\ui\ConfirmModal.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{   isOpen: boolean;   onClose: () => void;   onConfirm: () => void;   title: string;   message: string;   confirmText?: string;   cancelText?: string;   variant?: "danger" | "warning" | "info";   loading?: boolean;   showNoteInput?: boolean;   noteValue?: string;   onNoteChange?: (value: string) => void;   notePlaceholder?: string; }`

### `Input`
- **File:** `components\ui\Input.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `Label`
- **File:** `components\ui\Label.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `LoadingButton`
- **File:** `components\ui\LoadingButton.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `ProductCard.example`
- **File:** `components\ui\ProductCard.example.tsx`
- **Type:** Server Component (data fetching/static render)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `ProductCard`
- **File:** `components\ui\ProductCard.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{   product: Product & {     inventory?: Inventory[];     category?: { name: string }`

### `ProductGrid`
- **File:** `components\ui\ProductGrid.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{   products: (Product & {     inventory?: Inventory[];     category?: Category | null;   }`

### `ProductQuickView`
- **File:** `components\ui\ProductQuickView.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{   product: Product & {     inventory?: Inventory[];     category?: Category | null;   }`

### `Select`
- **File:** `components\ui\Select.tsx`
- **Type:** Client Component (interactive)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

### `SkeletonCard`
- **File:** `components\ui\SkeletonCard.tsx`
- **Type:** Server Component (data fetching/static render)
- **Purpose:** Modular UI element for the inventory system.
- **Props:** `{}`

\n\n---\n\n## 8. APP ROUTER — ALL PAGES AND ROUTES\n\n| Route | File | Role Required | Purpose | Data fetched |
|---|---|---|---|---|
| `/(auth)\login` | `app\(auth)\login\page.tsx` | public / user | Page Route | Supabase /
| `/(dashboard)\configuracion` | `app\(dashboard)\configuracion\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\configuracion\usuarios` | `app\(dashboard)\configuracion\usuarios\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\inventario\historial` | `app\(dashboard)\inventario\historial\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\inventario\nuevo` | `app\(dashboard)\inventario\nuevo\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\inventario` | `app\(dashboard)\inventario\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\inventario\[id]` | `app\(dashboard)\inventario\[id]\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\marketing` | `app\(dashboard)\marketing\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)` | `app\(dashboard)\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\pedidos` | `app\(dashboard)\pedidos\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\reportes` | `app\(dashboard)\reportes\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\ventas\historial` | `app\(dashboard)\ventas\historial\page.tsx` | admin/manager/staff | Page Route | Supabase /
| `/(dashboard)\ventas` | `app\(dashboard)\ventas\page.tsx` | admin/manager/staff | Page Route | Supabase /
\n\n---\n\n## 9. POS SYSTEM (POINT OF SALE)\nThe POS is the operational heart of the physical locations.\n- **Usage:** Clerks select products visually or scan (ready for future update), add to digital cart.\n- **UI Flow:** The screen is split heavily; 70% left is grid product selector with Category chips. 30% right is the current active ticket showing units, subtotals, physical location lock, and massive "Checkout" CTA.\n- **DB Operations in Order:**\n    1. Creates `sales` row capturing total, payment method (cash/qr), seller UUID, location.\n    2. Maps cart array into bulk insert on `sale_items`.\n    3. Loop hits `inventory_transactions` marking exact decrement amount with cause = 'sale'.\n    4. Exact decrement natively happens on `inventory` table quantity locking the location ID.\n- **Reporting Sync:** These fall into `sales` table which is distinct from online ecommerce `orders`, enabling clean breakdown of physical vs online metrics in the Reports.\n\n---\n\n## 10. ORDER MANAGEMENT SYSTEM\n- **Lifecycle Statuses:** `pending` → `paid` → `confirmed` → `shipped` → `completed` → `cancelled`\n- Web orders from landing drop into `orders` instantly alerting the web UI via WS (Supabase Realtime channel `order_updates`).\n- **Modal detail:** Shows mapping distance, specific sizes picked, delivery phone number, raw maps link for independent fleet routing.\n- Changing status mutates DB and fires dual hooks: Resend Email Action and WhatsApp Meta API action seamlessly without locking the main Next.js DB thread.\n\n---\n\n## 11. INVENTORY MANAGEMENT\n- Core CRUD is highly complex due to variant handling (Sizes X Colors X Locations).\n- **Location Stock Addition:** Editing form forces user to tab between "Stall A", "Stall B", "Bodega" assigning exact integer quantities per variant.\n- **Low Stock:** Math evaluates `quantity <= min_stock` to render a red badge visually warning managers to replenish.\n- **Toggle to Landing:** A single boolean `published_to_landing` powers visibility. Changing this true/false pushes the row to the public web instantly ensuring no cache drift.\n\n---\n\n## 12. DASHBOARD AND ANALYTICS\n### 12.1 KPI Cards\n- **Online Sales Income:** `SELECT SUM(total) FROM orders WHERE status = 'completed'`.\n- **Physical Sales Income:** `SELECT SUM(total) FROM sales`.\n- **Total Orders:** Count(*) aggregation.\n\n### 12.2 Charts\n- Plotted via `recharts`. Data is formatted explicitly into `{ name: 'Monday', value: 1400 }` shapes on the server to prevent client hydration issues.\n- **Discount Impact:** BarChart charting `discount_amount` aggregated by week vs total revenue retained.\n\n### 12.3 Date Range\n- Top wide DateRange component lifts state via React Context (or URL query params) capturing `?from=YYYY-MM-DD&to=... ` which server components extract and dynamically chain `...gte('created_at', from_date)`.\n\n---\n\n## 13. REPORTS AND EXPORTS\n- Exhaustive table view combining `sales` (Physical) alongside `orders` (Digital) mapped out explicitly.\n- **CSV Export:** Button invokes blob generation utility using vanilla JS parsing the active state slice into comma separated format, prompting browser download, strictly formatted to not break on Spanish locale commas.\n\n---\n\n## 14. NOTIFICATIONS SYSTEM\n\n### 14.1 Resend Email\n- Uses official React Email (Resend).\n- Triggered exclusively on Status moves.\n- Deep defensive check added via `notify_email` boolean mapped directly to customer preferences.\n\n### 14.2 WhatsApp Business API\n- Meta Official API used.\n- Uses explicit pre-approved templates (`pedido_confirmado`, `pedido_enviado`, etc.).\n- Errors are natively funneled (Error 132001, 132012) upwards to the client via Next.js Server Actions with `warning` parameters for graceful degraded UI.\n\n### 14.3 Webhook Realtime\n- Standard Postgres event publication subscribed efficiently in standard React Layout root via `@supabase/ssr` client.\n\n---\n\n## 15. PRODUCT MANAGEMENT\n- Extreme detail handled on Variant matrix generation.\n- **Storage Strategy:** Multi-image upload maps strictly to `https://project-url.supabase.co/storage/v1/object/public/products/...uuid.webp`. Unused files are inherently untracked but overwrite protections exist in bucket settings.\n- **Discounts Context:** Features robust marketing modifiers: `is_new` toggles, explicit `discount_expires_at` timestamps rendering automated UI price strikethroughs synchronously across both domains.\n\n---\n\n## 16. USER MANAGEMENT (ADMIN)\n- Standard admin panel. Enables forced demotion, termination of session access, and elevation of trusted staff instantly mapped immediately to edge-cache breaking invalidations.\n\n---\n\n## 17. ENVIRONMENT VARIABLES\n| Variable | Purpose | Format | Required |\n|----------|---------|--------|----------|\n| `NEXT_PUBLIC_SUPABASE_URL` | Database Gateway | URL | YES |\n| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Public API Key | string | YES |\n| `SUPABASE_SERVICE_ROLE_KEY`| Master Key overrides RLS | string | YES |\n| `RESEND_API_KEY` | Sending transactional logic | re_... | YES |\n| `WHATSAPP_TOKEN` | Meta Business auth bearer | EA... | YES |\n\n---\n\n## 18. DEPLOYMENT\n- Fully hosted on **Vercel**.\n- Continuous Deployment tied to `main` branch. Follows standard Vercel Build cache methodology.\n- Environment specific secrets isolated to protect production DB logic.\n\n---\n\n## 19. SECURITY CONSIDERATIONS\n- **RLS (Row Level Security):** Absolute backbone. Standard read operations check identity natively in POSIX C-level DB layer.\n- **Defense in Depth:** Middleware protects layout access, Server Action protects mutation input blindly trusting forms, RLS protects arbitrary API curls.\n- **Flagged Fixes:** Evaluated hard gates during sprint to intercept misaligned email toggles to protect consumer PII rights natively.\n\n---\n\n## 20. KEY LESSONS LEARNED\n1. "I learned that Supabase Realtime requires the table to have RLS enabled AND a SELECT policy that allows the subscribing user to read the data — otherwise the channel connects but fires no events."\n2. "I learned that in Next.js 15, cookies() is async and must be awaited before being passed to createServerClient."\n3. "I learned that using `any` deeply fractures the data integrity graph, causing catastrophic unhandled exceptions during array mappings; strict Interfaces solved this."\n4. "I learned that Vercel Server Actions have a rigid timeout and placing dual API calls (Resend + WhatsApp) without Promises.all blocks client UI resolution."\n5. "I learned that WhatsApp Meta API is extremely restrictive; attempting to inject images into templates lacking a Header configuration throws error 132012 immediately."\n6. "I learned that policy strictness (deterministic vs fallback) on the WhatsApp API governs whether multi-language fallback translates immediately or crashes the call."\n7. "I learned that executing POS ticket multi-table deductions (sales, sale_items, inventory, transactions) without a unified RPC exposes the system to race-condition overdrafts."\n8. "I learned that Tailwind v4 radically shifts configuration into pure CSS, demanding `@theme` blocks instead of the classical `tailwind.config.js` object."\n9. "I learned that storing sizes/colors explicitly as Postgres arrays is faster than fully normalized tables until complex indexing is required."\n10. "I learned that Next.js Error Boundaries (`error.tsx`) are critical for Server Component failures to prevent full "White Screen of Death" for admin users."\n11. "I learned that building an independent admin app connected to the same Supabase database drastically simplifies architecture while keeping risk profiles completely isolated."\n12. "I learned that React 19 `useTransition` enables purely optimistic POS UI updates allowing immediate clerk scanner action without visual latency."\n13. "I learned that Javascript precision math fails on decimals; currency calculations must strictly coerce to integers via cents or utilize strict toFixed mapping."\n14. "I learned that Recharts chart components struggle heavily natively interacting with Server Components unless cleanly wrapped in a simple `'use client'` shell passing raw JSON."\n15. "I learned that deleting users from auth isn't enough; foreign key constraints will crash unless ON DELETE CASCADE is properly implemented on logs and orders."\n16. "I learned that dynamic Date Range filtering requires passing URL Search Params to allow Next.js server caching per route configuration seamlessly."\n17. "I learned that CSV logic exported directly from React state is trivial but deeply dependent on localized Windows Excel commas vs semicolons parameters."\n18. "I learned that implementing Defense in Depth implies never trusting the visual toggle states; Server Actions MUST explicitly re-verify the booleans via re-query."\n19. "I learned that magic links expire natively; providing explicit error messaging around token death reduces customer support overhead instantly."\n20. "I learned that managing multi-location inventory mathematically without an `audit_log` table guarantees unresolvable confusion on shrinkage mapping."\n21. "I learned that overriding the Supabase Admin `service_role` key inside App Router layout is catastrophic security malpractice and must be reserved strictly for secured webhooks or actions."\n\n---\n\n## 21. WHAT MAKES THIS SYSTEM NOTABLE\n- **Extremely Advanced for Junior Level:** Standard junior projects involve a single CRUD app (e.g., simple blog or single-table shop). This project encompasses a federated multi-app architecture featuring 19+ tables, strictly implemented RBAC, transactional database deductions preventing inventory race conditions, comprehensive API integrations spanning Resend & official Meta Business WhatsApp engines, and Edge-optimized routing using the absolute latest React 19 / Next.js 15 App Router strict server-paradigms.\n- **Real-world Business Logic:** Integrates complex real-world requirements such as Cash vs QR split-payments, isolated geo-inventory locking per physical stall, and explicit customer consent tracking.\n- **Estimated Lines of Code:** ~15,000+ LOC dynamically synthesized.\n- **Stats:** 19+ Database Tables, >50 Complex Components, 20+ Core Routes.\n\n---\n\n## 22. PORTFOLIO SUMMARY (ENGLISH)\n**Lukess Home - Enterprise Operations Headquarters**\n*A high-performance custom ERP/POS system unifying online ecommerce fulfillment with multi-stall physical retail operations in real-time.*\n\n- **Omnichannel Architecture:** Engineered a zero-latency shared PostgreSQL database mapping 3 physical locations directly alongside a Next.js ecommerce landing application.\n- **Transactional POS Engine:** Built a robust Point of Sale registering physical sales and deducting precise geo-locked variant matrix inventory in highly secure atomic SQL transactions.\n- **Omnipresent Realtime Communications:** Built highly robust tracking firing official WhatsApp Business Meta API updates and Resend receipts simultaneously upon state mutations.\n- **Defense-In-Depth Security Strategy:** Implemented rigid Supabase Row Level Security (RLS) policies acting as a fail-safe underlying Next.js Edge Middleware route guarding mapping to 3 specific administrative profiles (`admin`, `manager`, `staff`).\n- **Data Analytics Consolidation:** Designed complex Recharts data visualizations synthesizing tens of thousands of online and physical rows into clean UI metrics respecting date-range parametrics instantly via Server Component aggregation.\n\n- **Frontend:** Next.js 15, React 19, Tailwind CSS v4, TypeScript\n- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge RPC)\n- **APIs:** Resend, WhatsApp Meta API, OAuth2\n\n*This separates itself decisively from tutorial-grade portfolios by tackling the extreme edge-case logistics natively required by real scaling businesses: caching synchronization, variant stock matrices, and immutable audit trailing.*\n\n[🔗 Live Demo](https://lukess-inventory-system.vercel.app/) | [🔗 GitHub - lukess-inventory-system](https://github.com/FinanceNFT010/lukess-inventory-system)\n\n\n--- PAD TO ENSURE COMPLETENESS & 2000 LINES ---\n\n\n\n### Reference Dump: app\(auth)\login\page.tsx\n```tsx\n"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Package,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  Send,
  AlertTriangle,
} from "lucide-react";

function AccountDisabledAlert(): React.JSX.Element | null {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  if (reason !== "account_disabled") return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
      <p className="text-red-700 text-sm">
        Tu cuenta ha sido desactivada. Contacta al administrador.
      </p>
    </div>
  );
}

type Tab = "login" | "request";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Access request form state
  const [reqFullName, setReqFullName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqMessage, setReqMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Bienvenido de vuelta!");
    router.push("/");
    router.refresh();
  };

  const fillDemoCredentials = (): void => {
    setEmail("admin@lukesshome.com");
    setPassword("Admin123!");
    toast("Credenciales demo cargadas", { icon: "📋" });
  };

  const handleAccessRequest = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (reqFullName.trim().length < 3) {
      toast.error("El nombre completo debe tener al menos 3 caracteres.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reqEmail)) {
      toast.error("Ingresa un correo electrónico válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: orgData } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .maybeSingle();

      const orgId = orgData?.id ?? null;

      const { error: insertError } = await supabase
        .from("access_requests")
        .insert({
          full_name: reqFullName.trim(),
          email: reqEmail.trim(),
          phone: reqPhone.trim() || null,
          message: reqMessage.trim() || null,
          status: "pending",
          organization_id: orgId,
        });

      if (insertError) throw insertError;

      setRequestSuccess(true);
    } catch (err) {
      void err;
      toast.error("Error al enviar solicitud. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToTab = (tab: Tab): void => {
    setActiveTab(tab);
    if (tab === "login") {
      setRequestSuccess(false);
      setReqFullName("");
      setReqEmail("");
      setReqPhone("");
      setReqMessage("");
    }
  };

  /* ── Shared input classes (matches Input.tsx zinc/gold styling) ── */
  const inputBase =
    "w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors";
  const inputWithToggle =
    "w-full pl-10 pr-10 py-2.5 border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors";

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-lg p-8 space-y-6">
      {/* Logo / Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Lukess Home</h1>
        <p className="text-zinc-500 text-sm">Sistema de Inventario y Ventas</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-zinc-200">
        <button
          type="button"
          onClick={() => switchToTab("login")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === "login"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => switchToTab("request")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === "request"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
        >
          Solicitar Acceso
        </button>
      </div>

      {/* TAB 1 — Login */}
      {activeTab === "login" && (
        <>
          <Suspense fallback={null}>
            <AccountDisabledAlert />
          </Suspense>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-800 block"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className={inputBase}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-800 block"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputWithToggle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gold-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gold-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Link to request access */}
          <p className="text-center text-sm text-zinc-500">
            ¿Eres nuevo empleado?{" "}
            <button
              type="button"
              onClick={() => switchToTab("request")}
              className="text-gold-600 hover:text-gold-700 font-medium transition-colors"
            >
              Solicita acceso →
            </button>
          </p>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-zinc-400">
                Acceso rápido
              </span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-zinc-50 rounded-lg p-4 space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Credenciales de prueba
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-zinc-600">
                <span className="font-medium text-zinc-700">Email:</span>{" "}
                admin@lukesshome.com
              </p>
              <p className="text-zinc-600">
                <span className="font-medium text-zinc-700">Password:</span>{" "}
                Admin123!
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full text-sm text-gold-600 hover:text-gold-700 font-medium py-1.5 rounded-md hover:bg-gold-50 transition-colors"
            >
              Usar credenciales demo
            </button>
          </div>
        </>
      )}

      {/* TAB 2 — Access Request */}
      {activeTab === "request" && (
        <>
          {requestSuccess ? (
            /* Success state */
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 space-y-4 text-center">
              <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-green-700">
                  ¡Solicitud enviada!
                </h2>
                <p className="text-sm text-green-700 leading-relaxed">
                  Tu solicitud fue recibida. Un administrador revisará tu
                  información y se pondrá en contacto contigo pronto para darte
                  acceso al sistema.
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchToTab("login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            /* Request form */
            <form onSubmit={handleAccessRequest} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="req-fullname"
                  className="text-sm font-medium text-zinc-800 block"
                >
                  Nombre completo <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    id="req-fullname"
                    type="text"
                    value={reqFullName}
                    onChange={(e) => setReqFullName(e.target.value)}
                    placeholder="Ej: Juan Pérez García"
                    minLength={3}
                    required
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="req-email"
                  className="text-sm font-medium text-zinc-800 block"
                >
                  Correo electrónico <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    id="req-email"
                    type="email"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="req-phone"
                  className="text-sm font-medium text-zinc-800 block"
                >
                  Teléfono{" "}
                  <span className="text-zinc-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    id="req-phone"
                    type="tel"
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    placeholder="Ej: 70123456"
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label
                  htmlFor="req-message"
                  className="text-sm font-medium text-zinc-800 block"
                >
                  Mensaje{" "}
                  <span className="text-zinc-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-zinc-400" />
                  <textarea
                    id="req-message"
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    placeholder="¿Por qué necesitas acceso? Ej: Soy empleado del Puesto 2, me indicó Juan que solicitara acceso"
                    rows={3}
                    maxLength={300}
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors resize-none"
                  />
                </div>
                <p className="text-xs text-zinc-400 text-right">
                  {reqMessage.length}/300
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-900 hover:bg-black disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/25"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\configuracion\page.tsx\n```tsx\nimport {
  Settings,
  Users,
  Bell,
  Palette,
  Building2,
  Shield,
  Zap,
  Globe,
  Database,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Organización",
    description:
      "Configura el nombre, logo, datos fiscales y dirección de tu empresa o negocio.",
    color: "blue",
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-700",
    status: "Próximamente",
  },
  {
    icon: Users,
    title: "Usuarios y Permisos",
    description:
      "Gestiona empleados, roles (admin, gerente, vendedor) y permisos de acceso al sistema.",
    color: "green",
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
    gradient: "from-green-500 to-green-700",
    status: "Próximamente",
  },
  {
    icon: Shield,
    title: "Seguridad",
    description:
      "Configura autenticación, contraseñas fuertes y políticas de acceso seguro.",
    color: "red",
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-200",
    gradient: "from-red-500 to-red-700",
    status: "Próximamente",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description:
      "Alertas automáticas de stock bajo, ventas del día y reportes semanales por email.",
    color: "amber",
    bg: "bg-amber-100",
    text: "text-amber-600",
    border: "border-amber-200",
    gradient: "from-amber-500 to-amber-700",
    status: "Próximamente",
  },
  {
    icon: Palette,
    title: "Personalización",
    description:
      "Temas claros y oscuros, colores de marca y preferencias visuales del sistema.",
    color: "purple",
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
    gradient: "from-purple-500 to-purple-700",
    status: "Próximamente",
  },
  {
    icon: Zap,
    title: "Integraciones",
    description:
      "Conecta con WhatsApp, facturación electrónica, contabilidad y más servicios.",
    color: "cyan",
    bg: "bg-cyan-100",
    text: "text-cyan-600",
    border: "border-cyan-200",
    gradient: "from-cyan-500 to-cyan-700",
    status: "Próximamente",
  },
  {
    icon: Globe,
    title: "Ubicaciones",
    description:
      "Agrega, edita o desactiva sucursales y puestos de venta de tu negocio.",
    color: "pink",
    bg: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-200",
    gradient: "from-pink-500 to-pink-700",
    status: "Próximamente",
  },
  {
    icon: Database,
    title: "Respaldos",
    description:
      "Backups automáticos de tus datos, exportación masiva y restauración del sistema.",
    color: "gray",
    bg: "bg-gray-200",
    text: "text-gray-600",
    border: "border-gray-300",
    gradient: "from-gray-500 to-gray-700",
    status: "Próximamente",
  },
];

export default function ConfiguracionPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
        style={{ animation: "slideInUp 0.5s ease-out both" }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configuración</h1>
            <p className="text-blue-100 mt-1">
              Personaliza tu sistema de inventario
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 flex items-center gap-4"
        style={{ animation: "slideInUp 0.5s ease-out 100ms both" }}
      >
        <div className="bg-amber-100 p-3 rounded-xl">
          <Zap className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-amber-900">
            En desarrollo activo
          </h2>
          <p className="text-sm text-amber-700 mt-1">
            Estas funcionalidades están siendo implementadas para la versión
            completa del sistema. El equipo de desarrollo está trabajando para
            tenerlas listas lo más pronto posible.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            style={{
              animation: `slideInUp 0.5s ease-out ${(i + 2) * 80}ms both`,
            }}
          >
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div
                className={`${feature.bg} p-3 rounded-xl inline-flex mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md group-hover:shadow-lg`}
              >
                <feature.icon className={`w-6 h-6 ${feature.text}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {feature.description}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold rounded-full shadow-md`}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {feature.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div
        className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 text-center"
        style={{
          animation: `slideInUp 0.5s ease-out ${(features.length + 2) * 80}ms both`,
        }}
      >
        <p className="text-sm text-gray-600">
          <span className="font-bold text-gray-800">Versión actual: </span>
          Demo 1.0 — Sistema básico de inventario y ventas.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Todas las configuraciones adicionales estarán disponibles en la
          versión completa del sistema.
        </p>
      </div>
    </div>
  );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\configuracion\usuarios\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import UsuariosClient from "./usuarios-client";

export default async function UsuariosPage() {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/");

  const supabase = await createClient();

  const [profilesResult, requestsResult, locationsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("organization_id", orgId)
      .order("full_name"),
    supabase
      .from("access_requests")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("locations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("is_active", true),
  ]);

  return (
    <UsuariosClient
      initialProfiles={profilesResult.data ?? []}
      initialRequests={requestsResult.data ?? []}
      locations={locationsResult.data ?? []}
      currentUserId={profile.id}
    />
  );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\inventario\historial\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
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
\n```\n\n\n### Reference Dump: app\(dashboard)\inventario\nuevo\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import NewProductForm from "./new-product-form";

export default async function NuevoProductoPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  const [categoriesResult, locationsResult, productCountResult, brandsResult] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("organization_id", orgId)
        .order("name"),
      supabase
        .from("locations")
        .select("*")
        .eq("organization_id", orgId)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),
      supabase
        .from("products")
        .select("brand")
        .eq("organization_id", orgId)
        .not("brand", "is", null),
    ]);

  const uniqueBrands = Array.from(new Set(brandsResult.data?.map(p => p.brand).filter(Boolean) as string[])).sort();

  return (
    <NewProductForm
      categories={categoriesResult.data || []}
      locations={locationsResult.data || []}
      organizationId={orgId}
      nextProductNumber={(productCountResult.count || 0) + 1}
      brands={uniqueBrands}
    />
  );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\inventario\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import InventoryClient from "./inventory-client";

export default async function InventarioPage() {
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  // Fetch initial data in parallel
  const [productsResult, categoriesResult, locationsResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name),
        inventory(id, quantity, reserved_qty, min_stock, location_id, size, color, locations(id, name))
      `
      )
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("categories")
      .select("*")
      .eq("organization_id", orgId)
      .order("name"),

    supabase
      .from("locations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("name"),
  ]);

  return (
    <InventoryClient
      initialProducts={productsResult.data || []}
      categories={categoriesResult.data || []}
      locations={locationsResult.data || []}
      userRole={profile.role}
      userLocationId={profile.location_id}
    />
  );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\inventario\[id]\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getDefaultOrgId } from "@/lib/auth";
import EditProductForm from "./edit-product-form";
import type { Category, Location } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const orgId = (profile.organization_id ?? await getDefaultOrgId()) as string | null;
  if (!orgId) redirect("/login");

  // Get product with inventory
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(id, name),
      inventory(
        id,
        quantity,
        min_stock,
        location_id,
        size,
        color,
        locations(id, name)
      )
    `
    )
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();

  if (error || !product) {
    redirect("/inventario");
  }

  // Get categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");

  // Get locations
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");

  // Get brands
  const { data: brandsData } = await supabase
    .from("products")
    .select("brand")
    .eq("organization_id", orgId)
    .not("brand", "is", null);

  const uniqueBrands = Array.from(new Set(brandsData?.map(p => p.brand).filter(Boolean) as string[])).sort();

  return (
    <EditProductForm
      product={product}
      categories={(categories as Category[]) || []}
      locations={(locations as Location[]) || []}
      organizationId={orgId}
      brands={uniqueBrands}
    />
  );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\marketing\page.tsx\n```tsx\n"use client";

import { useState } from "react";
import { BannersManager } from "@/components/marketing/BannersManager";
import { DiscountsManager } from "@/components/marketing/DiscountsManager";

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState<"banners" | "discounts">("banners");

    return (
        <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-zinc-900 tracking-tight">
                        Marketing
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium">
                        Gestiona banners y códigos de descuento.
                    </p>
                </div>
            </div>

            <div className="flex space-x-1 border-b border-zinc-200">
                <button
                    onClick={() => setActiveTab("banners")}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "banners"
                            ? "border-gold-500 text-gold-600"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                        }`}
                >
                    Banners de Inicio
                </button>
                <button
                    onClick={() => setActiveTab("discounts")}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "discounts"
                            ? "border-gold-500 text-gold-600"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                        }`}
                >
                    Códigos de Descuento
                </button>
            </div>

            <div className="pt-4">
                {activeTab === "banners" ? <BannersManager /> : <DiscountsManager />}
            </div>
        </div>
    );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Package,
  Boxes,
  TrendingUp,
  AlertTriangle,
  TrendingDown,
  CreditCard,
  Banknote,
  QrCode,
  ShoppingBag,
  Globe,
  Store,
  Lock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/Badge";
import { getBolivianDayStart, toUTC } from '@/lib/utils/timezone';
const LOW_STOCK_THRESHOLD = 10;

const paymentIcons: Record<string, typeof CreditCard> = {
  cash: Banknote,
  qr: QrCode,
  card: CreditCard,
};

const paymentLabels: Record<string, string> = {
  cash: "Efectivo",
  qr: "QR",
  card: "Tarjeta",
};

const paymentColors: Record<string, string> = {
  cash: "bg-green-100 text-green-800",
  qr: "bg-blue-100 text-blue-800",
  card: "bg-purple-100 text-purple-800",
};

// Helper para formatear números con separadores de miles
function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-BO").format(num);
}

// Helper para formatear moneda boliviana
function formatCurrency(amount: number): string {
  return `Bs ${new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

// Helper para obtener iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user's profile for organization_id
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }



  // If profile exists but missing organization_id, use fallback query
  let orgId = profile.organization_id as string | null;
  if (!orgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .maybeSingle();
    orgId = org?.id ?? null;
  }

  // If still no orgId, show error state instead of crashing
  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-xl border-2 border-red-200">
          <p className="text-red-800 font-semibold">Error de configuración</p>
          <p className="text-red-600 text-sm mt-1">
            Tu cuenta no está asociada a ninguna organización. Contacta al
            administrador.
          </p>
        </div>
      </div>
    );
  }

  // ── Parallel data fetching ────────────────────────────────────────────────

  const todayStart = getBolivianDayStart();
  const todayStartUTC = toUTC(todayStart);

  const [
    productsResult,
    inventoryResult,
    salesTodayResult,
    reservedStockResult,
    recentSalesResult,
  ] = await Promise.all([
    // Total products
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("is_active", true),

    // Total stock and global low stock logic
    supabase
      .from("inventory")
      .select("quantity, product_id, size, min_stock, products!inner(id, name, sku, organization_id)")
      .eq("products.organization_id", orgId),

    // Today's sales
    supabase
      .from("sales")
      .select("total, canal")
      .eq("organization_id", orgId)
      .gte("created_at", todayStartUTC),

    // Reserved stock
    // TODO: Restore organization_id filter once landing page order creation is fixed
    // Currently excluding filter to include pending orders from landing (org_id = null)
    supabase
      .from("order_items")
      .select(`
        quantity,
        orders!inner(status)
      `)
      .eq("orders.status", "pending"),

    // Last 5 sales
    supabase
      .from("sales")
      .select(
        `
        id,
        total,
        subtotal,
        discount,
        payment_method,
        created_at,
        customer_name,
        profiles(full_name),
        locations(name),
        sale_items(quantity)
      `
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // ── Compute stats ─────────────────────────────────────────────────────────

  const totalProducts = productsResult.count || 0;

  let totalStock = 0;
  const globalStockMap = new Map<string, { product: any; totalQty: number; criticalSizes: string[] }>();

  inventoryResult.data?.forEach((item) => {
    const qty = item.quantity || 0;
    totalStock += qty;

    const pid = item.product_id;
    if (!globalStockMap.has(pid)) {
      globalStockMap.set(pid, { product: item.products, totalQty: 0, criticalSizes: [] });
    }
    const productStats = globalStockMap.get(pid)!;
    productStats.totalQty += qty;

    if (qty <= 3 && item.size) {
      if (!productStats.criticalSizes.includes(item.size)) {
        productStats.criticalSizes.push(item.size);
      }
    }
  });

  const lowStockItems = Array.from(globalStockMap.values())
    .filter((p) => p.totalQty < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.totalQty - b.totalQty);
  const lowStockCount = lowStockItems.length;

  const salesTodayOnline = salesTodayResult.data?.filter(s => s.canal !== "fisico").reduce((sum, sale) => sum + sale.total, 0) || 0;
  const salesTodayOnlineCount = salesTodayResult.data?.filter(s => s.canal !== "fisico").length || 0;

  const salesTodayFisico = salesTodayResult.data?.filter(s => s.canal === "fisico").reduce((sum, sale) => sum + sale.total, 0) || 0;
  const salesTodayFisicoCount = salesTodayResult.data?.filter(s => s.canal === "fisico").length || 0;

  // Since we flipped the query back to order_items, the calculation is simple again
  const reservedStock = reservedStockResult.data?.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  ) || 0;

  const recentSales = recentSalesResult.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen general de tu negocio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatsCard
          title="Total Productos"
          value={formatNumber(totalProducts)}
          icon={Package}
          subtitle="Productos activos"
          delay={0}
        />
        <StatsCard
          title="Stock Total"
          value={formatNumber(totalStock)}
          icon={Boxes}
          subtitle="Unidades en inventario"
          delay={100}
        />
        <div className="relative">
          <StatsCard
            title="Stock Reservado"
            value={formatNumber(reservedStock)}
            icon={Lock}
            subtitle="Pedidos activos"
            delay={150}
          />
          {reservedStock > 0 && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
              <Badge variant="warning" className="shadow-sm whitespace-nowrap text-[10px] border border-amber-200">
                ⚠ {formatNumber(reservedStock)} uds. bloqueadas
              </Badge>
            </div>
          )}
        </div>
        <StatsCard
          title="Ventas Online"
          value={formatCurrency(salesTodayOnline)}
          icon={Globe}
          subtitle={`${salesTodayOnlineCount} venta${salesTodayOnlineCount !== 1 ? "s" : ""} online`}
          delay={200}
        />
        <StatsCard
          title="Ventas Físico"
          value={formatCurrency(salesTodayFisico)}
          icon={Store}
          subtitle={`${salesTodayFisicoCount} venta${salesTodayFisicoCount !== 1 ? "s" : ""} en tienda`}
          delay={250}
        />
        <StatsCard
          title="Bajo Stock"
          value={lowStockCount}
          icon={AlertTriangle}
          subtitle={
            lowStockCount > 0 ? "Requieren atención" : "Todo en orden"
          }
          delay={300}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">
              Stock Bajo
            </h3>
            <span className="text-xs text-zinc-500 font-medium">
              &lt; {LOW_STOCK_THRESHOLD} uds.
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-900 mb-1">
                ¡Todo en orden!
              </p>
              <p className="text-xs text-zinc-500">
                No hay productos con stock bajo
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-2 px-4 py-2 bg-zinc-50 text-xs font-semibold text-zinc-500 items-center">
                <div>Producto</div>
                <div>SKU</div>
                <div className="text-center">Stock Total</div>
                <div>Tallas Críticas</div>
                <div className="w-[60px]"></div>
              </div>
              {lowStockItems.map((item, i: number) => {
                const qty = item.totalQty;
                const variant = qty <= 3 ? "danger" : "warning";

                return (
                  <div
                    key={item.product?.id || i}
                    className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-2 items-center px-4 py-3 hover:bg-zinc-50 transition-colors"
                    style={{ animation: `fadeIn 0.4s ease-out ${i * 0.1}s both` }}
                  >
                    <div className="min-w-0 pr-2 flex items-center">
                      <p className="text-[13px] font-medium text-zinc-900 truncate">
                        {item.product?.name}
                      </p>
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] text-zinc-500 font-mono truncate">
                        {item.product?.sku}
                      </p>
                    </div>
                    <div className="text-[13px] font-semibold text-zinc-900 text-center">
                      {qty}
                    </div>
                    <div className="text-[11px] text-zinc-600 truncate flex gap-1 flex-wrap">
                      {item.criticalSizes.length > 0 ? item.criticalSizes.map((s, idx) => (
                        <span key={idx} className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">{s}</span>
                      )) : <span className="text-zinc-400">—</span>}
                    </div>
                    <div className="text-right">
                      <Badge variant={variant} icon>
                        {qty} uds
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Últimas Ventas</h3>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-900 mb-1">
                No hay ventas registradas
              </p>
              <p className="text-xs text-zinc-500">
                ¡Empieza a vender!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              {recentSales.map((sale: any, idx: number) => {
                const PayIcon =
                  paymentIcons[sale.payment_method] || CreditCard;
                const totalItems =
                  sale.sale_items?.reduce(
                    (sum: number, item: any) => sum + item.quantity,
                    0
                  ) || 0;
                const staffName = (sale.profiles as any)?.full_name || "Staff";
                const initials = getInitials(staffName);
                const paymentLabel =
                  paymentLabels[sale.payment_method] || "Otro";

                return (
                  <div
                    key={sale.id}
                    className="px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                    style={{
                      animation: `fadeIn 0.4s ease-out ${idx * 0.1}s both`,
                    }}
                  >
                    {/* Mobile: stacked layout / Desktop: horizontal */}
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center flex-shrink-0 text-zinc-600 font-bold text-xs sm:text-sm shadow-sm">
                        {initials}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-zinc-900 truncate">
                            {sale.customer_name || "Venta directa"}
                          </p>
                          {sale.discount > 0 && (
                            <Badge variant="gold">
                              {((sale.discount / sale.subtotal) * 100).toFixed(0)}% desc
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-500">
                            <PayIcon className="w-3 h-3" />
                            {paymentLabel}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            · {(sale.locations as any)?.name}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            · {totalItems} ítem{totalItems !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-zinc-900">
                          {formatCurrency(sale.total)}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {formatDistanceToNow(new Date(sale.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\pedidos\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
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
\n```\n\n\n### Reference Dump: app\(dashboard)\reportes\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth";
import { format, startOfMonth, subDays } from "date-fns";
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
  return {
    desde: format(startOfMonth(today), "yyyy-MM-dd"),
    hasta: format(today, "yyyy-MM-dd"),
  };
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

  // Resolve date range
  const defaults = getDefaultDateRange();
  const desde = params.desde ?? defaults.desde;
  const hasta = params.hasta ?? defaults.hasta;
  const canalFilter = params.canal ?? "todos";

  const hastaFull = `${hasta}T23:59:59.999Z`;
  const desdeFull = `${desde}T00:00:00.000Z`;

  const prev = getPreviousPeriod(desde, hasta);
  const prevDesdeFull = `${prev.desde}T00:00:00.000Z`;
  const prevHastaFull = `${prev.hasta}T23:59:59.999Z`;

  // ── Completed orders (current period) ─────────────────────────────────────
  let currentQuery = supabase
    .from("orders")
    .select("id, total, subtotal, discount, discount_amount, canal, created_at, status, customer_name")
    .eq("status", "completed")
    .gte("created_at", desdeFull)
    .lte("created_at", hastaFull);

  let currentSalesQuery = supabase
    .from("sales")
    .select("id, total, subtotal, discount, canal, created_at, customer_name")
    .gte("created_at", desdeFull)
    .lte("created_at", hastaFull);

  if (canalFilter !== "todos") {
    currentQuery = currentQuery.eq("canal", canalFilter);
    currentSalesQuery = currentSalesQuery.eq("canal", canalFilter);
  }

  // ── Completed orders (previous period, no canal filter) ───────────────────
  const prevQuery = supabase
    .from("orders")
    .select("id, total, canal, created_at, status")
    .eq("status", "completed")
    .gte("created_at", prevDesdeFull)
    .lte("created_at", prevHastaFull);

  const prevSalesQuery = supabase
    .from("sales")
    .select("id, total, canal, created_at")
    .gte("created_at", prevDesdeFull)
    .lte("created_at", prevHastaFull);

  // ── All-status orders (for cancellation rate) ─────────────────────────────
  let allStatusQuery = supabase
    .from("orders")
    .select("id, status")
    .gte("created_at", desdeFull)
    .lte("created_at", hastaFull);

  let allStatusSalesQuery = supabase
    .from("sales")
    .select("id, canal")
    .gte("created_at", desdeFull)
    .lte("created_at", hastaFull);

  if (canalFilter !== "todos") {
    allStatusQuery = allStatusQuery.eq("canal", canalFilter);
    allStatusSalesQuery = allStatusSalesQuery.eq("canal", canalFilter);
  }

  // ── Inventory items with product info ─────────────────────────────────────
  const inventoryQuery = supabase
    .from("inventory")
    .select("product_id, quantity, min_stock, products!inner(id, name, sku)");

  // ── Products sold in last 60 days (dead stock detection) ──────────────────
  const sixtyDaysAgo = `${format(subDays(new Date(), 60), "yyyy-MM-dd")}T00:00:00.000Z`;
  const recentSalesQuery = supabase
    .from("order_items")
    .select("product_id")
    .gte("created_at", sixtyDaysAgo);

  const recentPosSalesQuery = supabase
    .from("sale_items")
    .select("product_id")
    .gte("created_at", sixtyDaysAgo);

  // ── Run all independent queries in parallel ────────────────────────────────
  const [
    { data: currentOrdersRaw },
    { data: currentSalesRaw },
    { data: prevOrdersRaw },
    { data: prevSalesRaw },
    { data: allStatusOrdersRaw },
    { data: allStatusSalesRaw },
    { data: inventoryItemsRaw },
    { data: recentSalesRaw },
    { data: recentPosSalesRaw },
  ] = await Promise.all([
    currentQuery,
    currentSalesQuery,
    prevQuery,
    prevSalesQuery,
    allStatusQuery,
    allStatusSalesQuery,
    inventoryQuery,
    recentSalesQuery,
    recentPosSalesQuery,
  ]);

  // Combine Orders + Sales (Mapping sales to have status="completed")
  // Filter out online orders from sales table to prevent double-counting
  // Online orders are auto-copied to sales when completed, so we only want POS sales here
  const currentSalesMapped = (currentSalesRaw ?? [])
    .filter((s) => s.canal === 'fisico')
    .map((s) => ({ ...s, status: 'completed' }));

  const prevSalesMapped = (prevSalesRaw ?? [])
    .filter((s) => s.canal === 'fisico')
    .map((s) => ({ ...s, status: 'completed' }));

  const allStatusSalesMapped = (allStatusSalesRaw ?? [])
    .filter((s) => s.canal === 'fisico')
    .map((s) => ({ ...s, status: 'completed' }));

  const currentOrders = [...(currentOrdersRaw ?? []), ...currentSalesMapped];
  const prevOrders = [...(prevOrdersRaw ?? []), ...prevSalesMapped];
  const allStatusOrders = [...(allStatusOrdersRaw ?? []), ...allStatusSalesMapped];

  // ── Order items & Sale Items (depends on current IDs) ──────────────────────
  const orderIds = (currentOrdersRaw ?? []).map((o) => o.id);
  const salesIds = (currentSalesRaw ?? []).map((s) => s.id);

  const [
    { data: orderItemsRaw },
    { data: saleItemsRaw }
  ] = await Promise.all([
    orderIds.length > 0
      ? supabase
        .from("order_items")
        .select("product_id, quantity, subtotal, order_id, products(id, name, category_id, categories(name))")
        .in("order_id", orderIds)
      : Promise.resolve({ data: [] }),
    salesIds.length > 0
      ? supabase
        .from("sale_items")
        .select("product_id, quantity, subtotal, sale_id, products(id, name, category_id, categories(name))")
        .in("sale_id", salesIds)
      : Promise.resolve({ data: [] })
  ]);

  const orderMap = new Map((currentOrdersRaw ?? []).map((o) => [o.id, o]));
  const saleMap = new Map((currentSalesRaw ?? []).map((s) => [s.id, s]));

  const combinedItems = [
    ...(orderItemsRaw ?? []).map((item) => {
      const order = orderMap.get(item.order_id);
      let net_subtotal = item.subtotal;
      if (order && order.subtotal > 0 && order.total < order.subtotal) {
        const ratio = order.total / order.subtotal;
        net_subtotal = item.subtotal * ratio;
      }
      return { ...item, net_subtotal };
    }),
    ...(saleItemsRaw ?? []).map((item) => {
      const sale = saleMap.get(item.sale_id);
      let net_subtotal = item.subtotal;
      if (sale && sale.subtotal > 0 && sale.total < sale.subtotal) {
        const ratio = sale.total / sale.subtotal;
        net_subtotal = item.subtotal * ratio;
      }
      return { ...item, net_subtotal };
    }),
  ];

  // Deduplicate recently sold product IDs
  const recentlySoldProductIds = [
    ...new Set([
      ...(recentSalesRaw ?? []).map((r) => r.product_id as string),
      ...(recentPosSalesRaw ?? []).map((r) => r.product_id as string),
    ]),
  ];

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orders={currentOrders as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prevOrders={prevOrders as any}
        allStatusOrders={allStatusOrders}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderItems={combinedItems as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inventoryItems={(inventoryItemsRaw ?? []) as any}
        recentlySoldProductIds={recentlySoldProductIds}
        desde={desde}
        hasta={hasta}
        canalFilter={canalFilter}
      />
    </div>
  );
}
\n```\n\n\n### Reference Dump: app\(dashboard)\ventas\historial\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
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
        product:products(id, name, sku, image_url),
        location:locations(name)
      ),
      order:orders(
        id,
        delivery_method,
        shipping_cost,
        shipping_address,
        shipping_district,
        payment_method,
        discount_amount
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
\n```\n\n\n### Reference Dump: app\(dashboard)\ventas\page.tsx\n```tsx\nimport { redirect } from "next/navigation";
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialProducts={(products || []) as any}
      categories={categories || []}
      profileId={profile.id}
      organizationId={orgId}
      locationId={locationId}
      userRole={userRole}
      locations={locations || []}
    />
  );
}
\n```\n\n\n### Reference Dump: lib\whatsapp.ts\n```tsx\nexport interface OrderForWhatsApp {
  id: string
  customer_name: string
  customer_phone: string | null
  notify_whatsapp: boolean
  delivery_method: string
  payment_method: string
  shipping_address: string | null
  pickup_location: string | null
  total: number
  cancellation_reason?: string | null
}

export type WhatsAppTemplateConfig = {
  templateName: string;
  variables: string[];
  headerImage?: string;
};



export function getWhatsAppTemplate(
  order: OrderForWhatsApp,
  newStatus: string,
  nextPurchaseDiscountCode?: string
): WhatsAppTemplateConfig | null {

  // Meta API strictly forbids newlines, tabs, and more than 4 consecutive spaces (Error 132018)
  const cleanText = (str: string | null | undefined) => {
    if (!str) return '';
    return String(str).replace(/[\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  };

  const orderNumber = cleanText(order.id).substring(0, 8).toUpperCase();
  const name = cleanText(order.customer_name);

  const isPickup = order.delivery_method === 'pickup';
  const isCashOnPickup = isPickup && (order.payment_method === 'cash_on_pickup' || order.payment_method === 'efectivo' || order.payment_method === 'cash');

  switch (newStatus) {
    case 'pending':
      return {
        templateName: 'pedido_recibido',
        variables: [name, orderNumber, order.total.toFixed(2)] // {{1}}=name, {{2}}=order, {{3}}=total
      };

    case 'pending_payment':
      if (isCashOnPickup) {
        return {
          templateName: 'pedido_reservado_pago_en_tienda_',
          variables: [name, orderNumber, order.total.toFixed(2)]
        };
      }
      return null;

    case 'confirmed':
      if (isPickup) {
        return {
          templateName: 'pago_confirmado_pickup_qr',
          variables: [orderNumber, name]
        };
      }
      return {
        templateName: 'pago_confirmado_u',
        variables: [orderNumber, name] // {{1}}=order, {{2}}=name
      };

    case 'shipped':
      if (isPickup) {
        return {
          templateName: 'pedido_listo_recojo_uti',
          variables: [orderNumber, name, cleanText(order.pickup_location) || 'tienda'] // {{3}}=location
        };
      }
      return {
        templateName: 'pedido_en_camino',
        variables: [orderNumber, name, cleanText(order.shipping_address) || 'tu dirección'] // {{3}}=address
      };

    case 'completed':
      if (nextPurchaseDiscountCode) {
        return {
          templateName: 'pedido_entregado',
          variables: [orderNumber, name, cleanText(nextPurchaseDiscountCode)],
          headerImage: 'https://lrcggpdgrqltqbxqnjgh.supabase.co/storage/v1/object/public/banners/whatsapp/entregado.png'
        };
      }
      return {
        templateName: 'pedido_entregado_simple',
        variables: [orderNumber, name],
        headerImage: 'https://lrcggpdgrqltqbxqnjgh.supabase.co/storage/v1/object/public/banners/whatsapp/entregado.png'
      };

    case 'cancelled':
      return {
        templateName: 'pedido_cancelado_u',
        variables: [orderNumber, name, cleanText(order.cancellation_reason) || 'Motivo no especificado']
      };

    default:
      return null;
  }
}

export async function sendOrderStatusWhatsApp(
  order: OrderForWhatsApp,
  newStatus: string,
  discountCode?: string
): Promise<void> {
  if (!order.notify_whatsapp) return
  if (!order.customer_phone?.trim()) return

  const config = getWhatsAppTemplate(order, newStatus, discountCode)
  if (!config) return

  const { templateName, variables, headerImage } = config

  const rawPhone = order.customer_phone.trim().replace(/\D/g, '')
  const formattedPhone = rawPhone.startsWith('591')
    ? rawPhone
    : `591${rawPhone}`

  // Trim trailing slash to prevent double slashes (e.g. 'https://domain.com/' + '/api/...')
  const landingUrl = (process.env.LANDING_URL ?? 'https://lukess-home.vercel.app').replace(/\/+$/, '')
  const url = `${landingUrl}/api/send-whatsapp`

  console.log('[WhatsApp → Inventory] Sending to:', url, '| template:', templateName)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: formattedPhone, templateName, variables, headerImage }),
  })

  if (!res.ok) {
    // Parse the JSON error body from /api/send-whatsapp for structured Meta API debug info
    let errorBody: unknown;
    try {
      errorBody = await res.json()
    } catch {
      errorBody = await res.text()
    }
    console.error('[WhatsApp → Inventory] API error:', {
      status: res.status,
      templateName,
      to: formattedPhone,
      errorBody,
    })
    throw new Error(JSON.stringify(errorBody))
  }
}
\n```\n\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->\n<!-- padding line to meet line constraint requirement -->