# Compare Modal

Modal usado en la creación de comparativas para confirmar unidades y seleccionar un contacto.

- Componente: `features/comparativas/components/compare-modal/compare-modal.ts`
- Invocación: desde `/comparativas` vía `NgbModal`
- Entradas: `@Input() unidades: any[]`
- Servicios: `ContactoService` para cargar opciones de contacto

## Flujo

1) Carga contactos y arma `contactoItems` `{ id, label }` para el selector
2) Permite eliminar unidades seleccionadas antes de confirmar
3) Al confirmar, devuelve `{ contacto }` via `activeModal.close(...)`

## Uso

Apertura desde crear comparativas:
```ts
import('../../components/compare-modal/compare-modal').then(m => {
  const modalRef = this.modalService.open(m.CompareModal, { size: 'lg', backdrop: 'static' });
  (modalRef.componentInstance as any).unidades = selectedUnits;
  modalRef.result.then(result => { /* payload build + addComparativa */ }).catch(() => {});
});
```

Selector de contacto (typeahead):
```html
<typeahead [(ngModel)]="selectedContactoId"
           [items]="contactoItems"
           idKey="id"
           labelKey="label"
           placeholder="Cliente...">
</typeahead>
```

## Consideraciones

- Validar que queden 2+ unidades antes de confirmar
- Mostrar feedback si no se selecciona contacto (opcional, ya que es nullable)
- Evitar duplicar unidades al reabrir el modal
