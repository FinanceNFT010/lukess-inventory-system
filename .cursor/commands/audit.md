---
name: audit
description: Audita el estado actual del proyecto e identifica problemas
---

Perform a complete audit of the current project state:

1. **File Structure**: List all files in app/ and components/ directories
2. **TypeScript**: Run type check and list all errors
3. **Dependencies**: Check package.json for outdated or conflicting packages
4. **Supabase**: Using MCP, verify:
   - All expected tables exist
   - RLS policies are enabled on all tables
   - No orphaned data or broken foreign keys
5. **Routes**: List all routes and confirm each page loads without 404
6. **Environment Variables**: List all required env vars and confirm they exist in .env.local
7. **Build**: Run `npm run build` and report result
8. **Summary**: Generate a report with:
   - ✅ What's working correctly
   - ⚠️ What needs attention
   - ❌ Critical issues that must be fixed before proceeding
