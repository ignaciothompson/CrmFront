# Unidades

Rutas: `/unidades` (lista), `/unidades/form`, `/unidades/form/:id`, público `/proyecto/:id`

## Lista de unidades

- Componente: `features/unidades/unidades.ts`
- Filtros: Ciudad (`norte|sur|este`), Barrio (dependiente)
- Datos: `UnidadService.getUnidades()`
- Acciones:
  - Nuevo → `/unidades/form`
  - Editar unidad → `/unidades/form/:id`
  - Compartir proyecto → abre `/proyecto/{id}` (página pública)
  - Editar proyecto → `/unidades/form?proyectoId=...&editProyecto=1`
  - Eliminar unidad (confirm)
  - Eliminar proyecto + unidades vía `DeleteModal`

## Formulario de unidad

- Componente: `features/unidades/unidad-form/unidad-form.ts`
- Flujos:
  - Alcance `proyecto` (agregar múltiples unidades asociadas) o `unica`
  - Proyecto `existente` o `nuevo` (autocreación del proyecto si no existe)
  - En modo proyecto: tabla `sessionUnits` muestra unidades guardadas para ese proyecto; se puede editar/eliminar en línea
- Modelado flexible por tipo:
  - Apartamento: dormitorios, baños, m2 (internos/totales), piso, orientación, extras
  - Casa: superficies (edificada/terreno), antigüedad, condición, extras
  - Chacra/Campo: hectáreas, m2, tipo de construcción, acceso, infraestructura, servicios (luz/agua/internet), aptitud de suelo, IP, mejoras
- Catálogos: ciudades con barrios (curados + datos), `EXTRAS_CATALOG`
- Herencia desde proyecto: al seleccionar `proyectoId`, se denormaliza ciudad/barrio/dirección en la unidad

Guardar:
- Crea/actualiza unidad; en flujo proyecto `addAndRepeat()` agrega y prepara la siguiente (clonando configuración)

## Consideraciones

- Validaciones mínimas en `validateRequiredForAdd()` para el flujo de proyecto
- `getPrimarySize()` produce un resumen de tamaño por tipo de unidad
- Contador `unidadesCount` del proyecto se mantiene en el servicio al crear/eliminar unidades
