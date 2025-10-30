# Typeahead (Shared)

Standalone component wrapping `@ng-bootstrap/ng-bootstrap` typeahead with a simple id/label API and ControlValueAccessor support.

- Selector: `typeahead`
- File: `src/app/shared/components/typeahead/typeahead.ts`
- Standalone: yes (import it in the consuming component's `imports` array)

## Inputs

- `items: any[]` — list of objects to search
- `idKey: string = 'id'` — property name used as the value id
- `labelKey: string = 'label'` — property name used for display
- `placeholder: string = 'Buscar...'`
- `disabled: boolean = false`

## Value model

Implements ControlValueAccessor. The bound value is the selected item id (`string | null`).

- Writing a value sets the internal input text to the matching label
- Clearing the text input emits `null`

## Filtering

- Debounced 200ms, case-insensitive
- Matches on `labelKey` contains term
- Returns up to 10 suggestions

## Usage

Template-driven (ngModel):
```html
<typeahead
  [(ngModel)]="selectedId"
  [items]="options"
  idKey="id"
  labelKey="nombre"
  placeholder="Buscar cliente...">
</typeahead>
```

Reactive forms:
```ts
@Component({ /* ... */, imports: [TypeaheadComponent, ReactiveFormsModule] })
export class MyCmp {
  form = new FormGroup({ contactoId: new FormControl<string | null>(null) });
  options = [ { id: '1', nombre: 'Alice' }, { id: '2', nombre: 'Bob' } ];
}
```
```html
<form [formGroup]="form">
  <typeahead formControlName="contactoId"
             [items]="options"
             idKey="id"
             labelKey="nombre">
  </typeahead>
</form>
```

Disabled/placeholder:
```html
<typeahead [disabled]="isLoading" placeholder="Buscar..." [items]="options"></typeahead>
```

## Styling

- Input inherits Bootstrap styles; use `form-control` wrapper if embedding in form groups
- Use standard form label: `label.c-label`
- Place inside frames when used in pages
