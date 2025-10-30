# Listas Negras

Mantenimiento de contactos marcados como “Lista Negra”.

- Route: `/listas-negras` (protegida por `authGuard`)
- Component: `src/app/features/listas-negras/listas-negras.ts` (standalone)
- Depends on: `ContactoService`, `NgbModal`, shared `TypeaheadComponent`

## UI

Subheader de filtros y acciones:
- Filtro por contacto mediante `typeahead` (id/label)
- Botón Reset (btn-white btn-square)
- Botón Aplicar (btn-primary)

Tabla dentro de `frame`:
- Columnas: Nombre, Apellido, Motivo
- Acciones: Agregar (abre modal para marcar contactos)

## Datos

- `getContactos()` de `ContactoService`
- `items` contiene solo contactos con `ListaNegra: true`
- `searchItems` es `{ id, label }` para el typeahead

## Flujo

1) Cargar contactos y derivar `items` (solo lista negra)
2) Buscar/filtrar por contacto usando `selectedId`
3) “Agregar” abre `BlacklistModal` con opciones de contacto; al confirmar, marca `ListaNegra: true` con `updateContacto`

## Snippets

Typeahead en subheader:
```html
<typeahead [(ngModel)]="selectedId"
           name="blacklistSearch"
           [items]="searchItems"
           idKey="id"
           labelKey="label"
           placeholder="Escriba para filtrar...">
</typeahead>
```

Aplicar filtros:
```ts
applyFilters(): void {
  if (this.selectedId) {
    this.items = this.all.filter(c => !!c?.ListaNegra && String(c.id) === String(this.selectedId));
  } else {
    this.items = this.all.filter(c => !!c?.ListaNegra);
  }
}
```

## Consideraciones

- Desacoplar la derivación de `searchItems` a un método si crece
- Añadir mensajes de éxito/error al confirmar cambios en el modal
- Validar que el modal no repita contactos ya marcados
