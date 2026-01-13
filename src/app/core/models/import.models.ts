/**
 * Import System Models
 * 
 * Generic, reusable interfaces for Excel data import functionality.
 * Supports importing any entity type (Unidades, Contactos, Proyectos, etc.)
 * by configuring field mappings and validation rules.
 */

/**
 * Supported data types for field validation
 */
export type FieldDataType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'email' 
  | 'array' 
  | 'object';

/**
 * Field validation configuration
 * Defines how a field should be validated during import
 */
export interface FieldValidationConfig {
  /** Field name in the target database/entity */
  fieldName: string;
  
  /** Display label for error messages */
  label: string;
  
  /** Data type expected */
  dataType: FieldDataType;
  
  /** Whether this field is required */
  required?: boolean;
  
  /** Minimum value (for numbers) or length (for strings) */
  min?: number;
  
  /** Maximum value (for numbers) or length (for strings) */
  max?: number;
  
  /** Regular expression pattern for string validation */
  pattern?: RegExp | string;
  
  /** Custom validation function. Returns error message or null if valid */
  customValidator?: (value: any, row: Record<string, any>) => string | null;
  
  /** Default value if field is missing */
  defaultValue?: any;
  
  /** Transform function to convert Excel value to target format */
  transform?: (value: any, row: Record<string, any>) => any;
  
  /** Allowed values (for enum-like fields) */
  allowedValues?: any[];
  
  /** Whether to trim whitespace from string values */
  trim?: boolean;
}

/**
 * Column mapping configuration
 * Maps Excel column headers to database fields
 */
export interface ColumnMapping {
  /** Excel column header name (as it appears in the file) */
  excelColumn: string;
  
  /** Target database/entity field name */
  targetField: string;
}

/**
 * Import configuration schema
 * Defines the complete import schema for an entity type
 */
export interface ImportConfig {
  /** Entity type identifier (e.g., 'unidades', 'contactos', 'proyectos') */
  entityType: string;
  
  /** Display name for the entity type */
  entityDisplayName: string;
  
  /** Field validation configurations */
  fields: FieldValidationConfig[];
  
  /** Optional: Pre-configured column mappings (can be overridden by user) */
  defaultColumnMappings?: ColumnMapping[];
  
  /** Optional: Custom row validator that validates the entire row */
  rowValidator?: (row: Record<string, any>) => string | null;
}

/**
 * Validation error details for a single field
 */
export interface FieldValidationError {
  /** Field name */
  field: string;
  
  /** Display label */
  label: string;
  
  /** Error message */
  message: string;
  
  /** Original value from Excel */
  value: any;
}

/**
 * Validation result for a single row
 */
export interface RowValidationResult {
  /** Row index (0-based, excluding header) */
  rowIndex: number;
  
  /** Original Excel row data */
  originalRow: Record<string, any>;
  
  /** Whether the row is valid */
  isValid: boolean;
  
  /** Transformed/mapped row data (only if valid) */
  mappedRow?: Record<string, any>;
  
  /** Validation errors (only if invalid) */
  errors?: FieldValidationError[];
  
  /** Row-level error message (from rowValidator) */
  rowError?: string;
}

/**
 * Complete import validation result
 */
export interface ImportValidationResult {
  /** Total number of rows processed */
  totalRows: number;
  
  /** Valid rows ready for import */
  validRows: Record<string, any>[];
  
  /** Invalid rows with error details */
  invalidRows: RowValidationResult[];
  
  /** Summary statistics */
  summary: {
    validCount: number;
    invalidCount: number;
    successRate: number; // Percentage
  };
}

/**
 * Final import result after database insertion
 */
export interface ImportResult {
  /** Validation result */
  validation: ImportValidationResult;
  
  /** Number of rows successfully imported */
  importedCount: number;
  
  /** Number of rows that failed to import */
  failedCount: number;
  
  /** Import errors (database-level errors) */
  importErrors?: Array<{
    rowIndex: number;
    row: Record<string, any>;
    error: string;
  }>;
  
  /** Success message */
  successMessage?: string;
  
  /** Error message */
  errorMessage?: string;
}

/**
 * Excel file reading result
 */
export interface ExcelReadResult {
  /** Raw data from Excel (array of objects, keys are column headers) */
  rawData: Record<string, any>[];
  
  /** Column headers found in the Excel file */
  headers: string[];
  
  /** Sheet name */
  sheetName: string;
  
  /** Total number of rows (excluding header) */
  rowCount: number;
}

