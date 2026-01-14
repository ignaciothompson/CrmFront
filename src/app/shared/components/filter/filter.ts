import { Component, Input, forwardRef, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TypeaheadComponent } from '../typeahead/typeahead';

export type FilterType = 'text' | 'select' | 'date' | 'number' | 'range' | 'multiselect' | 'typeahead' | 'radio' | 'checkbox';

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
export class FilterComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('multiSelect', { static: false }) multiSelect?: ElementRef<HTMLElement>;
  @Input() id!: string;
  
  private outsideClickHandler?: (event: MouseEvent) => void;
  
  constructor(private cdr: ChangeDetectorRef) {}
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
  @Input() validateOnBlur: boolean = false; // Validate on blur instead of input change

  // For range type
  rangeFrom: any = null;
  rangeTo: any = null;

  // For multiselect
  selectedValues: any[] = [];
  multiselectOpen: boolean = false;

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
    } else if (this.type === 'select' && this.multiple) {
      // Select with multiple selection
      this.selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
    } else if (this.type === 'checkbox' && this.values && this.values.length > 0) {
      // Checkbox group - use selectedValues
      this.selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
    } else if (this.type === 'checkbox' && (!this.values || this.values.length === 0)) {
      // Single checkbox (boolean)
      this.value = value === true || value === 'true' || value === 1;
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
    if (!this.validateOnBlur) {
      this.onChange(value);
      this.onTouched();
    }
  }

  onInputBlur(): void {
    if (this.validateOnBlur) {
      this.onChange(this.value);
      this.onTouched();
    }
  }

  onTypeaheadChange(value: string | null): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  onRangeFromChange(value: any): void {
    this.rangeFrom = value;
    if (!this.validateOnBlur) {
      this.onChange({ from: this.rangeFrom, to: this.rangeTo });
      this.onTouched();
    }
  }

  onRangeFromBlur(): void {
    if (this.validateOnBlur) {
      this.onChange({ from: this.rangeFrom, to: this.rangeTo });
      this.onTouched();
    }
  }

  onRangeToChange(value: any): void {
    this.rangeTo = value;
    if (!this.validateOnBlur) {
      this.onChange({ from: this.rangeFrom, to: this.rangeTo });
      this.onTouched();
    }
  }

  onRangeToBlur(): void {
    if (this.validateOnBlur) {
      this.onChange({ from: this.rangeFrom, to: this.rangeTo });
      this.onTouched();
    }
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
    if (!this.selectedValues || this.selectedValues.length === 0) return false;
    // Compare both as strings to handle number/string mismatches
    return this.selectedValues.some(v => String(v) === String(value));
  }

  toggleMultiselectDropdown(): void {
    if (!this.disabled) {
      this.multiselectOpen = !this.multiselectOpen;
    }
  }

  toggleOption(value: any, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (this.disabled) return;
    
    const matchingOption = this.values?.find(v => String(v.value) === String(value));
    const actualValue = matchingOption ? matchingOption.value : value;
    
    const isCurrentlySelected = this.isSelected(actualValue);
    
    if (isCurrentlySelected) {
      // Deselect if already selected
      this.selectedValues = this.selectedValues.filter(v => String(v) !== String(actualValue));
    } else {
      // Select if not selected
      if (!this.selectedValues.some(v => String(v) === String(actualValue))) {
        this.selectedValues.push(actualValue);
      }
    }
    
    const result = this.multiple ? this.selectedValues : (this.selectedValues.length > 0 ? this.selectedValues[0] : null);
    this.onChange(result);
    this.onTouched();
    this.cdr.detectChanges();
  }

  getSelectedLabels(): string {
    if (!this.selectedValues || this.selectedValues.length === 0) {
      return '';
    }
    
    const labels = this.selectedValues.map(val => {
      const option = this.values?.find(v => String(v.value) === String(val));
      return option ? option.label : String(val);
    });
    
    if (labels.length <= 3) {
      return labels.join(', ');
    } else {
      return `${labels.slice(0, 3).join(', ')} y ${labels.length - 3} más`;
    }
  }

  onRadioChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.value = checked;
    this.onChange(checked);
    this.onTouched();
  }

  onCheckboxGroupChange(option: FilterOption, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (!this.selectedValues) {
      this.selectedValues = [];
    }
    
    if (checked) {
      if (!this.selectedValues.includes(option.value)) {
        this.selectedValues.push(option.value);
      }
    } else {
      this.selectedValues = this.selectedValues.filter(v => v !== option.value);
    }
    
    this.onChange(this.selectedValues);
    this.onTouched();
  }

  isCheckboxGroupSelected(value: any): boolean {
    return this.selectedValues && this.selectedValues.includes(value);
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

  ngAfterViewInit(): void {
    // Close dropdown when clicking outside
    if (this.type === 'select' && this.multiple) {
      this.outsideClickHandler = (event: MouseEvent) => {
        if (this.multiselectOpen) {
          const target = event.target as HTMLElement;
          const wrapper = document.querySelector(`[data-multiselect-id="${this.id}"]`);
          if (wrapper && !wrapper.contains(target)) {
            this.multiselectOpen = false;
            this.cdr.detectChanges();
          }
        }
      };
      setTimeout(() => {
        document.addEventListener('click', this.outsideClickHandler!);
      }, 0);
    }
  }

  ngOnDestroy(): void {
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
    }
  }
}

