## How the app works

### Tech stack
- Angular (standalone=false components within feature NgModules)
- Angular Router (lazy-loaded feature modules)
- Angular Forms (template-driven and reactive)
- Firebase (Auth, Firestore) configured in `AppModule`

### Structure
```
src/app/
  core/            // guards, services used across features
  shared/          // layout, common components (header, sidebar, not-found)
  features/        // each feature has its own module, routing, components
    <feature>/
      <feature>-module.ts
      <feature>-routing-module.ts
      <feature>.ts / .html / .css
      components/ and pages/ subfolders
```

### App shell
- `AppModule` bootstraps `App`, registers Firebase providers, and sets global error listeners.
- `AppRoutingModule` defines the public routes:
  - `/login` is public
  - Authenticated area is nested under `MainLayout` and guarded by `authGuard`
  - Feature routes are lazy-loaded modules (`loadChildren`).
  - Public comparativas detail is exposed at `/comparacion/:id` (no auth)

### Data & services
- Feature-specific services live inside the feature folder.
- Cross-cutting services live in `core/services`.
- Prefer readonly observables from services; components subscribe via `async` pipe when feasible.

### Domain model
- Core types defined in `src/app/core/models.ts`.
- Collections:
  - `proyectos` (Proyecto): { id, nombre, tipoProyecto: Multiple|Unico, ciudad, barrio, tipo, createdAt, updatedAt }
  - `unidades` (Unidad): { id, proyectoId, ciudad, barrio, nombre, tipo, orientacion, distribucion, dormitorios, banos, pisoCategoria, tamanoM2, precioUSD, expensasUSD, extras[], visibilidad, publicacionInterna?, disponibilidad, ocupacion?, imagenUrl?, createdAt, updatedAt }
  - `contactos` (Contacto): { id, nombre, apellido, edad?, telefono, mail?, pareja, familia, preferencias?, entrevista?, entrevistaPendiente?, createdAt, updatedAt }
  - `comparativas` (Comparativa): {
      id, createdAt,
      contacto: { id, nombre, telefono, mail },
      unidades: Array<UnidadResumen> // copia denormalizada para compartir: nombre, ciudad, barrio, dormitorios, banos, tamanoM2, precioUSD, expensasUSD, extras[], lat, lng
    }
- Denormalization: `ciudad` y `barrio` se copian desde `proyecto` a cada `unidad` para filtros rápidos en UI.

### Importar datos
- Ruta `/importar` con pantalla para cargar Excel (`xlsx`), previsualizar y mapear a las colecciones.
- Soporta 3 destinos: `proyectos`, `unidades`, `contactos`.
- Cada hoja/archivo debe respetar encabezados exactos (ver `docs/importing.md`).
- Incluye botones para generar datos de demostración.

### UI patterns
- Layout components (`Header`, `Sidebar`, `MainLayout`) live under `shared/layout`.
- Feature pages are thin containers delegating logic to services and UI to presentational components.
  - Comparativas: selección/creación en `/comparativas` (interno), listado en `/listado-comparativas` (interno), y detalle público en `/comparacion/:id`.


