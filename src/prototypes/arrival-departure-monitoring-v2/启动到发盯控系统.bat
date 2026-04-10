@echo off
chcp 65001 >nul
title 到发盯控系统
echo 正在启动到发盯控系统...
echo.
echo 请稍候，系统将自动打开浏览器...
echo.

REM 获取当前目录
cd /d "%~dp0"

REM 使用默认浏览器打开应用
start "" "app.html"

echo.
echo 到发盯控系统已启动！
echo 如果浏览器没有自动打开，请手动双击 app.html 文件
echo.
timeout /t 2 >nul
exit
