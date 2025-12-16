import { Component, forwardRef, Input } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'typeahead',
  standalone: true,
  imports: [FormsModule, NgbTypeaheadModule],
  templateUrl: './typeahead.html',
  styleUrl: './typeahead.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeaheadComponent),
      multi: true
    }
  ]
})
export class TypeaheadComponent implements ControlValueAccessor {
  @Input() items: any[] = [];
  @Input() idKey: string = 'id';
  @Input() labelKey: string = 'label';
  @Input() placeholder: string = 'Buscar...';
  @Input() disabled: boolean = false;

  inputText: string = '';
  private valueId: string | null = null;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.filterItems(term))
    );

  formatter = (x: any) => (x && x[this.labelKey]) ? x[this.labelKey] : '';

  writeValue(value: string | null): void {
    this.valueId = value || null;
    const found = this.items.find(it => String(it[this.idKey]) === String(this.valueId));
    this.inputText = found ? (found[this.labelKey] ?? '') : '';
  }

  registerOnChange(fn: (value: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  onSelect($event: any): void {
    const item = $event.item;
    const id = item ? String(item[this.idKey]) : null;
    this.valueId = id;
    this.inputText = item ? (item[this.labelKey] ?? '') : '';
    this.onChange(this.valueId);
  }

  onInputChanged(text: string): void {
    if (!text) {
      this.valueId = null;
      this.onChange(this.valueId);
    }
  }

  private filterItems(term: string): any[] {
    const t = (term || '').toLowerCase();
    // Si el término es %%%%, devolver los últimos 10 items (ya están ordenados por fecha)
    if (t === '%%%%') {
      return this.items.slice(0, 10);
    }
    if (!t) return this.items.slice(0, 10);
    return this.items.filter(it => String(it[this.labelKey] || '').toLowerCase().includes(t)).slice(0, 10);
  }
}


