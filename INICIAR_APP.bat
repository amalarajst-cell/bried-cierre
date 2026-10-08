@echo off
chcp 65001 >nul
title App Cierre de Jornada - Vinculación con el Futuro
echo ========================================================
echo    INICIANDO SERVIDOR PARA CIERRE DE JORNADA
echo    (Capacidad para 250 participantes simultaneos)
echo ========================================================
echo.
echo Abriendo servidor web de red y panel de administracion...
echo.

start "" "http://localhost:3000/admin.html"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server_tcp.ps1"

pause
