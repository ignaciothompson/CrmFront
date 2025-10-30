# Installation and Setup

This guide gets you running locally and building for production.

## Prerequisites

- Node.js: Use Node 20 LTS (recommended) or newer
- npm: comes with Node (repo uses npm as package manager)
- Firebase CLI (optional, for local emulators): `npm i -g firebase-tools`

## Clone and install

```bash
# clone
git clone <your-repo-url> crm-dashboard-fe
cd crm-dashboard-fe

# install dependencies
npm ci
```

## Development server

```bash
# start dev server with Angular CLI
npm start
# or explicitly
ng serve
```

- Opens at `http://localhost:4200/`
- Live reload is enabled
- Uses the development configuration by default (`serve.defaultConfiguration = development`)

## Linting and formatting

Prettier is configured in `package.json`.

```bash
# format staged or entire codebase (example)
npx prettier . --write
```

## Testing

```bash
# run unit tests
npm test
```

## Firebase emulators (optional)

Local emulators are configured in `firebase.json` and a convenience script is provided.

```bash
# start Auth, Firestore and Emulator UI
npm run emulators
```

- Auth: http://localhost:9099
- Firestore: http://localhost:8090
- Emulator UI: http://localhost:4000

Data can be imported/exported via the script flags already set.

## Build

```bash
# production build (default configuration for build is production)
npm run build
# or
ng build
```

- Output goes to `dist/crm-dashboard-fe/`
- Production build uses budgets and output hashing (`angular.json`)

For a development build with source maps:

```bash
# watch dev build
npm run watch
```

## Environment variables

Angular environments are in `src/environments/`:
- `environment.development.ts` is used for dev (`production: false`)
- `environment.ts` is used for production (`production: true`)

See Environment Configuration for details on setting up Firebase keys and switching configs.
