#!/bin/bash
# GamerDrift Auto-Commit Watch
# Monitors for file changes and auto-commits every 5 minutes

REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_PATH" || exit 1

echo "======================================"
echo "GamerDrift Auto-Commit Watcher"
echo "======================================"
echo "Repository: $REPO_PATH"
echo "Auto-committing every 5 minutes"
echo "Press Ctrl+C to stop"
echo "======================================"
echo ""

LAST_HASH=""

while true; do
    sleep 300  # Wait 5 minutes
    
    # Check if there are changes
    CURRENT_HASH=$(git status --porcelain | md5sum | cut -d' ' -f1)
    
    if [ "$CURRENT_HASH" != "$LAST_HASH" ] && [ -n "$(git status --porcelain)" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📝 Changes detected - Auto-committing..."
        
        # Add all changes
        git add -A
        
        # Commit with timestamp
        git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Committed successfully"
            LAST_HASH="$CURRENT_HASH"
        else
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️ Nothing to commit"
        fi
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ No changes detected"
    fi
done
