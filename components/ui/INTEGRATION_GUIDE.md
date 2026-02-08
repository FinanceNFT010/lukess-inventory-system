# 🚀 Guía de Integración - Componentes de Producto

Esta guía te muestra cómo integrar los nuevos componentes de producto en tu aplicación Lukess Inventory System.

## 📦 Componentes Disponibles

1. **ProductCard** - Tarjeta individual de producto (3 variantes)
2. **ProductGrid** - Grid con búsqueda y filtros
3. **ProductQuickView** - Modal de vista rápida

## 🎯 Casos de Uso Reales

### 1. Página de Inventario Mejorada

Reemplaza el listado actual con el nuevo grid interactivo.

**Archivo:** `app/(dashboard)/inventario/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { redirect } from "next/navigation";

export default async function InventarioPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Obtener perfil y organización
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Obtener productos con inventario y categoría
  const { data: products } = await supabase
    .from("products")
    .select(
      `
      *,
      inventory(*),
      category:categories(id, name)
    `
    )
    .eq("organization_id", profile.organization_id)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventario</h1>
        <p className="text-gray-600">
          Gestiona tus productos y controla el stock
        </p>
      </div>

      <ProductGrid
        products={products || []}
        variant="default"
        showStock={true}
        enableSearch={true}
        enableCategoryFilter={true}
        onProductSelect={(product) => {
          // Redirigir a página de edición
          window.location.href = `/inventario/${product.id}`;
        }}
      />
    </div>
  );
}
```

### 2. POS con Vista Rápida

Mejora el punto de venta con el modal de vista rápida.

**Archivo:** `app/(dashboard)/ventas/pos-with-quickview.tsx`

```tsx
"use client";

import { useState } from "react";
import { ProductGrid, ProductQuickView } from "@/components/ui";
import type { Product, Inventory } from "@/lib/types";

interface POSClientProps {
  initialProducts: (Product & { inventory: Inventory[] })[];
}

export function POSClient({ initialProducts }: POSClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Array<Product & { quantity: number }>>([]);

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    // Mostrar notificación
    alert(`${product.name} agregado al carrito`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Productos */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Productos</h2>
        <ProductGrid
          products={initialProducts}
          variant="compact"
          showStock={true}
          enableSearch={true}
          enableCategoryFilter={true}
          onProductSelect={(product) => setSelectedProduct(product)}
        />
      </div>

      {/* Carrito */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Carrito</h2>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              El carrito está vacío
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Bs {item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">
                    Bs {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    Bs{" "}
                    {cart
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                  Procesar Venta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de vista rápida */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
```

### 3. Dashboard con Productos Destacados

Muestra productos con bajo stock en el dashboard.

**Archivo:** `app/(dashboard)/dashboard-low-stock.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ui/ProductCard";
import { AlertTriangle } from "lucide-react";

export async function DashboardLowStock() {
  const supabase = await createClient();

  // Obtener productos con bajo stock
  const { data: lowStockProducts } = await supabase
    .from("inventory")
    .select(
      `
      quantity,
      min_stock,
      products!inner(
        id,
        sku,
        name,
        price,
        cost,
        brand,
        sizes,
        colors,
        organization_id,
        category_id,
        description,
        image_url,
        is_active,
        created_at,
        updated_at
      )
    `
    )
    .lte("quantity", supabase.raw("min_stock"))
    .limit(6);

  if (!lowStockProducts || lowStockProducts.length === 0) {
    return null;
  }

  // Transformar datos para ProductCard
  const products = lowStockProducts.map((item) => ({
    ...item.products,
    inventory: [
      {
        id: "temp",
        product_id: item.products.id,
        location_id: "temp",
        quantity: item.quantity,
        min_stock: item.min_stock,
        max_stock: null,
        updated_at: new Date().toISOString(),
      },
    ],
  }));

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-50 p-2 rounded-lg border-2 border-red-200">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Productos con Bajo Stock
          </h2>
          <p className="text-gray-600">Requieren reabastecimiento pronto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="default"
            showStock={true}
            onSelect={(p) => (window.location.href = `/inventario/${p.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 4. Catálogo Público (Futuro)

Si necesitas un catálogo público para clientes.

**Archivo:** `app/catalogo/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/ui/ProductGrid";

export default async function CatalogoPage() {
  const supabase = await createClient();

  // Obtener productos activos (sin autenticación)
  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id,
      sku,
      name,
      description,
      price,
      brand,
      sizes,
      colors,
      image_url,
      category:categories(name)
    `
    )
    .eq("is_active", true)
    .order("name");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Catálogo de Productos</h1>
          <p className="text-blue-100">
            Explora nuestra colección de ropa y accesorios
          </p>
        </div>
      </header>

      {/* Productos */}
      <div className="container mx-auto px-6 py-12">
        <ProductGrid
          products={products || []}
          variant="default"
          showStock={false} // No mostrar stock en catálogo público
          enableSearch={true}
          enableCategoryFilter={true}
          emptyMessage="No hay productos disponibles en este momento"
        />
      </div>
    </div>
  );
}
```

## 🎨 Personalización

### Cambiar Colores

Los componentes siguen las reglas de `.cursorrules.md`. Si necesitas personalizar:

```tsx
// En ProductCard.tsx, busca las clases de Tailwind y ajusta:

// Ejemplo: Cambiar color del precio
<p className="text-blue-600"> // Cambiar a text-purple-600
```

### Agregar Imágenes

Los componentes tienen un placeholder de `<Package>`. Para agregar imágenes:

```tsx
// En ProductCard.tsx, reemplaza:
<div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
  <Package className="w-10 h-10 text-blue-600" />
</div>

// Por:
{product.image_url ? (
  <img
    src={product.image_url}
    alt={product.name}
    className="w-full h-32 object-cover rounded-lg"
  />
) : (
  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
    <Package className="w-10 h-10 text-blue-600" />
  </div>
)}
```

## 🔧 Troubleshooting

### Error: "Cannot find module '@/components/ui'"

**Solución:** Verifica que tu `tsconfig.json` tenga:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Los productos no se muestran

**Solución:** Verifica que la query incluya `inventory` y `category`:

```typescript
.select(`
  *,
  inventory(*),
  category:categories(id, name)
`)
```

### El filtro de categoría no funciona

**Solución:** Asegúrate de que `category_id` no sea `null` en tus productos, o ajusta el filtro:

```typescript
const matchesCategory =
  categoryFilter === "all" ||
  product.category_id === categoryFilter ||
  (!product.category_id && categoryFilter === "sin-categoria");
```

## 📚 Próximos Pasos

1. **Agregar paginación** al ProductGrid para grandes inventarios
2. **Implementar filtros avanzados** (rango de precios, marca, etc.)
3. **Agregar ordenamiento** (precio, nombre, stock)
4. **Integrar con variantes** de producto (cuando se implemente)
5. **Agregar animaciones** con Framer Motion

## 🎓 Recursos

- [ProductCard README](./ProductCard.README.md)
- [Ejemplos de Uso](./ProductCard.example.tsx)
- [Reglas del Proyecto](../../.cursorrules.md)

---

**¿Necesitas ayuda?** Revisa los ejemplos o consulta la documentación del proyecto.
