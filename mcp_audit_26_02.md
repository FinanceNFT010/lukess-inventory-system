# 🔌 Auditoría Completa de MCPs Activos
## Proyecto: `lukess-inventory-system` · Owner: `FinanceNFT010`

> **Audiencia:** IA Asistente de Prompts  
> **Propósito:** Guía de referencia completa para saber **exactamente qué puedes pedir a cada MCP**, cómo pedirlo, cuándo usarlo y cuándo NO usarlo.  
> **Actualizado:** 2026-02-26 (datos obtenidos en tiempo real de los MCPs)

---

## 📚 Índice Rápido

1. [Stack del Proyecto](#stack)
2. [🐘 Supabase MCP — Base de Datos](#supabase)
3. [🐙 GitHub MCP — Repositorio](#github)
4. [🚀 Vercel MCP — Deployments](#vercel)
5. [🗃️ Notion MCP — Documentación](#notion)
6. [🔗 Flujos Combinados](#flujos)
7. [⚠️ Reglas Críticas](#reglas)

---

## Stack del Proyecto {#stack}

| Item | Valor |
|---|---|
| **Framework** | Next.js 15 App Router |
| **Lenguaje** | TypeScript strict (nunca `any`, nunca Pages Router) |
| **Estilos** | Tailwind CSS v4 (config en `@theme` block, `@import "tailwindcss"`) |
| **BD** | Supabase PostgreSQL · Project ID: `lrcggpdgrqltqbxqnjgh` · Región: `sa-east-1` |
| **Auth** | Supabase Auth Server-side (`@supabase/ssr`) |
| **UI** | shadcn/ui en `components/ui/` |
| **Repo** | `FinanceNFT010/lukess-inventory-system` |
| **Deploy** | Vercel (proyecto: `lukess-inventory-system`) |
| **Notion WS** | `Adrian Oliver — Dev & Freelance` |

---

## 🐘 Supabase MCP {#supabase}

**Proyecto:** `lukess-inventory` · ID: `lrcggpdgrqltqbxqnjgh` · Status: `ACTIVE_HEALTHY`  
**Host DB:** `db.lrcggpdgrqltqbxqnjgh.supabase.co` · PostgreSQL 17.6

### Schema Real de la Base de Datos

La BD tiene **15 tablas**, **todas con RLS habilitado**:

| Tabla | Filas | Propósito |
|---|---|---|
| `organizations` | 1 | Multi-tenant: empresa raíz del sistema |
| `profiles` | 5 | Usuarios del sistema (admin/manager/staff) |
| `locations` | 4 | Ubicaciones físicas (sucursales, puestos) |
| `categories` | 8 | Categorías de productos |
| `products` | 17 | Catálogo completo de productos |
| `inventory` | 220 | Stock por producto+ubicación+talla+color |
| `inventory_transactions` | 100 | Log de movimientos de inventario |
| `inventory_reservations` | 65 | Reservas de stock para pedidos online |
| `sales` | 78 | Ventas registradas (física y online) |
| `sale_items` | 32 | Líneas de cada venta |
| `orders` | 81 | Pedidos online (landing page) |
| `order_items` | 76 | Líneas de cada pedido |
| `customers` | 3 | Clientes del e-commerce |
| `subscribers` | 3 | Suscriptores de email |
| `wishlists` | 13 | Wishlist de clientes |
| `audit_log` | 73 | Auditoría general del sistema |
| `access_requests` | 6 | Solicitudes de acceso al sistema |

#### Enums del Sistema
- **`user_role`**: `admin` · `manager` · `staff`
- **`payment_method`**: `cash` · `qr` · `card`
- **`transaction_type`**: `sale` · `adjustment` · `return` · `transfer`
- **`order status`** (text): `pending` · `confirmed` · `shipped` · `completed` · `cancelled`
- **`canal`** (text): `online` · `fisico`
- **`delivery_method`**: `delivery` · `pickup`
- **`reservation status`**: `reserved` · `confirmed` · `released` · `completed` · `shipped`
- **`access_request status`**: `pending` · `approved` · `rejected`

#### Tablas Clave — Columnas Importantes

**`products`**: `id`, `organization_id`, `category_id`, `sku`, `name`, `description`, `price`, `cost`, `brand`, `sizes[]`, `colors[]`, `image_url`, `images[]`, `is_active`, `is_featured`, `is_new`, `low_stock_threshold` (def:5), `discount` (0-100), `collection`, `subcategory`, `color`, `sku_group`, `published_to_landing`

**`inventory`**: `id`, `product_id`, `location_id`, `quantity`, `min_stock` (def:5), `max_stock`, `size`, `color`, `variant_key` (generada: `productId_locationId_size_color`), `reserved_qty`

**`orders`**: `id`, `customer_name`, `customer_phone`, `customer_email`, `subtotal`, `discount`, `total`, `status`, `payment_method`, `payment_proof`, `notes`, `organization_id`, `internal_notes`, `managed_by`, `marketing_consent`, `delivery_method`, `shipping_address`, `fulfillment_location_id`, `canal`, `expires_at`, `notify_email`, `notify_whatsapp`, `payment_receipt_url`

**`profiles`**: `id` (= auth.users.id), `organization_id`, `location_id`, `email`, `full_name`, `role` (user_role enum), `is_active`, `phone`

---

### 🛠️ Tools del Supabase MCP

#### `list_projects`
- **Qué hace:** Lista todos los proyectos de Supabase vinculados al access-token
- **Cuándo usarla:** Al inicio de una sesión para obtener el `project_id` real
- **Returns:** Array de proyectos con `id`, `name`, `status`, `region`
- **Cuándo NO:** No la necesitas si ya sabes que el ID es `lrcggpdgrqltqbxqnjgh`

#### `get_project(project_id)`
- **Qué hace:** Detalles completos del proyecto (status, región, versión de Postgres)
- **Cuándo usarla:** Para verificar que el proyecto está `ACTIVE_HEALTHY` antes de operar
- **Returns:** Objeto con `status`, `database.version`, `region`

#### `list_tables(project_id, schemas)`
- **Qué hace:** Lista todas las tablas de un schema con columnas, tipos, FK, RLS status y row count
- **Cuándo usarla:** SIEMPRE antes de escribir código que toque la BD. Para conocer nombres exactos de columnas, tipos de datos, constraints.
- **Args:** `schemas: ["public"]`
- **Returns:** Array de tablas con columnas detalladas
- **⚠️ IMPORTANTE:** Úsala antes de cualquier migración para evitar conflictos de nombres

#### `execute_sql(project_id, query)`
- **Qué hace:** Ejecuta SQL SELECT o DML puro. Para explorar data, verificar queries, debuggear.
- **Cuándo usarla:**  
  - Ejecutar SELECT para verificar datos antes de escribir código  
  - Contar registros, buscar registros específicos  
  - Verificar que una migración tuvo el efecto esperado  
  - Probar queries complejos antes de ponerlos en el código
- **Cuándo NO:** ❌ NUNCA para DDL (CREATE, ALTER, DROP). Eso es `apply_migration`
- **Ejemplos de uso:**
  ```sql
  -- Ver productos con stock bajo
  SELECT p.name, i.quantity, i.min_stock 
  FROM inventory i JOIN products p ON i.product_id = p.id 
  WHERE i.quantity <= i.min_stock;
  
  -- Verificar RLS de una tabla
  SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
  
  -- Ver pedidos pendientes de pago
  SELECT id, customer_name, total, status, created_at FROM orders 
  WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10;
  ```

#### `apply_migration(project_id, name, query)`
- **Qué hace:** Aplica una migración DDL al proyecto y la registra en el historial
- **Cuándo usarla:** Siempre que hagas `CREATE TABLE`, `ALTER TABLE`, `DROP`, `CREATE INDEX`, `CREATE FUNCTION`, `CREATE TRIGGER`, `CREATE POLICY`
- **Args:** `name` debe ser snake_case descriptivo (ej: `add_notes_column_to_products`)
- **⚠️ CRÍTICO:** El `name` debe ser único. Si ya existe, fallará.
- **Cuándo NO:** ❌ NUNCA para SELECT o INSERT de datos normales. Eso es `execute_sql`

#### `list_migrations(project_id)`
- **Qué hace:** Lista todas las migraciones aplicadas en orden cronológico con timestamp
- **Cuándo usarla:** Antes de crear una migración (verificar que no existe ya), al debuggear inconsistencias, para auditorías
- **Migraciones actuales del proyecto:** 24 migraciones desde 2026-02-08 a 2026-02-21

#### `generate_typescript_types(project_id)`
- **Qué hace:** Genera el archivo `database.types.ts` completo basado en el schema actual
- **⚠️ CUÁNDO:** OBLIGATORIO después de CADA `apply_migration` que cambie schema
- **Dónde poner el output:** `types/database.types.ts`
- **Returns:** El texto TypeScript completo. Copiar y pegar en el archivo.

#### `get_project_url(project_id)`
- **Qué hace:** Devuelve la URL pública del proyecto (`https://lrcggpdgrqltqbxqnjgh.supabase.co`)
- **Cuándo usarla:** Al configurar variables de entorno o clientes

#### `get_publishable_keys(project_id)`
- **Qué hace:** Devuelve la `anon key` para uso en el frontend
- **⚠️ IMPORTANTE:** Nunca usar la `service_role` key en el cliente

#### `list_extensions(project_id)`
- **Qué hace:** Lista extensiones PostgreSQL activas (`uuid-ossp`, `pgcrypto`, etc.)
- **Cuándo usarla:** Si un migration falla por extensión faltante

#### `get_logs(project_id, service)`
- **Qué hace:** Logs de las últimas 24h de un servicio específico
- **Services disponibles:** `api` · `postgres` · `edge-function` · `auth` · `storage` · `realtime` · `branch-action`
- **Cuándo usarla:**
  - Error 500 en API → `service: "api"`
  - Problema con login/registro → `service: "auth"`
  - Edge Function falla → `service: "edge-function"`
  - Query lenta o error de BD → `service: "postgres"`

#### `get_advisors(project_id, type)`
- **Qué hace:** Análisis automatizado de seguridad o performance de la BD
- **Type:** `"security"` ó `"performance"`
- **Cuándo usarla:**  
  - ✅ Siempre después de `apply_migration` con cambios de RLS/políticas  
  - ✅ Antes de un deploy a producción  
  - ✅ Auditorías periódicas de seguridad
- **Alertas actuales detectadas en el proyecto:**
  - ⚠️ 10 funciones con `search_path` mutable: `log_inventory_transaction`, `reserve_order_inventory`, `handle_order_status_change`, `cancel_expired_orders`, `apply_order_allocation`, `handle_new_user`, `update_updated_at_column`, `get_user_org_id`, `get_user_role`, `get_user_location_id`
  - ⚠️ RLS policies demasiado permisivas en: `access_requests` (INSERT), `customers` (INSERT/UPDATE), `inventory_reservations` (ALL), `order_items` (INSERT), `orders` (INSERT/UPDATE), `subscribers` (INSERT)
  - ⚠️ `Leaked Password Protection` deshabilitada en Supabase Auth

#### `list_edge_functions(project_id)`
- **Qué hace:** Lista todas las Edge Functions desplegadas

#### `get_edge_function(project_id, function_slug)`
- **Qué hace:** Lee el código fuente de una Edge Function específica
- **Cuándo:** Al debuggear una función o antes de modificarla

#### `deploy_edge_function(project_id, name, files, verify_jwt)`
- **Qué hace:** Despliega o actualiza una Edge Function
- **⚠️ NUNCA** deshabilitar `verify_jwt: true` a menos que la función implemente su propia auth

#### `list_branches` / `create_branch` / `delete_branch` / `merge_branch` / `rebase_branch` / `reset_branch`
- **Qué hacen:** Gestionan ramas de desarrollo de Supabase (BD separada para testing)
- **Cuándo:** Features grandes que requieren cambios de schema sin afectar producción
- **Flujo:** `create_branch` → desarrollar → `merge_branch` → `delete_branch`

#### `pause_project` / `restore_project`
- **Cuándo:** Solo si se necesita economizar créditos en un proyecto inactivo. NO lo uses en producción sin coordinar.

---

## 🐙 GitHub MCP {#github}

**Repo:** `FinanceNFT010/lukess-inventory-system`  
**Issues abiertos actuales:** 0  
**Rama principal:** `main`

### 🛠️ Tools del GitHub MCP

#### Lectura de Repositorio

##### `get_file_contents(owner, repo, path, branch?)`
- **Qué hace:** Lee el contenido de cualquier archivo del repo
- **Cuándo:** Antes de modificar un archivo, para ver qué hay actualmente. Antes de implementar un feature, para entender el código existente.
- **Rate:** Incluye el `sha` del archivo — necesario para actualizarlo con `create_or_update_file`
- **Ejemplos:**
  ```
  path: "app/dashboard/page.tsx"
  path: "types/database.types.ts"
  path: "components/ui/button.tsx"
  path: ".env.example"
  ```

##### `list_commits(owner, repo, sha?, page?, perPage?)`
- **Qué hace:** Lista commits de una rama
- **Cuándo:** Investigar cuándo se introdujo un bug, revisar historial reciente, entender el contexto de un cambio
- **Tip:** Usar `sha: "main"` y `perPage: 10` para ver los últimos 10 commits

##### `search_code(q)`
- **Qué hace:** Busca código por texto en cualquier repo de GitHub
- **Cuándo:** Encontrar dónde se usa una función, buscar patrones problemáticos, encontrar todos los usos de una variable, auditar uso de `service_role`
- **Sintaxis:** `q: "PATTERN repo:OWNER/REPO language:typescript"`
- **Ejemplos:**
  ```
  q: "service_role repo:FinanceNFT010/lukess-inventory-system"
  q: "any repo:FinanceNFT010/lukess-inventory-system language:typescript"
  q: "console.log repo:FinanceNFT010/lukess-inventory-system"
  q: "createServerClient repo:FinanceNFT010/lukess-inventory-system"
  ```

##### `search_repositories(query)` / `search_issues(q)` / `search_users(q)`
- **Qué hacen:** Búsqueda global en GitHub
- **Cuándo:** Buscar librerías, encontrar issues similares en otros proyectos, investigar soluciones

#### Escritura en Repositorio

##### `create_or_update_file(owner, repo, path, content, message, branch, sha?)`
- **Qué hace:** Crea un archivo nuevo O actualiza uno existente
- **⚠️ IMPORTANTE:** Si el archivo EXISTE, debes pasar el `sha` (obtenido de `get_file_contents`). Sin `sha`, fallará.
- **`message`:** Seguir el formato de commits: `feat(scope): description` · `fix(scope): desc` · `chore(scope): desc`
- **`content`:** Debe ser texto plano (el contenido se pasa directo, no en base64 cuando se usa via MCP)

##### `push_files(owner, repo, branch, files, message)`
- **Qué hace:** Pushea múltiples archivos en un solo commit atómico
- **Cuándo:** Cuando un feature involucra cambios en 2+ archivos. Siempre preferir esto sobre múltiples `create_or_update_file` para mantener el historial limpio.
- **`files`:** Array de `{path, content}`

##### `create_branch(owner, repo, branch, from_branch?)`
- **Qué hace:** Crea una nueva rama
- **Convención de nombres:**
  - `feat/nombre-del-feature` — para features nuevos
  - `fix/descripcion-del-bug` — para bugfixes
  - `chore/tarea` — para tareas de mantenimiento
  - `refactor/modulo` — para refactors

#### Issues

##### `list_issues(owner, repo, state?, labels?, sort?, direction?, page?, per_page?)`
- **Qué hace:** Lista issues con filtros
- **Cuándo:** Al iniciar una sesión de trabajo para ver qué hay pendiente
- **Args útiles:** `state: "open"` · `state: "closed"` · `state: "all"`

##### `get_issue(owner, repo, issue_number)`
- **Qué hace:** Lee un issue específico con todos sus detalles
- **Cuándo:** Obligatorio ANTES de implementar cualquier feature que tenga issue asociado

##### `create_issue(owner, repo, title, body?, labels?, assignees?)`
- **Qué hace:** Crea un nuevo issue
- **Cuándo:** Al detectar un bug durante el desarrollo, al identificar deuda técnica, al planificar un feature

##### `update_issue(owner, repo, issue_number, title?, body?, state?, labels?, assignees?)`
- **Qué hace:** Actualiza un issue (cerrar, cambiar título, agregar etiquetas)
- **Cuándo:** Al terminar un fix → `state: "closed"`. Al agregar contexto a un issue existente.

##### `add_issue_comment(owner, repo, issue_number, body)`
- **Qué hace:** Agrega un comentario a un issue
- **Cuándo:** Para documentar el progreso de un issue sin cerrarlo aún, para referenciar el PR que lo resuelve

#### Pull Requests

##### `list_pull_requests(owner, repo, state?, base?, head?, sort?, direction?)`
- **Qué hace:** Lista PRs con filtros

##### `get_pull_request(owner, repo, pull_number)`
- **Qué hace:** Detalles completos de un PR (estado, base, head, review status)

##### `get_pull_request_files(owner, repo, pull_number)`
- **Qué hace:** Lista qué archivos cambiaron en un PR con diffs
- **Cuándo:** Al revisar un PR antes de aprobar, al analizar el alcance de un cambio

##### `get_pull_request_reviews(owner, repo, pull_number)`
- **Qué hace:** Reviews existentes de un PR (APPROVED, CHANGES_REQUESTED, COMMENT)

##### `get_pull_request_comments(owner, repo, pull_number)`
- **Qué hace:** Comentarios inline de un PR

##### `create_pull_request(owner, repo, title, head, base, body?, draft?)`
- **Qué hace:** Crea un PR
- **Cuándo:** Al finalizar un feature para solicitar merge a `main`
- **`base`:** Siempre `"main"` salvo que se indique lo contrario
- **`body`:** Describir QUÉ hace el PR, qué archivos tocó, cómo probarlo

##### `create_pull_request_review(owner, repo, pull_number, body, event, comments?)`
- **Qué hace:** Agrega una review formal al PR
- **`event`:** `"APPROVE"` · `"REQUEST_CHANGES"` · `"COMMENT"`

##### `merge_pull_request(owner, repo, pull_number, merge_method?, commit_title?, commit_message?)`
- **Qué hace:** Hace merge de un PR
- **`merge_method`:** `"squash"` (recomendado para mantener historial limpio) · `"merge"` · `"rebase"`
- **⚠️ PRECAUCIÓN:** Verificar que el PR esté aprobado y los checks pasen antes de mergear

##### `update_pull_request_branch(owner, repo, pull_number)`
- **Qué hace:** Trae los cambios de `main` al branch del PR (equivalente a `git merge main`)
- **Cuándo:** Si el PR está desactualizado respecto a `main`

#### Otros

##### `fork_repository(owner, repo, organization?)` / `create_repository(name, description?, private?, autoInit?)`
- **Cuándo:** Raramente necesarios. Solo si se está creando un proyecto nuevo desde cero.

---

## 🚀 Vercel MCP {#vercel}

**Paquete:** `@robinson_ai_systems/vercel-mcp` (26 tools activas)  
**Proyecto en Vercel:** `lukess-inventory-system`

### 🛠️ Tools del Vercel MCP

#### Proyectos

##### `list_projects`
- **Qué hace:** Lista todos los proyectos en tu cuenta de Vercel
- **Cuándo:** Para obtener el nombre/ID exacto del proyecto

##### `get_project`
- **Qué hace:** Información detallada de un proyecto (framework, Git integration, domains, env vars configuradas)
- **Cuándo:** Verificar configuración del proyecto, confirmar que la integración con GitHub está activa

##### `get_project_status`
- **Qué hace:** Estado actual del proyecto (último deployment status, dominio activo)
- **Cuándo:** Verificación rápida antes de hacer cambios, al inicio de una sesión

##### `list_team_projects`
- **Qué hace:** Lista proyectos de un Team específico
- **Cuándo:** Si trabajas con múltiples proyectos bajo el mismo team

##### `list_teams`
- **Qué hace:** Lista los teams de la cuenta de Vercel

#### Deployments

##### `list_deployments`
- **Qué hace:** Lista deployments del proyecto con estado (READY, ERROR, BUILDING, CANCELLED)
- **Cuándo:** Ver historial de deployments, encontrar un deployment específico para debuggear

##### `get_deployment`
- **Qué hace:** Detalles completos de un deployment (URL, estado, fecha, trigger, commit)
- **Cuándo:** Antes de leer los logs, para obtener el deployment ID exacto

##### `get_deployment_build_logs`
- **Qué hace:** Logs del proceso de BUILD de un deployment (compilación TypeScript, errores de Next.js)
- **Cuándo:** El deployment falló con status ERROR. Este es el primer lugar donde buscar si el build no compiló.
- **Qué buscar:** Errores de TypeScript, módulos faltantes, variables de entorno no definidas, fallos de `next build`

##### `get_runtime_logs`
- **Qué hace:** Logs de runtime de producción (errores en tiempo de ejecución de la app)
- **Cuándo:** Un endpoint devuelve 500, hay errores en la consola del usuario, comportamiento inesperado en producción
- **Qué buscar:** Stack traces de Node.js, errores de Supabase, errores de autenticación, crashes de Server Components

#### Contenido Web

##### `get_access_to_vercel_url`
- **Qué hace:** Accede a una URL del proyecto para verificar que responde
- **Cuándo:** Verificar que un endpoint específico está vivo y responde con 200

##### `web_fetch_vercel_url`
- **Qué hace:** Hace fetch del contenido de una URL del proyecto y devuelve el HTML/JSON
- **Cuándo:** Verificar el output de un endpoint de API, ver si una página renderiza correctamente, debuggear respuestas de Server Actions

#### Diagnóstico y Debugging

##### `quick_status`
- **Qué hace:** Resumen ultrarrápido del estado actual del proyecto en una línea
- **Cuándo:** Verificación rápida antes de hacer un push. ¿El proyecto está OK o hay algo roto?

##### `project_health_check`
- **Qué hace:** Chequeo completo de salud: último deployment, dominios, configuración, alertas
- **Cuándo:** Al inicio de una sesión de trabajo larga, antes de un lanzamiento, en auditorías

##### `analyze_deployment_performance`
- **Qué hace:** Analiza métricas de performance del último o un deployment específico
- **Cuándo:** La app se siente lenta, antes de reportar un problema de performance, optimizaciones

##### `debug_deployment_issues`
- **Qué hace:** Análisis guiado de problemas en un deployment fallido. Combina build logs + runtime logs + configuración.
- **Cuándo:** El deployment falló y no tienes claro por qué. Es el primer paso cuando hay un ERROR desconocido.

##### `fix_recent_build`
- **Qué hace:** Analiza el último build fallido y sugiere el fix específico en el código
- **Cuándo:** Build roto, quieres una solución concreta sin leer todos los logs manualmente

##### `troubleshoot_common_issues`
- **Qué hace:** Troubleshooting guiado de los problemas más frecuentes (env vars, CORS, timeouts, etc.)
- **Cuándo:** El problema no es obvio y quieres un diagnóstico sistemático

##### `optimize_deployment`
- **Qué hace:** Sugerencias concretas para mejorar el deployment (bundle size, cold starts, cache headers, etc.)
- **Cuándo:** Después de que funciona, para hacerlo más eficiente

#### Dominios

##### `check_domain_availability_and_price`
- **Qué hace:** Verifica si un dominio está disponible y su precio
- **Cuándo:** Al planificar el dominio de producción para un cliente

#### Documentación

##### `search_vercel_documentation`
- **Qué hace:** Busca en la documentación oficial de Vercel
- **Cuándo:** Necesitas saber cómo configurar algo de Vercel (redirects, rewrites, middleware, edge functions, cron jobs, etc.)

##### `explain_vercel_concept`
- **Qué hace:** Explica un concepto específico de Vercel (Edge Runtime, ISR, middleware, etc.)
- **Cuándo:** No estás seguro de cómo funciona algo internamente de Vercel

##### `vercel_help`
- **Qué hace:** Ayuda general sobre qué puede hacer el MCP de Vercel

#### Deployment

##### `deploy_to_vercel`
- **Qué hace:** Inicia un deployment manual
- **Cuándo:** Generalmente los deployments son automáticos al hacer push a `main`. Solo usar manualmente si es necesario un re-deploy sin cambios de código.

##### `system_instructions`
- **Qué hace:** Instrucciones del sistema del MCP. No tiene uso práctico en prompts.

---

## 🗃️ Notion MCP {#notion}

**Workspace:** `Adrian Oliver — Dev & Freelance`  
**Bot:** `Antigravity Dev` (integración oficial de Notion)

### 🛠️ Tools del Notion MCP

#### Búsqueda y Lectura

##### `API-post-search(query, filter?, sort?, page_size?)`
- **Qué hace:** Busca páginas y bases de datos por título en el workspace
- **Cuándo:** Antes de crear una página nueva (verificar que no existe). Para encontrar la documentación de un módulo.
- **`filter`:** `{property: "object", value: "page"}` o `value: "data_source"` para filtrar por tipo
- **`sort`:** `{timestamp: "last_edited_time", direction: "descending"}` para las más recientes primero
- **Returns:** Array de resultados con `id`, `url`, `title`

##### `API-retrieve-a-page(page_id)`
- **Qué hace:** Metadata de una página (título, propiedades si es DB, URL, fechas)
- **⚠️ OJO:** No devuelve el CONTENIDO de la página, solo la metadata. Para el contenido usar `API-get-block-children`

##### `API-get-block-children(block_id, page_size?)`
- **Qué hace:** Lee el contenido (bloques) de una página o bloque
- **Cuándo:** Leer el contenido completo de una página de documentación o spec
- **Tip:** El `block_id` de una página == el `page_id`. Los bloques pueden tener sub-bloques (anidados).
- **`page_size`:** Máximo 100. Si la página es larga, usa `start_cursor` para paginar.

##### `API-retrieve-a-block(block_id)`
- **Qué hace:** Lee un bloque específico por ID
- **Cuándo:** Cuando necesitas un bloque específico sin leer toda la página

##### `API-retrieve-a-database(database_id)`
- **Qué hace:** Schema de una base de datos de Notion (propiedades, tipos de campo, opciones de select)
- **Cuándo:** Antes de hacer `query-data-source`, para saber qué propiedades filtrar

##### `API-query-data-source(data_source_id, filter?, sorts?, page_size?, archived?, in_trash?)`
- **Qué hace:** Consulta una base de datos de Notion con filtros y ordenamiento
- **Cuándo:** Obtener registros de una BD de Notion (tareas, proyectos, clientes, etc.)
- **`filter`:** Sintaxis Notion: `{property: "Estado", select: {equals: "En Progreso"}}`
- **`sorts`:** `[{property: "Fecha", direction: "descending"}]`

##### `API-retrieve-a-comment(block_id, page_size?)`
- **Qué hace:** Lee los comentarios de una página o bloque

#### Escritura y Creación

##### `API-post-page(parent, properties, children?, icon?, cover?)`
- **Qué hace:** Crea una nueva página
- **`parent`:** `{"page_id": "ID_DE_PAGINA_PADRE"}` o `{"database_id": "ID_DE_BD"}` si es un registro de BD
- **`properties`:** Para páginas normales: `{"title": [{"text": {"content": "Título"}}]}`. Para registros de BD: según el schema.
- **`children`:** Array de bloques de contenido (párrafos, bullets, headers, código, etc.)

##### `API-patch-page(page_id, properties?, archived?, in_trash?, icon?, cover?)`
- **Qué hace:** Actualiza propiedades de una página existente
- **Cuándo:** Cambiar el título, archivar una página, cambiar estado en una BD
- **Para archivar:** `archived: true`. Para eliminar definitivamente: `in_trash: true`

##### `API-patch-block-children(block_id, children, after?)`
- **Qué hace:** Agrega bloques de contenido al final de una página o después de un bloque específico
- **Cuándo:** Agregar nuevo contenido a una página existente (changelog, notas de implementación)
- **`after`:** ID del bloque después del cual insertar (para insertar en posición específica)
- **Tipos de bloque comunes:**
  ```json
  // Párrafo
  {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Texto"}}]}}
  
  // Heading 2
  {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"text": {"content": "Sección"}}]}}
  
  // Bullet point
  {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"text": {"content": "Item"}}]}}
  
  // Bloque de código
  {"object": "block", "type": "code", "code": {"language": "typescript", "rich_text": [{"text": {"content": "const x = 1;"}}]}}
  ```

##### `API-update-a-block(block_id, type?, archived?)`
- **Qué hace:** Modifica el contenido de un bloque existente
- **Cuándo:** Corregir texto en una página, actualizar información ya escrita

##### `API-delete-a-block(block_id)`
- **Qué hace:** Elimina un bloque (acción irreversible)
- **⚠️ PRECAUCIÓN:** Verificar el block_id antes de eliminar

##### `API-create-a-comment(parent, rich_text)`
- **Qué hace:** Agrega un comentario a una página
- **Cuándo:** Dejar notas de revisión, preguntas, alertas en páginas de documentación

##### `API-create-a-data-source(parent, properties, title?)`
- **Qué hace:** Crea una nueva base de datos de Notion
- **Cuándo:** Crear un nuevo tracker de bugs, log de features, etc.

##### `API-update-a-data-source(data_source_id, properties?, title?, description?)`
- **Qué hace:** Actualiza el schema de una BD de Notion (agrega propiedades, cambia opciones)

##### `API-list-data-source-templates(data_source_id)` 
- **Qué hace:** Lista plantillas de una BD de Notion

##### `API-move-page(page_id, parent)`
- **Qué hace:** Mueve una página a otro padre (otra página o BD)

##### `API-get-self`
- **Qué hace:** Info del bot integrado (workspace, permisos)
- **Cuándo:** Verificar que la integración funciona

##### `API-get-users` / `API-get-user(user_id)`
- **Qué hacen:** Lista o lee usuarios del workspace
- **Cuándo:** Para @mencionar usuarios en comentarios/propiedades

---

## 🔗 Flujos Combinados {#flujos}

### Flujo 1: Implementar un Feature Completo

```
"Implementa el feature [NOMBRE].

1. [GitHub MCP] Lee el issue #N del repo FinanceNFT010/lukess-inventory-system 
   para entender los requisitos exactos.
2. [Supabase MCP] Ejecuta list_tables para ver el schema actual y entender 
   qué columnas/tablas están disponibles.
3. [GitHub MCP] Lee los archivos afectados actuales con get_file_contents.
4. [Supabase MCP] Si necesitas cambios de schema: aplica apply_migration con 
   nombre descriptivo, luego genera_typescript_types y actualiza types/database.types.ts.
5. Implementa el código. Todos los archivos modificados en un solo push_files 
   con mensaje de commit que siga el formato feat(scope): descripción.
6. [GitHub MCP] Crea la rama feat/nombre-feature, pushea en esa rama.
7. [GitHub MCP] Abre un PR hacia main describiendo qué hace y cómo probarlo.
8. [GitHub MCP] Cierra el issue #N con comentario referenciando el PR.
9. [Supabase MCP] Ejecuta get_advisors type='security' para verificar que 
   no quedaron vulnerabilidades."
```

### Flujo 2: Debug de Error en Producción

```
"Hay un error en producción: [DESCRIPCIÓN DEL SÍNTOMA].

1. [Vercel MCP] Ejecuta quick_status para ver el estado general del proyecto.
2. [Vercel MCP] Ejecuta get_runtime_logs del proyecto para ver los errores recientes.
3. [Supabase MCP] Si el error parece ser de BD: ejecuta get_logs con 
   service='postgres' o service='api' para correlacionar.
4. [Supabase MCP] Ejecuta el query relevante con execute_sql para verificar 
   si los datos están bien.
5. [GitHub MCP] Lista los últimos commits (list_commits perPage:5) para ver 
   si el error fue introducido por un cambio reciente.
6. Identifica la causa raíz y corrige.
7. [GitHub MCP] Pushea el fix con mensaje fix(scope): descripción del fix.
8. [Vercel MCP] Verifica con get_runtime_logs que el error desapareció."
```

### Flujo 3: Migración de Base de Datos

```
"Necesito agregar [DESCRIPCIÓN DEL CAMBIO DE SCHEMA].

1. [Supabase MCP] list_tables para ver el estado actual.
2. [Supabase MCP] list_migrations para ver el historial y asegurarte de 
   que el nombre de la nueva migración sea único.
3. [Supabase MCP] apply_migration con el DDL exacto y nombre descriptivo.
4. [Supabase MCP] execute_sql para verificar que el cambio se aplicó correctamente.
5. [Supabase MCP] generate_typescript_types → actualizar types/database.types.ts.
6. [Supabase MCP] get_advisors type='security' para verificar RLS.
7. [GitHub MCP] push_files con los archivos modificados (types + código que usa 
   los nuevos campos)."
```

### Flujo 4: Auditoría de Seguridad

```
"Haz una auditoría de seguridad completa del proyecto.

1. [Supabase MCP] get_advisors type='security' — documenta cada warning.
2. [Supabase MCP] execute_sql: 
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'
   para verificar que TODAS las tablas tienen RLS habilitado.
3. [GitHub MCP] search_code con q='service_role repo:FinanceNFT010/lukess-inventory-system'
   para verificar que service_role key no esté en el cliente.
4. [GitHub MCP] search_code con q='console.log repo:FinanceNFT010/lukess-inventory-system'
   para detectar logs olvidados en producción.
5. [Vercel MCP] project_health_check para verificar env vars y configuración.
6. Genera un reporte detallado con: ✅ lo que está bien, ⚠️ warnings y ❌ críticos.
7. Propone y aplica los fixes necesarios."
```

### Flujo 5: Onboarding / Contexto Inicial de Sesión

```
"Antes de empezar, dame un estado completo del proyecto.

1. [GitHub MCP] list_issues state='open' — ¿qué hay pendiente?
2. [GitHub MCP] list_pull_requests state='open' — ¿hay PRs abiertos?
3. [GitHub MCP] list_commits perPage:5 — ¿qué se hizo recientemente?
4. [Vercel MCP] quick_status — ¿el proyecto está en producción correcto?
5. [Supabase MCP] list_migrations — ¿cuál es la última migración?
6. [Notion MCP] API-post-search query='pendiente' — 
   ¿hay notas de pendientes en Notion?
Resúmeme todo en un briefing de 10 líneas antes de continuar."
```

### Flujo 6: Documentar un Feature en Notion

```
"Acabamos de implementar [FEATURE]. Documéntalo en Notion.

1. [Notion MCP] API-post-search query='Documentación Técnica' para encontrar 
   la página padre.
2. [Notion MCP] API-post-page para crear la página '[FEATURE] — Implementación'
   bajo esa sección con:
   - Descripción del feature
   - Tablas de BD afectadas
   - Archivos modificados (links de GitHub)
   - Cómo probarlo
   - Alertas de seguridad / decisiones de diseño importantes
3. [GitHub MCP] add_issue_comment en el issue correspondiente con el link 
   a la página de Notion."
```

### Flujo 7: Crear y Resolver un Bug

```
"Encontré un bug: [DESCRIPCIÓN].

1. [GitHub MCP] create_issue title='bug: [descripción corta]' con:
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Logs o screenshots si hay
2. [Vercel MCP] get_runtime_logs para obtener el stack trace exacto.
3. [Supabase MCP] execute_sql para validar el estado de los datos si es relevante.
4. Implementa el fix.
5. [GitHub MCP] push_files con mensaje 'fix(scope): descripción fixes #N'.
6. [GitHub MCP] update_issue issue_number=N state='closed' con comentario 
   'Resuelto en commit [sha]'."
```

---

## ⚠️ Reglas Críticas {#reglas}

> [!CAUTION]
> **NUNCA uses `apply_migration` para SELECT o DML común.** Solo para DDL (CREATE, ALTER, DROP, CREATE INDEX, CREATE POLICY). Para datos usa `execute_sql`.

> [!CAUTION]
> **SIEMPRE regenera `database.types.ts`** después de cualquier `apply_migration`. Usar `generate_typescript_types` y reemplazar el archivo `types/database.types.ts` completo.

> [!CAUTION]
> **NUNCA uses `service_role` key en el cliente.** Solo `anon key`. Verificar con `get_publishable_keys`.

> [!WARNING]
> **Antes de `create_or_update_file` en un archivo que ya existe:** siempre ejecutar primero `get_file_contents` para obtener el `sha` actual. Sin `sha`, el update fallará.

> [!WARNING]
> **Después de cualquier cambio de RLS o policy:** ejecutar `get_advisors type='security'` para verificar que no quedó un agujero de seguridad.

> [!WARNING]
> **Al nombrar migraciones:** verificar con `list_migrations` que el nombre no existe. El `version` es el timestamp, el `name` debe ser único y descriptivo en snake_case.

> [!IMPORTANT]
> **Siempre TypeScript strict.** Nunca `any`. Siempre tipos explícitos en funciones. Usar `types/database.types.ts` para tipar todo lo de Supabase.

> [!IMPORTANT]
> **Nunca Pages Router.** Solo App Router, directorio `app/`, Server Components por defecto. Client Components solo cuando es necesario (`"use client"`).

> [!NOTE]
> **Tailwind v4:** La configuración está en el bloque `@theme` del CSS. Usar `@import "tailwindcss"`, no `@tailwind base/components/utilities`. Cero sintaxis Tailwind v3.

> [!TIP]
> **Cuando algo se ve raro en prod:** SIEMPRE ir primero a Vercel MCP (`get_runtime_logs` o `debug_deployment_issues`) antes de asumir que el bug está en el código local. El entorno de producción puede diferir.

> [!TIP]
> **Antes de implementar cualquier cosa:** usa `get_file_contents` de GitHub y `list_tables` de Supabase para tener el contexto real. No asumas cómo está el código o el schema.
