/**
 * EJEMPLOS DE USO DEL COMPONENTE ProductCard
 * 
 * Este archivo muestra cómo usar el componente ProductCard
 * en diferentes contextos del sistema.
 */

import { ProductCard } from "./ProductCard";
import type { Product, Inventory } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 1: Variante COMPACTA (para POS)
// ═══════════════════════════════════════════════════════════════════════════

export function POSProductExample() {
  const product: Product & { inventory: Inventory[] } = {
    id: "123",
    organization_id: "org-1",
    category_id: "cat-1",
    sku: "CAM-TH-001",
    name: "Camisa Oxford Classic Fit",
    description: "Camisa Oxford de algodón 100%",
    price: 320.0,
    cost: 180.0,
    brand: "Tommy Hilfiger",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blanco", "Celeste", "Rosa"],
    image_url: null,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    inventory: [
      {
        id: "inv-1",
        product_id: "123",
        location_id: "loc-1",
        quantity: 15,
        min_stock: 5,
        max_stock: 50,
        updated_at: "2024-01-01",
      },
    ],
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <ProductCard
        product={product}
        variant="compact"
        showStock={true}
        onSelect={(p) => console.log("Producto seleccionado:", p.name)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 2: Variante DEFAULT (para listados generales)
// ═══════════════════════════════════════════════════════════════════════════

export function InventoryListExample() {
  const product: Product & {
    inventory: Inventory[];
    category: { name: string };
  } = {
    id: "123",
    organization_id: "org-1",
    category_id: "cat-1",
    sku: "CAM-TH-001",
    name: "Camisa Oxford Classic Fit",
    description: "Camisa Oxford de algodón 100%",
    price: 320.0,
    cost: 180.0,
    brand: "Tommy Hilfiger",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blanco", "Celeste", "Rosa"],
    image_url: null,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    inventory: [
      {
        id: "inv-1",
        product_id: "123",
        location_id: "loc-1",
        quantity: 3, // Bajo stock
        min_stock: 5,
        max_stock: 50,
        updated_at: "2024-01-01",
      },
    ],
    category: {
      name: "Camisas",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCard
        product={product}
        variant="default"
        showStock={true}
        onSelect={(p) => console.log("Editar producto:", p.id)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 3: Variante DETAILED (para vista de detalles)
// ═══════════════════════════════════════════════════════════════════════════

export function ProductDetailExample() {
  const product: Product & {
    inventory: Inventory[];
    category: { name: string };
  } = {
    id: "123",
    organization_id: "org-1",
    category_id: "cat-1",
    sku: "CAM-TH-001",
    name: "Camisa Oxford Classic Fit",
    description:
      "Camisa Oxford de algodón 100%, corte clásico. Perfecta para uso formal o casual.",
    price: 320.0,
    cost: 180.0,
    brand: "Tommy Hilfiger",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blanco", "Celeste", "Rosa"],
    image_url: null,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    inventory: [
      {
        id: "inv-1",
        product_id: "123",
        location_id: "loc-1",
        quantity: 15,
        min_stock: 5,
        max_stock: 50,
        updated_at: "2024-01-01",
      },
      {
        id: "inv-2",
        product_id: "123",
        location_id: "loc-2",
        quantity: 8,
        min_stock: 5,
        max_stock: 30,
        updated_at: "2024-01-01",
      },
    ],
    category: {
      name: "Camisas",
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProductCard
        product={product}
        variant="detailed"
        showStock={true}
        showProfitMargin={true}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 4: Grid de productos con diferentes estados
// ═══════════════════════════════════════════════════════════════════════════

export function ProductGridExample() {
  const products: (Product & { inventory: Inventory[] })[] = [
    {
      id: "1",
      organization_id: "org-1",
      category_id: null,
      sku: "CAM-001",
      name: "Camisa Blanca",
      description: null,
      price: 250.0,
      cost: 150.0,
      brand: null,
      sizes: ["M", "L"],
      colors: ["Blanco"],
      image_url: null,
      is_active: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      inventory: [
        {
          id: "inv-1",
          product_id: "1",
          location_id: "loc-1",
          quantity: 20,
          min_stock: 5,
          max_stock: 50,
          updated_at: "2024-01-01",
        },
      ],
    },
    {
      id: "2",
      organization_id: "org-1",
      category_id: null,
      sku: "PAN-001",
      name: "Pantalón Jean",
      description: null,
      price: 450.0,
      cost: 280.0,
      brand: "Levi's",
      sizes: ["30", "32", "34"],
      colors: ["Azul"],
      image_url: null,
      is_active: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      inventory: [
        {
          id: "inv-2",
          product_id: "2",
          location_id: "loc-1",
          quantity: 2, // Bajo stock
          min_stock: 5,
          max_stock: 30,
          updated_at: "2024-01-01",
        },
      ],
    },
    {
      id: "3",
      organization_id: "org-1",
      category_id: null,
      sku: "ZAP-001",
      name: "Zapatos Casuales",
      description: null,
      price: 680.0,
      cost: 420.0,
      brand: "Nike",
      sizes: ["40", "41", "42"],
      colors: ["Negro", "Blanco"],
      image_url: null,
      is_active: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      inventory: [
        {
          id: "inv-3",
          product_id: "3",
          location_id: "loc-1",
          quantity: 0, // Sin stock
          min_stock: 3,
          max_stock: 20,
          updated_at: "2024-01-01",
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="default"
          showStock={true}
          onSelect={(p) => alert(`Seleccionaste: ${p.name}`)}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 5: Integración con datos reales de Supabase
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ejemplo de cómo usar ProductCard con datos de Supabase
 */
export async function ProductsFromSupabaseExample() {
  // Este código iría en un Server Component o en useEffect
  /*
  const supabase = createClient();
  
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      inventory(*),
      category:categories(name)
    `)
    .eq("organization_id", userOrgId)
    .eq("is_active", true);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="default"
          showStock={true}
          onSelect={(p) => router.push(`/inventario/${p.id}`)}
        />
      ))}
    </div>
  );
  */
}
