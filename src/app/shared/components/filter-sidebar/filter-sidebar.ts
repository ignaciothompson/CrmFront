import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterComponent, FilterOption } from '../filter/filter';
import { TypeaheadComponent } from '../typeahead/typeahead';

export interface FilterSidebarConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'range' | 'multiselect' | 'typeahead' | 'radio' | 'checkbox';
  placeholder?: string;
  values?: FilterOption[];
  items?: any[]; // For typeahead
  idKey?: string;
  labelKey?: string;
  min?: number;
  max?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  multiple?: boolean;
  validateOnBlur?: boolean;
  // For displaying selected values
  getSelectedLabel?: (value: any) => string;
}

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterComponent, TypeaheadComponent],
  templateUrl: './filter-sidebar.html',
  styleUrl: './filter-sidebar.css'
})
export class FilterSidebarComponent {
  @Input() filters: FilterSidebarConfig[] = [];
  @Input() filterValues: Record<string, any> = {};
  @Output() filterChange = new EventEmitter<{ id: string; value: any }>();
  @Output() filtersChange = new EventEmitter<Record<string, any>>();

  openBlocks: Record<string, boolean> = {};

  ngOnInit(): void {
    // Initialize open blocks - all closed by default
    this.filters.forEach(filter => {
      this.openBlocks[filter.id] = false;
    });
  }

  toggleOpen(id: string): void {
    this.openBlocks[id] = !this.openBlocks[id];
  }

  onFilterChange(id: string, value: any): void {
    this.filterValues = { ...this.filterValues, [id]: value };
    this.filterChange.emit({ id, value });
    this.filtersChange.emit(this.filterValues);
  }

  getSelectedLabel(filter: FilterSidebarConfig): string {
    const value = this.filterValues[filter.id];
    if (!value && value !== 0) return '';

    if (filter.getSelectedLabel) {
      return filter.getSelectedLabel(value);
    }

    // Default label generation
    if (filter.type === 'range' && value && typeof value === 'object') {
      const from = value.from || value.from === 0 ? value.from : '';
      const to = value.to || value.to === 0 ? value.to : '';
      if (from || to) {
        return `(${from || 0} - ${to || '∞'})`;
      }
    }

    if (filter.type === 'checkbox' && filter.values && filter.values.length > 0) {
      // Checkbox group
      if (Array.isArray(value) && value.length > 0) {
        const selected = filter.values.filter(opt => value.includes(opt.value));
        return selected.map(opt => opt.label).join(', ');
      }
    }

    if (filter.type === 'multiselect' && Array.isArray(value) && value.length > 0) {
      const selected = filter.values?.filter(opt => value.includes(opt.value));
      return selected?.map(opt => opt.label).join(', ') || '';
    }

    if (filter.values) {
      const option = filter.values.find(opt => opt.value === value);
      if (option) return option.label;
    }

    if (filter.type === 'typeahead' && filter.items) {
      const item = filter.items.find(item => {
        const idKey = filter.idKey || 'id';
        return String(item[idKey]) === String(value);
      });
      if (item) {
        const labelKey = filter.labelKey || 'label';
        return item[labelKey] || '';
      }
    }

    return String(value);
  }

  hasSelection(filter: FilterSidebarConfig): boolean {
    const value = this.filterValues[filter.id];
    if (!value && value !== 0) return false;

    if (filter.type === 'range') {
      return value && (value.from !== null || value.to !== null);
    }

    if (filter.type === 'checkbox' && filter.values && filter.values.length > 0) {
      return Array.isArray(value) && value.length > 0;
    }

    if (filter.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0;
    }

    return value !== null && value !== undefined && value !== '';
  }
}

