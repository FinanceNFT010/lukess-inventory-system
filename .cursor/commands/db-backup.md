---
name: db-backup
description: Crear backup de la base de datos
---

# Database Backup

Crea un backup de las tablas críticas de Supabase.

## Tablas a respaldar

- organizations
- profiles
- products
- inventory
- sales
- sale_items

## Proceso

1. Conectar a Supabase usando MCP
2. Exportar cada tabla como JSON
3. Guardar en `backups/YYYY-MM-DD/`
4. Crear archivo ZIP
5. Subir a GitHub (opcional)

Pregunta qué tablas quiero respaldar.
