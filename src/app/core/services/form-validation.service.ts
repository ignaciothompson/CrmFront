import { Injectable } from '@angular/core';
import { ValidationRule, ValidationResult } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {
  /**
   * Validate a form object against validation rules
   */
  validateForm(data: Record<string, any>, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = data[rule.field];
      const error = this.validateField(value, rule);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a single field
   */
  private validateField(value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required) {
      if (value === null || value === undefined || value === '') {
        return `${rule.label} es requerido`;
      }
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${rule.label} debe tener al menos ${rule.minLength} caracteres`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `${rule.label} no puede tener más de ${rule.maxLength} caracteres`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return `${rule.label} tiene un formato inválido`;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `${rule.label} debe ser al menos ${rule.min}`;
      }

      if (rule.max !== undefined && value > rule.max) {
        return `${rule.label} no puede ser mayor que ${rule.max}`;
      }
    }

    // Custom validator
    if (rule.customValidator) {
      const customError = rule.customValidator(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  /**
   * Validate that at least one value is selected from a set of options
   */
  validateAtLeastOneSelected(
    selections: Record<string, boolean>,
    fieldLabel: string
  ): string | null {
    const hasSelection = Object.values(selections).some(val => val === true);
    if (!hasSelection) {
      return `Debe seleccionar al menos una opción en ${fieldLabel}`;
    }
    return null;
  }

  /**
   * Validate that a number range is valid (min <= max)
   */
  validateRange(
    min: number | null | undefined,
    max: number | null | undefined,
    fieldLabel: string
  ): string | null {
    if (min !== null && min !== undefined && max !== null && max !== undefined) {
      if (min > max) {
        return `El valor mínimo de ${fieldLabel} no puede ser mayor que el máximo`;
      }
    }
    return null;
  }

  /**
   * Get a user-friendly error message for common validation scenarios
   */
  getErrorMessage(field: string, errorType: string, label?: string): string {
    const fieldLabel = label || field;
    
    switch (errorType) {
      case 'required':
        return `${fieldLabel} es requerido`;
      case 'minlength':
        return `${fieldLabel} es muy corto`;
      case 'maxlength':
        return `${fieldLabel} es muy largo`;
      case 'min':
        return `${fieldLabel} es muy pequeño`;
      case 'max':
        return `${fieldLabel} es muy grande`;
      case 'pattern':
        return `${fieldLabel} tiene un formato inválido`;
      default:
        return `${fieldLabel} tiene un error de validación`;
    }
  }
}

