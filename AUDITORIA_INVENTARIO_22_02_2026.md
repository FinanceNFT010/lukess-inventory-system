# AUDITORÍA COMPLETA — LUKESS HOME INVENTORY SYSTEM
**Fecha:** 22 de febrero de 2026  
**Proyecto Supabase:** `lrcggpdgrqltqbxqnjgh` (lukess-inventory) — Región: sa-east-1  
**Estado del proyecto:** ACTIVE_HEALTHY  
**Base de datos:** PostgreSQL 17.6.1 (engine 17)

---

══════════════════════════════════════════
## SECCIÓN 1 — ESQUEMA REAL DE SUPABASE
══════════════════════════════════════════

> Datos obtenidos vía MCP `execute_sql` sobre `information_schema.columns` en schema `public`.

### Tablas existentes (14 tablas)

---

#### Tabla: `access_requests`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| organization_id | uuid | — | YES |
| email | text | — | NO |
| full_name | text | — | NO |
| phone | text | — | YES |
| message | text | — | YES |
| status | text | 'pending' | YES |
| reviewed_by | uuid | — | YES |
| reviewed_at | timestamptz | — | YES |
| rejection_reason | text | — | YES |
| created_at | timestamptz | now() | YES |

---

#### Tabla: `audit_log`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| organization_id | uuid | — | NO |
| user_id | uuid | — | YES |
| action | text | — | NO |
| table_name | text | — | NO |
| record_id | uuid | — | YES |
| old_data | jsonb | — | YES |
| new_data | jsonb | — | YES |
| ip_address | inet | — | YES |
| user_agent | text | — | YES |
| created_at | timestamptz | now() | NO |

---

#### Tabla: `categories`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| organization_id | uuid | — | NO |
| name | text | — | NO |
| description | text | — | YES |
| created_at | timestamptz | now() | NO |

---

#### Tabla: `customers`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | uuid_generate_v4() | NO |
| email | text | — | NO |
| name | text | — | YES |
| phone | text | — | YES |
| auth_user_id | uuid | — | YES |
| marketing_consent | boolean | false | YES |
| total_orders | integer | 0 | YES |
| total_spent | numeric | 0 | YES |
| created_at | timestamptz | now() | YES |
| updated_at | timestamptz | now() | YES |

---

#### Tabla: `inventory`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| product_id | uuid | — | NO |
| location_id | uuid | — | NO |
| quantity | integer | 0 | NO |
| min_stock | integer | 5 | NO |
| max_stock | integer | — | YES |
| updated_at | timestamptz | now() | NO |
| size | text | — | NO |
| color | text | — | NO |
| variant_key | text | — | YES |
| reserved_qty | integer | 0 | NO |

**Observaciones:**  
- Stock por ubicación + talla + color ✅  
- `reserved_qty` para reservas activas ✅  
- `min_stock` = umbral de alerta ✅  
- No existe campo `max_stock` con valor (nullable, sin default) ⚠️

---

#### Tabla: `inventory_reservations`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| order_id | uuid | — | NO |
| product_id | uuid | — | NO |
| location_id | uuid | — | NO |
| size | text | — | YES |
| quantity | integer | — | NO |
| status | text | 'reserved' | NO |
| created_at | timestamptz | now() | NO |
| updated_at | timestamptz | now() | NO |

---

#### Tabla: `inventory_transactions`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| inventory_id | uuid | — | NO |
| product_id | uuid | — | NO |
| location_id | uuid | — | NO |
| transaction_type | USER-DEFINED (enum) | — | NO |
| quantity_change | integer | — | NO |
| quantity_before | integer | — | NO |
| quantity_after | integer | — | NO |
| reference_id | uuid | — | YES |
| notes | text | — | YES |
| created_by | uuid | — | YES |
| created_at | timestamptz | now() | NO |

---

#### Tabla: `locations`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| organization_id | uuid | — | NO |
| name | text | — | NO |
| address | text | — | YES |
| phone | text | — | YES |
| is_active | boolean | true | NO |
| created_at | timestamptz | now() | NO |
| updated_at | timestamptz | now() | NO |

---

#### Tabla: `order_items`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| order_id | uuid | — | YES |
| product_id | uuid | — | YES |
| quantity | integer | — | NO |
| unit_price | numeric | — | NO |
| size | text | — | YES |
| color | text | — | YES |
| subtotal | numeric | — | NO |
| created_at | timestamptz | now() | YES |

---

#### Tabla: `orders`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| customer_name | text | — | NO |
| customer_phone | text | — | NO |
| customer_email | text | — | YES |
| subtotal | numeric | — | NO |
| discount | numeric | 0 | YES |
| total | numeric | — | NO |
| status | text | 'pending' | YES |
| payment_method | text | 'qr' | YES |
| payment_proof | text | — | YES |
| notes | text | — | YES |
| created_at | timestamptz | now() | YES |
| organization_id | uuid | — | YES |
| internal_notes | text | — | YES |
| managed_by | uuid | — | YES |
| updated_at | timestamptz | now() | YES |
| marketing_consent | boolean | false | YES |
| discount_percent | integer | 0 | YES |
| customer_id | uuid | — | YES |
| delivery_method | text | 'delivery' | YES |
| shipping_cost | numeric | 0 | YES |
| shipping_address | text | — | YES |
| shipping_reference | text | — | YES |
| shipping_district | text | — | YES |
| pickup_location | text | — | YES |
| gps_coordinates | text | — | YES |
| gps_lat | numeric | — | YES |
| gps_lng | numeric | — | YES |
| gps_distance_km | numeric | — | YES |
| maps_link | text | — | YES |
| recipient_name | text | — | YES |
| recipient_phone | text | — | YES |
| delivery_instructions | text | — | YES |
| canal | text | 'online' | YES |
| fulfillment_location_id | uuid | — | YES |
| fulfillment_notes | text | — | YES |
| reserved_at | timestamptz | — | YES |
| expires_at | timestamptz | — | YES |
| notify_email | boolean | true | YES |
| notify_whatsapp | boolean | false | YES |
| payment_receipt_url | text | — | YES |

**Observaciones:**  
- Campo `canal` (online / fisico) ✅  
- GPS completo: lat, lng, distancia, link a Maps ✅  
- `notify_email` y `notify_whatsapp` como flags por pedido ✅  
- `expires_at` / `reserved_at` para gestión de reservas ✅

---

#### Tabla: `organizations`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| name | text | — | NO |
| slug | text | — | NO |
| logo_url | text | — | YES |
| created_at | timestamptz | now() | NO |
| updated_at | timestamptz | now() | NO |

---

#### Tabla: `products`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| organization_id | uuid | — | NO |
| category_id | uuid | — | YES |
| sku | text | — | NO |
| name | text | — | NO |
| description | text | — | YES |
| price | numeric | — | NO |
| cost | numeric | 0 | NO |
| brand | text | — | YES |
| sizes | ARRAY (text[]) | '{}' | NO |
| colors | ARRAY (text[]) | '{}' | NO |
| image_url | text | — | YES |
| is_active | boolean | true | NO |
| created_at | timestamptz | now() | NO |
| updated_at | timestamptz | now() | NO |
| low_stock_threshold | integer | 5 | YES |
| **discount** | **integer** | **0** | **YES** ✅ |
| **is_featured** | **boolean** | **false** | **YES** ✅ |
| **images** | **ARRAY** | **—** | **YES** ✅ |
| **is_new** | **boolean** | **false** | **YES** ✅ |
| collection | text | — | YES |
| subcategory | text | — | YES |
| color | text | — | YES |
| sku_group | text | — | YES |
| **published_to_landing** | **boolean** | **false** | **NO** ✅ |

**Observaciones críticas:**  
- `discount` (integer) → EXISTE pero NO tiene campo `duration`/expiración ⚠️  
- `images` (ARRAY) → EXISTE en BD pero el formulario de producto aún NO la gestiona directamente ⚠️  
- `is_new` → EXISTE ✅  
- `is_featured` → EXISTE ✅  
- `published_to_landing` → EXISTE ✅  
- No existe campo `discount_expires_at` ni `discount_duration` en la tabla ❌

---

#### Tabla: `profiles`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | — | NO |
| organization_id | uuid | — | NO |
| location_id | uuid | — | YES |
| email | text | — | NO |
| full_name | text | — | NO |
| role | USER-DEFINED (user_role enum) | 'staff' | NO |
| avatar_url | text | — | YES |
| is_active | boolean | true | NO |
| created_at | timestamptz | now() | NO |
| updated_at | timestamptz | now() | NO |
| phone | text | — | YES |

---

#### Tabla: `sale_items`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| sale_id | uuid | — | NO |
| product_id | uuid | — | NO |
| quantity | integer | — | NO |
| unit_price | numeric | — | NO |
| subtotal | numeric | — | NO |
| size | text | — | YES |
| color | text | — | YES |
| location_id | uuid | — | YES |

---

#### Tabla: `sales`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | NO |
| organization_id | uuid | — | NO |
| location_id | uuid | — | YES |
| sold_by | uuid | — | YES |
| customer_name | text | — | YES |
| subtotal | numeric | — | NO |
| discount | numeric | 0 | NO |
| tax | numeric | 0 | NO |
| total | numeric | — | NO |
| payment_method | USER-DEFINED (enum) | — | NO |
| notes | text | — | YES |
| created_at | timestamptz | now() | NO |
| canal | text | 'fisico' | YES |
| order_id | uuid | — | YES |

---

#### Tabla: `subscribers`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | uuid_generate_v4() | NO |
| email | text | — | NO |
| name | text | — | YES |
| source | text | 'checkout' | YES |
| is_active | boolean | true | YES |
| created_at | timestamptz | now() | YES |

**EXISTE ✅** — Tabla de newsletter/suscriptores con fuente de captura.

---

#### Tabla: `wishlists`
| columna | tipo | default | nullable |
|---|---|---|---|
| id | uuid | uuid_generate_v4() | NO |
| user_id | uuid | — | YES |
| product_id | uuid | — | YES |
| created_at | timestamptz | now() | YES |

---

### Resumen de campos clave en `products`

| Campo | ¿Existe en BD? | Tipo |
|---|---|---|
| `discount` | ✅ SÍ | integer (0–100) |
| `discount_expires_at` / `duration` | ❌ NO | — |
| `images[]` (array múltiple) | ✅ SÍ | ARRAY (text[]) |
| `is_new` | ✅ SÍ | boolean |
| `is_featured` | ✅ SÍ | boolean |
| `published_to_landing` | ✅ SÍ | boolean |

### Tablas de newsletter/discount_codes

| Tabla | ¿Existe? |
|---|---|
| `subscribers` | ✅ SÍ (email, name, source, is_active) |
| `discount_codes` | ❌ NO existe en la BD |

---

══════════════════════════════════════════
## SECCIÓN 2 — ESTADO DE MÓDULOS DEL DASHBOARD
══════════════════════════════════════════

### M-01: Módulo Pedidos (`/pedidos`)

**Archivo principal:** `app/(dashboard)/pedidos/pedidos-client.tsx`  
**Server component:** `app/(dashboard)/pedidos/page.tsx`  
**Acciones:** `app/(dashboard)/pedidos/actions.ts`

**Acciones implementadas:**
- `updateOrderStatus(orderId, newStatus, internalNote?, fulfillmentNotes?, cancellationReason?)` — Cambia estado del pedido validando rol (no staff). Usa `supabaseAdmin` para el UPDATE (evita problemas RLS). ✅
- `getReceiptSignedUrl(receiptPath)` — Genera URL firmada del comprobante de pago (storage bucket `payment-receipts`). ✅
- `saveInternalNote(orderId, note)` — Guarda nota interna en el pedido. ✅

**Cambio de estado:**
- Flujo implementado con modal de confirmación para acción `confirmed`
- Estados disponibles: `pending` → `confirmed` → `shipped` → `completed` | `cancelled`
- Guarda `managed_by` (UUID del usuario que gestionó) y `updated_at`
- Solo roles `admin` y `manager` pueden cambiar estados (staff redirigido a `/ventas`)

**Realtime:**
- ✅ **IMPLEMENTADO** — Canal `pedidos-list` con subscripción a `INSERT` y `UPDATE` en tabla `orders`
- Nuevos pedidos aparecen al tope sin reload, con toast de notificación
- Updates se aplican en tiempo real al estado local

**WhatsApp al cambiar estado:**
- ✅ **IMPLEMENTADO** — Llama `sendOrderStatusWhatsApp()` en `lib/whatsapp.ts`
- Solo envía si `notify_whatsapp = true` Y el cliente tiene teléfono
- Templates mapeados: `confirmed → pago_confirmado`, `shipped → pedido_en_camino`, `completed → pedido_entregado`, `cancelled → pedido_cancelado`
- Endpoint: `POST ${LANDING_URL}/api/send-whatsapp` (delegado al proyecto landing)
- ⚠️ Las plantillas de WhatsApp Business deben estar creadas y aprobadas en Meta para funcionar

**Email al cambiar estado:**
- ✅ **IMPLEMENTADO** — Llama `sendOrderStatusEmail()` en `lib/notifications.ts` (Resend)
- Solo envía si `notify_email = true` Y el cliente tiene email

---

### M-02: Módulo Reportes (`/reportes`)

**Archivos:** `app/(dashboard)/reportes/page.tsx` + `reports-client.tsx`

**KPIs implementados (6 tarjetas):**
1. Ingresos totales (Bs.) con % vs período anterior
2. Pedidos totales con % vs período anterior
3. Ventas Online (Bs.) con % vs período anterior
4. Ventas Físico (Bs.) con % vs período anterior
5. Ticket Promedio (AOV) con % vs período anterior
6. Tasa de Cancelación (%) con conteo de cancelados

**Gráficos implementados:**
- BarChart apilado (Online vs Físico) por día — `recharts` ✅
- Donut (PieChart) Online vs Físico con proporciones ✅
- Top 10 productos más vendidos (tabla con medallas) ✅
- Ventas por categoría (BarChart horizontal) ✅
- Actividad por día de semana (BarChart con máximo resaltado) ✅
- Alertas de inventario: stock crítico + dead stock (+60 días sin movimiento) ✅
- Impacto de descuentos: bruto vs neto con mini BarChart ✅
- Tabla de detalle por día (max 30 días) ✅

**Export CSV:** ✅ **IMPLEMENTADO** — Exporta resumen del período, detalle por día y top 10 productos

**Filtro por canal:**  ✅ **IMPLEMENTADO** — Filtro `todos | online | fisico` via `?canal=` en URL

**Filtros de fecha:** ✅ IMPLEMENTADO — `?desde=` y `?hasta=` en URL, por defecto mes actual

---

### M-03: Módulo Productos / Inventario (`/inventario`)

**Archivos:**
- `app/(dashboard)/inventario/page.tsx` (Server)
- `app/(dashboard)/inventario/inventory-client.tsx` (Client)
- `app/(dashboard)/inventario/nuevo/new-product-form.tsx`
- `app/(dashboard)/inventario/[id]/edit-product-form.tsx`
- `app/(dashboard)/inventario/historial/audit-history-client.tsx`

**¿Existe vista de productos?** ✅ SÍ — Lista de productos con stock agrupado por ubicación

**¿Se puede crear un producto?** ✅ SÍ — Ruta `/inventario/nuevo`

**¿Se puede editar un producto?** ✅ SÍ — Ruta `/inventario/[id]`

**Campos editables (en formulario nuevo y edición):**
- SKU, SKU Group, Nombre, Descripción
- Categoría, Marca
- `image_url` (imagen principal — campo de texto/URL con botón de subida a Supabase Storage)
- Precio de venta, Costo
- Color (principal), Tallas disponibles (S, M, L, XL, 38, 40, 42, 44)
- Umbral de stock mínimo (`low_stock_threshold`)
- Stock inicial por ubicación y talla
- `published_to_landing` toggle ✅

**¿Campo para múltiples fotos (`images[]`)?**
- ❌ **NO implementado en el formulario** — El campo `images` EXISTE en la BD pero en el form solo hay `image_url` (una sola imagen). No hay UI de galería/múltiples fotos.

**¿Campo de descuento con duración?**
- ❌ **NO implementado** — El campo `discount` (integer) EXISTE en la BD pero no aparece en los formularios de nuevo/edición. Tampoco existe campo `discount_expires_at` o similar.

**¿Toggle `published_to_landing`?**
- ✅ **IMPLEMENTADO** — Hay toggle tanto en la lista (inventory-client.tsx, vía `togglePublishedToLanding` action) como en el formulario de edición.

**¿Opción marcar como NUEVO (`is_new`)?**
- ❌ **NO implementado en el formulario** — El campo `is_new` EXISTE en la BD pero no hay UI para manejarlo.

**¿Campo `is_featured`?**
- ❌ **NO implementado en el formulario** — El campo `is_featured` EXISTE en la BD pero no hay UI para manejarlo.

**Realtime en inventario:** ✅ Canal `inventory-changes` con subscripción a `inventory` y `products`

---

### M-04: Módulo Inventario — Ajustes de Stock

**¿Se puede ajustar stock por ubicación?** ✅ SÍ — El formulario de edición de producto incluye sección de ajuste de stock por ubicación + talla. Se registra en `inventory_transactions`.

**¿Hay alertas de stock bajo en el sidebar?** ✅ SÍ — Badge rojo en el enlace "Inventario" con conteo de items bajo threshold (threshold = 10 en el layout).

**¿Alertas en el módulo Reportes?** ✅ SÍ — Sección "Alertas de inventario" con stock crítico (bajo `min_stock`) y dead stock (sin movimiento en 60 días).

**¿Historial de transacciones?** ✅ SÍ — Ruta `/inventario/historial` con `audit-history-client.tsx`

---

### M-05: Navegación / Sidebar

**Módulos visibles en el Sidebar (por rol):**

| Enlace | Ruta | Roles | Sub-links |
|---|---|---|---|
| Dashboard | `/` | admin, manager | — |
| Inventario | `/inventario` | admin, manager | Ver Historial |
| Ventas | `/ventas` | admin, manager, staff | Ver Historial |
| Pedidos | `/pedidos` | admin, manager | — |
| Reportes | `/reportes` | admin, manager | — |
| Usuarios | `/configuracion/usuarios` | admin | — |

**Badges en sidebar:**
- Inventario: badge rojo con conteo de items bajo stock (threshold 10)
- Pedidos: badge naranja/rojo con conteo de pedidos pendientes (realtime via `PendingOrdersBadge`)

**¿Hay módulos en construcción o placeholder?** ❌ NO — Todos los módulos listados están implementados y funcionales. No hay "Coming soon" ni placeholders en el nav.

**Notas adicionales del sidebar:**
- Colapsable (w-64 ↔ w-20) en desktop ✅
- Mobile: menú hamburger con overlay ✅
- Rol `staff` solo ve: Ventas y su historial

---

══════════════════════════════════════════
## SECCIÓN 3 — FEATURES PENDIENTES DE IMPLEMENTAR
══════════════════════════════════════════

> Estado basado en análisis del código fuente y esquema real de BD.

### [✅] Subir múltiples imágenes por producto (`images[]`)
- **Estado:** Campo `images` (ARRAY) YA EXISTE en la BD Supabase ✅
- **En el código:** El formulario de nuevo/edición solo gestiona `image_url` (una imagen). No hay UI para galería múltiple.
- **Pendiente:** Implementar upload múltiple a Storage + guardar array en `products.images`

### [❌] Campo descuento con duración/expiración
- **Estado:** Campo `discount` (integer) YA EXISTE en BD ✅. Campo `discount_expires_at` o `duration` NO EXISTE en BD ❌
- **En el código:** `discount` no aparece en ningún formulario de producto
- **Pendiente:** (1) Agregar migración para `discount_expires_at timestamptz`, (2) Agregar UI en formulario de producto, (3) Lógica de expiración automática

### [❌] Badge NUEVO con tiempo configurable
- **Estado:** Campo `is_new` (boolean) YA EXISTE en BD ✅. No hay campo `is_new_until` o `is_new_expires_at`.
- **En el código:** `is_new` no aparece en ningún formulario
- **Pendiente:** (1) Posiblemente añadir `is_new_until timestamptz` en BD, (2) Agregar toggle/fecha en formulario de producto

### [❌] Sistema de códigos de descuento (`discount_codes`)
- **Estado:** Tabla `discount_codes` NO EXISTE en la BD ❌
- **En el código:** Sin ninguna referencia
- **Pendiente:** Crear tabla + lógica de validación en checkout del landing

### [✅] Newsletter / captura de emails (`subscribers`)
- **Estado:** Tabla `subscribers` YA EXISTE en BD con campos: email, name, source ('checkout'), is_active ✅
- **En el código del dashboard:** Sin UI de gestión de suscriptores (no hay módulo en el sidebar)
- **Pendiente:** Crear módulo de gestión de suscriptores en el dashboard (opcional)

### [✅] Notificaciones WhatsApp al cambiar estado de pedido
- **Estado:** ✅ IMPLEMENTADO — `lib/whatsapp.ts` + llamada en `actions.ts`
- **Condición:** Solo envía si `notify_whatsapp = true` en el pedido Y el cliente tiene teléfono
- **Dependencia externa:** El proyecto landing (`lukess-home.vercel.app`) debe tener `/api/send-whatsapp` funcionando con el PHONE_NUMBER_ID de Meta
- **Templates requeridos (deben estar aprobados en Meta):** `pago_confirmado`, `pedido_en_camino`, `pedido_entregado`, `pedido_cancelado`

---

══════════════════════════════════════════
## SECCIÓN 4 — NÚMERO DE WHATSAPP
══════════════════════════════════════════

**Búsqueda de `76020369` y `59176020369` en todos los archivos del proyecto:**

```
rg "76020369|59176020369" --no-ignore
```

**Resultado: NO SE ENCONTRÓ NINGUNA OCURRENCIA** en ningún archivo del proyecto.

El número de teléfono del negocio (76020369 / +591 76020369) **no está hardcodeado** en el código fuente del dashboard.

**Lo que SÍ existe relacionado con WhatsApp:**
- Variable de entorno `WHATSAPP_PHONE_NUMBER_ID=1072455762611964` en `.env.local`  
  → Este es el ID del número en la API de Meta/WhatsApp Business (no el número real en formato legible)
- La lógica usa el teléfono del **cliente** (guardado en `orders.customer_phone`) para enviarle notificaciones
- El número del negocio NO se usa en el dashboard; se configura en el proyecto landing

---

══════════════════════════════════════════
## SECCIÓN 5 — VARIABLES DE ENTORNO USADAS
══════════════════════════════════════════

> Fuente: referencias en código + `.env.local` (filtrado por .cursorignore, se leen vía Grep).

| Variable | Propósito | Requerida en |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase | Client, Server, Middleware |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase (pública) | Client, Server, Middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de service role (privada, omite RLS) | Server actions, admin client |
| `RESEND_API_KEY` | API key de Resend para envío de emails transaccionales | `lib/notifications.ts` |
| `LANDING_URL` | URL del proyecto landing (para construir URLs y llamar /api/send-whatsapp) | `lib/whatsapp.ts`, `lib/notifications.ts` |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número de teléfono en Meta Business API | Referenciado en `.env.local`; usado por el landing |
| `WHATSAPP_ACCESS_TOKEN` | Token de acceso a la API de WhatsApp Business (Meta) | Referenciado en `.env.local`; usado por el landing |
| `WHATSAPP_API_VERSION` | Versión de la API de Meta (ej. `v21.0`) | Referenciado en `.env.local`; usado por el landing |

**Valores actuales (`.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://lrcggpdgrqltqbxqnjgh.supabase.co`
- `LANDING_URL` = `https://lukess-home.vercel.app`
- `WHATSAPP_API_VERSION` = `v21.0`
- `WHATSAPP_PHONE_NUMBER_ID` = `1072455762611964`

> ⚠️ Los tokens y keys reales están en `.env.local` que está en `.cursorignore` — no se exponen en este documento.

---

══════════════════════════════════════════
## SECCIÓN 6 — DEPENDENCIAS Y VERSIONES
══════════════════════════════════════════

> Fuente: `package.json`

### Dependencies (producción)

| Paquete | Versión | Propósito |
|---|---|---|
| `next` | **16.1.6** | Framework principal (App Router) |
| `react` | **19.2.3** | UI Library |
| `react-dom` | **19.2.3** | DOM renderer |
| `typescript` (devDep) | `^5` | Tipado estático |
| `@supabase/supabase-js` | **^2.95.3** | Cliente Supabase JS |
| `@supabase/ssr` | **^0.8.0** | Helpers SSR para Next.js |
| `recharts` | **^3.7.0** | Gráficos (BarChart, PieChart, etc.) |
| `date-fns` | **^4.1.0** | Utilidades de fechas |
| `lucide-react` | **^0.563.0** | Iconos SVG |
| `react-hook-form` | **^7.71.1** | Gestión de formularios |
| `@hookform/resolvers` | **^5.2.2** | Resolver Zod para react-hook-form |
| `zod` | **^4.3.6** | Validación de esquemas |
| `react-hot-toast` | **^2.6.0** | Notificaciones toast |
| `react-confetti` | **^6.4.0** | Efecto de confeti (checkout exitoso) |
| `jspdf` | **^4.1.0** | Generación de PDFs |
| `qrcode` | **^1.5.4** | Generación de códigos QR |
| `@types/qrcode` | `^1.5.6` | Types para qrcode |
| `xlsx` | **^0.18.5** | Exportación Excel (disponible pero CSV se usa en reportes) |

### Librerías de WhatsApp
- **NO hay SDK de WhatsApp** instalado directamente.
- La integración es vía `fetch()` al endpoint `/api/send-whatsapp` del landing (`lukess-home.vercel.app`), que a su vez llama a la Meta Graph API con `WHATSAPP_ACCESS_TOKEN`.

### DevDependencies

| Paquete | Versión |
|---|---|
| `tailwindcss` | `^4` |
| `@tailwindcss/postcss` | `^4` |
| `@types/node` | `^20` |
| `@types/react` | `^19` |
| `@types/react-dom` | `^19` |
| `eslint` | `^9` |
| `eslint-config-next` | `16.1.6` |

### Notas de versiones
- **Next.js 16.1.6** — Versión reciente (por encima de 15 que establece el .cursorrules; la regla indica 15 como baseline)
- **React 19.2.3** — Versión más reciente, compatible con Next.js 16
- **Tailwind CSS 4** — Versión 4 (rompe retrocompatibilidad con v3; `.cursorrules` dice v3 pero el proyecto usa v4)
- **Recharts 3.7.0** — Versión 3 instalada
- **Zod 4.3.6** — Versión 4 instalada

---

## RESUMEN EJECUTIVO

### Lo que está 100% funcional ✅
- Autenticación y RBAC (admin / manager / staff)
- Módulo Pedidos con realtime, cambio de estado, notas internas
- Notificaciones email (Resend) al cambiar estado de pedido
- Notificaciones WhatsApp Business al cambiar estado (requiere templates aprobados en Meta)
- Módulo Reportes completo: 6 KPIs, 7 gráficos, filtros, export CSV
- Módulo Inventario: CRUD de productos, ajuste de stock por ubicación/talla, alertas, historial
- Toggle `published_to_landing` en inventario (lista y edición)
- Ventas POS físico con historial
- Gestión de usuarios (admin)
- Tabla `subscribers` para newsletter en BD

### Lo que existe en BD pero falta UI ⚠️
- `products.discount` → No aparece en ningún formulario
- `products.images[]` → BD tiene el campo, UI solo tiene `image_url`
- `products.is_new` → BD tiene el campo, no hay toggle en formulario
- `products.is_featured` → BD tiene el campo, no hay toggle en formulario
- `subscribers` → Tabla existe, no hay módulo de gestión en dashboard

### Lo que NO existe (ni en BD ni en código) ❌
- Campo `discount_expires_at` / duración de descuento
- Tabla `discount_codes`
- Campo `is_new_until` / expiración del badge NUEVO
- Módulo de gestión de suscriptores en el dashboard
