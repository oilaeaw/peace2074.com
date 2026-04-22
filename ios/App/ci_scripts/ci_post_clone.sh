#!/bin/sh
# Xcode Cloud: ci_post_clone.sh
# Runs BEFORE pod install. Installs node_modules so the Podfile's
# post_install header-patching globs can find and fix CapacitorCordova headers.

set -e

REPO_ROOT="$CI_PRIMARY_REPOSITORY_PATH"

echo "=== ci_post_clone: installing Node dependencies ==="
echo "Repo root: $REPO_ROOT"

# Install pnpm via corepack (Node 22 ships with corepack)
corepack enable
corepack prepare pnpm@latest --activate

cd "$REPO_ROOT"

# Install all workspace dependencies (frontend + nitro-api)
pnpm install --frozen-lockfile

echo "=== ci_post_clone: node_modules ready ==="
