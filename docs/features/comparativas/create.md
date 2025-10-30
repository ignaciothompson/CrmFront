# Crear Comparativa

Ruta: `/comparativas` (protegida)

- Componente: `features/comparativas/pages/comparativas-create/comparativas.ts`
- Dependencias: `UnidadService`, `ProyectoService`, `ComparativaService`, `NgbModal`, `TypeaheadComponent`

## Objetivo

Filtrar unidades por múltiples criterios, seleccionar 2+ unidades y confirmar para crear una comparativa asociada (opcionalmente) a un contacto.

## Datos y mapeo

- Carga inicial: `getUnidades()` → `all` e `items`
- Catálogos: ciudades y barrios derivados; extras desde `EXTRAS_CATALOG`
- Normalización (`compatMap`): adapta campos heterogéneos (precio, tamaño, dormitorios, etc.) y estados (visibilidad, disponibilidad)

## Filtros disponibles

- Nombre (typeahead por unidad)
- Proyecto (typeahead) [bloque comentado]
- Localidad, Barrio, Tipo de residencia
- Ver: `Publicado` | `No publicado` + Interna (`Activo | Stand By | Vendido`)
- Disponibilidad
- Orientación, Distribución, Piso
- Dormitorios (1, 2, 3, 4+), Baños (1, 2, 3, 4+)
- Tamaño (m²), Precio (USD), Expensas (USD)
- Extras (checkbox multiples)

Aplicación de filtros: `applyFilters()` produce `items` a partir de `all`.

## Selección y comparar

- Estado interno `selectedIdSet` (Set de ids)
- Tarjetas clickeables; muestra badge “Seleccionada”
- Botón flotante “Comparar (n)” aparece con 2+ seleccionadas
- `openCompareModal($event)`: abre modal asíncrono (lazy import), pasa unidades seleccionadas y espera resultado

## Confirmación

- En `modalRef.result`, arma snapshot denormalizado de unidades y datos opcionales del contacto
- Persiste con `comparativaService.addComparativa(payload)`
- Redirige a `/comparacion/{id}` al finalizar

## UI fragmentos

Botón comparar flotante:
```html
@if (selectedCount() >= 2) {
  <div class="compare-floating">
    <button class="btn c-btn btn-small btn-primary" (click)="openCompareModal($event)">Comparar ({{ selectedCount() }})</button>
  </div>
}
```

Typeahead de nombre:
```html
<typeahead [(ngModel)]="nameSelectedId"
           [items]="nameItems"
           idKey="id"
           labelKey="label"
           placeholder="Buscar unidad..."
           (ngModelChange)="applyFilters()">
</typeahead>
```

## Consideraciones

- Validar mínimo 2 unidades antes de abrir el modal
- Mantener `compatMap` alineado con el modelo de `Unidad`
- UX: recordar filtros expandidos (`openBlocks`) entre sesiones si es necesario
