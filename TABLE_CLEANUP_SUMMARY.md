# Unidades Table Cleanup Summary

## Overview
This document summarizes the columns removed from the `unidades` table to match the current application model structure.

## Columns Removed

### ❌ Removed Columns

1. **`city`** (character varying)
   - **Reason:** Redundant with `ciudad` column
   - **Status:** Both columns existed, `ciudad` is the one used in the model

2. **`area_comun`** (text)
   - **Reason:** Removed from application model
   - **Status:** No longer used in the form or service

3. **`equipamiento`** (text)
   - **Reason:** Removed from application model
   - **Status:** No longer used in the form or service

4. **`piso_proyecto`** (integer)
   - **Reason:** Removed from application model
   - **Status:** No longer used in the form or service

5. **`unidades_totales`** (integer)
   - **Reason:** Removed from application model
   - **Status:** No longer used in the form or service

6. **`tipo_propiedad`** (character varying)
   - **Reason:** Removed from application model
   - **Status:** No longer used in the form or service

## Column Added

### ✅ Added Column

1. **`entrega`** (character varying)
   - **Reason:** Needed for mapping `fechaEntrega` from the form model
   - **Status:** Service maps `fechaEntrega` → `entrega` before saving

## Migration Files

### 1. `migration_remove_unused_columns.sql`
- **Purpose:** Migration script to remove unused columns
- **Usage:** Run this script on your database to clean up the table
- **Safety:** Uses `DROP COLUMN IF EXISTS` to prevent errors if columns don't exist

### 2. `unidades_table_cleaned.sql`
- **Purpose:** Complete cleaned table definition
- **Usage:** Reference for the final table structure
- **Note:** Includes all columns currently used by the application

## Current Table Structure

After cleanup, the `unidades` table contains:

### Core Fields
- `id`, `proyecto_id`, `nombre`, `tipo_unidad`, `estado_comercial`
- `precio`, `moneda`, `responsable`, `comision`, `entrega`

### Apartment Fields
- `dormitorios`, `banos`, `m2_internos`, `m2_totales`
- `piso`, `orientacion`, `distribucion`, `altura`

### Casa/Campo/Chacra Fields
- `superficie_edificada`, `superficie_terreno`, `plantas`, `hectareas`

### Location Fields
- `ciudad`, `barrio`, `ciudad_id`, `barrio_id`

### Other Fields
- `desarrollador`
- `terraza`, `garage`, `tamano_terraza`, `tamano_garage`, `precio_garage`
- `amenities` (jsonb)
- `created_at`, `updated_at`, `deleted_at`

## How to Apply

1. **Backup your database** before running migrations
2. Run `migration_remove_unused_columns.sql` to remove unused columns
3. Verify the table structure matches `unidades_table_cleaned.sql`

## Verification

After running the migration, verify with:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'unidades' 
ORDER BY ordinal_position;
```

The result should match the columns listed in `unidades_table_cleaned.sql`.

