import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TypeaheadComponent } from '../typeahead/typeahead';

export type FilterType = 'text' | 'select' | 'date' | 'number' | 'range' | 'multiselect' | 'typeahead';

export interface FilterOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeaheadComponent],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterComponent),
      multi: true
    }
  ]
})
export class FilterComponent implements ControlValueAccessor {
  @Input() id!: string;
  @Input() type: FilterType = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() values: FilterOption[] = [];
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() multiple: boolean = false; // For multiselect
  
  // For typeahead
  @Input() items: any[] = []; // Array of items for typeahead
  @Input() idKey: string = 'id'; // Key to use for item ID
  @Input() labelKey: string = 'label'; // Key to use for item label

  // For range type
  rangeFrom: any = null;
  rangeTo: any = null;

  // For multiselect
  selectedValues: any[] = [];

  value: any = null;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value;
    
    if (this.type === 'range') {
      if (value && typeof value === 'object' && 'from' in value && 'to' in value) {
        this.rangeFrom = value.from;
        this.rangeTo = value.to;
      } else {
        this.rangeFrom = null;
        this.rangeTo = null;
      }
    } else if (this.type === 'multiselect') {
      this.selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
    } else {
      this.value = value;
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  onTypeaheadChange(value: string | null): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  onRangeFromChange(value: any): void {
    this.rangeFrom = value;
    this.onChange({ from: this.rangeFrom, to: this.rangeTo });
    this.onTouched();
  }

  onRangeToChange(value: any): void {
    this.rangeTo = value;
    this.onChange({ from: this.rangeFrom, to: this.rangeTo });
    this.onTouched();
  }

  onMultiselectChange(option: FilterOption, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      if (!this.selectedValues.includes(option.value)) {
        this.selectedValues.push(option.value);
      }
    } else {
      this.selectedValues = this.selectedValues.filter(v => v !== option.value);
    }
    
    const result = this.multiple ? this.selectedValues : (this.selectedValues.length > 0 ? this.selectedValues[0] : null);
    this.onChange(result);
    this.onTouched();
  }

  isSelected(value: any): boolean {
    return this.selectedValues.includes(value);
  }

  get inputType(): string {
    switch (this.type) {
      case 'date':
        return 'date';
      case 'number':
        return 'number';
      case 'range':
        // For range type, determine if it's a date range based on minDate/maxDate
        return (this.minDate || this.maxDate) ? 'date' : 'number';
      default:
        return 'text';
    }
  }
}

