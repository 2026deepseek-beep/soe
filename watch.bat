@echo off
echo Watching for changes... (Ctrl+C to stop)
if exist node_modules (
  call npm run watch
) else if exist tw.exe (
  tw.exe -i src\input.css -o assets\style.css --watch
) else (
  echo X Tailwind not found.
  pause
  exit /b 1
)