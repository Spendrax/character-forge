#!/bin/sh
# Character Forge - the table (Linux): run it, keep the terminal open during the game.
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Install Node.js first (nodejs.org or your package manager)."; exit 1; }
node server.js 8080 --open
