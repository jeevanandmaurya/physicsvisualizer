@echo off
REM Sync scenes folder to public directory
echo Syncing scenes to public directory...
xcopy /E /I /Y "%~dp0scenes" "%~dp0public\scenes"
echo.
echo Sync complete!
echo.
pause
