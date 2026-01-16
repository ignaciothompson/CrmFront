import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExcelService } from '../../core/services/excel.service';
import { DataValidatorService } from '../../core/services/data-validator.service';
import { UnidadService } from '../../core/services/unidad';
import { ProyectoService } from '../../core/services/proyecto';
import { CiudadService } from '../../core/services/ciudad.service';
import { BarrioService } from '../../core/services/barrio.service';
import { UNIDADES_IMPORT_CONFIG } from '../../core/services/unidades-import.config';
import { UnidadForm } from '../unidades/unidad-form/unidad-form';
import {
  ColumnMapping,
  ImportValidationResult,
  RowValidationResult,
  FieldValidationConfig
} from '../../core/models/import.models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-importar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './importar.html',
  styleUrl: './importar.css'
})
export class Importar implements OnInit {
  private excelService = inject(ExcelService);
  private validatorService = inject(DataValidatorService);
  private unidadService = inject(UnidadService);
  private proyectoService = inject(ProyectoService);
  private ciudadService = inject(CiudadService);
  private barrioService = inject(BarrioService);
  private modal = inject(NgbModal);

  // Tab management
  activeTab: 'mapping' | 'review' = 'mapping';

  // Tab 1: File upload and column mapping
  excelFile: File | null = null;
  excelHeaders: string[] = [];
  rawData: Record<string, any>[] = [];
  columnMappings: ColumnMapping[] = [];
  availableFields: FieldValidationConfig[] = [];
  proyectos: Array<{ id: string; nombre: string }> = [];
  ciudades: Array<{ id: number; nombre: string }> = [];
  barrios: Array<{ id: number; nombre: string; ciudad_id: number }> = [];
  proyectosMap: Map<string, string> = new Map(); // Map nombre -> id

  // Step 2: Data review and editing
  validationResult: ImportValidationResult | null = null;
  editableRows: Array<{
    originalIndex: number;
    data: Record<string, any>;
    isValid: boolean;
    errors?: Array<{ field: string; message: string }>;
    isDeleted: boolean;
  }> = [];

  // UI state
  isProcessing = false;
  isImporting = false;
  resultMessage = '';
  resultType: 'success' | 'error' | 'warning' | '' = '';

  ngOnInit(): void {
    this.loadReferenceData();
    this.availableFields = UNIDADES_IMPORT_CONFIG.fields;
  }

  async loadReferenceData(): Promise<void> {
    try {
      // Load proyectos
      const proyectosData = await firstValueFrom(this.proyectoService.getProyectos());
      this.proyectos = proyectosData.map((p: any) => ({
        id: p.id || '',
        nombre: p.nombre || 'Sin nombre'
      }));
      // Create map for quick lookup (case-insensitive)
      this.proyectosMap.clear();
      proyectosData.forEach((p: any) => {
        if (p.nombre) {
          this.proyectosMap.set(p.nombre.toLowerCase().trim(), p.id);
        }
      });

      // Load ciudades
      const ciudadesData = await firstValueFrom(this.ciudadService.getCiudades());
      this.ciudades = ciudadesData.map((c: any) => ({
        id: c.id,
        nombre: c.nombre
      }));

      // Load barrios
      const barriosData = await firstValueFrom(this.barrioService.getBarrios());
      this.barrios = barriosData.map((b: any) => ({
        id: b.id,
        nombre: b.nombre,
        ciudad_id: b.ciudad_id
      }));
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  }

  /**
   * Step 1: Handle file selection
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!this.excelService.isValidExcelFile(file)) {
      this.showMessage('Por favor seleccione un archivo Excel válido (.xlsx o .xls)', 'error');
      return;
    }

    this.excelFile = file;
    this.isProcessing = true;

    try {
      const readResult = await this.excelService.readExcelFile(file);
      this.excelHeaders = readResult.headers;
      this.rawData = readResult.rawData;

      // Initialize column mappings
      this.initializeColumnMappings();

      this.showMessage(`Archivo leído: ${readResult.rowCount} filas, ${readResult.headers.length} columnas`, 'success');
    } catch (error) {
      console.error('Error reading file:', error);
      this.showMessage('Error al leer el archivo Excel', 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Initialize column mappings - no auto-mapping, all fields start empty
   */
  private initializeColumnMappings(): void {
    const mappings: ColumnMapping[] = [];

    // Create mappings for all Excel headers with empty targetField
    this.excelHeaders.forEach(header => {
      mappings.push({
        excelColumn: header,
        targetField: '' // No auto-mapping, user must select manually
      });
    });

    this.columnMappings = mappings;
  }

  /**
   * Update column mapping
   */
  updateColumnMapping(excelColumn: string, targetField: string, sourceType?: 'unidad' | 'proyecto'): void {
    const mapping = this.columnMappings.find(m => m.excelColumn === excelColumn);
    if (!mapping) return;

    // Set the target field (simple assignment)
    mapping.targetField = targetField && targetField.trim() !== '' ? targetField.trim() : '';
  }

  /**
   * Get mapping pairs for displaying 2 mappings per row
   */
  getMappingPairs(): Array<[ColumnMapping | null, ColumnMapping | null, ColumnMapping | null, ColumnMapping | null]> {
    const pairs: Array<[ColumnMapping | null, ColumnMapping | null, ColumnMapping | null, ColumnMapping | null]> = [];
    
    for (let i = 0; i < this.columnMappings.length; i += 4) {
      const first = this.columnMappings[i] || null;
      const second = i + 1 < this.columnMappings.length ? this.columnMappings[i + 1] || null : null;
      const third = i + 2 < this.columnMappings.length ? this.columnMappings[i + 2] || null : null;
      const fourth = i + 3 < this.columnMappings.length ? this.columnMappings[i + 3] || null : null;
      pairs.push([first, second, third, fourth]);
    }
    
    return pairs;
  }

  /**
   * Get proyecto fields (fields that belong to proyecto entity)
   */
  getProyectoFields(): Array<{ value: string; label: string; category: string }> {
    const proyectoFieldNames = [
      'nombreProyecto',
      'desarrollador',
      'localidad',
      'direccion',
      'entrega',
      'fechaEntrega'
    ];

    return this.availableFields
      .filter(field => proyectoFieldNames.includes(field.fieldName))
      .map(field => ({
        value: field.fieldName,
        label: this.getNormalizedLabel(field.fieldName, field.label),
        category: 'Proyecto'
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Get unidad fields (fields that belong to unidad entity)
   * Excludes barrioId, ciudadId, and proyecto fields
   */
  getUnidadFields(): Array<{ value: string; label: string; category: string }> {
    const proyectoFieldNames = [
      'proyectoId',
      'nombreProyecto',
      'desarrollador',
      'localidad',
      'direccion',
      'entrega',
      'fechaEntrega'
    ];

    // Exclude ID fields (barrioId, ciudadId) - only show barrio and ciudad
    const excludedIdFields = ['barrioId', 'ciudadId'];

    return this.availableFields
      .filter(field => 
        !proyectoFieldNames.includes(field.fieldName) &&
        !excludedIdFields.includes(field.fieldName)
      )
      .map(field => ({
        value: field.fieldName,
        label: this.getNormalizedLabel(field.fieldName, field.label),
        category: 'Unidad'
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Get normalized label for field
   */
  private getNormalizedLabel(fieldName: string, originalLabel: string): string {
    if (fieldName === 'proyectoId') {
      return 'Nombre Proyecto';
    } else if (fieldName === 'ciudad' || fieldName === 'ciudadId') {
      return 'Ciudad';
    } else if (fieldName === 'barrio' || fieldName === 'barrioId') {
      return 'Barrio';
    }
    return originalLabel;
  }

  /**
   * Get selected fields (fields that are already mapped)
   */
  private getSelectedFields(): Set<string> {
    return new Set(
      this.columnMappings
        .filter(m => m.targetField && m.targetField.trim() !== '')
        .map(m => m.targetField)
    );
  }

  /**
   * Get available target fields for mapping, excluding already selected ones
   * Separated by category (Unidad/Proyecto) and sorted alphabetically
   */
  getAvailableTargetFields(excludeField?: string): Array<{ value: string; label: string; category: string }> {
    const selectedFields = this.getSelectedFields();
    if (excludeField) {
      selectedFields.delete(excludeField); // Allow the current field to be shown
    }

    const unidadFields = this.getUnidadFields()
      .filter(field => !selectedFields.has(field.value));
    
    const proyectoFields = this.getProyectoFields()
      .filter(field => !selectedFields.has(field.value));

    return [
      { value: '', label: '-- No mapear --', category: '' },
      ...unidadFields,
      ...proyectoFields
    ];
  }

  /**
   * Get available fields grouped by category for a specific mapping
   * Shows all fields except those selected in OTHER mappings (not the current one)
   */
  getAvailableFieldsForMapping(excelColumn: string): {
    unidadFields: Array<{ value: string; label: string }>;
    proyectoFields: Array<{ value: string; label: string }>;
  } {
    const currentMapping = this.columnMappings.find(m => m.excelColumn === excelColumn);
    const currentField = currentMapping?.targetField?.trim() || '';
    
    // Get fields selected in OTHER mappings (exclude current mapping)
    const selectedFields = new Set(
      this.columnMappings
        .filter(m => m.excelColumn !== excelColumn && m.targetField && m.targetField.trim() !== '')
        .map(m => m.targetField!)
    );

    // Get all unidad fields - show all except those selected in other mappings
    const allUnidadFields = this.getUnidadFields();
    const unidadFields = allUnidadFields
      .filter(field => !selectedFields.has(field.value) || field.value === currentField)
      .map(field => ({ value: field.value, label: field.label }));

    // Get all proyecto fields - show all except those selected in other mappings
    const allProyectoFields = this.getProyectoFields();
    const proyectoFields = allProyectoFields
      .filter(field => !selectedFields.has(field.value) || field.value === currentField)
      .map(field => ({ value: field.value, label: field.label }));

    return { unidadFields, proyectoFields };
  }

  /**
   * Get selected value for unidad dropdown
   */
  getUnidadSelectedValue(mapping: ColumnMapping): string {
    if (!mapping.targetField) return '';
    const unidadFields = this.getUnidadFields();
    return unidadFields.some(f => f.value === mapping.targetField) ? mapping.targetField : '';
  }

  /**
   * Get selected value for proyecto dropdown
   */
  getProyectoSelectedValue(mapping: ColumnMapping): string {
    if (!mapping.targetField) return '';
    const proyectoFields = this.getProyectoFields();
    return proyectoFields.some(f => f.value === mapping.targetField) ? mapping.targetField : '';
  }

  /**
   * Validate data and move to review tab
   */
  async validateAndContinue(): Promise<void> {
    if (!this.rawData.length) {
      this.showMessage('No hay datos para validar', 'error');
      return;
    }

    // Filter out unmapped columns
    const validMappings = this.columnMappings.filter(
      m => m.targetField && m.targetField.trim() !== ''
    );

    if (validMappings.length === 0) {
      this.showMessage('Por favor mapee al menos una columna', 'error');
      return;
    }

    this.isProcessing = true;

    try {
      // Validate data
      this.validationResult = this.validatorService.validateData(
        this.rawData,
        validMappings,
        UNIDADES_IMPORT_CONFIG
      );

      // Prepare editable rows (combine valid and invalid rows)
      // Create a map of row indices to validation results for quick lookup
      const invalidRowMap = new Map<number, RowValidationResult>();
      this.validationResult.invalidRows.forEach(ir => {
        invalidRowMap.set(ir.rowIndex, ir);
      });

      // Create a map of original row indices to valid rows
      const validRowMap = new Map<number, Record<string, any>>();
      for (const vr of this.validationResult.validRows) {
        // Find the original row index by matching data
        for (let oi = 0; oi < this.rawData.length; oi++) {
          const or = this.rawData[oi];
          const mapped = await this.mapRow(or, validMappings);
          // Simple comparison - check if key fields match
          const keysMatch = Object.keys(vr).every(key => {
            return JSON.stringify(mapped[key]) === JSON.stringify(vr[key]);
          });
          if (keysMatch) {
            validRowMap.set(oi, vr);
            break;
          }
        }
      }

      // Build editable rows (async mapping)
      this.editableRows = [];
      for (let index = 0; index < this.rawData.length; index++) {
        const row = this.rawData[index];
        const invalidRow = invalidRowMap.get(index);
        const validRow = validRowMap.get(index);

        if (invalidRow) {
          const mappedData = invalidRow.mappedRow || await this.mapRow(row, validMappings);
          this.editableRows.push({
            originalIndex: index,
            data: mappedData,
            isValid: false,
            errors: invalidRow.errors?.map(e => ({
              field: e.field,
              message: e.message
            })),
            isDeleted: false
          });
        } else if (validRow) {
          this.editableRows.push({
            originalIndex: index,
            data: validRow,
            isValid: true,
            errors: undefined,
            isDeleted: false
          });
        } else {
          // Fallback: map row manually
          const mappedData = await this.mapRow(row, validMappings);
          this.editableRows.push({
            originalIndex: index,
            data: mappedData,
            isValid: true,
            errors: undefined,
            isDeleted: false
          });
        }
      }

      // Move to review tab
      this.activeTab = 'review';
      this.showMessage(
        `Validación completada: ${this.validationResult.summary.validCount} válidas, ${this.validationResult.summary.invalidCount} con errores`,
        'success'
      );
    } catch (error) {
      console.error('Error validating data:', error);
      this.showMessage('Error al validar los datos', 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Map a raw row using column mappings
   * Handles ciudad/barrio matching (case-insensitive) and proyecto creation
   */
  private async mapRow(row: Record<string, any>, mappings: ColumnMapping[]): Promise<Record<string, any>> {
    const mapped: Record<string, any> = {};

    // First pass: process ciudad and barrio mappings first to ensure ciudadId is available for barrio
    const ciudadMapping = mappings.find(m => m.targetField === 'ciudad');
    const barrioMapping = mappings.find(m => m.targetField === 'barrio');
    
    // Process ciudad first
    if (ciudadMapping && ciudadMapping.targetField) {
      const value = row[ciudadMapping.excelColumn];
      if (value !== undefined && value !== null && value !== '') {
        const ciudadMatch = this.ciudades.find(
          c => c.nombre.toLowerCase().trim() === String(value).toLowerCase().trim()
        );
        if (ciudadMatch) {
          mapped['ciudadId'] = ciudadMatch.id;
          mapped['ciudad'] = ciudadMatch.nombre; // Keep nombre for reference
        } else {
          mapped['ciudad'] = String(value).trim();
        }
      }
    }
    
    // Process barrio second (after ciudad)
    if (barrioMapping && barrioMapping.targetField) {
      const value = row[barrioMapping.excelColumn];
      if (value !== undefined && value !== null && value !== '') {
        // First check if we have ciudadId to filter barrios
        const ciudadIdForBarrio = mapped['ciudadId'];
        let barrioMatch;
        
        if (ciudadIdForBarrio) {
          // Find barrio by name within the ciudad
          barrioMatch = this.barrios.find(
            b => b.ciudad_id === ciudadIdForBarrio &&
                 b.nombre.toLowerCase().trim() === String(value).toLowerCase().trim()
          );
        } else {
          // Find barrio by name without ciudad filter
          barrioMatch = this.barrios.find(
            b => b.nombre.toLowerCase().trim() === String(value).toLowerCase().trim()
          );
        }
        
        if (barrioMatch) {
          mapped['barrioId'] = barrioMatch.id;
          mapped['barrio'] = barrioMatch.nombre; // Keep nombre for reference
          // Also ensure ciudadId is set if barrio has ciudad_id
          if (barrioMatch.ciudad_id && !mapped['ciudadId']) {
            mapped['ciudadId'] = barrioMatch.ciudad_id;
            const ciudad = this.ciudades.find(c => c.id === barrioMatch.ciudad_id);
            if (ciudad) {
              mapped['ciudad'] = ciudad.nombre;
            }
          }
        } else {
          mapped['barrio'] = String(value).trim();
        }
      }
    }

    // Second pass: process all other mappings
    for (const mapping of mappings) {
      if (mapping.targetField) {
        // Skip ciudad and barrio as they were already processed
        if (mapping.targetField === 'ciudad' || mapping.targetField === 'barrio') {
          continue;
        }
        
        const value = row[mapping.excelColumn];
        if (value !== undefined && value !== null && value !== '') {
          // Handle proyecto nombre -> check if exists, create if not
          if (mapping.targetField === 'proyectoId' || mapping.targetField === 'nombreProyecto') {
            const proyectoNombre = String(value).trim();
            const proyectoNombreLower = proyectoNombre.toLowerCase();
            
            // Check cache first
            let proyectoId = this.proyectosMap.get(proyectoNombreLower);
            
            // If not in cache, check in proyectos list
            if (!proyectoId) {
              const proyectoExistente = this.proyectos.find(
                p => p.nombre.toLowerCase().trim() === proyectoNombreLower
              );
              
              if (proyectoExistente) {
                proyectoId = proyectoExistente.id;
                // Update cache
                this.proyectosMap.set(proyectoNombreLower, proyectoId);
              }
            }
            
            if (proyectoId) {
              mapped['proyectoId'] = proyectoId;
            } else {
              // Keep nombreProyecto for later processing during import
              // Don't create proyecto here, will be created during importData()
              mapped['nombreProyecto'] = proyectoNombre;
            }
          }
          // Regular field mapping
          else {
            mapped[mapping.targetField] = value;
          }
        }
      }
    }

    return mapped;
  }

  /**
   * Step 2: Update editable row data
   */
  updateRowData(rowIndex: number, field: string, value: any): void {
    const row = this.editableRows[rowIndex];
    if (row) {
      row.data[field] = value;
      
      // Handle ciudadId change - update barrios list and ciudad name
      if (field === 'ciudadId') {
        if (value) {
          const ciudadId = parseInt(String(value), 10);
          if (!isNaN(ciudadId)) {
            row.data['ciudadId'] = ciudadId;
            // Find ciudad name
            const ciudad = this.ciudades.find(c => c.id === ciudadId);
            if (ciudad) {
              row.data['ciudad'] = ciudad.nombre;
            }
            // Clear barrioId if it doesn't belong to new ciudad
            if (row.data['barrioId']) {
              const barrio = this.barrios.find(b => b.id === row.data['barrioId']);
              if (barrio && barrio.ciudad_id !== ciudadId) {
                delete row.data['barrioId'];
                delete row.data['barrio'];
              }
            }
          }
        }
      }
      
      // Handle barrioId change - update barrio name
      if (field === 'barrioId') {
        if (value) {
          const barrioId = parseInt(String(value), 10);
          if (!isNaN(barrioId)) {
            row.data['barrioId'] = barrioId;
            const barrio = this.barrios.find(b => b.id === barrioId);
            if (barrio) {
              row.data['barrio'] = barrio.nombre;
              // Ensure ciudadId matches barrio's ciudad
              if (barrio.ciudad_id && !row.data['ciudadId']) {
                row.data['ciudadId'] = barrio.ciudad_id;
                const ciudad = this.ciudades.find(c => c.id === barrio.ciudad_id);
                if (ciudad) {
                  row.data['ciudad'] = ciudad.nombre;
                }
              }
            }
          }
        }
      }
      
      // Re-validate row
      this.validateRow(rowIndex);
    }
  }

  /**
   * Validate a single row
   */
  private validateRow(rowIndex: number): void {
    const row = this.editableRows[rowIndex];
    if (!row) return;

    const errors: Array<{ field: string; message: string }> = [];

    // Validate against field configs
    this.availableFields.forEach(fieldConfig => {
      const value = row.data[fieldConfig.fieldName];
      
      // Check required
      if (fieldConfig.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: fieldConfig.fieldName,
          message: `${fieldConfig.label} es obligatorio`
        });
        return;
      }

      // Skip validation if empty and not required
      if (value === undefined || value === null || value === '') {
        return;
      }

      // Type validation
      if (fieldConfig.dataType === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push({
            field: fieldConfig.fieldName,
            message: `${fieldConfig.label} debe ser un número válido`
          });
        } else {
          if (fieldConfig.min !== undefined && numValue < fieldConfig.min) {
            errors.push({
              field: fieldConfig.fieldName,
              message: `${fieldConfig.label} debe ser al menos ${fieldConfig.min}`
            });
          }
          if (fieldConfig.max !== undefined && numValue > fieldConfig.max) {
            errors.push({
              field: fieldConfig.fieldName,
              message: `${fieldConfig.label} no puede ser mayor que ${fieldConfig.max}`
            });
          }
        }
      }

      // Allowed values validation
      if (fieldConfig.allowedValues && fieldConfig.allowedValues.length > 0) {
        if (!fieldConfig.allowedValues.includes(value)) {
          errors.push({
            field: fieldConfig.fieldName,
            message: `${fieldConfig.label} debe ser uno de: ${fieldConfig.allowedValues.join(', ')}`
          });
        }
      }
    });

    row.errors = errors.length > 0 ? errors : undefined;
    row.isValid = errors.length === 0;
  }

  /**
   * Delete a row (mark for deletion)
   */
  deleteRow(rowIndex: number): void {
    this.editableRows[rowIndex].isDeleted = true;
  }

  /**
   * Restore a deleted row
   */
  restoreRow(rowIndex: number): void {
    this.editableRows[rowIndex].isDeleted = false;
  }

  /**
   * Get rows to import (not deleted and valid)
   */
  getRowsToImport(): Array<Record<string, any>> {
    return this.editableRows
      .filter(row => !row.isDeleted && row.isValid)
      .map(row => row.data);
  }

  /**
   * Step 2: Import data
   */
  async importData(): Promise<void> {
    const rowsToImport = this.getRowsToImport();

    if (rowsToImport.length === 0) {
      this.showMessage('No hay filas válidas para importar', 'warning');
      return;
    }

    this.isImporting = true;
    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      for (const row of rowsToImport) {
        try {
          // Prepare data for import
          const dataToImport: Record<string, any> = {
            ...row,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Handle nombreProyecto -> create/get proyecto
          // First check if proyecto exists by name (case-insensitive)
          if (dataToImport['nombreProyecto'] && !dataToImport['proyectoId']) {
            const proyectoNombre = String(dataToImport['nombreProyecto']).trim();
            const proyectoNombreLower = proyectoNombre.toLowerCase();
            
            // Check cache first
            let proyectoId: string | undefined = this.proyectosMap.get(proyectoNombreLower);
            
            // If not in cache, check in proyectos list
            if (!proyectoId) {
              const proyectoExistente = this.proyectos.find(
                p => p.nombre.toLowerCase().trim() === proyectoNombreLower
              );
              
              if (proyectoExistente) {
                proyectoId = proyectoExistente.id;
                // Update cache
                this.proyectosMap.set(proyectoNombreLower, proyectoId);
              }
            }
            
            // If still not found, create new proyecto
            if (!proyectoId) {
              try {
                const nuevoProyecto = await this.proyectoService.addProyecto({
                  nombre: proyectoNombre
                });
                proyectoId = nuevoProyecto.id;
                
                // Update local cache only if proyectoId is valid
                if (proyectoId) {
                  this.proyectos.push({ id: proyectoId, nombre: proyectoNombre });
                  this.proyectosMap.set(proyectoNombreLower, proyectoId);
                }
              } catch (error) {
                console.error('Error creating proyecto:', error);
                errors.push(`Error al crear proyecto "${proyectoNombre}": ${error}`);
                failedCount++;
                continue; // Skip this row
              }
            }
            
            if (proyectoId) {
              dataToImport['proyectoId'] = proyectoId;
            }
            delete dataToImport['nombreProyecto'];
          }

          // Handle precioUSD -> precio mapping
          if (dataToImport['precioUSD'] !== undefined && !dataToImport['precio']) {
            dataToImport['precio'] = dataToImport['precioUSD'];
            delete dataToImport['precioUSD'];
          }

          // Handle fechaEntrega -> entrega mapping
          if (dataToImport['fechaEntrega'] !== undefined && !dataToImport['entrega']) {
            dataToImport['entrega'] = dataToImport['fechaEntrega'];
            delete dataToImport['fechaEntrega'];
          }

          await this.unidadService.addUnidad(dataToImport);
          importedCount++;
        } catch (error) {
          failedCount++;
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
          errors.push(`Fila ${rowsToImport.indexOf(row) + 1}: ${errorMsg}`);
          console.error('Error importing row:', error, row);
        }
      }

      if (importedCount > 0) {
        this.showMessage(
          `Importación completada: ${importedCount} de ${rowsToImport.length} unidades importadas exitosamente`,
          'success'
        );
      }

      if (failedCount > 0) {
        this.showMessage(
          `Importación completada con errores: ${importedCount} exitosas, ${failedCount} fallidas`,
          'warning'
        );
        console.error('Import errors:', errors);
      }
    } catch (error) {
      console.error('Error during import:', error);
      this.showMessage('Error durante la importación', 'error');
    } finally {
      this.isImporting = false;
    }
  }

  /**
   * Open unidad form modal for editing
   */
  openUnidadModal(rowIndex: number): void {
    const row = this.editableRows[rowIndex];
    if (!row) return;

    const modalRef = this.modal.open(UnidadForm, { size: 'xl', backdrop: 'static', keyboard: false });
    const component = modalRef.componentInstance as UnidadForm;
    
    // Mark as import mode to hide "Agregar y Repetir" button
    component.isImportMode = true;
    // Set a temporary id to show "Editar" in the modal title instead of "Nuevo"
    component.unidadId = 'edit';
    
    // Prepare data for the form
    const formData: any = { ...row.data };
    
    // Handle nombreProyecto - create proyecto if needed
    if (formData['nombreProyecto'] && !formData['proyectoId']) {
      const proyectoNombre = String(formData['nombreProyecto']).trim();
      const proyectoId = this.proyectosMap.get(proyectoNombre.toLowerCase());
      if (proyectoId) {
        formData['proyectoId'] = proyectoId;
      }
    }
    
    // Map ciudadId/barrioId to ciudad/barrio for the form (form expects string IDs)
    if (formData['ciudadId']) {
      formData['ciudad'] = String(formData['ciudadId']);
    } else if (formData['ciudad']) {
      // If we have ciudad name, try to find ID
      const ciudadMatch = this.findCiudadByName(formData['ciudad']);
      if (ciudadMatch) {
        formData['ciudad'] = String(ciudadMatch.id);
        formData['ciudadId'] = ciudadMatch.id;
      }
    }
    
    if (formData['barrioId']) {
      formData['barrio'] = String(formData['barrioId']);
    } else if (formData['barrio']) {
      // If we have barrio name, try to find ID
      const barrioMatch = this.findBarrioByName(formData['barrio'], formData['ciudad'] || formData['ciudadId']);
      if (barrioMatch) {
        formData['barrio'] = String(barrioMatch.id);
        formData['barrioId'] = barrioMatch.id;
      }
    }
    
    // Set proyectoId if available, but don't lock it
    if (formData['proyectoId']) {
      component.proyectoId = formData['proyectoId'];
      component.editProyecto = false; // Don't allow editing proyecto when importing
    }

    // Wait for component to initialize, then set the model data
    setTimeout(() => {
      // Map the data to the form model structure
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          // Skip ID fields that shouldn't be in model
          if (key !== 'ciudadId' && key !== 'barrioId') {
            component.model[key] = formData[key];
          }
        }
      });
      
      // Set ciudadId and barrioId separately
      if (formData['ciudadId']) {
        component.model['ciudad'] = String(formData['ciudadId']);
      }
      if (formData['barrioId']) {
        component.model['barrio'] = String(formData['barrioId']);
      }
      
      // Don't lock proyecto - allow user to change it
      component.projectLocked = false;
      component.proyectoFieldsDisabled = false;
      
      // Load barrios if ciudad is set
      if (formData['ciudad']) {
        component.onCiudadChange();
      }
    }, 200);

    modalRef.result.then((result: any) => {
      if (result === true || (result && result.draft === true)) {
        // Get model data (either from result.model if draft, or component.model)
        const modelData = result?.model || component.model;
        const updatedData: Record<string, any> = { ...modelData };
        
        // Map ciudad/barrio back to ciudadId/barrioId
        if (updatedData['ciudad']) {
          const ciudadId = parseInt(String(updatedData['ciudad']), 10);
          if (!isNaN(ciudadId)) {
            updatedData['ciudadId'] = ciudadId;
            const ciudad = this.ciudades.find(c => c.id === ciudadId);
            if (ciudad) {
              updatedData['ciudad'] = ciudad.nombre;
            }
          }
        }
        if (updatedData['barrio']) {
          const barrioId = parseInt(String(updatedData['barrio']), 10);
          if (!isNaN(barrioId)) {
            updatedData['barrioId'] = barrioId;
            const barrio = this.barrios.find(b => b.id === barrioId);
            if (barrio) {
              updatedData['barrio'] = barrio.nombre;
            }
          }
        }
        
        // Handle proyectoNombre -> proyectoId conversion
        if (updatedData['proyectoNombre'] && !updatedData['proyectoId']) {
          const proyectoNombre = String(updatedData['proyectoNombre']).trim();
          let proyectoId = this.proyectosMap.get(proyectoNombre.toLowerCase());
          
          if (!proyectoId) {
            // Check if proyecto exists in database
            const proyectoExistente = this.proyectos.find(
              p => p.nombre.toLowerCase().trim() === proyectoNombre.toLowerCase().trim()
            );
            
            if (proyectoExistente) {
              proyectoId = proyectoExistente.id;
            } else {
              // Will be created during import, keep nombreProyecto for now
              updatedData['nombreProyecto'] = proyectoNombre;
            }
          }
          
          if (proyectoId) {
            updatedData['proyectoId'] = proyectoId;
            delete updatedData['proyectoNombre'];
            delete updatedData['nombreProyecto'];
          }
        }
        
        // Update proyectoId if changed
        if (updatedData['proyectoId']) {
          row.data['proyectoId'] = updatedData['proyectoId'];
        }
        
        // Update the row with all data (save as draft)
        row.data = { ...row.data, ...updatedData };
        this.validateRow(rowIndex);
        
        // Reload reference data in case proyecto was created
        this.loadReferenceData();
      }
    }).catch(() => {});
  }

  /**
   * Reset import process
   */
  reset(): void {
    this.activeTab = 'mapping';
    this.excelFile = null;
    this.excelHeaders = [];
    this.rawData = [];
    this.columnMappings = [];
    this.editableRows = [];
    this.validationResult = null;
    this.resultMessage = '';
    this.resultType = '';
  }

  /**
   * Show message
   */
  private showMessage(message: string, type: 'success' | 'error' | 'warning' | '' = ''): void {
    this.resultMessage = message;
    this.resultType = type;
    setTimeout(() => {
      if (this.resultMessage === message) {
        this.resultMessage = '';
        this.resultType = '';
      }
    }, 5000);
  }

  /**
   * Get field label by field name
   */
  getFieldLabel(fieldName: string): string {
    const field = this.availableFields.find(f => f.fieldName === fieldName);
    return field?.label || fieldName;
  }

  /**
   * Get field config by field name
   */
  getFieldConfig(fieldName: string): FieldValidationConfig | undefined {
    return this.availableFields.find(f => f.fieldName === fieldName);
  }

  /**
   * Get barrios filtered by ciudad (case-insensitive matching)
   */
  getBarriosByCiudad(ciudadIdOrNombre: number | string | undefined): Array<{ id: number; nombre: string }> {
    if (!ciudadIdOrNombre) return [];
    
    let ciudadId: number | null = null;
    
    if (typeof ciudadIdOrNombre === 'string') {
      // Try to parse as number first
      const parsedId = parseInt(ciudadIdOrNombre, 10);
      if (!isNaN(parsedId)) {
        ciudadId = parsedId;
      } else {
        // Find ciudad by name (case-insensitive)
        const ciudad = this.ciudades.find(
          c => c.nombre.toLowerCase().trim() === ciudadIdOrNombre.toLowerCase().trim()
        );
        if (ciudad) {
          ciudadId = ciudad.id;
        }
      }
    } else {
      ciudadId = ciudadIdOrNombre;
    }

    if (ciudadId === null) return [];

    return this.barrios
      .filter(b => b.ciudad_id === ciudadId)
      .map(b => ({ id: b.id, nombre: b.nombre }));
  }

  /**
   * Find ciudad by name (case-insensitive)
   */
  findCiudadByName(nombre: string): { id: number; nombre: string } | undefined {
    return this.ciudades.find(
      c => c.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
    );
  }

  /**
   * Find barrio by name and ciudad (case-insensitive)
   */
  findBarrioByName(nombreBarrio: string, nombreCiudad?: string): { id: number; nombre: string } | undefined {
    if (nombreCiudad) {
      const ciudad = this.findCiudadByName(nombreCiudad);
      if (ciudad) {
        return this.barrios.find(
          b => b.ciudad_id === ciudad.id && 
               b.nombre.toLowerCase().trim() === nombreBarrio.toLowerCase().trim()
        );
      }
    }
    return this.barrios.find(
      b => b.nombre.toLowerCase().trim() === nombreBarrio.toLowerCase().trim()
    );
  }

  /**
   * Getter methods for template filters
   */
  get validRowsCount(): number {
    return this.editableRows.filter(r => r.isValid && !r.isDeleted).length;
  }

  get invalidRowsCount(): number {
    return this.editableRows.filter(r => !r.isValid && !r.isDeleted).length;
  }

  get deletedRowsCount(): number {
    return this.editableRows.filter(r => r.isDeleted).length;
  }

  get deletedRows(): Array<{
    originalIndex: number;
    data: Record<string, any>;
    isValid: boolean;
    errors?: Array<{ field: string; message: string }>;
    isDeleted: boolean;
  }> {
    return this.editableRows.filter(r => r.isDeleted);
  }

  /**
   * Helper method to convert value to string for preview
   */
  toString(value: any): string {
    return String(value || '');
  }

  /**
   * Get proyecto nombre by id
   */
  getProyectoNombre(proyectoId: string, nombreProyecto?: string): string {
    if (nombreProyecto) return nombreProyecto;
    const proyecto = this.proyectos.find(p => p.id === proyectoId);
    return proyecto?.nombre || '';
  }

  /**
   * Get barrio selected value (ID or name)
   */
  getBarrioSelectedValue(rowData: Record<string, any>): string {
    if (rowData['barrioId']) {
      return String(rowData['barrioId']);
    }
    // If we have barrio name, try to find the ID
    if (rowData['barrio']) {
      const barrioMatch = this.findBarrioByName(rowData['barrio'], rowData['ciudad'] || rowData['ciudadId']);
      if (barrioMatch) {
        return String(barrioMatch.id);
      }
    }
    return '';
  }
}
