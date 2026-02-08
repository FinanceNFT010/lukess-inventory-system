#!/bin/bash

# Verificar que .cursorrules existe
if [ ! -f ".cursorrules" ]; then
  echo '{"continue": false, "user_message": "⚠️ Archivo .cursorrules no encontrado."}'
  exit 0
fi

# Contexto adicional
echo '{"continue": true, "additional_context": "🏠 Lukess Inventory | Next.js 15 + Supabase | Lee .cursorrules"}'
exit 0
