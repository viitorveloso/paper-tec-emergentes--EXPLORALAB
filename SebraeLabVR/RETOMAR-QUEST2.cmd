@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Preparacao do SebraeLab para Meta Quest 2
echo Feche o projeto no Unity antes de continuar.
echo E necessario acesso a internet, autorizacao para instalar e licenca Unity ativa.
echo Se preferir instalar pelo Hub, siga LEIA-ME-OUTRA-MAQUINA.txt.
echo.
pause
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tools\VRSetup\Quest2.ps1" -Action Install
if errorlevel 1 goto falha
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tools\VRSetup\Quest2.ps1" -Action Build
if errorlevel 1 goto falha
echo APK gerado em Builds\Quest2\SebraeLabVR-Quest2.apk
echo Teste os controles, navegacao e desempenho no Quest 2.
pause
exit /b 0
:falha
echo A preparacao parou. Consulte o erro acima, LEIA-ME-OUTRA-MAQUINA.txt e Tools\VRSetup\unity-build.log.
echo Nenhum novo APK foi confirmado nesta execucao.
pause
exit /b 1
