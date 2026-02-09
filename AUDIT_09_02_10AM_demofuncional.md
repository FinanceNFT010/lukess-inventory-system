# MEGA AUDITORÍA COMPLETA - LUKESS INVENTORY SYSTEM
## Documento de Referencia para IA - Actualizado: 9 de Febrero 2026 Hora 10AM

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### Qué es
**Lukess Inventory System** es un sistema profesional de gestión de inventario y punto de venta (POS) diseñado para **Lukess Home**, una tienda de ropa ubicada en **Santa Cruz, Bolivia**. El sistema maneja múltiples ubicaciones físicas (puestos de venta), control de stock en tiempo real, ventas con múltiples métodos de pago, reportes analíticos y gestión de usuarios con roles.

### Propietario
- **Negocio**: Lukess Home (tienda de ropa)
- **País**: Bolivia
- **Moneda**: Bolivianos (Bs)
- **Idioma de la UI**: Español

### Credenciales de Acceso Demo
- **Email**: admin@lukesshome.com
- **Password**: Admin123!
- **Rol**: Administrador

---

## 2. STACK TECNOLÓGICO COMPLETO

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | 16.1.6 | Framework principal (App Router) |
| **React** | 19.2.3 | Librería de UI |
| **TypeScript** | ^5 | Tipado estático |
| **Tailwind CSS** | ^4 | Estilos utility-first |
| **Lucide React** | ^0.563.0 | Iconos |
| **Recharts** | ^3.7.0 | Gráficos para reportes |
| **React Hook Form** | ^7.71.1 | Manejo de formularios |
| **Zod** | ^4.3.6 | Validación de schemas |
| **React Hot Toast** | ^2.6.0 | Notificaciones |
| **React Confetti** | ^6.4.0 | Efecto visual en ventas |
| **date-fns** | ^4.1.0 | Manejo de fechas |

### Backend / Base de Datos
| Tecnología | Uso |
|---|---|
| **Supabase** | BaaS (Database, Auth, Storage, Realtime) |
| **PostgreSQL** | Base de datos relacional (via Supabase) |
| **Row Level Security (RLS)** | Seguridad a nivel de fila |
| **Supabase Storage** | Almacenamiento de imágenes de productos |
| **Supabase Realtime** | Actualizaciones en tiempo real del inventario |

### Supabase
- **Project ID**: `lrcggpdgrqltqbxqnjgh`
- **URL**: `https://lrcggpdgrqltqbxqnjgh.supabase.co`
- **Storage Bucket**: `product-images` (público, 10MB max, PNG/JPG/JPEG/WEBP/GIF)

### Herramientas de Desarrollo
| Herramienta | Uso |
|---|---|
| **ESLint** | Linting |
| **PostCSS** | Procesador CSS |
| **Cursor IDE** | IDE con IA (donde se desarrolla) |
| **Supabase MCP** | Herramienta de IA para interactuar con Supabase |

### Fuentes
- **Inter**: Fuente principal del cuerpo
- **Poppins** (600, 700, 800): Fuente para títulos y display

---

## 3. ARQUITECTURA DEL PROYECTO

### Estructura de Carpetas Completa

```
lukess-inventory-system/
├── .cursor/                          # Configuración de Cursor IDE
│   ├── commands/                     # Comandos personalizados
│   │   ├── commit.md
│   │   ├── db-backup.md
│   │   ├── deploy.md
│   │   ├── fix-bugs.md
│   │   └── review.md
│   ├── hooks/                        # Hooks personalizados
│   │   ├── audit.sh
│   │   ├── format.sh
│   │   └── load-context.sh
│   ├── hooks.json
│   └── mcp.json                      # Configuración MCP (Supabase)
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (fuentes, Toaster)
│   ├── globals.css                   # Estilos globales + animaciones
│   ├── favicon.ico
│   │
│   ├── (auth)/                       # Route Group: Autenticación
│   │   ├── layout.tsx                # Layout con fondo gradiente
│   │   └── login/
│   │       └── page.tsx              # Página de login
│   │
│   └── (dashboard)/                  # Route Group: App principal
│       ├── layout.tsx                # Layout con Sidebar + TopBar + Auth check
│       ├── page.tsx                  # Dashboard principal (/)
│       ├── loading.tsx               # Skeleton loading
│       ├── error.tsx                 # Error boundary
│       │
│       ├── inventario/               # Módulo de inventario
│       │   ├── page.tsx              # Server component → InventoryClient
│       │   ├── inventory-client.tsx  # Client: tabla, filtros, CRUD (~876 líneas)
│       │   ├── nuevo/
│       │   │   ├── page.tsx          # Server: fetch categorías/ubicaciones
│       │   │   └── new-product-form.tsx  # Client: formulario nuevo producto (~870 líneas)
│       │   └── [id]/
│       │       ├── page.tsx          # Server: fetch producto existente
│       │       ├── edit-product-form.tsx  # Client: formulario editar (~581 líneas)
│       │       └── loading.tsx       # Skeleton para edición
│       │
│       ├── ventas/                   # Módulo POS (Punto de Venta)
│       │   ├── page.tsx              # Server: fetch productos + ubicaciones
│       │   └── pos-client.tsx        # Client: POS completo (~824 líneas)
│       │
│       ├── reportes/                 # Módulo de reportes
│       │   ├── page.tsx              # Server: fetch ventas + items
│       │   └── reports-client.tsx    # Client: gráficos + analytics (~852 líneas)
│       │
│       └── configuracion/            # Módulo de configuración
│           └── page.tsx              # Placeholder "próximamente"
│
├── components/
│   ├── dashboard/                    # Componentes del layout
│   │   ├── Sidebar.tsx               # Navegación lateral + selector ubicación
│   │   ├── TopBar.tsx                # Barra superior (solo avatar/nombre)
│   │   ├── StatsCard.tsx             # Tarjeta de estadísticas
│   │   └── DashboardWrapper.tsx      # Provider del LocationContext
│   │
│   └── ui/                           # Componentes reutilizables
│       ├── index.ts                  # Barrel export
│       ├── ConfirmModal.tsx          # Modal de confirmación
│       ├── Input.tsx                 # Input con validación visual
│       ├── LoadingButton.tsx         # Botón con estados loading/success
│       ├── ProductCard.tsx           # Card de producto (3 variantes)
│       ├── ProductGrid.tsx           # Grid filtrable de productos
│       ├── ProductQuickView.tsx      # Modal detalle de producto
│       └── SkeletonCard.tsx          # Skeletons de carga
│
├── lib/
│   ├── types.ts                      # Tipos TypeScript de la DB (~367 líneas)
│   ├── context/
│   │   └── LocationContext.tsx        # Context para ubicación seleccionada
│   └── supabase/
│       ├── client.ts                 # Supabase browser client
│       ├── server.ts                 # Supabase server client (cookies)
│       └── middleware.ts             # Refresh de sesión
│
├── middleware.ts                     # Next.js middleware (auth session refresh)
│
├── supabase/                         # Migraciones SQL
│   ├── 001_initial_schema.sql        # Schema completo (~395 líneas)
│   ├── 002_seed_demo_data.sql        # Datos de prueba
│   ├── 003_rls_policies.sql          # Políticas RLS (~435 líneas)
│   ├── 004_add_missing_columns.sql   # Columnas adicionales
│   └── 004_product_variants.sql      # Variantes de producto (futuro)
│
├── public/                           # Archivos estáticos
├── .cursorrules.md                   # Reglas del proyecto para IA
├── .env.example                      # Variables de entorno ejemplo
├── AUDIT.md                          # Este archivo
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── eslint.config.mjs
```

### Patrón Arquitectónico: Server-First con Hidratación

El proyecto sigue el patrón recomendado por Next.js App Router:

1. **Server Components** (`page.tsx`): Hacen fetch de datos en el servidor
2. **Client Components** (`*-client.tsx`): Reciben datos como props y manejan interactividad
3. **`key` prop**: Se usa para forzar remontaje cuando cambian datos críticos (ej: `key={locationId || "all"}`)
4. **`useEffect` de sincronización**: Los client components sincronizan `initialProducts` desde el servidor

```
[Server Component] → fetch data → pass as props → [Client Component] → useState + useEffect sync
```

### Route Groups (CRÍTICO)
Los paréntesis `(auth)` y `(dashboard)` son **route groups** de Next.js. **NO forman parte de la URL**.

| Carpeta | URL resultante |
|---|---|
| `app/(auth)/login/page.tsx` | `/login` |
| `app/(dashboard)/page.tsx` | `/` |
| `app/(dashboard)/inventario/page.tsx` | `/inventario` |
| `app/(dashboard)/ventas/page.tsx` | `/ventas` |
| `app/(dashboard)/reportes/page.tsx` | `/reportes` |
| `app/(dashboard)/configuracion/page.tsx` | `/configuracion` |

---

## 4. BASE DE DATOS - SCHEMA COMPLETO

### Diagrama de Relaciones

```
organizations (1 fila)
  ├── profiles (1 usuario)
  ├── categories (7 categorías)
  ├── locations (4 ubicaciones, 2 activas)
  ├── products (26 activos)
  │     ├── inventory (52 registros → 2 por producto × 2 ubicaciones)
  │     └── sale_items (24 items)
  ├── sales (12 ventas)
  ├── inventory_transactions (24 transacciones - auto-generadas por trigger)
  └── audit_log (0 - no implementado aún)
```

### Tablas Detalladas

#### `organizations` (1 fila)
Multi-tenant base. Toda la app filtra por `organization_id`.
- `id` UUID PK
- `name` TEXT
- `slug` TEXT UNIQUE
- `logo_url` TEXT nullable
- `created_at`, `updated_at` TIMESTAMPTZ

#### `locations` (4 filas, 2 activas)
Ubicaciones físicas: "Puesto 1 - Central", "Puesto 2 - Norte"
- `id` UUID PK
- `organization_id` UUID FK → organizations
- `name` TEXT
- `address` TEXT nullable
- `phone` TEXT nullable
- `is_active` BOOLEAN default true
- `created_at`, `updated_at` TIMESTAMPTZ

#### `profiles` (1 usuario)
Vinculado a `auth.users` de Supabase.
- `id` UUID PK FK → auth.users
- `organization_id` UUID FK → organizations
- `location_id` UUID nullable FK → locations (ubicación seleccionada actual)
- `email` TEXT
- `full_name` TEXT
- `role` ENUM('admin', 'manager', 'staff')
- `avatar_url` TEXT nullable
- `is_active` BOOLEAN
- `created_at`, `updated_at` TIMESTAMPTZ

#### `categories` (7 filas)
Categorías: Accesorios, Calzado, Camisas, Chaquetas, Gorras, Pantalones, Polos
- `id` UUID PK
- `organization_id` UUID FK → organizations
- `name` TEXT (UNIQUE con org_id)
- `description` TEXT nullable
- `created_at` TIMESTAMPTZ

#### `products` (26 activos)
- `id` UUID PK
- `organization_id` UUID FK → organizations
- `category_id` UUID nullable FK → categories
- `sku` TEXT (UNIQUE con org_id)
- `name` TEXT
- `description` TEXT nullable
- `price` NUMERIC(10,2) CHECK >= 0
- `cost` NUMERIC(10,2) CHECK >= 0, default 0
- `brand` TEXT nullable
- `sizes` TEXT[] default '{}'
- `colors` TEXT[] default '{}'
- `image_url` TEXT nullable (URL de imagen del producto)
- `is_active` BOOLEAN default true (soft delete)
- `low_stock_threshold` INTEGER nullable default 5
- `created_at`, `updated_at` TIMESTAMPTZ

#### `inventory` (52 filas)
Stock por producto por ubicación. UNIQUE(product_id, location_id).
- `id` UUID PK
- `product_id` UUID FK → products (CASCADE delete)
- `location_id` UUID FK → locations (CASCADE delete)
- `quantity` INTEGER default 0
- `min_stock` INTEGER default 5
- `max_stock` INTEGER nullable
- `updated_at` TIMESTAMPTZ

#### `sales` (12 filas)
- `id` UUID PK
- `organization_id` UUID FK → organizations
- `location_id` UUID FK → locations
- `sold_by` UUID FK → profiles (RESTRICT delete)
- `customer_name` TEXT nullable
- `subtotal` NUMERIC(10,2) CHECK >= 0
- `discount` NUMERIC(10,2) default 0
- `tax` NUMERIC(10,2) default 0
- `total` NUMERIC(10,2) CHECK >= 0
- `payment_method` ENUM('cash', 'qr', 'card')
- `notes` TEXT nullable
- `created_at` TIMESTAMPTZ

#### `sale_items` (24 filas)
- `id` UUID PK
- `sale_id` UUID FK → sales (CASCADE delete)
- `product_id` UUID FK → products (RESTRICT delete)
- `quantity` INTEGER CHECK > 0
- `unit_price` NUMERIC(10,2) CHECK >= 0
- `subtotal` NUMERIC(10,2) CHECK >= 0

#### `inventory_transactions` (24 filas - auto-generadas)
Se generan automáticamente por trigger cuando cambia `inventory.quantity`.
- `id` UUID PK
- `inventory_id` UUID FK → inventory
- `product_id` UUID FK → products
- `location_id` UUID FK → locations
- `transaction_type` ENUM('sale', 'adjustment', 'return', 'transfer')
- `quantity_change` INTEGER
- `quantity_before` INTEGER
- `quantity_after` INTEGER
- `reference_id` UUID nullable
- `notes` TEXT nullable
- `created_by` UUID nullable FK → profiles
- `created_at` TIMESTAMPTZ

#### `audit_log` (0 filas - no implementado)
Para auditoría general del sistema. Preparado pero sin datos.

### ENUMS de PostgreSQL
```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE payment_method AS ENUM ('cash', 'qr', 'card');
CREATE TYPE transaction_type AS ENUM ('sale', 'adjustment', 'return', 'transfer');
```

### Triggers Activos
1. **`update_updated_at_column()`**: Auto-actualiza `updated_at` en organizations, locations, profiles, products, inventory
2. **`handle_new_user()`**: Auto-crea profile cuando un usuario se registra en auth
3. **`log_inventory_transaction()`**: Auto-registra en `inventory_transactions` cuando cambia `quantity` en inventory. Usa cast explícito `::transaction_type` para evitar error de tipos

### Funciones Helper de RLS
```sql
get_user_org_id()       -- Retorna organization_id del usuario autenticado
get_user_role()         -- Retorna rol ('admin', 'manager', 'staff')
get_user_location_id()  -- Retorna location_id asignada al usuario
```

### Políticas RLS (Resumen)

| Tabla | Admin | Manager | Staff |
|---|---|---|---|
| organizations | Ver/Editar | Ver | Ver |
| locations | CRUD | Ver | Ver |
| profiles | CRUD (org) | Ver/Editar (org) | Ver/Editar propio |
| categories | CRUD | Crear/Ver/Editar | Ver |
| products | CRUD | Crear/Ver/Editar | Ver |
| inventory | CRUD (org) | CRUD (org) | Ver/Edit (su ubicación) |
| sales | CRUD (org) | Ver/Crear (org) | Ver/Crear (su ubicación) |
| sale_items | Ver/Crear | Ver/Crear | Ver/Crear (su ubicación) |
| inventory_transactions | Ver (org) | Ver (org) | Ver (su ubicación) |
| audit_log | Ver (org) | - | - |

### Supabase Storage
- **Bucket**: `product-images`
- **Público**: Sí
- **Max file size**: 10 MB
- **MIME types**: image/png, image/jpg, image/jpeg, image/webp, image/gif
- **Políticas**: Public read (SELECT), Allow upload (INSERT para authenticated y anon)

---

## 5. ESTADO ACTUAL DE LOS DATOS

| Entidad | Cantidad |
|---|---|
| Organizaciones | 1 |
| Usuarios | 1 (admin) |
| Ubicaciones activas | 2 (Puesto 1 - Central, Puesto 2 - Norte) |
| Categorías | 7 (Accesorios, Calzado, Camisas, Chaquetas, Gorras, Pantalones, Polos) |
| Productos activos | 26 |
| Productos inactivos | 0 |
| Registros de inventario | 52 (2 por producto × 2 ubicaciones) |
| Stock total | 599 unidades |
| Ventas registradas | 12 |
| Items vendidos | 24 |
| Transacciones de inventario | 24 (auto-generadas por trigger) |

### Productos Cargados
El sistema tiene dos tipos de productos:
1. **15 productos demo** con imágenes de Unsplash (camisas, pantalones, calzado, accesorios)
2. **11 productos reales de Lukess Home** con imágenes propias en Supabase Storage (camisas, pantalones, chaquetas, gorras, accesorios)

---

## 6. FUNCIONALIDADES IMPLEMENTADAS

### 6.1 Autenticación (Login)
- Login con email/password via Supabase Auth
- Credenciales demo pre-cargadas en la pantalla
- Auto-redirect a dashboard si ya está autenticado
- Middleware que refresca la sesión en cada request
- Logout desde el sidebar

### 6.2 Dashboard (Página Principal)
- **4 tarjetas de estadísticas**: Total Productos, Stock Total, Ventas Hoy, Bajo Stock
- **Tabla de productos con stock bajo** (< 10 unidades), con badges de colores
- **Últimas 5 ventas**: cliente, vendedor, ubicación, método de pago, monto, tiempo relativo
- Server component puro (datos frescos del servidor)
- Skeleton loading mientras carga

### 6.3 Inventario
- **Tabla de productos** con columnas: Imagen, Nombre, SKU, Categoría, Precio, Costo, Stock por ubicación, Stock Total, Acciones
- **Búsqueda** por nombre, SKU o marca
- **Filtros**: categoría, ubicación, solo bajo stock, mostrar inactivos
- **Ordenamiento**: por nombre, SKU, precio, stock total (asc/desc)
- **Paginación**: 20 items por página
- **Acciones por producto**: Editar (link), Desactivar (soft delete), Reactivar
- **Supabase Realtime**: se suscribe a cambios en `inventory` y `products` para actualización automática
- **Modal de confirmación** para desactivar/eliminar
- **Sincronización** con `useEffect` cuando el servidor envía nuevos datos (cambio de ubicación)

### 6.4 Crear Producto
- Formulario con validación Zod
- **Campos**: SKU (auto-generado LH-XXXX), nombre, descripción, categoría, marca, URL de imagen, precio, costo
- **Auto-generación de SKU**: basado en la cantidad de productos existentes
- **Preview de imagen**: muestra la imagen si la URL es válida
- **Calculadora de margen**: muestra % de ganancia y ganancia por unidad automáticamente
- **Selector de tallas**: tallas comunes predefinidas + custom
- **Selector de colores**: colores comunes predefinidos + custom con hex
- **Stock por ubicación**: campo de cantidad para cada ubicación activa, con botón de stock uniforme
- **Guarda en localStorage**: marcas recientes y colores personalizados
- Validación de SKU único

### 6.5 Editar Producto
- Mismo formulario que crear, pre-poblado con datos existentes
- Actualiza producto e inventario
- Maneja nuevas ubicaciones si se agregaron después de crear el producto
- Preview de imagen existente

### 6.6 POS (Punto de Venta)
- **Grid de productos** con imágenes, precios y stock disponible
- **Búsqueda** tipo scanner (enfocada por defecto)
- **Filtro por categoría** con pills horizontales
- **Carrito de compras**: agregar, quitar, ajustar cantidad
- **Validación de stock**: no permite agregar más del stock disponible
- **Campo de cliente** (opcional)
- **Descuento %**: campo numérico que calcula automáticamente
- **3 métodos de pago**: Efectivo, QR, Tarjeta (con iconos visuales)
- **Proceso de venta**:
  1. Crea registro en `sales`
  2. Crea registros en `sale_items`
  3. Lee stock actual de la DB (no de memoria)
  4. Valida que hay stock suficiente
  5. Actualiza `inventory` (resta cantidad)
- **Modal de éxito** con confetti
- **Soporte multi-ubicación**: cuando es "Todas las ubicaciones", suma stock de todas y busca la primera con stock al vender
- **Sincronización**: actualiza productos cuando cambia la ubicación sin recargar

### 6.7 Reportes y Analíticas
- **Selector de rango**: 7, 14, 30 días o rango personalizado
- **4 tarjetas de métricas**: Ingresos Totales, Cantidad de Ventas, Ticket Promedio, Items Vendidos
- **Comparación período anterior**: muestra % de cambio (verde si subió, rojo si bajó)
- **Gráficos con Recharts**:
  - **Tendencia de ventas**: gráfico de área por día
  - **Métodos de pago**: gráfico donut (efectivo, QR, tarjeta)
  - **Top 5 productos**: barras horizontales con progreso visual
  - **Ventas por ubicación**: barras + tabla resumen
- **Exportar CSV**: descarga todas las ventas filtradas en formato CSV

### 6.8 Configuración
- Página placeholder con "Próximamente"
- Lista de funciones planificadas:
  - Configuración de organización
  - Gestión de usuarios y permisos
  - Seguridad
  - Notificaciones
  - Personalización

### 6.9 Sidebar (Navegación)
- **Logo** Lukess Home con indicador verde de estado
- **5 enlaces**: Dashboard, Inventario, Ventas, Reportes, Configuración
- **Badge de bajo stock** en Inventario (número rojo)
- **Sección de usuario**: avatar con iniciales, nombre, rol
- **Selector de ubicación** (admin/manager): "Todas las ubicaciones" o ubicación específica
  - Al cambiar ubicación: actualiza `profile.location_id` en Supabase + `router.refresh()`
  - Persiste en localStorage via LocationContext
- **Colapsable** en desktop (ancho 64px vs 256px)
- **Responsive**: hamburger menu en mobile con overlay

### 6.10 TopBar
- Simplificado: solo muestra nombre, email y avatar del usuario
- Ya no tiene selector de ubicación (movido al sidebar)

### 6.11 Soft Delete
- Los productos no se eliminan físicamente
- Se marcan como `is_active = false`
- Se pueden ver productos inactivos con el toggle "Mostrar inactivos"
- Se pueden reactivar desde la tabla de inventario
- Protege la integridad referencial (productos con ventas no se pierden)

---

## 7. COMPONENTES REUTILIZABLES

### `ProductCard` (3 variantes)
- **default**: Card grande con imagen, nombre, SKU, categoría, precio, stock
- **compact**: Card horizontal compacta con mini imagen (para POS)
- **detailed**: Card expandida con tallas, colores, margen, stock por ubicación

### `ProductGrid`
- Grid filtrable de ProductCards
- Búsqueda por nombre/SKU/marca
- Filtro por categoría
- Contador de resultados

### `ProductQuickView`
- Modal con detalle completo del producto
- Imagen, precios, margen, stock por ubicación, tallas, colores
- Acciones: Agregar al carrito, Editar, Cerrar

### `ConfirmModal`
- Modal de confirmación con 3 variantes: danger, warning, info
- Botón de confirmación con estado loading
- Usado para soft delete de productos

### `LoadingButton`
- Botón con estados: normal, loading (spinner), success (check)
- 4 variantes: primary (gradiente azul-púrpura), secondary, danger, success

### `Input`
- Input con label, error, success states
- Iconos de estado (error circle, check)
- Helper text

### `StatsCard`
- Tarjeta de estadística con icono, valor, título, subtítulo
- 5 colores: blue, green, orange, red, purple
- Animación fade-in con delay

### `SkeletonCard/SkeletonTable/SkeletonChart/SkeletonGrid`
- Componentes de carga animados (pulse)
- Usados en loading.tsx files

---

## 8. PATRONES Y CONVENCIONES

### Server vs Client Components
```
page.tsx        → Server Component (fetch data)
*-client.tsx    → Client Component (interactividad)
```

- Siempre `"use client"` al inicio de componentes con hooks/eventos
- Server components hacen las queries a Supabase
- Client components reciben datos como `initialProducts` props
- Sincronización con `useEffect(() => { setData(initialData) }, [initialData])`

### Supabase
```typescript
// Server (en page.tsx)
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Client (en *-client.tsx)
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

### Manejo de Errores
```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  toast.success('Operación exitosa');
} catch (error: any) {
  console.error('Error:', error);
  toast.error(error.message || 'Error inesperado');
}
```

### Validación con Zod
```typescript
const productSchema = z.object({
  sku: z.string().min(1, "SKU es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  price: z.coerce.number().positive("Precio debe ser mayor a 0"),
  cost: z.coerce.number().min(0),
  image_url: z.string().url().optional().or(z.literal("")),
  sizes: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
});
```

### Formateo de Moneda (Bolivianos)
```typescript
function formatCurrency(amount: number): string {
  return `Bs ${new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
```

### Paleta de Colores del Sistema
| Módulo | Background | Texto | Border |
|---|---|---|---|
| Dashboard/Productos | bg-blue-50 | text-blue-600 | border-blue-200 |
| Inventario/Stock | bg-green-50 | text-green-600 | border-green-200 |
| Ventas | bg-purple-50 | text-purple-600 | border-purple-200 |
| Alertas/Bajo Stock | bg-red-50 | text-red-600 | border-red-200 |
| Reportes | bg-amber-50 | text-amber-600 | border-amber-200 |
| Botón primario | gradient blue-600 → purple-600 | text-white | — |

### Iconos (Lucide React)
- Dashboard: `Home`
- Inventario: `Package`
- Ventas: `ShoppingCart`
- Reportes: `BarChart3`
- Configuración: `Settings`
- Alerta: `AlertTriangle`
- Editar: `Pencil`
- Eliminar: `Trash2`
- Ubicación: `MapPin`

---

## 9. FLUJOS DE DATOS CRÍTICOS

### Flujo de Cambio de Ubicación
```
1. Usuario cambia ubicación en Sidebar (select)
2. setSelectedLocationId(newId) → actualiza LocationContext + localStorage
3. supabase.from("profiles").update({ location_id: newId })
4. router.refresh() → re-ejecuta Server Components
5. Server Components re-fetch datos con nuevo location_id
6. Client Components reciben nuevos initialProducts
7. useEffect sincroniza el estado local
8. UI se actualiza sin recargar el navegador
```

### Flujo de Venta (POS)
```
1. Usuario busca/selecciona productos → agrega al carrito
2. Valida stock disponible (no exceder)
3. Ingresa cliente (opcional), descuento, método de pago
4. Click "Finalizar Venta"
5. INSERT en sales → obtiene sale.id
6. INSERT en sale_items (con sale_id)
7. Para cada item del carrito:
   a. SELECT quantity FROM inventory WHERE product_id AND location_id
   b. Calcula newQuantity = actual - vendido
   c. Valida que newQuantity >= 0
   d. UPDATE inventory SET quantity = newQuantity
8. Trigger log_inventory_transaction() se ejecuta automáticamente
9. Modal de éxito + confetti
10. Carrito se limpia
```

### Flujo de Soft Delete
```
1. Usuario click "Desactivar" en tabla de inventario
2. Modal de confirmación aparece
3. Si confirma:
   a. UPDATE products SET is_active = false WHERE id = productId
   b. Refresh de la lista (producto desaparece)
4. Para reactivar:
   a. Toggle "Mostrar inactivos" en filtros
   b. Click "Reactivar" en el producto inactivo
   c. UPDATE products SET is_active = true WHERE id = productId
```

---

## 10. CONFIGURACIÓN DE NEXT.JS

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,   // NOTA: ignora errores TS en build
  },
  eslint: {
    ignoreDuringBuilds: true,  // NOTA: ignora errores ESLint en build
  },
}
```

**NOTA IMPORTANTE**: `ignoreBuildErrors` y `ignoreDuringBuilds` están activados. Esto significa que hay errores TypeScript/ESLint pre-existentes que no bloquean el build pero deberían resolverse eventualmente.

---

## 11. BUGS CONOCIDOS Y RESUELTOS

### Resueltos
1. **Ventas no disminuían inventario**: Trigger PostgreSQL tenía error de cast `text` → `transaction_type`. Se solucionó con cast explícito `::transaction_type`
2. **No se podían eliminar productos**: Se implementó soft delete en lugar de DELETE físico
3. **Ordenar por stock causaba crash**: Se movió `getTotalStock` inline dentro del `useMemo` con protecciones null
4. **Configuración daba 404**: Mismatch entre ruta del sidebar (`/configuracion`) y carpeta creada (`/configuraciones`). Se corrigió creando `app/(dashboard)/configuracion/page.tsx`
5. **Botones invisibles**: Contraste incorrecto en gradientes. Se estandarizó siempre usar `text-white` con gradientes
6. **Catch vacíos**: Se agregaron `console.error` y `toast.error` con mensajes específicos en todos los catch blocks
7. **Ventas mostraba "sin productos" con Todas las ubicaciones**: La query filtraba por `locationId` null. Se corrigió condicionando el filtro
8. **Cambiar ubicación requería recargar**: Se agregó `router.refresh()` en el sidebar + `useEffect` de sincronización + `key` prop

### Potenciales
- `ignoreBuildErrors: true` en next.config.ts (hay errores TS pre-existentes)
- El módulo de Configuración es solo un placeholder
- No hay sistema de registro (solo login)
- Audit log está preparado pero vacío (no se usa)

---

## 12. GUÍA PARA LA IA - CÓMO DAR PROMPTS EFECTIVOS

### Estructura Recomendada de Prompts

```
@.cursorrules.md [Siempre referenciar las reglas]

TÍTULO EN MAYÚSCULAS DESCRIBIENDO LA TAREA

═══════════════════════════════════════════════════════════════

## ARCHIVOS A MODIFICAR:
@archivo1.tsx
@archivo2.tsx

═══════════════════════════════════════════════════════════════

## CAMBIO 1: [Descripción]
Archivo: ruta/al/archivo.tsx
[Instrucciones específicas con código]

═══════════════════════════════════════════════════════════════

## CAMBIO 2: [Descripción]
[...]

═══════════════════════════════════════════════════════════════

APLICA TODOS LOS CAMBIOS. Verifica que compile sin errores.
```

### Mejores Prácticas para Prompts

1. **Siempre referenciar `@.cursorrules.md`** al inicio para que la IA conozca el contexto
2. **Ser específico con los archivos** usando `@ruta/al/archivo.tsx`
3. **Incluir código de ejemplo** cuando sea posible (ANTES → DESPUÉS)
4. **Separar cambios por secciones** con delimitadores visuales (`═══`)
5. **Especificar el resultado esperado** ("debería mostrar...", "debería redirigir...")
6. **Pedir verificación** ("Verifica que compile sin errores")
7. **Para datos de Supabase**: especificar organization_id, location_ids, product details exactos
8. **Para bugs**: incluir el mensaje de error exacto y los pasos para reproducir
9. **Para features**: describir el flujo completo del usuario

### Qué NO hacer
- No dar instrucciones vagas como "arregla todo"
- No olvidar mencionar los archivos involucrados
- No asumir que la IA recuerda conversaciones anteriores (por eso existe este archivo)
- No pedir cambios sin contexto de por qué

### Ejemplos de Buenos Prompts

**Para bugs:**
```
BUG: Al ordenar por stock total en inventario, la página se congela.
Archivo: @app/(dashboard)/inventario/inventory-client.tsx
Error en consola: [pegar error]
Pasos: 1) Ir a /inventario 2) Click en columna "Stock Total"
```

**Para features:**
```
@.cursorrules.md
AGREGAR CAMPO DE DESCUENTO AL POS
Archivo: @app/(dashboard)/ventas/pos-client.tsx
- Agregar input numérico de descuento (0-100%)
- Calcular descuento sobre subtotal
- Mostrar total = subtotal - descuento
- Guardar en campo `discount` de tabla `sales`
```

**Para datos:**
```
@.cursorrules.md
CREAR 5 PRODUCTOS EN CATEGORÍA CAMISAS
Usar Supabase MCP:
- organization_id: '11111111-1111-1111-1111-111111111111'
- Producto 1: SKU: CAM-XXX, nombre: ..., precio: X, cost: 60% del precio
- Stock: Puesto 1: X, Puesto 2: Y
- image_url: https://...
```

---

## 13. WORKFLOW DE DESARROLLO

### Ciclo de Desarrollo
1. **Planificación**: Describir la feature/fix en detalle
2. **Implementación**: La IA modifica los archivos necesarios
3. **Verificación**: Revisar que no hay errores de linting
4. **Prueba manual**: El usuario prueba en `localhost:3000`
5. **Feedback**: El usuario reporta si funciona o si hay bugs
6. **Iteración**: Se corrige y se repite

### Comandos de Desarrollo
```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar linter
```

### Convenciones de Código
- `"use client"` al inicio de componentes interactivos
- Server Components por defecto
- TypeScript estricto (interfaces sobre types)
- Tailwind CSS para estilos (no CSS modules)
- `toast.success()` / `toast.error()` para notificaciones
- `router.refresh()` después de mutaciones exitosas
- `console.error()` en catch blocks para debugging

---

## 14. PRÓXIMAS FUNCIONALIDADES POSIBLES

### Módulo de Configuración (placeholder actual)
- Configuración de la organización (nombre, logo, datos)
- Gestión de usuarios (crear, editar roles, desactivar)
- Permisos granulares por módulo
- Notificaciones de bajo stock
- Temas y personalización

### Mejoras Potenciales
- Sistema de registro de nuevos usuarios
- Transferencias de stock entre ubicaciones
- Devoluciones de ventas
- Impresión de tickets/recibos
- Códigos de barras
- Dashboard con más métricas
- Historial de precios
- Proveedores y órdenes de compra
- Multi-idioma
- Dark mode
- PWA (Progressive Web App)
- Notificaciones push de bajo stock

---

## 15. RESUMEN EJECUTIVO

**Lukess Inventory System** es una aplicación web moderna y funcional construida con Next.js 16, React 19, Supabase y Tailwind CSS. Actualmente tiene:

- **26 productos activos** con imágenes (Unsplash + Supabase Storage)
- **7 categorías** de ropa y accesorios
- **2 ubicaciones** de venta (puestos)
- **599 unidades** de stock total
- **12 ventas** registradas con **24 items**
- **Sistema POS** completo con carrito, descuentos y 3 métodos de pago
- **Reportes** con gráficos, tendencias y exportación CSV
- **Roles** de usuario (admin, manager, staff) con RLS
- **Soft delete** para proteger integridad de datos
- **Realtime** para actualizaciones de inventario
- **Responsive** para desktop y mobile

El proyecto está listo para uso real y tiene espacio para crecer con las funcionalidades planificadas en el módulo de Configuración.
