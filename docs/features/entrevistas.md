# Entrevistas

Rutas: `/entrevistas`, `/entrevistas/form`

## Lista de entrevistas

- Componente: `features/entrevistas/entrevistas.ts`
- Datos: `EntrevistaService.getEntrevistas()` (colección independiente)
- Filtros:
  - Contacto (typeahead por `contactoId`)
  - Fecha (`YYYY-MM-DD`)
- Acciones: Agregar (routerLink a `/entrevistas/form`)

Filtrado:
```ts
applyFilters(): void {
  let filtered = this.all;
  if (this.selectedId) filtered = filtered.filter(e => String(e?.contactoId) === String(this.selectedId));
  if (this.selectedDate) filtered = filtered.filter(e => String(e?.fecha) === String(this.selectedDate));
  this.items = filtered;
}
```

## Campos mostrados

- Nombre, Apellido, Fecha, Hora, Pendiente (Sí/No)

## Consideraciones

- El formulario de creación/edición vive en `features/entrevistas/form/…` (agregar doc si es requerido)
- Alinear la fuente de verdad: calendario en Dashboard también consume esta colección
