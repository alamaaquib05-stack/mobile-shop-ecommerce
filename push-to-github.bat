@echo off
echo ========================================
echo   Mobile Shop - GitHub Push Script
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo [1/6] Checking Git status...
cd /d "%~dp0"

REM Check if .git folder exists
if not exist ".git" (
    echo.
    echo Git repository not initialized yet.
    echo Initializing Git repository...
    git init
    echo Git initialized successfully!
)

echo.
echo [2/6] Checking for changes...
git status

echo.
echo [3/6] Staging all files...
git add .

echo.
echo [4/6] Creating commit...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" (
    set commit_message=Update: Mobile Shop E-Commerce Application
)
git commit -m "%commit_message%"

echo.
echo [5/6] Checking remote repository...
git remote -v | findstr origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo No remote repository configured.
    echo.
    set /p github_url="Enter your GitHub repository URL: "
    git remote add origin !github_url!
    echo Remote repository added successfully!
)

echo.
echo [6/6] Pushing to GitHub...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo   Push failed! Common solutions:
    echo ========================================
    echo 1. Make sure you created the repository on GitHub
    echo 2. Use Personal Access Token as password
    echo 3. Check your internet connection
    echo.
    echo To create Personal Access Token:
    echo - Go to GitHub Settings ^> Developer settings ^> Personal access tokens
    echo - Generate new token with 'repo' scope
    echo - Use token as password when prompted
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Next steps:
echo 1. Visit your GitHub repository
echo 2. Verify all files are uploaded
echo 3. Check that .env files are NOT visible
echo 4. Follow DEPLOYMENT.md to deploy to production
echo.
pause

@REM Made with Bob
