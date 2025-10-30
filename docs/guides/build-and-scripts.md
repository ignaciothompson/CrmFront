# Build and Scripts

Common scripts and build settings.

## NPM scripts

```json
{
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test",
  "emulators": "firebase emulators:start --import=.emulator-data --export-on-exit"
}
```

- `start`: dev server on `http://localhost:4200/`
- `build`: production build by default (see Angular config)
- `watch`: development build with source maps
- `test`: run unit tests with Karma
- `emulators`: start Firebase Auth/Firestore emulators with import/export

## Angular build settings

- Entry: `src/main.ts`
- Polyfills: `zone.js`, `@angular/localize/init`
- Styles included:
  - `bootstrap/dist/css/bootstrap.min.css`
  - `@fortawesome/fontawesome-free/css/all.min.css`
  - `src/app/css/main.css`
  - `src/styles.css`
- Assets copied from `public/` and `src/app/assets/` → `dist/.../assets`

## Production configuration

- Output hashing: `all`
- Budgets:
  - initial: warn at 1.5MB, error at 2MB
  - anyComponentStyle: warn at 10kB, error at 20kB

## Development configuration

- `optimization: false`
- `extractLicenses: false`
- `sourceMap: true`
