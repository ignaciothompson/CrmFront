# Layout (Shared)

Standalone layout shell and building blocks for page structure and navigation.

## MainLayout

- Selector: `app-main-layout`
- File: `src/app/shared/layout/main-layout.ts`
- Purpose: provides the global shell (sidebar + header) and hosts the `router-outlet`
- Behavior: updates `pageTitle` from deepest activated route `data.title`

Template structure:
```html
<div class="layout d-flex">
  <div class="sidebar-wrapper">
    <app-sidebar></app-sidebar>
  </div>
  <div class="content-wrapper d-flex flex-column flex-grow-1">
    <app-header [title]="pageTitle" [userName]="userName"></app-header>
    <main class="app-content flex-grow-1 p-3">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
```

Routing usage:
- Used as the `component` for the guarded shell in `AppRoutingModule`
- Child routes render inside the `<router-outlet>`

## Header

- Selector: `app-header`
- File: `src/app/shared/layout/header/header.ts`
- Inputs:
  - `title: string`
  - `userName: string`
- Actions:
  - Home: navigates to `/dashboard`
  - User menu: settings (`/usuario`) and Log Out

Usage:
```html
<app-header [title]="pageTitle" [userName]="userName"></app-header>
```

## Sidebar

- Selector: `app-sidebar`
- File: `src/app/shared/layout/sidebar/sidebar.ts`
- Purpose: primary navigation and entry points
- Items: Nueva Venta (modal), Ventas, Proyectos, Contactos, Comparativas (crear/listado), Meets, Listas negras, Reportes, Monitor Eventos, Importar
- Behavior: `openNuevaVenta()` lazy-loads and opens `NuevaVentaModal`

Usage:
```html
<app-sidebar></app-sidebar>
```

## Styling

- Wrap page content in the frame pattern inside the content area
- Buttons follow `btn c-btn` variants; inputs use `form-control c-input`; labels use `c-label`
- Use utilities from `global.css` for spacing and layout
