# CI/CD

Recommended checks and a minimal CI pipeline.

## Required checks

- Install dependencies
- Lint/format check (Prettier)
- Build (production)
- Unit tests

## GitHub Actions example

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prettier --check .
      - run: npm run build
      - run: npm test --if-present
```

## Releases

- Maintain `docs/meta/CHANGELOG.md`
- Tag releases using semantic versioning
