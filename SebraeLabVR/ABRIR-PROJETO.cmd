@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tools\VRSetup\Quest2.ps1" -Action Open
if errorlevel 1 pause
