# Reportes

Panel de métricas con filtros de rango y agrupaciones para entrevistas y unidades.

- Route: `/reportes` (protegida por `authGuard`)
- Component: `src/app/features/reportes/reportes.ts` (standalone)
- Charts: `ng2-charts` (Chart.js)
- Datos: `UnidadService`, `ContactoService` (con fallback de `demoData.json`)

## Filtros

- Rango de fechas: `Desde` / `Hasta` (`type="date"`)
- Botones: Reset (btn-white btn-square), Aplicar (btn-primary)
- El rango afecta todas las visualizaciones

## Visualizaciones

1) Línea: Unidades registradas vs vendidas
- Series: `Registradas`, `Vendidas`
- Agrupación automática por: Mes, Semana o Día (según rango)
- Modo manual con botones de segmentación

2) Barras: Entrevistas por periodo
- Agrupación automática o manual por Mes/Semana/Día
- Eje X rotulado según modo

3) Donut: Unidades por ciudad
- Suma unidades por `ciudad` (o campo análogo)

## Agrupación automática

- Determina el modo según la diferencia entre inicio y fin:
  - ≥ ~6 meses → Mes
  - ≥ ~1 mes y < ~6 meses → Semana
  - < ~1 mes → Día

## Notas de datos

- Fechas de unidades: usa `entrega | fecha | createdAt | updatedAt` (el primero válido)
- “Vendida”: verdadero si `vendida | sold | disponibilidad === 'Vendida'`
- Fechas de entrevistas: `entrevista.fechaISO | Entrevista.Fecha | entrevista.fecha | fechaEntrevista`

## Interacción y estilos

- `maintainAspectRatio: false` y CSS `.chart-fill` para ocupar alto disponible
- Botones segmentados (`btn c-btn btn-small btn-white`) con estado `active`

## Extensiones sugeridas

- Quitar fallback de `demoData.json` en producción
- Filtros adicionales por ciudad/barrio/tipo
- Exportación a CSV/PNG
