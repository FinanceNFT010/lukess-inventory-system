#!/bin/bash

# Leer input
input=$(cat)

# Extraer file_path del JSON
file_path=$(echo "$input" | grep -oP '"file_path"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")

# Solo formatear TypeScript/JavaScript
if [[ "$file_path" =~ \.(ts|tsx|js|jsx)$ ]]; then
  npx prettier --write "$file_path" 2>/dev/null || true
fi

exit 0
