@echo off
echo 正在禁用旧页面...
echo.

REM 重命名旧页面以禁用它们
if exist "src\prototypes\passenger-template" (
    ren "src\prototypes\passenger-template" "passenger-template.disabled"
    echo - 已禁用: passenger-template
)

if exist "src\prototypes\passenger-template-v2" (
    ren "src\prototypes\passenger-template-v2" "passenger-template-v2.disabled"
    echo - 已禁用: passenger-template-v2
)

if exist "src\prototypes\station-passenger-template" (
    ren "src\prototypes\station-passenger-template" "station-passenger-template.disabled"
    echo - 已禁用: station-passenger-template
)

echo.
echo 操作完成！
echo 现在只显示新的 客运模板 页面。
echo.
pause
