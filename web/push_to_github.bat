@echo off
cd /d "C:\Users\brven\Claude\Projects\Boating App\web"

echo =============================================
echo  RevConnect1 Web -- Git Setup + Push
echo =============================================
echo.

:: Remove any broken .git directory from a previous attempt
if exist ".git" (
    echo Removing old .git folder...
    rmdir /s /q ".git"
)

echo Initialising git repo...
git init -b main
if errorlevel 1 goto :error

echo.
echo Configuring git user...
git config user.email "brvenikanthony@gmail.com"
git config user.name "Lambda2006"

echo.
echo Configuring remote...
git remote add origin https://github.com/Lambda2006/revconnect1-web.git

echo.
echo Staging all files...
git add .

echo.
echo Committing...
git commit -m "feat: Phase 7 - Next.js marketing site

- Landing page with hero, feature strip, supported boats strip
- /features, /pricing, /pricing/success, /boats, /business
- /terms, /privacy, /disclaimer (attorney review required)
- Stripe Checkout API route (7-day trial, same price IDs as mobile)
- Boat model request form (writes to boat_model_requests table)
- Shared Navbar + Footer with brand colors navy #0A2240 / red #C8102E"

if errorlevel 1 goto :error

echo.
echo Pushing to GitHub...
echo (A browser window may open to authenticate -- sign in as Lambda2006)
echo.
git push -u origin main

if errorlevel 1 goto :error

echo.
echo =============================================
echo  SUCCESS! Code is now on GitHub.
echo  https://github.com/Lambda2006/revconnect1-web
echo =============================================
echo.
pause
exit /b 0

:error
echo.
echo =============================================
echo  ERROR -- see message above
echo =============================================
echo.
pause
exit /b 1
