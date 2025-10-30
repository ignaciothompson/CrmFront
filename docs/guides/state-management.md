# State Management

Approach for local component state and shared app state.

## Local state

- Prefer Angular Signals or component class fields for transient UI state
- Derive view state from inputs and service Observables where possible

## Shared state

- Encapsulate remote state in services under `core/services/*`
- Reads: expose `Observable<T>` via AngularFire `collectionData`/`docData`
- Writes: use `async` methods that return Promises; services may emit audit events

## Patterns

- Avoid duplicating Firestore data in component state; subscribe in components and use `async` pipe
- Keep transformation logic in services for reuse
- Prefer lightweight DTOs for forms; map to models at save time

## Examples

- `ProyectoService` provides `getProyectos()` stream and CRUD methods
- `UnidadService`, `ContactoService`, `EntrevistaService`, `VentaService`, `ComparativaService` follow the same pattern
