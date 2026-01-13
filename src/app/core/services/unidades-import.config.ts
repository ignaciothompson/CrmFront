/**
 * Import Configuration for Unidades
 * 
 * Complete configuration for importing Unidades from Excel files.
 */

import { ImportConfig, FieldValidationConfig } from '../models/import.models';

export const UNIDADES_IMPORT_CONFIG: ImportConfig = {
  entityType: 'unidades',
  entityDisplayName: 'Unidades',
  fields: [
    // Campos de Proyecto
    {
      fieldName: 'proyectoId',
      label: 'ID del Proyecto',
      dataType: 'string',
      required: false,
      trim: true
    },
    {
      fieldName: 'nombreProyecto',
      label: 'Nombre Proyecto',
      dataType: 'string',
      required: false,
      trim: true
    },
    {
      fieldName: 'proyectoNombre',
      label: 'Nombre Proyecto (alternativo)',
      dataType: 'string',
      required: false,
      trim: true
    },
    // Campos de Ubicación
    {
      fieldName: 'ciudad',
      label: 'Ciudad',
      dataType: 'string',
      required: false,
      trim: true
    },
    {
      fieldName: 'ciudadId',
      label: 'ID de Ciudad',
      dataType: 'number',
      required: false,
      min: 1
    },
    {
      fieldName: 'barrio',
      label: 'Barrio',
      dataType: 'string',
      required: false,
      trim: true
    },
    {
      fieldName: 'barrioId',
      label: 'ID de Barrio',
      dataType: 'number',
      required: false,
      min: 1
    },
    // Campos básicos de Unidad
    {
      fieldName: 'nombre',
      label: 'Nombre',
      dataType: 'string',
      required: true,
      trim: true
    },
    {
      fieldName: 'tipoUnidad',
      label: 'Tipo de Unidad',
      dataType: 'string',
      required: true,
      allowedValues: ['Apartamento', 'Casa', 'Chacra', 'Campo'],
      defaultValue: 'Apartamento',
      trim: true
    },
    {
      fieldName: 'piso',
      label: 'Piso',
      dataType: 'number',
      required: false,
      min: 0
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
      fieldName: 'm2Internos',
      label: 'Tamaño Interior (m²)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'm2Totales',
      label: 'Tamaño Total (m²)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'superficieEdificada',
      label: 'Superficie Edificada (m²)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'superficieTerreno',
      label: 'Superficie Terreno (m²)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'plantas',
      label: 'Plantas',
      dataType: 'number',
      required: false,
      min: 1
    },
    {
      fieldName: 'hectareas',
      label: 'Hectáreas',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'altura',
      label: 'Altura',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'orientacion',
      label: 'Orientación',
      dataType: 'string',
      required: false,
      allowedValues: ['Norte', 'Noreste', 'Este', 'Sudeste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'],
      trim: true
    },
    {
      fieldName: 'distribucion',
      label: 'Distribución',
      dataType: 'string',
      required: false,
      allowedValues: [
        'Frente/Esquinero',
        'Frente/Central',
        'Contrafrente/Esquinero',
        'Contrafrente/Central',
        'Lateral',
        'Inferior'
      ],
      trim: true
    },
    {
      fieldName: 'estadoComercial',
      label: 'Estado Comercial',
      dataType: 'string',
      required: true,
      allowedValues: ['En venta', 'En alquiler', 'Reservada', 'Vendida', 'Pre-venta', 'En Pozo'],
      defaultValue: 'En venta',
      trim: true
    },
    {
      fieldName: 'precioUSD',
      label: 'Precio (USD)',
      dataType: 'number',
      required: true,
      min: 0
    },
    {
      fieldName: 'responsable',
      label: 'Responsable',
      dataType: 'string',
      required: true,
      trim: true
    },
    {
      fieldName: 'comision',
      label: 'Comisión (%)',
      dataType: 'number',
      required: true,
      min: 0
    },
    {
      fieldName: 'fechaEntrega',
      label: 'Fecha de Entrega',
      dataType: 'date',
      required: false
    },
    {
      fieldName: 'terraza',
      label: 'Terraza',
      dataType: 'string',
      required: false,
      allowedValues: ['Si', 'No', 'Extra'],
      trim: true
    },
    {
      fieldName: 'tamanoTerraza',
      label: 'Tamaño Terraza (m²)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'garage',
      label: 'Garage',
      dataType: 'string',
      required: false,
      allowedValues: ['Si', 'No', 'Extra'],
      trim: true
    },
    {
      fieldName: 'tamanoGarage',
      label: 'Tamaño Garage (m²)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'precioGarage',
      label: 'Precio Garage (USD)',
      dataType: 'number',
      required: false,
      min: 0
    },
    {
      fieldName: 'amenities',
      label: 'Amenities',
      dataType: 'array',
      required: false,
      transform: (value: any) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          return value.split(',').map((x: string) => x.trim()).filter(Boolean);
        }
        return [];
      }
    }
  ],
  defaultColumnMappings: [
    // Proyecto
    { excelColumn: 'proyectoId', targetField: 'proyectoId' },
    { excelColumn: 'nombreProyecto', targetField: 'nombreProyecto' },
    { excelColumn: 'Nombre Proyecto', targetField: 'nombreProyecto' },
    { excelColumn: 'Proyecto', targetField: 'nombreProyecto' },
    { excelColumn: 'proyectoNombre', targetField: 'nombreProyecto' },
    { excelColumn: 'proyecto', targetField: 'nombreProyecto' },
    // Ubicación
    { excelColumn: 'ciudad', targetField: 'ciudad' },
    { excelColumn: 'Ciudad', targetField: 'ciudad' },
    { excelColumn: 'barrio', targetField: 'barrio' },
    { excelColumn: 'Barrio', targetField: 'barrio' },
    // Datos básicos
    { excelColumn: 'nombre', targetField: 'nombre' },
    { excelColumn: 'Nombre', targetField: 'nombre' },
    { excelColumn: 'tipoUnidad', targetField: 'tipoUnidad' },
    { excelColumn: 'tipo', targetField: 'tipoUnidad' },
    { excelColumn: 'Tipo', targetField: 'tipoUnidad' },
    { excelColumn: 'piso', targetField: 'piso' },
    { excelColumn: 'Piso', targetField: 'piso' },
    { excelColumn: 'dormitorios', targetField: 'dormitorios' },
    { excelColumn: 'Dormitorios', targetField: 'dormitorios' },
    { excelColumn: 'dorms', targetField: 'dormitorios' },
    { excelColumn: 'banos', targetField: 'banos' },
    { excelColumn: 'Baños', targetField: 'banos' },
    { excelColumn: 'baños', targetField: 'banos' },
    { excelColumn: 'bathrooms', targetField: 'banos' },
    // Tamaños
    { excelColumn: 'm2Internos', targetField: 'm2Internos' },
    { excelColumn: 'm2internos', targetField: 'm2Internos' },
    { excelColumn: 'metrosInternos', targetField: 'm2Internos' },
    { excelColumn: 'm2Totales', targetField: 'm2Totales' },
    { excelColumn: 'm2totales', targetField: 'm2Totales' },
    { excelColumn: 'metrosTotales', targetField: 'm2Totales' },
    { excelColumn: 'superficieEdificada', targetField: 'superficieEdificada' },
    { excelColumn: 'Superficie Edificada', targetField: 'superficieEdificada' },
    { excelColumn: 'superficieTerreno', targetField: 'superficieTerreno' },
    { excelColumn: 'Superficie Terreno', targetField: 'superficieTerreno' },
    { excelColumn: 'plantas', targetField: 'plantas' },
    { excelColumn: 'Plantas', targetField: 'plantas' },
    { excelColumn: 'hectareas', targetField: 'hectareas' },
    { excelColumn: 'Hectáreas', targetField: 'hectareas' },
    { excelColumn: 'hectáreas', targetField: 'hectareas' },
    { excelColumn: 'altura', targetField: 'altura' },
    { excelColumn: 'Altura', targetField: 'altura' },
    // Orientación y distribución
    { excelColumn: 'orientacion', targetField: 'orientacion' },
    { excelColumn: 'Orientación', targetField: 'orientacion' },
    { excelColumn: 'orientación', targetField: 'orientacion' },
    { excelColumn: 'distribucion', targetField: 'distribucion' },
    { excelColumn: 'Distribución', targetField: 'distribucion' },
    { excelColumn: 'distribución', targetField: 'distribucion' },
    // Estado y precio
    { excelColumn: 'estadoComercial', targetField: 'estadoComercial' },
    { excelColumn: 'Estado Comercial', targetField: 'estadoComercial' },
    { excelColumn: 'estado', targetField: 'estadoComercial' },
    { excelColumn: 'precioUSD', targetField: 'precioUSD' },
    { excelColumn: 'precio', targetField: 'precioUSD' },
    { excelColumn: 'Precio', targetField: 'precioUSD' },
    { excelColumn: 'precio usd', targetField: 'precioUSD' },
    { excelColumn: 'Precio USD', targetField: 'precioUSD' },
    { excelColumn: 'responsable', targetField: 'responsable' },
    { excelColumn: 'Responsable', targetField: 'responsable' },
    { excelColumn: 'comision', targetField: 'comision' },
    { excelColumn: 'Comisión', targetField: 'comision' },
    { excelColumn: 'comisión', targetField: 'comision' },
    { excelColumn: 'comision %', targetField: 'comision' },
    // Fecha de entrega
    { excelColumn: 'fechaEntrega', targetField: 'fechaEntrega' },
    { excelColumn: 'Fecha Entrega', targetField: 'fechaEntrega' },
    { excelColumn: 'entrega', targetField: 'fechaEntrega' },
    { excelColumn: 'Entrega', targetField: 'fechaEntrega' },
    { excelColumn: 'fecha de entrega', targetField: 'fechaEntrega' },
    // Terraza
    { excelColumn: 'terraza', targetField: 'terraza' },
    { excelColumn: 'Terraza', targetField: 'terraza' },
    { excelColumn: 'tamanoTerraza', targetField: 'tamanoTerraza' },
    { excelColumn: 'Tamaño Terraza', targetField: 'tamanoTerraza' },
    { excelColumn: 'tamaño terraza', targetField: 'tamanoTerraza' },
    { excelColumn: 'metrosTerraza', targetField: 'tamanoTerraza' },
    // Garage
    { excelColumn: 'garage', targetField: 'garage' },
    { excelColumn: 'Garage', targetField: 'garage' },
    { excelColumn: 'garaje', targetField: 'garage' },
    { excelColumn: 'tamanoGarage', targetField: 'tamanoGarage' },
    { excelColumn: 'Tamaño Garage', targetField: 'tamanoGarage' },
    { excelColumn: 'tamaño garage', targetField: 'tamanoGarage' },
    { excelColumn: 'metrosGarage', targetField: 'tamanoGarage' },
    { excelColumn: 'precioGarage', targetField: 'precioGarage' },
    { excelColumn: 'Precio Garage', targetField: 'precioGarage' },
    { excelColumn: 'precio garage', targetField: 'precioGarage' },
    // Amenities
    { excelColumn: 'amenities', targetField: 'amenities' },
    { excelColumn: 'Amenities', targetField: 'amenities' },
    { excelColumn: 'extras', targetField: 'amenities' },
    { excelColumn: 'Extras', targetField: 'amenities' },
    { excelColumn: 'equipamiento', targetField: 'amenities' }
  ]
};

