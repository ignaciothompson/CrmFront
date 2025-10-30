# NotFound (Shared)

Simple catch-all route component for unknown paths.

- Selector: `app-not-found`
- File: `src/app/shared/not-found/not-found.ts`
- Template: minimal message; customize as needed (`not-found.html`)

Routing
- Declared as the wildcard route target in `AppRoutingModule`:
  - `{ path: '**', component: NotFound }`

Usage
- No inputs; used only by the router for unmatched URLs
- You may enhance the template with a link back to `/dashboard`
