# Listado de Comparativas

Ruta: `/listado-comparativas` (protegida)

- Componente: `features/comparativas/pages/comparativas-list/comparativas-list.ts`
- Servicio: `ComparativaService`
- Filtro: typeahead por contacto

## Datos

- `getComparativas()` → Ordenadas por `createdAt` desc
- Deriva `contactoItems` (id/label) únicos para el typeahead

## Acciones

- Compartir: copia al portapapeles la URL pública `/comparacion/{id}`
- Eliminar: confirma y borra la comparativa

## UI

Subheader con filtro:
```html
<typeahead [(ngModel)]="selectedContactoId"
          [items]="contactoItems"
          idKey="id"
          labelKey="label"
          placeholder="Escriba para filtrar...">
</typeahead>
```

Tabla:
- Cliente, Teléfono, Creada (fecha/hora), Unidades (resumen), Acciones

Formateo de fecha:
```ts
formatDate(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}
```

## Consideraciones

- Manejar errores de clipboard en navegadores sin permiso
- Añadir paginación si la lista crece
- Confirmación de borrado ya implementada con `confirm()`
