## Components

### Conventions
- File naming: one component per folder: `feature/.../<name>/<name>.ts|html|css` or directly under feature for simple pages.
- Class name: `PascalCase` (e.g., `Unidades`). Selector: `app-` prefix (e.g., `app-unidades`).
- Keep containers thin: data orchestration only; push UI into presentational components.

### Creating a page component
1) Generate files next to the feature module:
```
features/<feature>/<feature>.ts
features/<feature>/<feature>.html
features/<feature>/<feature>.css
```
2) Add it to `<feature>-module.ts` declarations.
3) Add a route in `<feature>-routing-module.ts` using `component: <FeatureClass>`.

### Inputs, Outputs
```ts
@Component({ selector: 'app-example', templateUrl: './example.html' })
export class Example {
  @Input() title = '';
  @Output() save = new EventEmitter<void>();
}
```

### Dependency Injection
- Inject services via constructor parameters.
- Use feature-local services for feature concerns; core services for cross-cutting.

### Standalone vs NgModule
- Current code uses `standalone: false` with feature NgModules.
- You may opt into standalone by setting `standalone: true` and declaring `imports: [...]` in the component; remove it from the module declarations and adjust routing to `loadComponent`.

### Comparativas components
- `Comparativas` (page) → filtros + cards para seleccionar unidades y crear una comparativa.
- `CompareModal` (modal) → confirma unidades, elige `Contacto` (typeahead) y guarda en Firestore.
- `ComparativasListPage` (page) → tabla con Cliente, fecha, Unidades; acciones de Compartir (copia `/comparacion/:id`) y Eliminar.
- `ComparativaDetailPage` (page) → vista pública: header con cliente, tabla comparativa y mapa con marcadores de las unidades.


