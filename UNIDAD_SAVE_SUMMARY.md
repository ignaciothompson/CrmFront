# Unidad Save Process - Complete Summary

## Overview
This document summarizes what fields are saved to the `unidades` table and how the save process works based on the current model structure.

## Current Model Structure

```typescript
model: {
  // Common
  nombre: '',              // saved on unidad
  fechaEntrega: '',        // saved on unidad
  ciudad: null,            // saved on unidad
  barrio: null,            // saved on unidad
  responsable: '',         // saved on unidad
  comision: null,          // saved on unidad
  tipoUnidad: 'Apartamento', // saved on unidad
  estadoComercial: 'En venta', // saved on unidad
  
  // Apartment specifics
  dormitorios: null,
  banos: null,
  m2Internos: null,
  m2Totales: null,
  piso: null,
  orientacion: null,
  distribucion: null,
  altura: null,
  precioUSD: null,
  
  // Extras
  terraza: '',
  garage: 'No',
  tamanoTerraza: null,
  tamanoGarage: null,
  precioGarage: null,
  
  // Casa/Campo/Chacra specifics
  superficieEdificada: null,
  superficieTerreno: null,
  plantas: null,
  hectareas: null,
  
  // Amenities
  amenities: [],
  
  // Proyecto values
  proyectoId: '',          // saved on proyecto
  proyectoNombre: '',       // UI-only
}
```

## Fields Saved to `unidades` Table

### ✅ Core Fields (Always Saved)
- `id` (varchar) - UUID, auto-generated if not provided
- `proyecto_id` (varchar) - Reference to proyecto (nullable)
- `nombre` (varchar) - Unit name
- `tipo_unidad` (varchar) - Type: 'Apartamento', 'Casa', 'Chacra', 'Campo'
- `estado_comercial` (varchar) - Commercial status: 'En venta', 'En alquiler', 'Reservada', 'Vendida', etc.
- `precio` (numeric) - Price in USD (mapped from `precioUSD`)
- ~~`moneda`~~ - Not saved (we only manage USD, no need to store it)
- `responsable` (varchar) - Responsible person/agent
- `comision` (numeric) - Commission percentage
- `entrega` (varchar/date) - Delivery date (mapped from `fechaEntrega`)

### ✅ Apartment-Specific Fields
- `dormitorios` (integer) - Number of bedrooms
- `banos` (integer) - Number of bathrooms
- `m2_internos` (numeric) - Internal square meters
- `m2_totales` (numeric) - Total square meters
- `piso` (integer) - Floor number
- `orientacion` (varchar) - Orientation: 'Norte', 'Sur', 'Este', 'Oeste', etc.
- `distribucion` (varchar) - Distribution: 'Frente/Esquinero', 'Frente/Central', etc.
- `altura` (varchar) - Height (e.g., "2,40m")

### ✅ Casa/Campo/Chacra-Specific Fields
- `superficie_edificada` (numeric) - Built surface in m²
- `superficie_terreno` (numeric) - Land surface in m²
- `plantas` (integer) - Number of floors
- `hectareas` (numeric) - Hectares (for Chacra/Campo)

### ✅ Location Fields
- `ciudad` (varchar) - City name as string
- `barrio` (varchar) - Neighborhood name as string
- `ciudad_id` (integer) - Foreign key to ciudades table (nullable)
- `barrio_id` (integer) - Foreign key to barrios table (nullable)

### ✅ Developer Field
- `desarrollador` (varchar) - Developer name (nullable)

### ✅ Extra/Amenity Fields
- `terraza` (varchar) - Terrace: 'Si', 'No', or 'Extra'
- `garage` (varchar) - Garage: 'Si', 'No', or 'Extra'
- `tamano_terraza` (numeric) - Terrace size in m² (nullable)
- `tamano_garage` (numeric) - Garage size in m² (nullable)
- `precio_garage` (numeric) - Garage price in USD (nullable)
- `amenities` (jsonb) - Array of amenities as `[{id: string, name: string}]`

### ✅ Timestamps
- `created_at` (timestamp) - Auto-set on creation
- `updated_at` (timestamp) - Auto-updated on modification (via trigger)
- `deleted_at` (timestamp) - For soft deletes (null = not deleted)

### ✅ Status Field
- `activo` (boolean) - Active status (defaults to true)

## Fields NOT Saved (Removed/Deleted)

### ❌ Removed from Database Schema
- `antiguedad` - Age of property
- `condicion` - Condition
- `aptitud_suelo` - Soil aptitude
- `indice_productividad` - Productivity index

### ❌ Removed from Model and UI
- `descripcion` - Description field
- `ubicacion` - Location/address field
- `tipoPropiedad` - Property type field
- `pisoProyecto` - Project floors field
- `unidadesTotales` - Total units field
- `areaComun` - Common areas field
- `equipamiento` - Equipment field
- `extras` - Legacy extras array (replaced by `amenities`)
- `alcance` - Scope field (removed from flow control)

### ❌ Legacy Fields (Removed from Tables and UI)
- `tipo` - Legacy type field
- `unidades` - Legacy units field
- `inicio` - Legacy start field

### ❌ UI-Only Fields (Not Saved)
- `proyectoNombre` - UI-only, used for display and validation
- `precioUSD` - Mapped to `precio` + `moneda`, then deleted
- `fechaEntrega` - Mapped to `entrega` (database column name)

### ❌ Chacra/Campo Fields Not Saved
- `acceso` - Not saved
- `infraestructura` - Not saved
- `tipoConstruccion` - Not saved
- `mejorasTrabajo` - Not saved
- `infraestructuraHabitacional` - Not saved
- `fuentesAgua` - Not saved
- `luz` - Not saved (boolean)
- `agua` - Not saved (boolean)
- `internet` - Not saved (boolean)

## Save Process Flow

### 1. Form Submission (`unidad-form.ts`)
```typescript
save() → validateRequiredFields() → ensureProyectoId() → buildPayloadWithProjectInheritance() → unidadService.addUnidad()
```

### 2. Data Cleaning (`unidad.ts` - `addUnidad()`)

#### Step 1: Remove Undefined Values
- `removeUndefinedDeep()` removes all undefined values from the payload

#### Step 2: Field Cleanup
- Removes UI-only fields (`proyectoNombre`)
- Removes fields not in database schema
- Removes legacy/removed fields

#### Step 3: Field Mapping
- `fechaEntrega` → `entrega` (for database column name)
- `precioUSD` → `precio` + `moneda` (defaults to 'USD')
- `tipoUnidad` → `tipo_unidad` (via snake_case conversion)
- `estadoComercial` → `estado_comercial` (via snake_case conversion)

#### Step 4: Transformations
- `amenities`: `['key1', 'key2']` → `[{id: 'key1', name: 'key1'}, {id: 'key2', name: 'key2'}]`
- Generate UUID if `id` not provided
- Add timestamps: `created_at`, `updated_at`, `deleted_at` (null)

#### Step 5: Validation
- Ensures `precio` is set (throws error if missing)

#### Step 6: Case Conversion
- Converts camelCase to snake_case for database
- Example: `proyectoId` → `proyecto_id`, `tipoUnidad` → `tipo_unidad`

#### Step 7: Database Insert
- Inserts into `unidades` table via Supabase
- Returns created record with `id`

### 3. Proyecto Handling

#### If Creating New Proyecto
- Only saves `nombre` and optional `proyecto_id` to `proyectos` table
- All location fields (`ciudad`, `barrio`, `ciudad_id`, `barrio_id`) are stored in `unidades` table

#### If Using Existing Proyecto
- Links unidad via `proyecto_id`
- Loads proyecto data into form fields (disabled)
- Does not modify proyecto record

## Field Mappings (camelCase → snake_case)

| Application Field | Database Column | Notes |
|------------------|-----------------|-------|
| `proyectoId` | `proyecto_id` | |
| `tipoUnidad` | `tipo_unidad` | |
| `estadoComercial` | `estado_comercial` | |
| `fechaEntrega` | `entrega` | Mapped in service |
| `m2Internos` | `m2_internos` | |
| `m2Totales` | `m2_totales` | |
| `superficieEdificada` | `superficie_edificada` | |
| `superficieTerreno` | `superficie_terreno` | |
| `tamanoTerraza` | `tamano_terraza` | |
| `tamanoGarage` | `tamano_garage` | |
| `precioGarage` | `precio_garage` | |
| `ciudadId` | `ciudad_id` | |
| `barrioId` | `barrio_id` | |
| `createdAt` | `created_at` | |
| `updatedAt` | `updated_at` | |
| `deletedAt` | `deleted_at` | |

## Validation Rules

### Required Fields (Always)
- `tipoUnidad` - Type of property
- `nombre` - Unit name
- `dormitorios` - Number of bedrooms
- `banos` - Number of bathrooms
- `estadoComercial` - Commercial status
- `responsable` - Responsible person
- `precioUSD` - Price in USD
- `comision` - Commission percentage

### Required Fields (Apartamento)
- `m2Internos` - Internal square meters
- `m2Totales` - Total square meters
- `piso` - Floor number
- `orientacion` - Orientation
- `distribucion` - Distribution
- `altura` - Height

### Required Fields (Casa/Campo/Chacra)
- `superficieTerreno` - Land surface in m²
- `superficieEdificada` - Built surface in m²
- `plantas` - Number of floors
- `ciudad` - City
- `barrio` - Neighborhood

## Debug Information

The service logs the following to console:
- List of field names being sent: `Fields being sent to Supabase (unidades table): [...]`
- Full payload object: `Full payload: {...}`

Check browser console when saving to see exactly what's being sent.

## Common Issues & Solutions

### Issue: "El precio es obligatorio"
**Cause:** `precioUSD` is not set or is empty
**Solution:** Ensure price field is filled in the form

### Issue: Column not found errors
**Cause:** Field is being sent but doesn't exist in database
**Solution:** Check that field is in the deletion list or add column to database

### Issue: Foreign key errors
**Cause:** Invalid `proyecto_id` or `ciudad_id`/`barrio_id` values
**Solution:** Ensure referenced records exist in database

## Complete Field List Sent to Database

### Always Sent
- `id`, `proyecto_id`, `nombre`, `tipo_unidad`, `estado_comercial`
- `precio`, `moneda`, `responsable`, `comision`
- `dormitorios`, `banos`
- `ciudad`, `barrio`, `ciudad_id`, `barrio_id`
- `desarrollador`
- `terraza`, `garage`, `tamano_terraza`, `tamano_garage`, `precio_garage`
- `amenities` (as JSONB array)
- `altura`
- `created_at`, `updated_at`, `deleted_at`

### Conditionally Sent (Based on tipoUnidad)
- **Apartamento:** `m2_internos`, `m2_totales`, `piso`, `orientacion`, `distribucion`
- **Casa/Campo/Chacra:** `superficie_edificada`, `superficie_terreno`, `plantas`
- **Chacra/Campo:** `hectareas`

### Conditionally Sent (Based on proyecto)
- `entrega` - Only if not Apartamento with proyecto (for Apartamento with proyecto, it's saved in proyectos table)

## Notes

- **Proyecto Table:** Only stores `id`, `nombre`, `proyecto_id` (optional), and timestamps
- **Location Fields:** Stored in `unidades` table, not `proyectos` table
- **Fecha Entrega:** For Apartamentos with proyecto, stored in `proyectos` table; otherwise stored in `unidades` table
- **Amenities:** Stored as JSONB array with format `[{id: string, name: string}]`
