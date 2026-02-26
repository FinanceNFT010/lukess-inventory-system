# MEMORY FORMAT RULES

When updating `meta/activeContext.md`, ALWAYS use this exact structure.
Do NOT invent new sections. Do NOT skip sections.

Required sections in order:
1. ## CURRENT BLOCK (block number, name, status, started date)
2. ## LAST COMPLETED BLOCK (block number, name, date, commit message)
3. ## FILES CHANGED THIS SESSION (full paths, one per line, with brief description)
4. ## DATABASE STATE (last migration name, types regenerated Y/N, pending migrations)
5. ## OPEN ISSUES (checkboxes, max 10 items — if more, put them in a separate issues.md)
6. ## NEXT BLOCK (block number, name, dependencies, brief scope)
7. ## BLOCK HISTORY TABLE (markdown table: Block | Name | Status | Date | Commit)

Update this file using the FILE WRITE TOOL — never just mention the update in chat.
The update happens BEFORE the walkthrough artifact. Not after. Not "I'll do it next time."
