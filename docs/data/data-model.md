# Data Model

Core entities persisted in Firestore and used across the app.

## Proyecto
- `id`, `nombre`, `tipoProyecto: 'Multiple' | 'Unico'`
- `ciudad`, `barrio`, `tipo` (residencia)
- `createdAt`, `updatedAt`
- Derived counters: `unidadesCount`

## Unidad
- `id`, `proyectoId`, denormalized `ciudad`, `barrio`
- Attributes: `nombre`, `tipo`, `orientacion`, `distribucion`, `dormitorios`, `banos`, `pisoCategoria`
- Metrics: `tamanoM2`, `precioUSD`, `expensasUSD`
- Status: `visibilidad`, `publicacionInterna?`, `disponibilidad`, `ocupacion?`
- Media: `imagenUrl?`
- Audit: `activo?`, `createdAt?`, `updatedAt?`

## Contacto
- `id`, `nombre`, `apellido`, `telefono`, `mail?`
- Household: `pareja`, `familia`
- Preferencias: `ciudad?`, `barrio?`, `tipo?`, `cuartos?`, `precio? { min?, max? }`
- Entrevista (planned): `proyectoId?`, `unidadId?`, `comentario?`, `fechaISO?`, `hora?`, `lugar?`, `entrevistaPendiente?`
- Audit: `createdAt?`, `updatedAt?`

## Entrevista
- Stored as its own collection for planned/completed interviews
- Links to `proyectoId`/`unidadId` as needed; service records audit events

## Venta
- `id?`, `date` (epoch ms), `type: 'venta' | 'renta'`
- `contacto` summary, `unidad` summary

## Comparativa
- Arbitrary payload for comparisons; stored under `comparativas/{id}`

## Evento (audit)
- Event log entries in `eventos` with `tipo` ('Nuevo'|'Editado'|'Eliminado'), `categoria`, `fecha`, and `data` { current, previous?, changes? }
