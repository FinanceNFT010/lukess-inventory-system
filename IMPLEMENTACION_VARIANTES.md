# 🎯 IMPLEMENTACIÓN DE SISTEMA DE VARIANTES

## ⚠️ ADVERTENCIA IMPORTANTE

Este es un cambio **ARQUITECTÓNICO MAYOR** que afectará:
- ✅ Base de datos (nuevas tablas)
- ✅ Formularios de productos
- ✅ Sistema de inventario
- ✅ Sistema de ventas (POS)
- ✅ Reportes

**Tiempo estimado:** 4-6 horas de desarrollo + testing

---

## 📋 FASE 1: BASE DE DATOS (AHORA)

### Paso 1.1: Ejecutar Script SQL

1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Abre el archivo: `supabase/004_product_variants.sql`
4. Copia TODO el contenido
5. Pégalo en el SQL Editor
6. Click en **RUN** (o F5)
7. Verifica que diga: "Success. No rows returned"

### Paso 1.2: Verificar Tablas Creadas

Ejecuta este query para verificar:

```sql
-- Verificar que la tabla existe
SELECT COUNT(*) FROM public.product_variants;

-- Verificar que inventory tiene variant_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inventory' AND column_name = 'variant_id';
```

Si ambos queries funcionan, ¡la base de datos está lista! ✅

---

## 🚧 FASE 2: CÓDIGO (DESPUÉS DE CONFIRMAR FASE 1)

**NO CONTINÚES HASTA QUE FASE 1 ESTÉ COMPLETA**

Una vez que confirmes que el SQL se ejecutó correctamente, te daré los siguientes archivos:

### Archivos a Modificar:

1. **`lib/types.ts`**
   - Agregar tipo `ProductVariant`
   - Actualizar tipo `Product` para incluir `variants`

2. **`app/(dashboard)/inventario/nuevo/new-product-form.tsx`**
   - Convertir a wizard de 2 pasos
   - Paso 1: Info básica del producto
   - Paso 2: Generar variantes (matriz Tallas x Colores)

3. **`app/(dashboard)/inventario/inventory-client.tsx`**
   - Mostrar productos con variantes expandibles
   - Sub-filas para cada variante

4. **`app/(dashboard)/ventas/pos-client.tsx`**
   - Modal de selección de variante al agregar producto
   - Mostrar talla/color en carrito

5. **Nuevos componentes:**
   - `components/variants/VariantMatrix.tsx` - Matriz de variantes
   - `components/variants/VariantSelector.tsx` - Selector en POS
   - `components/variants/VariantRow.tsx` - Fila de variante en inventario

---

## 🔄 MIGRACIÓN DE DATOS EXISTENTES (Opcional)

Si ya tienes productos en el sistema, puedes:

### Opción A: Dejar productos sin variantes
- Productos actuales siguen usando `product_id` en inventory
- Nuevos productos usan variantes
- Sistema híbrido (ambos funcionan)

### Opción B: Migrar a variantes
Ejecutar este script para crear 1 variante por producto existente:

```sql
-- Crear variante "default" para cada producto
INSERT INTO public.product_variants (
  organization_id,
  product_id,
  sku,
  size,
  color,
  price,
  cost,
  is_active
)
SELECT 
  p.organization_id,
  p.id,
  p.sku || '-DEFAULT',
  'Única',
  'Único',
  p.price,
  p.cost,
  TRUE
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_variants pv 
  WHERE pv.product_id = p.id
);

-- Migrar inventory a usar variant_id
UPDATE public.inventory i
SET 
  variant_id = (
    SELECT pv.id 
    FROM public.product_variants pv 
    WHERE pv.product_id = i.product_id 
    AND pv.size = 'Única'
    LIMIT 1
  ),
  product_id = NULL
WHERE i.product_id IS NOT NULL 
AND i.variant_id IS NULL;
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Script SQL ejecutado sin errores
- [ ] Tabla `product_variants` existe
- [ ] Columna `variant_id` en `inventory` existe
- [ ] Políticas RLS funcionan
- [ ] Funciones helper creadas

### Código (Fase 2)
- [ ] Tipos TypeScript actualizados
- [ ] Formulario de creación con wizard
- [ ] Inventario muestra variantes
- [ ] POS permite seleccionar variantes
- [ ] Ventas registran variant_id correcto
- [ ] Reportes incluyen variantes

### Testing
- [ ] Crear producto con variantes
- [ ] Editar variantes existentes
- [ ] Vender variante específica en POS
- [ ] Ver stock por variante en inventario
- [ ] Reportes muestran datos correctos

---

## 🆘 ROLLBACK (Si algo sale mal)

Si necesitas revertir los cambios:

```sql
-- Eliminar tabla de variantes
DROP TABLE IF EXISTS public.product_variants CASCADE;

-- Remover columna variant_id de inventory
ALTER TABLE public.inventory DROP COLUMN IF EXISTS variant_id;

-- Hacer product_id obligatorio de nuevo
ALTER TABLE public.inventory ALTER COLUMN product_id SET NOT NULL;

-- Restaurar constraint único original
CREATE UNIQUE INDEX inventory_product_location_unique 
ON public.inventory(product_id, location_id);
```

---

## 📞 PRÓXIMOS PASOS

1. ✅ **EJECUTA EL SQL** en Supabase (Fase 1)
2. ✅ **VERIFICA** que todo funcionó
3. ✅ **CONFIRMA** aquí que está listo
4. ✅ Te daré el código para Fase 2

**NO AVANCES A FASE 2 SIN CONFIRMAR FASE 1**

---

## 💡 ALTERNATIVA MÁS SIMPLE

Si esto te parece demasiado complejo, puedo implementar:

**Sistema de SKU Compuesto:**
- Crear productos separados por variante
- SKU: `POL-ADIDAS-40-BLANCO`
- Agrupar visualmente por nombre base
- 80% de funcionalidad, 20% del esfuerzo

¿Prefieres continuar con variantes o cambiar a SKU compuesto?
