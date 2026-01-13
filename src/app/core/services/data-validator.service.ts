import { Injectable } from '@angular/core';
import {
  ImportConfig,
  ImportValidationResult,
  RowValidationResult,
  FieldValidationConfig,
  FieldValidationError,
  ColumnMapping
} from '../models/import.models';

/**
 * DataValidatorService
 * 
 * Generic service for validating Excel data against import configurations.
 * Supports field-level and row-level validation with detailed error reporting.
 */
@Injectable({
  providedIn: 'root'
})
export class DataValidatorService {
  /**
   * Validate Excel data against import configuration
   * 
   * @param rawData - Raw data from Excel (array of row objects)
   * @param columnMappings - Mapping of Excel columns to target fields
   * @param config - Import configuration with field validation rules
   * @returns ImportValidationResult with valid and invalid rows
   */
  validateData(
    rawData: Record<string, any>[],
    columnMappings: ColumnMapping[],
    config: ImportConfig
  ): ImportValidationResult {
    const invalidRows: RowValidationResult[] = [];
    const validRows: Record<string, any>[] = [];

    // Create a map for quick column lookup
    const columnMap = new Map<string, string>();
    columnMappings.forEach(mapping => {
      columnMap.set(mapping.excelColumn, mapping.targetField);
    });

    // Create a map for quick field config lookup
    const fieldConfigMap = new Map<string, FieldValidationConfig>();
    config.fields.forEach(field => {
      fieldConfigMap.set(field.fieldName, field);
    });

    // Process each row
    rawData.forEach((row, index) => {
      const validationResult = this.validateRow(
        row,
        index,
        columnMap,
        fieldConfigMap,
        config
      );

      if (validationResult.isValid && validationResult.mappedRow) {
        validRows.push(validationResult.mappedRow);
      } else {
        invalidRows.push(validationResult);
      }
    });

    const totalRows = rawData.length;
    const validCount = validRows.length;
    const invalidCount = invalidRows.length;
    const successRate = totalRows > 0 ? (validCount / totalRows) * 100 : 0;

    return {
      totalRows,
      validRows,
      invalidRows,
      summary: {
        validCount,
        invalidCount,
        successRate: Math.round(successRate * 100) / 100 // Round to 2 decimals
      }
    };
  }

  /**
   * Validate a single row
   * 
   * @param row - Raw row data from Excel
   * @param rowIndex - Zero-based row index (excluding header)
   * @param columnMap - Map of Excel column -> target field
   * @param fieldConfigMap - Map of field name -> validation config
   * @param config - Import configuration
   * @returns RowValidationResult
   */
  private validateRow(
    row: Record<string, any>,
    rowIndex: number,
    columnMap: Map<string, string>,
    fieldConfigMap: Map<string, FieldValidationConfig>,
    config: ImportConfig
  ): RowValidationResult {
    const errors: FieldValidationError[] = [];
    const mappedRow: Record<string, any> = {};

    // Map and validate each field
    config.fields.forEach(fieldConfig => {
      // Find the Excel column that maps to this field
      let excelColumn: string | undefined;
      for (const [excelCol, targetField] of columnMap.entries()) {
        if (targetField === fieldConfig.fieldName) {
          excelColumn = excelCol;
          break;
        }
      }

      // Get raw value from Excel row
      let rawValue: any = undefined;
      if (excelColumn) {
        // Try exact match first
        rawValue = row[excelColumn];
        
        // Try case-insensitive match if exact match failed
        if (rawValue === undefined) {
          const lowerExcelColumn = excelColumn.toLowerCase();
          for (const key in row) {
            if (key.toLowerCase() === lowerExcelColumn) {
              rawValue = row[key];
              break;
            }
          }
        }
      }

      // Validate and transform the field
      const fieldError = this.validateField(
        rawValue,
        fieldConfig,
        row,
        rowIndex
      );

      if (fieldError) {
        errors.push(fieldError);
      } else {
        // Field is valid, add to mapped row
        let finalValue = rawValue;

        // Apply default value if field is empty and not required
        if (
          (finalValue === undefined ||
            finalValue === null ||
            finalValue === '') &&
          !fieldConfig.required &&
          fieldConfig.defaultValue !== undefined
        ) {
          finalValue = fieldConfig.defaultValue;
        }

        // Apply transform if defined
        if (fieldConfig.transform && finalValue !== undefined && finalValue !== null && finalValue !== '') {
          try {
            finalValue = fieldConfig.transform(finalValue, row);
          } catch (error) {
            errors.push({
              field: fieldConfig.fieldName,
              label: fieldConfig.label,
              message: `Error transforming value: ${error instanceof Error ? error.message : 'Unknown error'}`,
              value: rawValue
            });
            return; // Skip adding this field
          }
        }

        // Only add field if it has a value (unless it's required)
        if (finalValue !== undefined && finalValue !== null && finalValue !== '') {
          mappedRow[fieldConfig.fieldName] = finalValue;
        } else if (fieldConfig.required) {
          mappedRow[fieldConfig.fieldName] = finalValue; // Include even if empty for required fields
        }
      }
    });

    // Check for row-level validation
    let rowError: string | null = null;
    if (config.rowValidator && errors.length === 0) {
      // Only run row validator if field-level validation passed
      rowError = config.rowValidator(mappedRow);
    }

    const isValid = errors.length === 0 && !rowError;

    return {
      rowIndex,
      originalRow: { ...row },
      isValid,
      mappedRow: isValid ? mappedRow : undefined,
      errors: errors.length > 0 ? errors : undefined,
      rowError: rowError || undefined
    };
  }

  /**
   * Validate a single field value
   * 
   * @param value - Raw value from Excel
   * @param config - Field validation configuration
   * @param row - Complete row data (for context in custom validators)
   * @param rowIndex - Row index (for error messages)
   * @returns FieldValidationError if invalid, null if valid
   */
  private validateField(
    value: any,
    config: FieldValidationConfig,
    row: Record<string, any>,
    rowIndex: number
  ): FieldValidationError | null {
    // Check required
    if (config.required) {
      if (value === undefined || value === null || value === '') {
        return {
          field: config.fieldName,
          label: config.label,
          message: `${config.label} es obligatorio`,
          value
        };
      }
    } else {
      // If not required and empty, skip validation
      if (value === undefined || value === null || value === '') {
        return null;
      }
    }

    // Type validation and conversion
    let convertedValue: any = value;

    try {
      switch (config.dataType) {
        case 'string':
          convertedValue = String(value);
          if (config.trim !== false) {
            convertedValue = convertedValue.trim();
          }
          if (convertedValue === '' && config.required) {
            return {
              field: config.fieldName,
              label: config.label,
              message: `${config.label} no puede estar vacío`,
              value
            };
          }
          break;

        case 'number':
          convertedValue = this.parseNumber(value);
          if (convertedValue === null || isNaN(convertedValue)) {
            return {
              field: config.fieldName,
              label: config.label,
              message: `${config.label} debe ser un número válido`,
              value
            };
          }
          break;

        case 'boolean':
          convertedValue = this.parseBoolean(value);
          break;

        case 'date':
          convertedValue = this.parseDate(value);
          if (!convertedValue) {
            return {
              field: config.fieldName,
              label: config.label,
              message: `${config.label} debe ser una fecha válida`,
              value
            };
          }
          break;

        case 'email':
          convertedValue = String(value).trim().toLowerCase();
          if (!this.isValidEmail(convertedValue)) {
            return {
              field: config.fieldName,
              label: config.label,
              message: `${config.label} debe ser un email válido`,
              value
            };
          }
          break;

        case 'array':
          convertedValue = this.parseArray(value);
          if (!Array.isArray(convertedValue)) {
            return {
              field: config.fieldName,
              label: config.label,
              message: `${config.label} debe ser una lista válida`,
              value
            };
          }
          break;

        case 'object':
          // Objects are passed through as-is, validation happens in custom validator
          convertedValue = value;
          break;
      }
    } catch (error) {
      return {
        field: config.fieldName,
        label: config.label,
        message: `Error procesando ${config.label}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        value
      };
    }

    // Min/Max validation
    if (config.min !== undefined) {
      if (config.dataType === 'string') {
        if (convertedValue.length < config.min) {
          return {
            field: config.fieldName,
            label: config.label,
            message: `${config.label} debe tener al menos ${config.min} caracteres`,
            value
          };
        }
      } else if (config.dataType === 'number') {
        if (convertedValue < config.min) {
          return {
            field: config.fieldName,
            label: config.label,
            message: `${config.label} debe ser al menos ${config.min}`,
            value
          };
        }
      }
    }

    if (config.max !== undefined) {
      if (config.dataType === 'string') {
        if (convertedValue.length > config.max) {
          return {
            field: config.fieldName,
            label: config.label,
            message: `${config.label} no puede tener más de ${config.max} caracteres`,
            value
          };
        }
      } else if (config.dataType === 'number') {
        if (convertedValue > config.max) {
          return {
            field: config.fieldName,
            label: config.label,
            message: `${config.label} no puede ser mayor que ${config.max}`,
            value
          };
        }
      }
    }

    // Pattern validation (for strings)
    if (config.pattern && config.dataType === 'string') {
      const pattern =
        config.pattern instanceof RegExp
          ? config.pattern
          : new RegExp(config.pattern);
      if (!pattern.test(convertedValue)) {
        return {
          field: config.fieldName,
          label: config.label,
          message: `${config.label} no cumple con el formato requerido`,
          value
        };
      }
    }

    // Allowed values validation
    if (config.allowedValues && config.allowedValues.length > 0) {
      if (!config.allowedValues.includes(convertedValue)) {
        return {
          field: config.fieldName,
          label: config.label,
          message: `${config.label} debe ser uno de: ${config.allowedValues.join(', ')}`,
          value
        };
      }
    }

    // Custom validator
    if (config.customValidator) {
      const customError = config.customValidator(convertedValue, row);
      if (customError) {
        return {
          field: config.fieldName,
          label: config.label,
          message: customError,
          value
        };
      }
    }

    return null; // Field is valid
  }

  /**
   * Parse a value to number, handling various formats
   */
  private parseNumber(value: any): number | null {
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return null;
      // Remove common formatting (commas, currency symbols, etc.)
      const cleaned = trimmed.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  /**
   * Parse a value to boolean
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return ['true', '1', 'yes', 'sí', 'si', 'verdadero'].includes(lower);
    }
    return Boolean(value);
  }

  /**
   * Parse a value to date string (YYYY-MM-DD)
   * Handles Excel serial dates and various date formats
   */
  private parseDate(value: any): string | null {
    if (!value) return null;

    // If already a date string in YYYY-MM-DD format
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    // If it's a Date object
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // If it's an Excel serial number
    if (typeof value === 'number') {
      try {
        // Excel epoch: December 30, 1899
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const ms = value * 24 * 60 * 60 * 1000;
        const date = new Date(excelEpoch.getTime() + ms);
        if (isNaN(date.getTime())) return null;
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return null;
      }
    }

    // Try parsing as string date
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return null;
      
      // Try ISO format first
      const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
      if (isoMatch) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }

      // Try common formats (DD/MM/YYYY, MM/DD/YYYY, etc.)
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    return null;
  }

  /**
   * Parse a value to array
   * Handles comma-separated strings and existing arrays
   */
  private parseArray(value: any): any[] | null {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return [];
      return trimmed.split(',').map(item => item.trim()).filter(Boolean);
    }
    return null;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

