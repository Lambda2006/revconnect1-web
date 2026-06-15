@echo off
cd /d "C:\Users\brven\Claude\Projects\Boating App\web"
echo Pushing to GitHub...
echo (A browser window may open -- sign in as Lambda2006)
echo.
git push -u origin main
echo.
if errorlevel 1 (
    echo PUSH FAILED - see message above
) else (
    echo SUCCESS! https://github.com/Lambda2006/revconnect1-web
)
echo.
pause
