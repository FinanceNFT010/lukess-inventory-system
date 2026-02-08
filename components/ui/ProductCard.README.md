# 📦 ProductCard Component

Componente reutilizable para mostrar productos en el sistema de inventario Lukess.

## 🎯 Características

- ✅ **3 variantes**: `compact`, `default`, `detailed`
- ✅ **Alertas visuales**: Indicador de bajo stock con colores del sistema
- ✅ **Margen de ganancia**: Cálculo automático y visualización
- ✅ **Stock por ubicación**: Muestra inventario detallado
- ✅ **Responsive**: Adaptable a diferentes tamaños de pantalla
- ✅ **Accesible**: Botones con estados hover claros
- ✅ **TypeScript**: Totalmente tipado

## 📋 Props

```typescript
interface ProductCardProps {
  product: Product & {
    inventory?: Inventory[];
    category?: { name: string } | null;
  };
  onSelect?: (product: Product) => void;
  showStock?: boolean;
  showProfitMargin?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}
```

### Props Detalladas

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `product` | `Product & {...}` | **requerido** | Objeto del producto con inventario y categoría opcional |
| `onSelect` | `(product: Product) => void` | `undefined` | Callback cuando se selecciona el producto |
| `showStock` | `boolean` | `true` | Mostrar información de stock |
| `showProfitMargin` | `boolean` | `false` | Mostrar margen de ganancia (solo en `detailed`) |
| `variant` | `"default" \| "compact" \| "detailed"` | `"default"` | Variante visual del componente |
| `className` | `string` | `""` | Clases CSS adicionales |

## 🎨 Variantes

### 1. Compact (POS)

Ideal para el punto de venta donde necesitas ver muchos productos en poco espacio.

```tsx
<ProductCard
  product={product}
  variant="compact"
  showStock={true}
  onSelect={(p) => addToCart(p)}
/>
```

**Características:**
- Diseño horizontal compacto
- Precio destacado
- Stock visible
- Click para agregar al carrito

### 2. Default (Listados)

Perfecto para listados de inventario y vistas generales.

```tsx
<ProductCard
  product={product}
  variant="default"
  showStock={true}
  onSelect={(p) => router.push(`/inventario/${p.id}`)}
/>
```

**Características:**
- Diseño balanceado
- Icono de producto
- Alerta de bajo stock
- Categoría visible
- Precio y stock destacados

### 3. Detailed (Vista de Detalles)

Para páginas de detalle o cuando necesitas mostrar toda la información.

```tsx
<ProductCard
  product={product}
  variant="detailed"
  showStock={true}
  showProfitMargin={true}
/>
```

**Características:**
- Toda la información del producto
- Tallas y colores
- Margen de ganancia
- Stock por ubicación
- Descripción completa
- Precios detallados

## 🎨 Paleta de Colores (según .cursorrules)

El componente sigue estrictamente las reglas de colores del proyecto:

| Elemento | Background | Text | Border | Uso |
|----------|-----------|------|--------|-----|
| Producto normal | `bg-white` | `text-gray-900` | `border-gray-200` | Estado normal |
| Hover | `bg-white` | `text-gray-900` | `border-blue-400` | Interacción |
| Icono producto | `bg-blue-50` | `text-blue-600` | `border-blue-200` | Identificación |
| Precio | - | `text-blue-600` | - | Destacado |
| Stock normal | - | `text-green-600` | - | Stock suficiente |
| Bajo stock | `bg-red-50` | `text-red-600` | `border-red-200` | ⚠️ Alerta |
| Sin stock | - | `text-gray-400` | - | Agotado |
| Categoría | `bg-purple-50` | `text-purple-700` | `border-purple-200` | Clasificación |
| Margen ganancia | `bg-green-50` | `text-green-600` | `border-green-200` | Rentabilidad |

## 📊 Lógica de Negocio

### Cálculo de Stock Total

```typescript
const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
```

### Detección de Bajo Stock

```typescript
const minStock = product.inventory?.reduce((sum, inv) => sum + inv.min_stock, 0) || 0;
const isLowStock = totalStock > 0 && totalStock <= minStock;
```

### Cálculo de Margen de Ganancia

```typescript
const profitMargin = ((product.price - product.cost) / product.cost) * 100;
const profitAmount = product.price - product.cost;
```

## 🔧 Ejemplos de Uso

### Ejemplo 1: Grid de Productos en Inventario

```tsx
"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import type { Product, Inventory } from "@/lib/types";

export function InventoryGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="default"
          showStock={true}
          onSelect={(p) => window.location.href = `/inventario/${p.id}`}
        />
      ))}
    </div>
  );
}
```

### Ejemplo 2: Selector de Productos en POS

```tsx
"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import { useState } from "react";

export function POSProductSelector({ products, onAddToCart }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="compact"
          showStock={true}
          onSelect={onAddToCart}
        />
      ))}
    </div>
  );
}
```

### Ejemplo 3: Vista Detallada de Producto

```tsx
"use client";

import { ProductCard } from "@/components/ui/ProductCard";

export function ProductDetail({ product }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProductCard
        product={product}
        variant="detailed"
        showStock={true}
        showProfitMargin={true}
      />
      
      {/* Botones de acción */}
      <div className="flex gap-4 mt-6">
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
          Editar Producto
        </button>
        <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all">
          Eliminar
        </button>
      </div>
    </div>
  );
}
```

### Ejemplo 4: Con Datos de Supabase (Server Component)

```tsx
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ui/ProductCard";

export default async function ProductsPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      inventory(*),
      category:categories(name)
    `)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="default"
          showStock={true}
        />
      ))}
    </div>
  );
}
```

## 🚨 Problemas Comunes

### 1. "El stock no se muestra"

**Solución:** Asegúrate de incluir `inventory` en tu query de Supabase:

```typescript
.select(`
  *,
  inventory(*)
`)
```

### 2. "La categoría aparece como null"

**Solución:** La categoría es opcional. Incluye el join si la necesitas:

```typescript
.select(`
  *,
  inventory(*),
  category:categories(name)
`)
```

### 3. "El componente no es clickeable"

**Solución:** Pasa la función `onSelect`:

```tsx
<ProductCard
  product={product}
  onSelect={(p) => console.log(p)}
/>
```

### 4. "Los colores no se ven bien"

**Problema:** El componente sigue las reglas de `.cursorrules`. Si ves problemas de contraste, verifica que estés usando las clases correctas.

## 🎯 Mejores Prácticas

1. **Usa la variante correcta:**
   - `compact` → POS, selección rápida
   - `default` → Listados, inventario
   - `detailed` → Vista de detalles, edición

2. **Muestra el margen solo cuando sea necesario:**
   ```tsx
   showProfitMargin={userRole === 'admin' || userRole === 'manager'}
   ```

3. **Filtra productos inactivos:**
   ```typescript
   .eq("is_active", true)
   ```

4. **Optimiza las queries:**
   ```typescript
   // ❌ Malo - trae todo
   .select("*")
   
   // ✅ Bueno - solo lo necesario
   .select("id, sku, name, price, cost, inventory(quantity)")
   ```

## 🔐 Seguridad

El componente es solo de visualización. La seguridad debe manejarse en:

1. **Server Components:** Filtrar por `organization_id`
2. **RLS Policies:** Verificar en Supabase
3. **Validación:** En formularios de edición/creación

## 📚 Recursos

- [Reglas del Proyecto](.cursorrules.md)
- [Tipos TypeScript](../../lib/types.ts)
- [Ejemplos de Uso](./ProductCard.example.tsx)

---

**Creado siguiendo las reglas de:** `.cursorrules.md`  
**Fecha:** Febrero 2026  
**Versión:** 1.0.0
