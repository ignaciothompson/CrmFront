# Firestore

Collections and access patterns used by the application.

## Collections

- `proyectos` — project metadata; includes `unidadesCount`
- `unidades` — units linked to `proyectoId`; denormalized city/barrio for filtering
- `contactos` — contacts with preferences and interview planning fields
- `entrevistas` — interview records
- `ventas` — sales/rent records
- `comparativas` — saved comparisons
- `eventos` — audit log (see Monitor de Eventos)

## Access patterns

- Reads: AngularFire `collectionData`/`docData` with `{ idField: 'id' }`
- Writes: `addDoc`, `updateDoc`, `deleteDoc` via service methods
- Counters: `proyectos.unidadesCount` maintained on unidad create/delete

## Emulators

In development, Auth and Firestore are connected to local emulators from `main.ts`. Start via:

```bash
npm run emulators
```

- Auth: `http://localhost:9099`
- Firestore: `http://localhost:8090` (UI at `http://localhost:4000`)

## Indexes

No custom composite indexes are defined here. Add indexes as queries evolve.
