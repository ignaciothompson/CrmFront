import { Component, forwardRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'typeahead',
  standalone: true,
  imports: [FormsModule, NgSelectModule],
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
export class TypeaheadComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() idKey: string = 'id';
  @Input() labelKey: string = 'label';
  @Input() placeholder: string = 'Buscar...';
  @Input() disabled: boolean = false;

  valueId: string | null = null;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  // Transformed items for ng-select (ensures idKey and labelKey are properly set)
  transformedItems: any[] = [];

  ngOnInit(): void {
    this.transformItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['idKey'] || changes['labelKey']) {
      this.transformItems();
    }
  }

  private transformItems(): void {
    // Transform items to ensure they have 'id' and 'label' properties for ng-select
    // while preserving original structure
    this.transformedItems = (this.items || []).map(item => ({
      ...item,
      id: String(item[this.idKey] || ''),
      label: String(item[this.labelKey] || '')
    }));
  }

  // Custom search function for ng-select - filters items
  searchFn = (term: string, item: any): boolean => {
    const searchTerm = (term || '').toLowerCase();
    
    // Special case: %%%% returns first 10 items
    if (searchTerm === '%%%%') {
      return true;
    }
    
    if (!searchTerm) {
      return true;
    }
    
    const label = String(item[this.labelKey] || item.label || '').toLowerCase();
    return label.includes(searchTerm);
  };

  writeValue(value: string | null): void {
    this.valueId = value || null;
  }

  registerOnChange(fn: (value: string | null) => void): void { 
    this.onChange = fn; 
  }

  registerOnTouched(fn: () => void): void { 
    this.onTouched = fn; 
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(value: string | null): void {
    // ng-select with bindValue returns the value directly (the id)
    this.valueId = value;
    this.onChange(value);
    this.onTouched();
  }

}


