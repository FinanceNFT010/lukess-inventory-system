---
name: verify
description: Verifica que todo esté implementado correctamente sin errores
---

Run these steps in order in the terminal and report results:

1. Run `npm run build` and confirm it completes with 0 errors and 0 warnings
2. Run `npm run lint` and confirm 0 lint errors
3. Check localhost:3000 is running (if not, remind user to run `npm run dev`)
4. List ALL files that were modified or created in this session
5. For each modified file, confirm:
   - No TypeScript errors (`any` types, missing types, etc.)
   - No unused imports
   - Proper error handling with try/catch
6. If using Supabase: confirm all new tables/columns exist using Supabase MCP
7. Report: ✅ VERIFIED or ❌ ISSUES FOUND with specific problems listed
