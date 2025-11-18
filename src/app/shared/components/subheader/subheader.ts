import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, AfterViewInit, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent, FilterOption } from '../filter/filter';

export interface FilterConfig {
  id: string;
  type: 'text' | 'select' | 'date' | 'number' | 'range' | 'multiselect' | 'typeahead' | 'radio' | 'checkbox';
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
export class SubheaderComponent implements AfterContentInit, AfterViewInit {
  @Input() submitLabel: string = 'Aplicar';
  @Input() columnClass: string = 'col-xs-12 col-sm-6 col-md-3';
  @Input() filters: FilterConfig[] = [];
  @Input() initialValues: Record<string, any> = {};
  @Input() autoApply: boolean = true; // Auto-apply filters when initial values are set
  
  @Output() submit = new EventEmitter<Record<string, any>>();
  @Output() reset = new EventEmitter<void>();

  @ContentChildren(FilterComponent) contentFilters!: QueryList<FilterComponent>;
  @ViewChildren(FilterComponent) viewFilters!: QueryList<FilterComponent>;

  filterValues: Record<string, any> = {};
  isCollapsed: boolean = false;
  private isInitialLoad: boolean = true;

  ngAfterContentInit(): void {
    // Initialize filter values
    setTimeout(() => {
      this.updateFilterValues();
      
      // Watch for filter changes
      const filters = this.getFilters();
      filters.changes.subscribe(() => {
        this.updateFilterValues();
      });
    });
  }

  ngAfterViewInit(): void {
    // Set initial values after view is initialized to ensure filters are rendered
    setTimeout(() => {
      this.setInitialValues();
    }, 0);
  }

  private setInitialValues(): void {
    const filters = this.getFilters();
    if (filters.length === 0) {
      // If filters aren't ready yet, try again
      setTimeout(() => this.setInitialValues(), 50);
      return;
    }
    
    let hasInitialValues = false;
    
    filters.forEach((filter, index) => {
      const filterConfig = this.filters[index];
      if (!filterConfig) return;
      
      const initialValue = this.initialValues[filterConfig.id];
      if (initialValue !== undefined && initialValue !== null && initialValue !== '') {
        hasInitialValues = true;
        if (filterConfig.type === 'range' && typeof initialValue === 'object' && 'from' in initialValue && 'to' in initialValue) {
          filter.writeValue(initialValue);
        } else {
          filter.writeValue(initialValue);
        }
      }
    });
    
    // Auto-apply filters if initial values were set
    if (hasInitialValues && this.autoApply) {
      setTimeout(() => {
        this.isInitialLoad = true;
        this.onSubmit();
        this.isInitialLoad = false;
      }, 100);
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
      } else if (filter.type === 'multiselect' || (filter.type === 'checkbox' && filter.values && filter.values.length > 0)) {
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
      } else if (filter.type === 'multiselect' || (filter.type === 'checkbox' && filter.values && filter.values.length > 0)) {
        currentValue = filter.selectedValues.length > 0 ? filter.selectedValues : null;
      } else {
        currentValue = filter.value;
      }
      
      values[filter.id] = currentValue;
    });
    
    // Update filter values
    this.updateFilterValues();
    
    // Collapse only if filters were applied and this is not the initial load
    const hasActive = this.hasActiveFilters();
    if (hasActive && !this.isInitialLoad) {
      this.isCollapsed = true;
    }
    
    this.submit.emit(values);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  expandSubheader(): void {
    this.isCollapsed = false;
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.getActiveFilters()).length > 0;
  }

  getActiveFilters(): Record<string, { label: string; value: string }> {
    const active: Record<string, { label: string; value: string }> = {};
    
    this.filters.forEach(filterConfig => {
      const value = this.filterValues[filterConfig.id];
      if (this.isFilterValueActive(value, filterConfig)) {
        active[filterConfig.id] = {
          label: filterConfig.label,
          value: this.formatFilterValue(value, filterConfig)
        };
      }
    });
    
    return active;
  }

  private isFilterValueActive(value: any, config: FilterConfig): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    
    if (config.type === 'range') {
      return value && (value.from || value.to);
    }
    
    if (config.type === 'multiselect' || (config.type === 'checkbox' && config.values && config.values.length > 0)) {
      return Array.isArray(value) && value.length > 0;
    }
    
    if (config.type === 'checkbox' && (!config.values || config.values.length === 0)) {
      return value === true || value === 'true' || value === 1;
    }
    
    return true;
  }

  private formatFilterValue(value: any, config: FilterConfig): string {
    if (config.type === 'range') {
      const from = value?.from || '';
      const to = value?.to || '';
      if (from && to) {
        return `${from} - ${to}`;
      } else if (from) {
        return `Desde ${from}`;
      } else if (to) {
        return `Hasta ${to}`;
      }
      return '';
    }
    
    if (config.type === 'multiselect' || (config.type === 'checkbox' && config.values && config.values.length > 0)) {
      if (Array.isArray(value) && value.length > 0) {
        const labels = value.map(v => {
          const option = config.values?.find(opt => opt.value === v);
          return option ? option.label : String(v);
        });
        return labels.join(', ');
      }
      return '';
    }
    
    if (config.type === 'select' || config.type === 'radio') {
      const option = config.values?.find(opt => String(opt.value) === String(value));
      return option ? option.label : String(value);
    }
    
    if (config.type === 'typeahead') {
      const item = config.items?.find(item => String(item[config.idKey || 'id']) === String(value));
      return item ? item[config.labelKey || 'label'] : String(value);
    }
    
    if (config.type === 'date') {
      // Format date if needed
      return String(value);
    }
    
    return String(value);
  }

  removeFilter(filterId: string): void {
    const filters = this.getFilters();
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;
    
    const filterConfig = this.filters.find(f => f.id === filterId);
    if (!filterConfig) return;
    
    // Reset the filter
    if (filterConfig.type === 'range') {
      filter.rangeFrom = null;
      filter.rangeTo = null;
      filter.writeValue({ from: null, to: null });
    } else if (filterConfig.type === 'multiselect' || (filterConfig.type === 'checkbox' && filterConfig.values && filterConfig.values.length > 0)) {
      filter.selectedValues = [];
      filter.writeValue([]);
    } else {
      filter.writeValue(null);
    }
    
    this.updateFilterValues();
    
    // Collect values for submit
    const values: Record<string, any> = {};
    filters.forEach(f => {
      let currentValue: any = null;
      
      if (f.type === 'range') {
        currentValue = { from: f.rangeFrom, to: f.rangeTo };
      } else if (f.type === 'multiselect' || (f.type === 'checkbox' && f.values && f.values.length > 0)) {
        currentValue = f.selectedValues.length > 0 ? f.selectedValues : null;
      } else {
        currentValue = f.value;
      }
      
      values[f.id] = currentValue;
    });
    
    // Check if there are still active filters after removal
    const stillHasActive = this.hasActiveFilters();
    
    // Emit submit event
    this.submit.emit(values);
    
    // Expand if no filters remain
    if (!stillHasActive) {
      this.isCollapsed = false;
    }
  }

  onReset(): void {
    // Reset all filters
    const filters = this.getFilters();
    filters.forEach(filter => {
      if (filter.type === 'range') {
        filter.rangeFrom = null;
        filter.rangeTo = null;
        filter.writeValue({ from: null, to: null });
      } else if (filter.type === 'multiselect' || (filter.type === 'checkbox' && filter.values && filter.values.length > 0)) {
        filter.selectedValues = [];
        filter.writeValue([]);
      } else {
        filter.writeValue(null);
      }
      this.filterValues[filter.id] = null;
    });
    
    // Expand subheader when filters are reset
    this.isCollapsed = false;
    this.reset.emit();
  }
}

