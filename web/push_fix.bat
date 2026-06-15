@echo off
cd /d "C:\Users\brven\Claude\Projects\Boating App\web"
echo Committing Stripe apiVersion fix...
git add app/api/checkout/route.ts
git commit -m "fix: cast Stripe apiVersion as any for TS compat"
echo.
echo Pushing to GitHub...
git push origin main
echo.
if errorlevel 1 (
    echo PUSH FAILED
) else (
    echo SUCCESS
)
echo.
pause
