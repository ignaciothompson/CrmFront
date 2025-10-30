# Environment Configuration

Configure environment profiles and Firebase settings.

## Files and profiles

Angular uses the files in `src/environments/`:

- `environment.development.ts`
  - `production: false`
  - Development Firebase config (placeholder values included)
- `environment.ts`
  - `production: true`
  - Production Firebase config (real project keys)

The Angular CLI selects configurations as follows:
- `ng serve` defaults to `development` (see `serve.defaultConfiguration`)
- `ng build` defaults to `production` (see `build.defaultConfiguration`)

## Firebase configuration

Each environment exports an `environment` object with a `firebase` section, for example:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: '... ',
    authDomain: '... ',
    projectId: '... ',
    storageBucket: '... ',
    messagingSenderId: '... ',
    appId: '... ',
  },
};
```

Populate the development values with a non-production Firebase project. The production values should be your live project settings.

## Local emulators (optional)

`firebase.json` configures local emulators for Auth and Firestore. Start them via:

```bash
npm run emulators
```

- Auth: `http://localhost:9099`
- Firestore: `http://localhost:8090`
- Emulator UI: `http://localhost:4000`

If using emulators, ensure your Angular services point to the emulator ports (e.g., via AngularFire `connectAuthEmulator` and `connectFirestoreEmulator`) in development mode.

## Switching configurations

- Development server (uses development env):
  ```bash
  ng serve
  ```
- Production build (uses production env):
  ```bash
  ng build
  ```

## Deployment notes

- The SPA rewrite is configured in `vercel.json` to route all paths to `index.html`.
- Ensure production Firebase keys in `environment.ts` are valid for the deployed domain(s).
