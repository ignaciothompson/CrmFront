import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent, FilterOption } from '../filter/filter';

export interface FilterConfig {
  id: string;
  type: 'text' | 'select' | 'date' | 'number' | 'range' | 'multiselect' | 'typeahead';
  label: string;
  placeholder?: string;
  values?: FilterOption[];
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  multiple?: boolean;
  columnClass?: string;
  // For typeahead
  items?: any[];
  idKey?: string;
  labelKey?: string;
}

@Component({
  selector: 'app-subheader',
  standalone: true,
  imports: [CommonModule, FilterComponent],
  templateUrl: './subheader.html',
  styleUrl: './subheader.css'
})
export class SubheaderComponent implements AfterContentInit {
  @Input() submitLabel: string = 'Aplicar';
  @Input() columnClass: string = 'col-xs-12 col-sm-6 col-md-3';
  @Input() filters: FilterConfig[] = [];
  
  @Output() submit = new EventEmitter<Record<string, any>>();
  @Output() reset = new EventEmitter<void>();

  @ContentChildren(FilterComponent) contentFilters!: QueryList<FilterComponent>;
  @ViewChildren(FilterComponent) viewFilters!: QueryList<FilterComponent>;

  filterValues: Record<string, any> = {};
  
  buttonColumnClass: string = 'col-xs-12 col-sm-12 col-md-auto';
  buttonOffsetClass: string = '';

  ngAfterContentInit(): void {
    // Initialize filter values and calculate button layout
    setTimeout(() => {
      this.updateFilterValues();
      this.calculateButtonLayout();
      
      // Watch for filter changes
      const filters = this.getFilters();
      filters.changes.subscribe(() => {
        this.updateFilterValues();
        this.calculateButtonLayout();
      });
    });
  }

  private calculateButtonLayout(): void {
    if (this.filters.length === 0) {
      this.buttonColumnClass = 'col-xs-12 col-sm-12 col-md-auto';
      this.buttonOffsetClass = '';
      return;
    }

    // Calculate total md columns used by filters
    let mdColumns = 0;
    
    this.filters.forEach(filter => {
      const colClass = filter.columnClass || this.columnClass;
      
      // Extract md column class like "col-md-3" from "col-xs-12 col-sm-6 col-md-3"
      const mdMatch = colClass.match(/col-md-(\d+)/);
      if (mdMatch) {
        mdColumns += parseInt(mdMatch[1], 10);
      } else {
        // If no md class found, try to extract from default columnClass
        const defaultMdMatch = this.columnClass.match(/col-md-(\d+)/);
        if (defaultMdMatch) {
          mdColumns += parseInt(defaultMdMatch[1], 10);
        }
      }
    });

    // Calculate remaining columns (Bootstrap grid is 12 columns)
    const remaining = 12 - mdColumns;
    
    if (remaining >= 2) {
      // Use col-md-2 with offset if there's space
      // Example: 3 filters × col-md-3 = 9 columns, remaining = 3
      // Button: col-md-2 + offset-md-1 = 2 + 1 = 3 columns total
      const offset = remaining - 2;
      this.buttonColumnClass = 'col-xs-12 col-sm-12 col-md-2';
      this.buttonOffsetClass = offset > 0 ? `offset-md-${offset}` : '';
    } else if (remaining >= 1) {
      // Use col-md-1 if only 1 column remains
      this.buttonColumnClass = 'col-xs-12 col-sm-12 col-md-1';
      this.buttonOffsetClass = '';
    } else {
      // If no space (remaining = 0), wrap to next line
      this.buttonColumnClass = 'col-xs-12 col-sm-12 col-md-12';
      this.buttonOffsetClass = '';
    }
  }

  private getFilters(): QueryList<FilterComponent> {
    // Prefer content projection filters, fallback to view filters
    return this.contentFilters.length > 0 ? this.contentFilters : this.viewFilters;
  }

  private updateFilterValues(): void {
    const filters = this.getFilters();
    filters.forEach(filter => {
      let currentValue: any = null;
      
      if (filter.type === 'range') {
        currentValue = { from: filter.rangeFrom, to: filter.rangeTo };
      } else if (filter.type === 'multiselect') {
        currentValue = filter.selectedValues;
      } else {
        currentValue = filter.value;
      }
      
      this.filterValues[filter.id] = currentValue;
    });
  }

  onSubmit(): void {
    // Collect current values from all filters
    const values: Record<string, any> = {};
    const filters = this.getFilters();
    
    filters.forEach(filter => {
      let currentValue: any = null;
      
      if (filter.type === 'range') {
        currentValue = { from: filter.rangeFrom, to: filter.rangeTo };
      } else if (filter.type === 'multiselect') {
        currentValue = filter.selectedValues.length > 0 ? filter.selectedValues : null;
      } else {
        currentValue = filter.value;
      }
      
      values[filter.id] = currentValue;
    });
    this.submit.emit(values);
  }

  onReset(): void {
    // Reset all filters
    const filters = this.getFilters();
    filters.forEach(filter => {
      if (filter.type === 'range') {
        filter.rangeFrom = null;
        filter.rangeTo = null;
        filter.writeValue({ from: null, to: null });
      } else if (filter.type === 'multiselect') {
        filter.selectedValues = [];
        filter.writeValue([]);
      } else {
        filter.writeValue(null);
      }
      this.filterValues[filter.id] = null;
    });
    this.reset.emit();
  }
}

