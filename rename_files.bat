@echo off
REM Batch script to rename .js to .ts and .jsx to .tsx recursively

for /r %%f in (*.jsx) do (
    move "%%f" "%%~dpnf.tsx"
)

for /r %%f in (*.js) do (
    move "%%f" "%%~dpnf.ts"
)

echo Renaming complete.
