#!/bin/bash

# Crear carpeta de logs
mkdir -p .cursor/logs

# Timestamp y log
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")
echo "$timestamp | Hook executed" >> .cursor/logs/audit.log

exit 0
