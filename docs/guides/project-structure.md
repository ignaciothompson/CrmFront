# Project Structure

High-level layout and responsibilities of key folders.

```
crm-dashboard-fe/
├─ docs/                         # Documentation (GitBook navigation in SUMMARY.md)
├─ public/                       # Static assets copied to build
├─ scripts/                      # Utility scripts (e.g., set-admin.js)
├─ src/
│  ├─ app/
│  │  ├─ app.*                   # Root component, routing module, global app styles
│  │  ├─ assets/                 # App-specific images and assets
│  │  ├─ core/                   # Cross-cutting concerns
│  │  │  ├─ guards/              # Route guards (e.g., auth-guard)
│  │  │  ├─ models/              # Domain models (e.g., evento.model.ts)
│  │  │  ├─ services/            # Data/services (auth, proyecto, unidad, venta, etc.)
│  │  │  └─ models.ts            # Shared model exports
│  │  ├─ css/                    # Global CSS (variables, components, utilities)
│  │  ├─ features/               # Feature modules/pages
│  │  │  ├─ auth/                # Login
│  │  │  ├─ comparativas/        # Comparisons (components, pages)
│  │  │  ├─ contactos/           # Contacts (list, form)
│  │  │  ├─ dashboard/           # Dashboard
│  │  │  ├─ entrevistas/         # Interviews (components, form)
│  │  │  ├─ importar/            # Import flows
│  │  │  ├─ listas-negras/       # Blacklist
│  │  │  ├─ monitor-eventos/     # Event monitor
│  │  │  ├─ reportes/            # Reports
│  │  │  ├─ unidades/            # Units (forms, modals, shared)
│  │  │  ├─ usuario/             # User profile/settings
│  │  │  └─ ventas/              # Sales (new sale)
│  │  ├─ shared/                 # Shared components/layout/not-found
│  │  │  ├─ components/          # Reusable UI (e.g., typeahead)
│  │  │  ├─ layout/              # Shell, navbar, sidebar, footer
│  │  │  └─ shared-module.ts     # Shared module bundle
│  │  └─ app-routing-module.ts   # Route definitions
│  ├─ environments/              # Angular env files (development, production)
│  ├─ index.html                 # App HTML entry
│  ├─ main.ts                    # Angular bootstrap entry
│  └─ styles.css                 # Global stylesheet included by Angular build
├─ angular.json                  # Angular CLI project/build config
├─ firebase.json                 # Firebase emulators + Firestore rules mapping
├─ firestore.rules               # Firestore security rules
├─ vercel.json                   # Vercel rewrites (SPA routing)
├─ package.json                  # Dependencies, scripts, Prettier config
├─ tsconfig*.json                # TypeScript and Angular compiler configs
└─ README.md                     # Angular CLI starter readme
```

## Conventions

- Features are grouped under `src/app/features/<feature>` with their own styles, templates, and logic
- Cross-cutting services and models live in `src/app/core/`
- Reusable UI lives in `src/app/shared/`
- Global CSS is split into base (`src/styles.css`) and app-level CSS (`src/app/css/*`)
- Static assets are served from `public/` and `src/app/assets/` (the latter is copied to `assets/` at build time)

## Build inputs/outputs

- Entry point: `src/main.ts`
- Styles included: Bootstrap, FontAwesome, `src/app/css/main.css`, `src/styles.css` (see `angular.json`)
- Build output: `dist/crm-dashboard-fe/`
