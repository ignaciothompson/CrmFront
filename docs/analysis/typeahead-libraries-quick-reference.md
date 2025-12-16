# Typeahead Libraries Quick Reference

## Quick Comparison

### 1. @ng-select/ng-select
```bash
npm install @ng-select/ng-select
```

**Best for:** Production applications needing robust features

**Key Features:**
- Multi-select support
- Remote data loading
- Virtual scrolling for large lists
- Custom templates
- Grouping and tagging
- Excellent documentation

**Basic Usage:**
```typescript
import { NgSelectModule } from '@ng-select/ng-select';

// Component
items = [{ id: '1', name: 'Item 1' }];
selectedId: string | null = null;

// Template
<ng-select
  [(ngModel)]="selectedId"
  [items]="items"
  bindValue="id"
  bindLabel="name"
  [searchable]="true"
  placeholder="Search...">
</ng-select>
```

**Remote Data:**
```typescript
@ViewChild(NgSelectComponent) ngSelect: NgSelectComponent;

loadItems(term: string) {
  return this.service.search(term).pipe(
    catchError(() => of([]))
  );
}
```

```html
<ng-select
  [typeahead]="loadItems"
  bindValue="id"
  bindLabel="name">
</ng-select>
```

**Links:**
- NPM: https://www.npmjs.com/package/@ng-select/ng-select
- Docs: https://ng-select.github.io/ng-select
- GitHub: https://github.com/ng-select/ng-select

---

### 2. Angular Material Autocomplete
```bash
npm install @angular/material
```

**Best for:** Applications using Angular Material Design

**Key Features:**
- Material Design styling
- Excellent accessibility
- Async data support
- Keyboard navigation
- Official Angular team support

**Basic Usage:**
```typescript
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Component
control = new FormControl('');
items = [{ id: '1', name: 'Item 1' }];

filteredItems = this.control.valueChanges.pipe(
  startWith(''),
  map(value => this.filter(value || ''))
);

filter(value: string) {
  const filterValue = value.toLowerCase();
  return this.items.filter(item => 
    item.name.toLowerCase().includes(filterValue)
  );
}
```

**Template:**
```html
<mat-form-field>
  <input matInput 
         [formControl]="control"
         [matAutocomplete]="auto">
  <mat-autocomplete #auto="matAutocomplete">
    <mat-option *ngFor="let item of filteredItems | async" 
                [value]="item.id">
      {{ item.name }}
    </mat-option>
  </mat-autocomplete>
</mat-form-field>
```

**Links:**
- NPM: https://www.npmjs.com/package/@angular/material
- Docs: https://material.angular.io/components/autocomplete

---

### 3. ng2-completer
```bash
npm install ng2-completer
```

**Best for:** Simple use cases, minimal dependencies

**Key Features:**
- Lightweight
- Simple API
- Local and remote data
- Custom templates

**Basic Usage:**
```typescript
import { CompleterService, CompleterData, CompleterModule } from 'ng2-completer';

// Component
items = [{ id: '1', name: 'Item 1' }];
dataService: CompleterData;

constructor(private completerService: CompleterService) {
  this.dataService = completerService.local(
    this.items, 
    'name',  // search field
    'name'   // title field
  );
}
```

**Template:**
```html
<ng2-completer
  [(ngModel)]="selectedId"
  [datasource]="dataService"
  [minSearchLength]="0"
  [placeholder]="'Search...'">
</ng2-completer>
```

**Links:**
- NPM: https://www.npmjs.com/package/ng2-completer
- GitHub: https://github.com/oferh/ng2-completer

---

### 4. ng-bootstrap Typeahead (Current)
```bash
npm install @ng-bootstrap/ng-bootstrap
```

**Best for:** Bootstrap-based applications

**Key Features:**
- Bootstrap styling
- Lightweight
- Good documentation
- Already integrated

**Basic Usage:**
```typescript
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

// Component
items = [{ id: '1', name: 'Item 1' }];

search = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.filterItems(term))
  );

formatter = (x: any) => x.name;
```

**Template:**
```html
<input type="text"
       class="form-control"
       [ngbTypeahead]="search"
       [resultFormatter]="formatter"
       [inputFormatter]="formatter"
       [(ngModel)]="selectedName">
```

**Links:**
- NPM: https://www.npmjs.com/package/@ng-bootstrap/ng-bootstrap
- Docs: https://ng-bootstrap.github.io/#/components/typeahead

---

## Migration Guide: Current → ng-select

### Step 1: Install
```bash
npm install @ng-select/ng-select
```

### Step 2: Update Component
```typescript
// Before
import { TypeaheadComponent } from '../../../shared/components/typeahead/typeahead';

@Component({
  imports: [TypeaheadComponent]
})

// After
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  imports: [NgSelectModule]
})
```

### Step 3: Update Template
```html
<!-- Before -->
<typeahead
  [(ngModel)]="selectedId"
  [items]="items"
  idKey="id"
  labelKey="name"
  placeholder="Search...">
</typeahead>

<!-- After -->
<ng-select
  [(ngModel)]="selectedId"
  [items]="items"
  bindValue="id"
  bindLabel="name"
  [searchable]="true"
  [clearable]="true"
  placeholder="Search...">
</ng-select>
```

### Step 4: Update Data Structure (if needed)
```typescript
// Current format works fine, but ng-select is more flexible
// You can use any object structure with bindValue/bindLabel
```

### Step 5: Add Styles (optional)
```typescript
// In component or global styles
@import '~@ng-select/ng-select/themes/default.theme.css';
// Or bootstrap theme
@import '~@ng-select/ng-select/themes/bootstrap.theme.css';
```

---

## Feature Comparison

| Feature | ng-select | Material | ng2-completer | ng-bootstrap |
|---------|-----------|----------|---------------|--------------|
| Multi-select | ✅ | ❌ | ❌ | ❌ |
| Remote data | ✅ | ✅ | ✅ | ✅ |
| Custom templates | ✅ | ✅ | ✅ | Limited |
| Virtual scrolling | ✅ | ✅ | ❌ | ❌ |
| Grouping | ✅ | ❌ | ❌ | ❌ |
| Tagging | ✅ | ❌ | ❌ | ❌ |
| Bootstrap theme | ✅ | ❌ | ✅ | ✅ |
| Material theme | ✅ | ✅ | ❌ | ❌ |
| Accessibility | ✅ | ✅ | ⚠️ | ⚠️ |
| Bundle size | Medium | Large | Small | Small |
| Weekly downloads | 1M+ | 2M+ | 10K | 200K |

---

## Decision Tree

```
Do you need multi-select?
├─ Yes → Use @ng-select/ng-select
└─ No → Continue...

Are you using Angular Material?
├─ Yes → Use Angular Material Autocomplete
└─ No → Continue...

Do you need advanced features (grouping, virtual scroll)?
├─ Yes → Use @ng-select/ng-select
└─ No → Continue...

Is current implementation working well?
├─ Yes → Keep and enhance ng-bootstrap
└─ No → Migrate to @ng-select/ng-select
```

---

## Quick Start Examples

### ng-select with Remote Data
```typescript
// Service
searchContacts(term: string): Observable<Contact[]> {
  return this.http.get<Contact[]>(`/api/contacts?q=${term}`);
}

// Component
loadContacts = (term: string) => 
  this.contactService.searchContacts(term).pipe(
    catchError(() => of([]))
  );

// Template
<ng-select
  [typeahead]="loadContacts"
  bindValue="id"
  bindLabel="name"
  [minTermLength]="2"
  placeholder="Search contacts...">
</ng-select>
```

### Material Autocomplete with Remote Data
```typescript
// Component
control = new FormControl('');
filteredItems = this.control.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(value => 
    value ? this.service.search(value) : of([])
  )
);

// Template
<input matInput 
       [formControl]="control"
       [matAutocomplete]="auto">
<mat-autocomplete #auto="matAutocomplete">
  <mat-option *ngFor="let item of filteredItems | async" 
              [value]="item">
    {{ item.name }}
  </mat-option>
</mat-autocomplete>
```

---

## Resources

- **ng-select Documentation:** https://ng-select.github.io/ng-select
- **Angular Material Docs:** https://material.angular.io/components/autocomplete
- **ng-bootstrap Docs:** https://ng-bootstrap.github.io/#/components/typeahead
- **ng2-completer GitHub:** https://github.com/oferh/ng2-completer

