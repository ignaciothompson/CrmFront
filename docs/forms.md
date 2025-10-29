## Forms

### Template-driven forms
- Import `FormsModule` in the feature module.
- Bind with `[(ngModel)]` for simple state.
```html
<input [(ngModel)]="name" name="name" class="form-control c-input">
```
- Disable controls with property binding:
```html
<select [disabled]="isLocked"></select>
```

### Reactive forms
- Import `ReactiveFormsModule` in the app or feature module.
```ts
this.form = new FormGroup({
  name: new FormControl(''),
  email: new FormControl('', { nonNullable: true })
});
```
```html
<form [formGroup]="form">
  <input formControlName="name">
  <input formControlName="email">
</form>
```
- Programmatic enable/disable:
```ts
this.form.get('name')!.disable();
```

### Validation
- Template-driven: use `required`, `minlength`, etc. and `ngModel` state.
- Reactive: compose validators in control config and show errors with `form.controls['name'].errors`.

### Unidades form specifics
- `Proyecto` seleccionable con typeahead; al elegirlo se denormaliza `ciudad` y `barrio`.
- `Extras` administrados como array de strings; UI de checkboxes ligada a `model.extras`.
- Campos básicos de proyecto/unidad se guardan vía `UnidadService.addUnidad`/`updateUnidad`.

### Importar pantalla
- Ubicación: `/importar`.
- Selecciona destino (`proyectos` | `unidades` | `contactos`).
- Carga Excel (`.xlsx/.xls`) y previsualiza primeras filas.
- Botón Importar ejecuta mappers y persiste en Firestore.
- Botón Generar demo crea registros de ejemplo en la colección seleccionada.

