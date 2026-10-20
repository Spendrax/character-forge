@echo off
title Character Forge - the table
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Character Forge needs Node.js ^(free^). The download page opens now:
  echo install the "LTS" version, then double-click this file again.
  start "" https://nodejs.org/en/download
  pause
  exit /b
)
echo Starting Character Forge for the table...
echo If Windows asks about the firewall, allow "Private networks" so phones can connect.
echo Keep this window open during the game. Close it to stop.
echo.
node server.js 8080 --open
pause
