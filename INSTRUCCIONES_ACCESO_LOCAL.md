# 🚀 INSTRUCCIONES PARA ACCEDER AL SISTEMA EN LOCAL

## ✅ Estado Actual
- ✅ Servidor corriendo en: **http://localhost:3000**
- ✅ Variables de entorno configuradas
- ✅ Base de datos Supabase conectada
- ✅ Nueva funcionalidad de stock detallado implementada

---

## 📋 PASOS PARA VER LAS IMPLEMENTACIONES

### 1. Abrir el Navegador
Abre tu navegador preferido (Chrome, Edge, Firefox) y ve a:
```
http://localhost:3000
```

### 2. Iniciar Sesión
Te redirigirá automáticamente a `/login`

**Credenciales de prueba:**
- Necesitas crear un usuario en Supabase o usar uno existente
- Si no tienes usuario, necesitamos crearlo en Supabase

### 3. Ver la Nueva Funcionalidad
Una vez dentro:
1. Ve a **Inventario** (menú lateral)
2. **Haz clic en cualquier fila de producto** (toda la fila es clickeable)
3. Se expandirá mostrando:
   - ✅ Información completa del producto (imagen, precios, margen)
   - ✅ Distribución por cada ubicación/puesto
   - ✅ Tallas disponibles en cada puesto con cantidades
   - ✅ Alertas de stock bajo
   - ✅ Total general

---

## 🔐 CREAR USUARIO DE PRUEBA

Si no tienes usuario, necesitas crear uno en Supabase:

### Opción 1: Desde Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `lrcggpdgrqltqbxqnjgh`
3. Ve a **Authentication** → **Users**
4. Click en **Add User**
5. Ingresa:
   - Email: `admin@lukesshome.com`
   - Password: `admin123456`
6. Luego ve a **Table Editor** → **profiles**
7. Inserta un registro:
   ```sql
   id: [el UUID del usuario que creaste]
   organization_id: [UUID de tu organización]
   email: admin@lukesshome.com
   full_name: Administrador
   role: admin
   is_active: true
   ```

### Opción 2: SQL Query

Ejecuta en Supabase SQL Editor:

```sql
-- 1. Crear usuario en auth
-- (Esto se hace desde el dashboard de Authentication)

-- 2. Crear profile
INSERT INTO profiles (
  id, 
  organization_id, 
  email, 
  full_name, 
  role, 
  is_active
) VALUES (
  '[UUID del usuario de auth]',
  '[UUID de tu organización]',
  'admin@lukesshome.com',
  'Administrador',
  'admin',
  true
);
```

---

## 🎯 QUÉ VER EN LA NUEVA FUNCIONALIDAD

### Vista Normal (Tabla)
```
┌────────────────────────────────────────────────────┐
│ ↓ [Img] Polera Nike    NIKE-001    Bs 150.00      │ ← Click aquí
│ ↓ [Img] Pantalón Adidas ADIDAS-001 Bs 200.00      │
│ ↓ [Img] Zapatillas Puma PUMA-001   Bs 350.00      │
└────────────────────────────────────────────────────┘
```

### Vista Expandida (Al hacer click)
```
┌────────────────────────────────────────────────────┐
│ ↑ [Img] Polera Nike    NIKE-001    Bs 150.00      │ ← Fila expandida
├────────────────────────────────────────────────────┤
│                                                    │
│ ╔════════════════════════════════════════════════╗│
│ ║ [Imagen Grande]  Polera Nike Deportiva        ║│
│ ║                  SKU: NIKE-001                 ║│
│ ║                  Nike                          ║│
│ ║                                                ║│
│ ║ Precio: Bs 150.00   Costo: Bs 80.00          ║│
│ ║ Margen: 87.5% (+Bs 70.00)                    ║│
│ ║                                                ║│
│ ║ Tallas: [S] [M] [L] [XL]                     ║│
│ ║ Colores: [Negro] [Blanco]                    ║│
│ ╚════════════════════════════════════════════════╝│
│                                                    │
│ 📍 Distribución de Stock por Ubicación             │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 📍 Puesto 1 - Central      [20 unidades] 📦 │ │
│ │ Stock mínimo: 15 unidades                   │ │
│ │                                              │ │
│ │ Distribución por Tallas:                    │ │
│ │ [Talla S: 4] [Talla M: 7] [Talla L: 7]     │ │
│ │ [Talla XL: 2]                               │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 📍 Puesto 2 - Norte        [15 unidades] 📦 │ │
│ │ Stock mínimo: 20 unidades                   │ │
│ │                                              │ │
│ │ Distribución por Tallas:                    │ │
│ │ [Talla S: 3] [Talla M: 5] [Talla L: 5]     │ │
│ │ [Talla XL: 2]                               │ │
│ │                                              │ │
│ │ ⚠️ Stock bajo - Mínimo: 20 unidades         │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ╔════════════════════════════════════════════════╗│
│ ║ 📦 STOCK TOTAL: 35 unidades                  ║│
│ ╚════════════════════════════════════════════════╝│
└────────────────────────────────────────────────────┘
```

---

## 🎨 CARACTERÍSTICAS VISUALES

### Colores de los Chips de Tallas

| Stock | Color | Ejemplo |
|-------|-------|---------|
| **≥ 3 unidades** | 🟢 Verde | `Talla M: 7` |
| **1-2 unidades** | 🟡 Amarillo | `Talla S: 2` |
| **0 unidades** | ⚪ Gris tachado | `~~Talla XL: 0~~` |

### Indicadores Visuales

- **Borde lateral azul** cuando la fila está expandida
- **Fondo azul claro** en la fila expandida
- **Chevron animado** (↓ cuando cerrado, ↑ cuando abierto)
- **Hover effect** en toda la fila
- **Shadows elevados** en las cards de ubicación

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "Cannot read properties of null (reading 'id')"

**Causa:** No estás autenticado

**Solución:**
1. Ve a `http://localhost:3000/login`
2. Inicia sesión con tus credenciales
3. Si no tienes usuario, créalo en Supabase (ver arriba)

### Problema: "Página en blanco"

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Compártelos para ayudarte

### Problema: "No se expande al hacer clic"

**Solución:**
1. Verifica que estés haciendo clic en la fila del producto
2. NO hagas clic en los botones de Editar/Eliminar
3. Haz clic en el nombre, SKU, o cualquier parte de la fila

### Problema: "No veo las tallas"

**Posibles causas:**
1. El producto no tiene tallas definidas
   - Verás: "Producto sin variantes de talla"
2. El producto tiene stock 0
   - Verás chips grises tachados

---

## 📱 ACCESO DESDE CELULAR

Si quieres ver desde tu celular en la misma red WiFi:

```
http://192.168.0.39:3000
```

---

## 🎯 CHECKLIST DE VERIFICACIÓN

Una vez que accedas, verifica:

- [ ] El servidor está corriendo en http://localhost:3000
- [ ] Puedes iniciar sesión
- [ ] Ves el dashboard con las métricas
- [ ] Puedes navegar a Inventario
- [ ] Ves la lista de productos
- [ ] Al hacer clic en una fila, se expande
- [ ] Ves la información completa del producto
- [ ] Ves cada ubicación con su stock
- [ ] Ves las tallas distribuidas por ubicación
- [ ] Los colores de los chips funcionan correctamente
- [ ] El total general es correcto

---

## 💡 TIPS

1. **Haz clic en cualquier parte de la fila** para expandir
2. **Los botones de Editar/Eliminar NO expanden** la fila
3. **Solo un producto expandido a la vez** (al expandir otro, el anterior se cierra)
4. **Scroll hacia abajo** para ver todas las ubicaciones
5. **Los chips verdes** indican buen stock (≥3 unidades)
6. **Los chips amarillos** indican stock bajo (1-2 unidades)
7. **Los chips grises tachados** indican sin stock (0 unidades)

---

**¡Listo para probar!** 🎉

Abre http://localhost:3000 y disfruta de la nueva funcionalidad.
