@echo off
cd /d "%~dp0"
powershell -executionpolicy unrestricted -File trayrun.ps1
