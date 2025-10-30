# Architecture

This app uses Angular 20 with standalone components, lazy-loaded routes, and AngularFire. It mixes a standalone root with a routing NgModule for maintainability.

## Bootstrapping and Providers

The application is bootstrapped with `bootstrapApplication` and providers configured in `src/main.ts`:

```ts
bootstrapApplication(App, {
  providers: [
    provideAnimations(),
    importProvidersFrom(AppRoutingModule),
    provideCharts(withDefaultRegisterables()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (isDevMode()) connectAuthEmulator(auth, 'http://localhost:9099');
      return auth;
    }),
    provideFirestore(() => {
      const db = getFirestore();
      if (isDevMode()) connectFirestoreEmulator(db, 'localhost', 8080);
      return db;
    })
  ]
});
```

- Root component is standalone (`App`), hosts a `<router-outlet>`
- Routing providers come from `AppRoutingModule` via `importProvidersFrom`
- Firebase App/Auth/Firestore are provided at the root
- In dev mode, Auth and Firestore are connected to local emulators

## Routing and Layout

Routes are defined in `AppRoutingModule` with lazy `loadComponent` and a guarded shell layout:

- Public routes: `login`, `proyecto/:id`, `comparacion/:id`
- Protected routes are nested under `MainLayout` and guarded by `authGuard`
- Not found route maps to `NotFound`

See the Routing document for the full table.

## Authentication Guard

The `authGuard` is a functional guard using AngularFire Auth:

```ts
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const isAuthed = await new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => resolve(!!user));
  });
  if (!isAuthed) {
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};
```

- On missing session, navigates to `/login`
- Applies to all child routes under `MainLayout`

## Modules and Code Organization

- Standalone components throughout features for routing targets
- `core/` contains guards, models, and services (Auth, Proyecto, Unidad, Venta, etc.)
- `shared/` contains reusable components and layout (e.g., `MainLayout`)
- Feature areas live under `features/` and are lazy-loaded per route

## Data Access

- AngularFire is used for Auth and Firestore access
- Services in `core/services/` encapsulate reads/writes and business logic
- Emulator connections are automatic in development (from `main.ts`)

## State Management

- Local component state and Angular Signals where useful (e.g., `App` title)
- Cross-component state via services in `core/services/`

## Cross-cutting Concerns

- Error handling: bubble to UI with user-friendly messages; log in dev console
- Performance: lazy component loading by route, build optimizations, budgets in `angular.json`
- Internationalization: `@angular/localize/init` included in polyfills
