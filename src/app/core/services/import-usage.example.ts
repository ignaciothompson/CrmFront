/**
 * Import System Usage Examples
 * 
 * This file demonstrates how to use the ExcelService and DataValidatorService
 * to implement Excel import functionality in your Angular components.
 */

import { Component, inject } from '@angular/core';
import { ExcelService } from './excel.service';
import { DataValidatorService } from './data-validator.service';
import {
  ImportConfig,
  ColumnMapping,
  ImportValidationResult,
  ImportResult
} from '../models/import.models';
import { UNIDADES_IMPORT_CONFIG } from './import-configs.example';
import { UnidadService } from './unidad';

/**
 * Example Component: How to use the import system
 * 
 * This is a reference implementation showing the complete flow:
 * 1. User uploads Excel file
 * 2. System reads headers
 * 3. User maps columns
 * 4. System validates data
 * 5. System imports valid data
 */
export class ImportExampleComponent {
  private excelService = inject(ExcelService);
  private validatorService = inject(DataValidatorService);
  private unidadService = inject(UnidadService);

  // State
  excelFile: File | null = null;
  excelHeaders: string[] = [];
  rawData: Record<string, any>[] = [];
  columnMappings: ColumnMapping[] = [];
  validationResult: ImportValidationResult | null = null;
  isProcessing = false;
  importResult: ImportResult | null = null;

  /**
   * Step 1: Handle file upload
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!this.excelService.isValidExcelFile(file)) {
      alert('Por favor seleccione un archivo Excel válido (.xlsx o .xls)');
      return;
    }

    this.excelFile = file;
    this.isProcessing = true;

    try {
      // Read Excel file
      const readResult = await this.excelService.readExcelFile(file);
      
      this.excelHeaders = readResult.headers;
      this.rawData = readResult.rawData;

      // Initialize column mappings with defaults (if available)
      this.initializeColumnMappings(UNIDADES_IMPORT_CONFIG);

    } catch (error) {
      alert('Error al leer el archivo Excel');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Step 2: Initialize column mappings
   */
  private initializeColumnMappings(config: ImportConfig): void {
    // Start with default mappings if available
    const mappings: ColumnMapping[] = [];
    
    if (config.defaultColumnMappings) {
      // Use default mappings where Excel headers match
      config.defaultColumnMappings.forEach(defaultMapping => {
        const matchingHeader = this.excelHeaders.find(
          header => header.toLowerCase() === defaultMapping.excelColumn.toLowerCase()
        );
        if (matchingHeader) {
          mappings.push({
            excelColumn: matchingHeader,
            targetField: defaultMapping.targetField
          });
        }
      });
    }

    // Add unmapped headers (user will need to map these manually)
    this.excelHeaders.forEach(header => {
      const isMapped = mappings.some(m => m.excelColumn === header);
      if (!isMapped) {
        mappings.push({
          excelColumn: header,
          targetField: '' // Empty = needs user mapping
        });
      }
    });

    this.columnMappings = mappings;
  }

  /**
   * Step 3: User updates column mapping
   */
  updateColumnMapping(excelColumn: string, targetField: string): void {
    const mapping = this.columnMappings.find(m => m.excelColumn === excelColumn);
    if (mapping) {
      mapping.targetField = targetField;
    }
  }

  /**
   * Step 4: Validate data
   */
  validateData(config: ImportConfig): void {
    if (!this.rawData.length) {
      alert('No hay datos para validar');
      return;
    }

    // Filter out unmapped columns
    const validMappings = this.columnMappings.filter(
      m => m.targetField && m.targetField.trim() !== ''
    );

    if (validMappings.length === 0) {
      alert('Por favor mapee al menos una columna');
      return;
    }

    // Validate
    this.validationResult = this.validatorService.validateData(
      this.rawData,
      validMappings,
      config
    );

  }

  /**
   * Step 5: Import valid data
   */
  async importData(): Promise<void> {
    if (!this.validationResult || this.validationResult.validRows.length === 0) {
      alert('No hay filas válidas para importar');
      return;
    }

    this.isProcessing = true;
    const importErrors: Array<{ rowIndex: number; row: Record<string, any>; error: string }> = [];
    let importedCount = 0;

    try {
      // Import each valid row
      for (let i = 0; i < this.validationResult.validRows.length; i++) {
        const row = this.validationResult.validRows[i];
        
        try {
          // Add timestamps
          const dataToImport = {
            ...row,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          await this.unidadService.addUnidad(dataToImport);
          importedCount++;
        } catch (error) {
          // Find original row index
          const originalRowIndex = this.rawData.findIndex(
            originalRow => JSON.stringify(originalRow) === JSON.stringify(row)
          );

          importErrors.push({
            rowIndex: originalRowIndex,
            row,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      // Build result
      this.importResult = {
        validation: this.validationResult,
        importedCount,
        failedCount: importErrors.length,
        importErrors: importErrors.length > 0 ? importErrors : undefined,
        successMessage: `Importación completada: ${importedCount} de ${this.validationResult.validRows.length} filas importadas exitosamente`
      };

    } catch (error) {
      alert('Error durante la importación');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Helper: Get validation errors for display
   */
  getValidationErrors(): Array<{ rowIndex: number; errors: string[] }> {
    if (!this.validationResult) return [];

    return this.validationResult.invalidRows.map(invalidRow => ({
      rowIndex: invalidRow.rowIndex + 1, // 1-based for display
      errors: [
        ...(invalidRow.errors?.map(e => `${e.label}: ${e.message}`) || []),
        ...(invalidRow.rowError ? [invalidRow.rowError] : [])
      ]
    }));
  }
}

/**
 * Simplified usage example: One-step import
 */
export async function simpleImportExample(
  file: File,
  config: ImportConfig,
  columnMappings: ColumnMapping[],
  importFunction: (row: Record<string, any>) => Promise<void>
): Promise<ImportResult> {
  const excelService = inject(ExcelService);
  const validatorService = inject(DataValidatorService);

  // 1. Read Excel
  const readResult = await excelService.readExcelFile(file);

  // 2. Validate
  const validationResult = validatorService.validateData(
    readResult.rawData,
    columnMappings,
    config
  );

  // 3. Import valid rows
  const importErrors: Array<{ rowIndex: number; row: Record<string, any>; error: string }> = [];
  let importedCount = 0;

  for (let i = 0; i < validationResult.validRows.length; i++) {
    const row = validationResult.validRows[i];
    try {
      await importFunction(row);
      importedCount++;
    } catch (error) {
      const originalIndex = readResult.rawData.findIndex(
        r => JSON.stringify(r) === JSON.stringify(row)
      );
      importErrors.push({
        rowIndex: originalIndex,
        row,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return {
    validation: validationResult,
    importedCount,
    failedCount: importErrors.length,
    importErrors: importErrors.length > 0 ? importErrors : undefined,
    successMessage: `Importación completada: ${importedCount} de ${validationResult.validRows.length} filas importadas`
  };
}

