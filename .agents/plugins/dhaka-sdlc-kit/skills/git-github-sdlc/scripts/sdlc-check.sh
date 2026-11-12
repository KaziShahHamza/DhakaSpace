#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo " Running DhakaSpace SDLC Pre-Commit Check "
echo "=========================================="

# 1. Check Git status
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Error: Not inside a Git repository."
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || true)
if [ -z "$CURRENT_BRANCH" ]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
fi
echo "✓ Current branch: $CURRENT_BRANCH"

# 2. Secret & Sensitive File Leakage Scan
echo "Scanning for sensitive files..."
LEAKED_FILES=$(git ls-files --stage | grep -E '(\.env(\..+)?|\.pem|\.key)$' | grep -v '\.env\.example$' || true)
if [ -n "$LEAKED_FILES" ]; then
  echo "❌ CRITICAL: Sensitive file(s) tracked in Git index:"
  echo "$LEAKED_FILES"
  exit 1
fi

STAGED_SECRETS=$(git diff --cached --name-only | grep -E '(\.env(\..+)?|\.pem|\.key)$' | grep -v '\.env\.example$' || true)
if [ -n "$STAGED_SECRETS" ]; then
  echo "❌ CRITICAL: Sensitive file(s) are staged for commit:"
  echo "$STAGED_SECRETS"
  exit 1
fi
echo "✓ No secret files staged or tracked."

# 3. JSON Configuration Validation
echo "Validating JSON syntax across project..."
for json_file in $(find . -name "*.json" ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.git/*"); do
  if ! node -e "JSON.parse(require('fs').readFileSync('$json_file', 'utf8'))" >/dev/null 2>&1; then
    echo "❌ Error: Invalid JSON in $json_file"
    exit 1
  fi
done
echo "✓ All JSON files valid."

# 4. Monorepo Summary
echo "------------------------------------------"
echo "Working Tree Status:"
git status -s
echo "------------------------------------------"
echo "✓ SDLC pre-commit automated checks PASSED."
exit 0
