@echo off
echo 🚀 Starting Sync and Push...

:: 1. Run sync to update notes and index
echo 📦 Syncing notes...
call npm run sync

:: 2. Git operations
echo 🌿 Staging changes...
git add .

echo 📝 Committing changes...
set msg="Update notes: %date% %time%"
git commit -m %msg%

echo 📤 Pushing to GitHub...
git push

echo ✨ Done!
pause
