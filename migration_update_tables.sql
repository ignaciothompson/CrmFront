-- =====================================================
-- Migration Script: Update Unidades and Proyectos Tables
-- Based on schema changes
-- =====================================================

-- =====================================================
-- PART 1: UPDATE UNIDADES TABLE
-- =====================================================

-- Step 1: Add new columns that are now being sent to unidades table
ALTER TABLE public.unidades
  -- Location fields (denormalized from proyecto)
  ADD COLUMN IF NOT EXISTS city character varying NULL,
  ADD COLUMN IF NOT EXISTS barrio character varying NULL,
  ADD COLUMN IF NOT EXISTS ciudad character varying NULL,
  ADD COLUMN IF NOT EXISTS ciudad_id integer NULL,
  ADD COLUMN IF NOT EXISTS barrio_id integer NULL,
  
  -- Developer field
  ADD COLUMN IF NOT EXISTS desarrollador character varying NULL,
  
  -- Extra/amenity fields
  ADD COLUMN IF NOT EXISTS terraza character varying NULL,
  ADD COLUMN IF NOT EXISTS garage character varying NULL,
  ADD COLUMN IF NOT EXISTS tamano_terraza numeric NULL,
  ADD COLUMN IF NOT EXISTS tamano_garage numeric NULL,
  ADD COLUMN IF NOT EXISTS precio_garage numeric NULL,
  ADD COLUMN IF NOT EXISTS area_comun text NULL,
  ADD COLUMN IF NOT EXISTS equipamiento text NULL,
  ADD COLUMN IF NOT EXISTS amenities jsonb NULL DEFAULT '[]'::jsonb,
  
  -- Project-related fields
  ADD COLUMN IF NOT EXISTS altura character varying NULL,
  ADD COLUMN IF NOT EXISTS piso_proyecto integer NULL,
  ADD COLUMN IF NOT EXISTS unidades_totales integer NULL,
  ADD COLUMN IF NOT EXISTS tipo_propiedad character varying NULL;

-- Step 2: Add foreign key constraints for ciudad_id and barrio_id if they don't exist
DO $$
BEGIN
  -- Add foreign key for ciudad_id if column exists and constraint doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'unidades' 
             AND column_name = 'ciudad_id')
  AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_schema = 'public' 
                  AND table_name = 'unidades' 
                  AND constraint_name = 'unidades_ciudad_id_fkey') THEN
    ALTER TABLE public.unidades
      ADD CONSTRAINT unidades_ciudad_id_fkey 
      FOREIGN KEY (ciudad_id) REFERENCES public.ciudades(id);
  END IF;
  
  -- Add foreign key for barrio_id if column exists and constraint doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'unidades' 
             AND column_name = 'barrio_id')
  AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_schema = 'public' 
                  AND table_name = 'unidades' 
                  AND constraint_name = 'unidades_barrio_id_fkey') THEN
    ALTER TABLE public.unidades
      ADD CONSTRAINT unidades_barrio_id_fkey 
      FOREIGN KEY (barrio_id) REFERENCES public.barrios(id);
  END IF;
END $$;

-- Step 3: Drop columns that were removed from database
ALTER TABLE public.unidades
  DROP COLUMN IF EXISTS antiguedad,
  DROP COLUMN IF EXISTS condicion,
  DROP COLUMN IF EXISTS aptitud_suelo,
  DROP COLUMN IF EXISTS indice_productividad;

-- Step 4: Drop legacy columns that are removed from tables and UI
ALTER TABLE public.unidades
  DROP COLUMN IF EXISTS tipo,
  DROP COLUMN IF EXISTS unidades,
  DROP COLUMN IF EXISTS inicio;

-- Step 5: Ensure timestamps exist (if they don't already)
ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS created_at timestamp without time zone NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone NULL;

-- Step 6: Create index on deleted_at for soft delete queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_unidades_deleted_at ON public.unidades(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- PART 2: UPDATE PROYECTOS TABLE
-- =====================================================

-- Step 1: Add proyecto_id column if it doesn't exist (optional field)
ALTER TABLE public.proyectos
  ADD COLUMN IF NOT EXISTS proyecto_id character varying NULL;

-- Step 2: Drop columns that are no longer saved to proyectos table
ALTER TABLE public.proyectos
  DROP COLUMN IF EXISTS ciudad_id,
  DROP COLUMN IF EXISTS barrio_id,
  DROP COLUMN IF EXISTS direccion,
  DROP COLUMN IF EXISTS entrega,
  DROP COLUMN IF EXISTS desarrollador,
  DROP COLUMN IF EXISTS tipo_proyecto;

-- Step 3: Ensure created_at exists (if it doesn't already)
ALTER TABLE public.proyectos
  ADD COLUMN IF NOT EXISTS created_at timestamp without time zone NULL DEFAULT now();

-- Step 4: Add updated_at if needed
ALTER TABLE public.proyectos
  ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone NULL DEFAULT now();

-- =====================================================
-- PART 3: CREATE UPDATE TRIGGER FOR updated_at
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for unidades table
DROP TRIGGER IF EXISTS update_unidades_updated_at ON public.unidades;
CREATE TRIGGER update_unidades_updated_at
  BEFORE UPDATE ON public.unidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for proyectos table
DROP TRIGGER IF EXISTS update_proyectos_updated_at ON public.proyectos;
CREATE TRIGGER update_proyectos_updated_at
  BEFORE UPDATE ON public.proyectos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 4: DATA MIGRATION (if needed)
-- =====================================================

-- If you have existing data, you might want to migrate it
-- Example: Copy data from old columns to new columns before dropping them
-- (Uncomment and modify as needed)

-- Example migration for existing unidades data:
-- UPDATE public.unidades
-- SET ciudad_id = (SELECT id FROM ciudades WHERE nombre = unidades.ciudad LIMIT 1)
-- WHERE ciudad IS NOT NULL AND ciudad_id IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify unidades table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'unidades'
ORDER BY ordinal_position;

-- Verify proyectos table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'proyectos'
ORDER BY ordinal_position;

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

/*
-- To rollback, run these commands:

-- Restore removed columns in unidades (if needed)
ALTER TABLE public.unidades
  ADD COLUMN antiguedad integer NULL,
  ADD COLUMN condicion character varying NULL,
  ADD COLUMN aptitud_suelo character varying NULL,
  ADD COLUMN indice_productividad integer NULL,
  ADD COLUMN tipo character varying NULL,
  ADD COLUMN unidades integer NULL,
  ADD COLUMN inicio character varying NULL;

-- Restore removed columns in proyectos (if needed)
ALTER TABLE public.proyectos
  ADD COLUMN ciudad_id integer NULL,
  ADD COLUMN barrio_id integer NULL,
  ADD COLUMN direccion character varying NULL,
  ADD COLUMN entrega character varying NULL,
  ADD COLUMN desarrollador character varying NULL,
  ADD COLUMN tipo_proyecto character varying NULL;

-- Drop new columns in unidades (if needed)
ALTER TABLE public.unidades
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS barrio,
  DROP COLUMN IF EXISTS ciudad,
  DROP COLUMN IF EXISTS ciudad_id,
  DROP COLUMN IF EXISTS barrio_id,
  DROP COLUMN IF EXISTS desarrollador,
  DROP COLUMN IF EXISTS terraza,
  DROP COLUMN IF EXISTS garage,
  DROP COLUMN IF EXISTS tamano_terraza,
  DROP COLUMN IF EXISTS tamano_garage,
  DROP COLUMN IF EXISTS precio_garage,
  DROP COLUMN IF EXISTS area_comun,
  DROP COLUMN IF EXISTS equipamiento,
  DROP COLUMN IF EXISTS amenities,
  DROP COLUMN IF EXISTS altura,
  DROP COLUMN IF EXISTS piso_proyecto,
  DROP COLUMN IF EXISTS unidades_totales,
  DROP COLUMN IF EXISTS tipo_propiedad;

-- Drop triggers
DROP TRIGGER IF EXISTS update_unidades_updated_at ON public.unidades;
DROP TRIGGER IF EXISTS update_proyectos_updated_at ON public.proyectos;
DROP FUNCTION IF EXISTS update_updated_at_column();
*/

