# Versioning Guide

This project uses automated semantic versioning with [standard-version](https://github.com/conventional-changelog/standard-version) and GitHub Actions.

## How It Works

1. **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) format:
   ```
   feat: add new prayer time feature
   fix: correct Quran verse display
   docs: update README
   chore: update dependencies
   ```

2. **Automatic Releases**: When you merge to `main` or `master`:
   - GitHub Actions runs the Release workflow
   - Analyzes commits since last release
   - Bumps version based on commit types:
     - `feat:` → minor version (1.0.0 → 1.1.0)
     - `fix:` → patch version (1.0.0 → 1.0.1)
     - `BREAKING CHANGE:` → major version (1.0.0 → 2.0.0)
   - Updates CHANGELOG.md
   - Creates a git tag
   - Creates a GitHub release

3. **Manual Releases**: Use the workflow dispatch:
   - Go to Actions → Release → Run workflow
   - Choose release type: patch, minor, or major

## Local Development

Test versioning locally (dry-run):
```bash
npm run release -- --dry-run
```

## Version Scheme

Following [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backward compatible)
- **PATCH** (0.0.1): Bug fixes (backward compatible)

## Commit Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | minor |
| `fix` | Bug fix | patch |
| `docs` | Documentation only | none |
| `style` | Code style changes | none |
| `refactor` | Code refactoring | patch |
| `perf` | Performance improvements | patch |
| `test` | Adding tests | none |
| `chore` | Maintenance tasks | none |
| `ci` | CI/CD changes | none |

## Examples

### Adding a Feature
```bash
git commit -m "feat: add Islamic calendar integration"
# Results in: 1.0.0 → 1.1.0
```

### Fixing a Bug
```bash
git commit -m "fix: correct prayer time calculation for edge cases"
# Results in: 1.0.0 → 1.0.1
```

### Breaking Change
```bash
git commit -m "feat!: redesign API authentication

BREAKING CHANGE: API now requires OAuth2 instead of API keys"
# Results in: 1.0.0 → 2.0.0
```

## Changelog

All changes are automatically documented in [CHANGELOG.md](../CHANGELOG.md), organized by version and categorized by change type.
