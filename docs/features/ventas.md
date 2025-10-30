# Ventas

Rutas: `/ventas` (lista); modal de nueva venta accesible desde la barra lateral.

## Lista de ventas

- Componente: `features/ventas/ventas.ts`
- Datos: `VentaService.getVentas()` → ordenadas desc por fecha
- Filtros:
  - Rango de fechas (Desde/Hasta)
  - Contacto (typeahead)
  - Unidad (typeahead)
  - Tipo (`venta | renta`)

## Modal “Nueva Venta”

- Componente: `features/ventas/nueva-venta/nueva-venta.ts`
- Selecciones: `contactoId` (opcional), `unidadId` (requerido), `type` (`venta|renta`)
- Acciones al confirmar:
  - Marca la unidad como vendida/rentada (`updateUnidad` con `vendida`/`rented`)
  - Registra la venta con `VentaService.addVenta({ date, type, contacto, unidad })`
- También muestra últimas 10 ventas y permite precargar selección con `editRow`

## Consideraciones

- Mantener consistencia de estados de la unidad (vendida/rentada) con la UI de listados
- Agregar validaciones en el modal (unidad obligatoria)
