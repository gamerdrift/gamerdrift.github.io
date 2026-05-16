#!/bin/bash
# Auto-commit hook for GamerDrift website
# This script automatically commits changes to git when files are saved

echo "✅ GamerDrift Auto-Commit Hook Activated"

# Get list of modified files
MODIFIED_FILES=$(git diff --cached --name-only)

if [ -z "$MODIFIED_FILES" ]; then
    echo "ℹ️ No staged changes detected"
    exit 0
fi

echo "📝 Modified files:"
echo "$MODIFIED_FILES"

# Determine commit message based on modified files
COMMIT_MSG="🔄 Auto-update: "

if echo "$MODIFIED_FILES" | grep -q "index.html"; then
    COMMIT_MSG="${COMMIT_MSG}Updated main website"
fi

if echo "$MODIFIED_FILES" | grep -q "\.md$"; then
    COMMIT_MSG="${COMMIT_MSG} + Documentation"
fi

if echo "$MODIFIED_FILES" | grep -q "\.yml$"; then
    COMMIT_MSG="${COMMIT_MSG} + CI/CD Configuration"
fi

if [ "$COMMIT_MSG" = "🔄 Auto-update: " ]; then
    COMMIT_MSG="🔄 Auto-update: Website changes - $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "💾 Committing: $COMMIT_MSG"

# Add timestamp
COMMIT_MSG="${COMMIT_MSG} @ $(date '+%H:%M:%S')"

exit 0
