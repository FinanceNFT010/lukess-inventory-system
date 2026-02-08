---
name: deploy
description: Deploy a Vercel producción
---

# Deploy to Vercel

Prepara y ejecuta deploy a producción:

## Checklist Pre-Deploy

1. ✅ Todos los tests pasan
2. ✅ No hay errores de TypeScript
3. ✅ Build local exitoso
4. ✅ Variables de entorno configuradas

## Proceso

1. Verificar branch actual (debe ser main)
2. Pull latest changes
3. Build local: `npm run build`
4. Si OK, push a main
5. Vercel auto-deploya

Pregunta confirmación antes de hacer push.
Pregunta confirmación antes de hacer push.
