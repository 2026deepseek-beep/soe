@echo off
echo Building Tailwind CSS...
if exist node_modules (
  call npm run build
) else if exist tw.exe (
  tw.exe -i src\input.css -o assets\style.css --minify
) else (
  echo X Tailwind not found. Run "npm install" or download tw.exe
  pause
  exit /b 1
)
echo.
echo Build complete: assets\style.css
dir assets\style.css
pause