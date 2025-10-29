## Importing data (Excel)

The app provides a simple import screen at `/importar` to load Excel files into Firestore.

### Supported targets
- Proyectos → `proyectos` collection
- Unidades → `unidades` collection
- Contactos → `contactos` collection

### File format
- Accepts `.xlsx` / `.xls`.
- Use exact headers listed below. Order matters.
- Values must be valid for the enums/constraints.

#### Proyectos headers
```
nombre, tipoProyecto, ciudad, barrio, tipo
```
- `tipoProyecto`: `Multiple` | `Unico`
- `ciudad`: `Montevideo` | `Maldonado` | `Canelones`
- `tipo`: `Casa` | `Apartamento` | `Complejo`

#### Unidades headers
```
proyectoId, ciudad, barrio, nombre, tipo, orientacion, distribucion, dormitorios, banos, pisoCategoria, tamanoM2, precioUSD, expensasUSD, extras, visibilidad, publicacionInterna, disponibilidad, ocupacion, imagenUrl
```
- `proyectoId`: Firestore doc ID or logical ID you later reconcile
- `ciudad`: `Montevideo` | `Maldonado` | `Canelones`
- `orientacion`: `Norte` | `Noreste` | `Este` | `Sudeste` | `Sur` | `Suroeste` | `Oeste` | `Noroeste`
- `distribucion`: `Frente/Esquinero` | `Frente/Central` | `Contrafrente/Esquinero` | `Contrafrente/Central` | `Lateral` | `Inferior`
- `pisoCategoria`: `Bajo` | `Medio` | `Alto`
- `extras`: comma-separated labels from: `Servicio, Garage, Terraza, Estufa a leña, Jacuzzi, Parrillero, Piscina, Loft, Duplex, Triplex, Penthouse`
- `visibilidad`: `Publicado` | `No publicado` (if `No publicado`, set `publicacionInterna`: `Activo` | `Stand By` | `Vendido`)
- `disponibilidad`: one of: `No disponible`, `Disponible: publicada`, `Disponible: reventa publicada`, `Disponible: reventa no publicada`, `Disponible: con renta publicada`, `Disponible: con renta no publicada`, `Reservada para venta`, `Reservada por promotor`, `Vendida`
- `ocupacion`: `A ocupar` | `1 a 6 meses` | `7 meses 1 año` | `1 a 2 años` | `Mas de 2 años`

#### Contactos headers
```
nombre, apellido, edad, telefono, mail, pareja, familia, pref_ciudad, pref_barrio, pref_tipo, pref_cuartos, pref_precio_min, pref_precio_max, entrevistaPendiente, ent_proyectoId, ent_unidadId, ent_comentario, ent_fecha, ent_hora, ent_lugar
```
- booleans as `true` / `false`
- `pref_tipo`: `Casa` | `Apartamento` | `Complejo`
- `ent_fecha`: `YYYY-MM-DD`, `ent_hora`: `HH:mm`

### Workflow
1. Navigate to `/importar`.
2. Select the target (Proyectos/Unidades/Contactos).
3. Choose a file and preview the first rows.
4. Click Importar to persist into Firestore.
5. Optionally, click “Generar demo” to seed sample data.

### Under the hood
- Parsing via `xlsx`.
- Mappers implemented in `src/app/features/importar/importar.ts`:
  - `mapProyecto(row)` → `Proyecto`
  - `mapUnidad(row)` → `Unidad`
  - `mapContacto(row)` → `Contacto`
- Extras are parsed from comma-separated strings into a `string[]`.


