# Routing

This app uses a guarded shell layout with lazy-loaded standalone components.

## Route map

Public routes (no auth):

- `/login` → `Login`
- `/proyecto/:id` → `UnidadesShared` (public project share)
- `/comparacion/:id` → `ComparativaDetailPage` (public comparativa share)

Protected routes (under `MainLayout`, guarded by `authGuard`):

- `/` → redirects to `/dashboard`
- `/dashboard` → `Dashboard` (data: title = Dashboard)
- `/ventas` → `VentasPage` (data: title = Ventas)
- `/contactos` → `Contactos` (data: title = Contactos)
- `/contactos/form` → `ContactoForm` (data: title = Contacto)
- `/contactos/form/:id` → `ContactoForm` (edit mode)
- `/unidades` → `Unidades` (data: title = Listado de Proyectos)
- `/unidades/form` → `UnidadForm` (data: title = Proyecto)
- `/unidades/form/:id` → `UnidadForm` (edit mode)
- `/comparativas` → `Comparativas` (data: title = Crear Comparativas)
- `/listado-comparativas` → `ComparativasListPage` (data: title = Comparativas)
- `/reportes` → `Reportes` (data: title = Reportes)
- `/monitor-eventos` → `MonitorEventosComponent` (data: title = Monitor de Eventos)
- `/listas-negras` → `ListasNegras` (data: title = Listas negras)
- `/entrevistas` → `Entrevistas` (data: title = Entrevistas)
- `/entrevistas/form` → `EntrevistaForm` (data: title = Entrevista)
- `/usuario` → `Usuario` (data: title = Usuario)
- `/importar` → `Importar` (data: title = Importar)

Fallback:

- `**` → `NotFound`

## Lazy loading

All route targets are loaded via `loadComponent` to minimize initial bundle size. The shell `MainLayout` is the only eagerly referenced component in the protected tree.

## Guarding

- `authGuard` is applied at the `MainLayout` level, protecting all child routes.
- On unauthenticated access, it redirects to `/login`.

## Titles

Pages set a `data.title` property in the route where applicable. Use this to update the document title and breadcrumbs if needed.

## Navigation tips

- Public shared routes (`/proyecto/:id`, `/comparacion/:id`) must not rely on authenticated state.
- Prefer route parameters for entity ids and query params for filters/sort.


