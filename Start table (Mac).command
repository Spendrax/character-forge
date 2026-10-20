#!/bin/sh
# Character Forge - the table (Mac): double-click to start, close the window to stop.
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then echo "Character Forge needs Node.js (free): install the LTS version from nodejs.org, then double-click this file again."; open https://nodejs.org/en/download; read -r _; exit 1; fi
echo "Keep this window open during the game. Close it to stop."
node server.js 8080 --open
