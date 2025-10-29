## Routing

### App-level routing
- Defined in `src/app/app-routing-module.ts`.
- Public route: `/login` → `Login` component.
- Authenticated area: uses `MainLayout` and `authGuard`.
- Features are lazy-loaded modules via `loadChildren`.

#### Main routes
- `/dashboard` → Dashboard
- `/unidades` → Proyectos/Unidades
- `/contactos` → Contactos
- `/comparativas` → Crear/seleccionar unidades para comparar (pantalla interna)
- `/listado-comparativas` → Listado de comparativas guardadas (pantalla interna)
- `/entrevistas` → Entrevistas/Agenda
- `/listas-negras` → Listas negras
- `/importar` → Importar datos (Excel)

#### Public routes
- `/comparacion/:id` → Detalle público de una comparativa (sin login)

### Feature routing
- Each feature has `<feature>-routing-module.ts` with `Routes` pointing to its page components.
```ts
const routes: Routes = [
  { path: '', component: Unidades },
  { path: 'form', component: UnidadForm },
  { path: 'form/:id', component: UnidadForm },
];
```

For Comparativas:
```ts
// src/app/features/comparativas/comparativas-routing-module.ts
const routes: Routes = [
  { path: '', component: Comparativas }, // /comparativas
];

// Public module: src/app/features/comparativas/comparativas-public-module.ts (lazy-loaded at /comparacion/:id)
const routes: Routes = [
  { path: '', component: ComparativaDetailPage }, // /comparacion/:id
];
```

### Adding a new feature route (lazy)
1) Create `<Feature>Module` with a `<Feature>RoutingModule`.
2) Add to `AppRoutingModule`:
```ts
{ path: 'my-feature', data: { title: 'My Feature' }, loadChildren: () => import('./features/my-feature/my-feature-module').then(m => m.MyFeatureModule) }
```

### Guarding routes
- Use `authGuard` in parent `MainLayout` to protect child routes.
- For feature-specific guards, add `canActivate` in feature routes.


