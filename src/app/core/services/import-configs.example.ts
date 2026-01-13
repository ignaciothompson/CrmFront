/**
 * Import Configuration Examples
 * 
 * This file contains example ImportConfig configurations for different entity types.
 * Use these as templates when creating import configurations for your entities.
 */

import { ImportConfig, FieldValidationConfig } from '../models/import.models';
import { CiudadType, TipoResidencia, PublicacionVisibilidad, PublicacionInterna, Disponibilidad } from '../models';

/**
 * Example: Import configuration for Unidades
 */
export const UNIDADES_IMPORT_CONFIG: ImportConfig = {
  entityType: 'unidades',
  entityDisplayName: 'Unidades',
  fields: [
    {
      fieldName: 'proyectoId',
      label: 'ID del Proyecto',
      dataType: 'string',
      required: true,
      trim: true
    },
    {
      fieldName: 'ciudad',
      label: 'Ciudad',
      dataType: 'string',
      required: true,
      allowedValues: ['Montevideo', 'Maldonado', 'Canelones'],
      trim: true
    },
    {
      fieldName: 'barrio',
      label: 'Barrio',
      dataType: 'string',
      required: false,
      trim: true
    },
    {
      fieldName: 'nombre',
      label: 'Nombre',
      dataType: 'string',
      required: false,
      trim: true
    },
    {
      fieldName: 'tipo',
      label: 'Tipo',
      dataType: 'string',
      required: true,
      allowedValues: ['Casa', 'Apartamento', 'Complejo'],
      trim: true
    },
    {
      fieldName: 'dormitorios',
      label: 'Dormitorios',
      dataType: 'number',
      required: true,
      min: 0,
      defaultValue: 1
    },
    {
      fieldName: 'banos',
      label: 'Baños',
      dataType: 'number',
      required: true,
      min: 1,
      defaultValue: 1
    },
    {
      fieldName: 'tamanoM2',
      label: 'Tamaño (m²)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'precioUSD',
      label: 'Precio (USD)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'expensasUSD',
      label: 'Expensas (USD)',
      dataType: 'number',
      required: false,
      min: 0,
      defaultValue: 0
    },
    {
      fieldName: 'extras',
      label: 'Extras',
      dataType: 'array',
      required: false,
      transform: (value: any) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          return value.split(',').map((x: string) => x.trim()).filter(Boolean);
        }
        return [];
      }
    },
    {
      fieldName: 'visibilidad',
      label: 'Visibilidad',
      dataType: 'string',
      required: true,
      allowedValues: ['Publicado', 'No publicado'],
      defaultValue: 'Publicado'
    },
    {
      fieldName: 'disponibilidad',
      label: 'Disponibilidad',
      dataType: 'string',
      required: true,
      defaultValue: 'Disponible: publicada'
    }
  ],
  defaultColumnMappings: [
    { excelColumn: 'proyectoId', targetField: 'proyectoId' },
    { excelColumn: 'ciudad', targetField: 'ciudad' },
    { excelColumn: 'barrio', targetField: 'barrio' },
    { excelColumn: 'nombre', targetField: 'nombre' },
    { excelColumn: 'tipo', targetField: 'tipo' },
    { excelColumn: 'dormitorios', targetField: 'dormitorios' },
    { excelColumn: 'banos', targetField: 'banos' },
    { excelColumn: 'tamanoM2', targetField: 'tamanoM2' },
    { excelColumn: 'precioUSD', targetField: 'precioUSD' },
    { excelColumn: 'expensasUSD', targetField: 'expensasUSD' },
    { excelColumn: 'extras', targetField: 'extras' },
    { excelColumn: 'visibilidad', targetField: 'visibilidad' },
    { excelColumn: 'disponibilidad', targetField: 'disponibilidad' }
  ]
};

/**
 * Example: Import configuration for Contactos
 */
export const CONTACTOS_IMPORT_CONFIG: ImportConfig = {
  entityType: 'contactos',
  entityDisplayName: 'Contactos',
  fields: [
    {
      fieldName: 'nombre',
      label: 'Nombre',
      dataType: 'string',
      required: true,
      min: 1,
      trim: true
    },
    {
      fieldName: 'apellido',
      label: 'Apellido',
      dataType: 'string',
      required: true,
      min: 1,
      trim: true
    },
    {
      fieldName: 'telefono',
      label: 'Teléfono',
      dataType: 'string',
      required: true,
      trim: true,
      pattern: /^[\d\s\+\-\(\)]+$/
    },
    {
      fieldName: 'mail',
      label: 'Email',
      dataType: 'email',
      required: false,
      trim: true
    },
    {
      fieldName: 'edad',
      label: 'Edad',
      dataType: 'number',
      required: false,
      min: 0,
      max: 150
    },
    {
      fieldName: 'pareja',
      label: 'Pareja',
      dataType: 'boolean',
      required: false,
      defaultValue: false
    },
    {
      fieldName: 'familia',
      label: 'Familia',
      dataType: 'boolean',
      required: false,
      defaultValue: false
    }
  ],
  defaultColumnMappings: [
    { excelColumn: 'nombre', targetField: 'nombre' },
    { excelColumn: 'apellido', targetField: 'apellido' },
    { excelColumn: 'telefono', targetField: 'telefono' },
    { excelColumn: 'mail', targetField: 'mail' },
    { excelColumn: 'edad', targetField: 'edad' },
    { excelColumn: 'pareja', targetField: 'pareja' },
    { excelColumn: 'familia', targetField: 'familia' }
  ]
};

/**
 * Example: Import configuration for Proyectos
 */
export const PROYECTOS_IMPORT_CONFIG: ImportConfig = {
  entityType: 'proyectos',
  entityDisplayName: 'Proyectos',
  fields: [
    {
      fieldName: 'nombre',
      label: 'Nombre del Proyecto',
      dataType: 'string',
      required: true,
      min: 1,
      trim: true
    },
    {
      fieldName: 'tipoProyecto',
      label: 'Tipo de Proyecto',
      dataType: 'string',
      required: true,
      allowedValues: ['Multiple', 'Unico'],
      trim: true
    },
    {
      fieldName: 'ciudad',
      label: 'Ciudad',
      dataType: 'string',
      required: true,
      allowedValues: ['Montevideo', 'Maldonado', 'Canelones'],
      trim: true
    },
    {
      fieldName: 'barrio',
      label: 'Barrio',
      dataType: 'string',
      required: false,
      trim: true
    },
    {
      fieldName: 'tipo',
      label: 'Tipo',
      dataType: 'string',
      required: true,
      allowedValues: ['Casa', 'Apartamento', 'Complejo'],
      trim: true
    }
  ],
  defaultColumnMappings: [
    { excelColumn: 'nombre', targetField: 'nombre' },
    { excelColumn: 'tipoProyecto', targetField: 'tipoProyecto' },
    { excelColumn: 'ciudad', targetField: 'ciudad' },
    { excelColumn: 'barrio', targetField: 'barrio' },
    { excelColumn: 'tipo', targetField: 'tipo' }
  ]
};

/**
 * Helper function to create a custom ImportConfig
 * 
 * @param entityType - Entity type identifier
 * @param entityDisplayName - Display name
 * @param fields - Field validation configurations
 * @param defaultMappings - Optional default column mappings
 * @param rowValidator - Optional row-level validator
 */
export function createImportConfig(
  entityType: string,
  entityDisplayName: string,
  fields: FieldValidationConfig[],
  defaultMappings?: Array<{ excelColumn: string; targetField: string }>,
  rowValidator?: (row: Record<string, any>) => string | null
): ImportConfig {
  return {
    entityType,
    entityDisplayName,
    fields,
    defaultColumnMappings: defaultMappings,
    rowValidator
  };
}

