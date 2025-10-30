# Linting and Formatting

This project enforces formatting using Prettier. ESLint is not configured in this repo.

## Prettier configuration

Defined in `package.json`:

```json
{
  "prettier": {
    "printWidth": 100,
    "singleQuote": true,
    "overrides": [
      {
        "files": "*.html",
        "options": { "parser": "angular" }
      }
    ]
  }
}
```

## Commands

- Check formatting:
  ```bash
  npx prettier --check .
  ```
- Fix formatting:
  ```bash
  npx prettier --write .
  ```

Integrate the `--check` command in CI to gate PRs.
