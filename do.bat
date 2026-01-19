@echo off
setlocal

:: Default values
set COMMIT_MSG="Update site and notes: %date% %time%"
set PUSH=true

:: Parse Arguments
:parse
if "%~1"=="" goto :main

if /i "%~1"=="-m" (
    set "COMMIT_MSG=%~2"
    shift
    shift
    goto :parse
)

if /i "%~1"=="--nopush" (
    set PUSH=false
    shift
    goto :parse
)

if /i "%~1"=="--help" (
    goto :usage
)

shift
goto :parse

:usage
echo.
echo Usage: do.bat [options]
echo.
echo Options:
echo   -m "message"   Specify a custom commit message.
echo                  Default: "Update site and notes: <date> <time>"
echo.
echo   --nopush       Skip the 'git push' step.
echo.
echo   --help         Show this help message and workflow details.
echo.
echo Workflow:
echo   1. npm run sync    - Scans Workspace and syncs notes to public/
echo   2. npm run build   - Compiles React App and generates assets into dist/
echo   3. Deploy dist     - Deploys the built content to the 'page' branch.
echo.
echo Note: This script NO LONGER pushes to the 'main' branch automatically.
echo       Feature updates in 'main' should be pushed manually by developers.
echo.
exit /b 0

:main

echo 🚀 Starting Build, Sync, and Deployment to 'page' branch...

:: 1. Sync and Build locally
echo 📦 Building project (including sync)...
call npm run build

:: Check build success
if %errorlevel% neq 0 (
    echo ❌ Build failed. Aborting.
    exit /b %errorlevel%
)

:: 2. Deploy and Push (Page Branch only)
if "%PUSH%"=="true" (
    echo 🚀 Deploying 'dist' artifact to 'page' branch...
    
    :: Copy GitHub Workflows to dist so the 'page' branch can trigger Actions
    echo 🔧 Copying GitHub Workflows to dist...
    xcopy /E /I /Y ".github" "dist\.github" >nul
    
    pushd dist
    
    :: Initialize temp repo for deployment
    git init
    git add -A
    
    :: Use the provided commit message for the deployment record
    echo 📝 Committing deployment: %COMMIT_MSG%
    git commit -m %COMMIT_MSG%
    
    :: Force push to remote 'page' branch
    echo 📤 Pushing Dist to origin/page (SSH)...
    git push -f git@github.com:yceachan/yceachan.github.io.git HEAD:page
    
    popd
    echo ✨ Deployment to 'page' branch complete!
) else (
    echo ⏹️ Push skipped (--nopush option used).
    echo    Dist generated in 'dist/'.
)

echo.
echo ℹ️  Reminder: 'main' branch was NOT pushed. 
echo    If you have source code changes, please push them manually.

pause
endlocal
