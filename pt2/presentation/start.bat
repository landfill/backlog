@echo off
echo Starting Hand-Tracking Presentation...
echo.
echo Launching local server on http://localhost:8080
echo Press Ctrl+C to stop the server.
echo.

cd /d "%~dp0"

where python >nul 2>&1
if %ERRORLEVEL% == 0 (
    start "" "http://localhost:8080"
    python -m http.server 8080
) else (
    where python3 >nul 2>&1
    if %ERRORLEVEL% == 0 (
        start "" "http://localhost:8080"
        python3 -m http.server 8080
    ) else (
        echo ERROR: Python not found.
        echo Please install Python from https://www.python.org/downloads/
        pause
    )
)
