# Database Migration Summary

## Overview
This migration updates the `unidades` and `proyectos` tables to match the new application schema requirements.

## Changes to `unidades` Table

### ✅ Columns Added
These columns are now being sent from the application and need to exist in the database:

1. **Location fields** (denormalized from proyecto):
   - `city` (varchar) - City name as string
   - `barrio` (varchar) - Neighborhood name as string
   - `ciudad` (varchar) - Alternative city field
   - `ciudad_id` (integer) - Foreign key to ciudades table
   - `barrio_id` (integer) - Foreign key to barrios table

2. **Developer field**:
   - `desarrollador` (varchar) - Developer name

3. **Extra/Amenity fields**:
   - `terraza` (varchar) - Terrace: 'Si', 'No', or 'Extra'
   - `garage` (varchar) - Garage: 'Si', 'No', or 'Extra'
   - `tamano_terraza` (numeric) - Terrace size in m²
   - `tamano_garage` (numeric) - Garage size in m²
   - `precio_garage` (numeric) - Garage price in USD
   - `area_comun` (text) - Common areas description
   - `equipamiento` (text) - Equipment description
   - `amenities` (jsonb) - Array of amenities as `[{id: string, name: string}]`

4. **Project-related fields**:
   - `altura` (varchar) - Height (e.g., "2,40m")
   - `piso_proyecto` (integer) - Number of floors in project
   - `unidades_totales` (integer) - Total units in project
   - `tipo_propiedad` (varchar) - Property type: 'Edificio', 'Casa', 'PH'

### ❌ Columns Removed
These columns were removed from the database schema:

1. **Removed fields**:
   - `antiguedad` (integer) - Age of property
   - `condicion` (varchar) - Condition: 'A estrenar', 'Reciclado', 'A reciclar'
   - `aptitud_suelo` (varchar) - Soil aptitude for Campo
   - `indice_productividad` (integer) - Productivity index for Campo

2. **Legacy fields** (removed from tables and UI):
   - `tipo` (varchar) - Legacy type field
   - `unidades` (integer) - Legacy units field
   - `inicio` (varchar) - Legacy start field

### 🔄 Timestamps
- `created_at` - Auto-set on creation
- `updated_at` - Auto-updated on modification (via trigger)
- `deleted_at` - For soft deletes (null = not deleted)

## Changes to `proyectos` Table

### ✅ Columns Kept
Only these columns remain in the proyectos table:
- `id` (varchar, primary key) - Project ID
- `nombre` (varchar) - Project name (optional)
- `proyecto_id` (varchar) - Parent project ID (optional)
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Update timestamp

### ❌ Columns Removed
These columns are no longer saved to proyectos table:
- `ciudad_id` (integer) - City ID
- `barrio_id` (integer) - Neighborhood ID
- `direccion` (varchar) - Address
- `entrega` (varchar) - Delivery date
- `desarrollador` (varchar) - Developer name
- `tipo_proyecto` (varchar) - Project type

**Note:** These fields are now stored in the `unidades` table instead.

## Migration Steps

1. **Run the migration script** (`migration_update_tables.sql`)
2. **Verify the changes** using the verification queries at the end of the script
3. **Test the application** to ensure everything works correctly

## Important Notes

- **Foreign Keys**: The migration adds foreign key constraints for `ciudad_id` and `barrio_id` in the unidades table
- **Triggers**: Automatic `updated_at` timestamp updates are handled by database triggers
- **Data Migration**: If you have existing data, you may need to migrate it manually (see comments in migration script)
- **Rollback**: A rollback script is included in comments if you need to revert changes

## Field Mappings

### Application → Database (camelCase → snake_case)
- `proyectoId` → `proyecto_id`
- `tipoUnidad` → `tipo_unidad`
- `estadoComercial` → `estado_comercial`
- `m2Internos` → `m2_internos`
- `m2Totales` → `m2_totales`
- `superficieEdificada` → `superficie_edificada`
- `superficieTerreno` → `superficie_terreno`
- `areaComun` → `area_comun`
- `tamanoTerraza` → `tamano_terraza`
- `tamanoGarage` → `tamano_garage`
- `precioGarage` → `precio_garage`
- `pisoProyecto` → `piso_proyecto`
- `unidadesTotales` → `unidades_totales`
- `tipoPropiedad` → `tipo_propiedad`
- `ciudadId` → `ciudad_id`
- `barrioId` → `barrio_id`

## Testing Checklist

After running the migration, verify:

- [ ] All new columns exist in `unidades` table
- [ ] Removed columns are gone from `unidades` table
- [ ] `proyectos` table only has the required columns
- [ ] Foreign key constraints work correctly
- [ ] Triggers update `updated_at` automatically
- [ ] Application can create new unidades
- [ ] Application can update existing unidades
- [ ] Application can create new proyectos
- [ ] Application can update existing proyectos

