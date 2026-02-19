---
name: commit
description: Hace git add, commit y push con mensaje descriptivo del bloque completado
---

Execute these git commands in the terminal:

1. `git add .`
2. `git status` — list all changed files
3. Generate a commit message following this format:
   - Type: feat | fix | style | refactor | chore
   - Scope: (inventory) | (landing) | (auth) | (db) | (ui)
   - Description: concise English description of what was implemented
   - Example: `feat(auth): add RBAC roles schema and auth trigger`
4. `git commit -m "[generated message]"`
5. `git push origin main`
6. Confirm push was successful and provide the Vercel deployment URL to monitor
