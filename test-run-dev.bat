@echo off
setlocal

:: Set the project directory
set PROJECT_DIR=C:\Users\user\Documents\undangan\undangan

:: Set the browser path
set BROWSER="C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"

:: URL to open
set URL=http://localhost:8000?to=Namehere

:: Check if npm is already running on port 8000 (default Vite port)
netstat -aon | findstr :8000 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo npm run dev is already running. Stopping it...
    :: Find the PID of the process using port 8000
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
        taskkill /PID %%a /F
    )
    :: Wait a moment to ensure the process is terminated
    timeout /t 2 /nobreak >nul
)

:: Change to project directory
cd /d %PROJECT_DIR%

:: Start npm run dev in a new window
echo Starting npm run dev...
start cmd /c npm run dev

:: Wait for the server to start (adjust time if needed)
timeout /t 5 /nobreak >nul

:: Open Brave in incognito mode
echo Opening Brave Browser in incognito mode...
start "" %BROWSER% --incognito %URL%

echo Done!
endlocal