-- Migration: Remove unused columns from unidades table
-- Date: 2024
-- Description: Remove columns that are no longer used in the application model

-- Add entrega column if it doesn't exist (needed for fechaEntrega mapping)
ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS entrega character varying NULL;

-- Remove unused columns from unidades table
ALTER TABLE public.unidades
  DROP COLUMN IF EXISTS city,                    -- Redundant with ciudad
  DROP COLUMN IF EXISTS area_comun,             -- Removed from model
  DROP COLUMN IF EXISTS equipamiento,           -- Removed from model
  DROP COLUMN IF EXISTS piso_proyecto,          -- Removed from model
  DROP COLUMN IF EXISTS unidades_totales,       -- Removed from model
  DROP COLUMN IF EXISTS tipo_propiedad;         -- Removed from model

-- Verify the columns were removed
-- You can run this query to check:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'unidades' 
-- ORDER BY ordinal_position;

