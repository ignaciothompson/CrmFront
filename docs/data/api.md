# API (Service Layer)

Angular services encapsulate Firestore access. Reads are Observables; writes return Promises.

## ProyectoService
- `getProyectos(): Observable<any[]>`
- `addProyecto(proyecto)` → sets `unidadesCount: 0`
- `getProyectoById(id): Observable<any|undefined>`
- `updateProyecto(id, changes)`
- `deleteProyecto(id)`

## UnidadService
- `getUnidades(): Observable<any[]>`
- `addUnidad(unidad)` → emits audit event; increments `proyectos/{id}.unidadesCount`
- `getUnidadById(id): Observable<any|undefined>`
- `updateUnidad(id, changes)` → emits edit audit event
- `deleteUnidad(id)` → emits delete audit event; decrements `unidadesCount`

## ContactoService
- `getContactos(): Observable<any[]>`
- `addContacto(contacto)` → audit new
- `getContactoById(id): Observable<any|undefined>`
- `updateContacto(id, changes)` → audit edit
- `deleteContacto(id)` → audit delete

## EntrevistaService
- `getEntrevistas(): Observable<any[]>`
- `addEntrevista(entrevista)` → audit new
- `updateEntrevista(id, changes)` → audit edit
- `deleteEntrevista(id)` → audit delete

## VentaService
- `getVentas(): Observable<VentaRecord[]>`
- `addVenta(payload: VentaRecord)` → ensures `date` is set

## ComparativaService
- `getComparativas(): Observable<any[]>`
- `getComparativa(id): Observable<any>`
- `addComparativa(payload)`
- `deleteComparativa(id)`

## Auth Guard
- `authGuard`: functional `CanActivateFn` that redirects to `/login` when no user is present
