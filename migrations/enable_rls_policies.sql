-- RLS (Row Level Security) Configuration
-- This script enables RLS and creates policies for authenticated users

-- ============================================
-- OPTION 1: Enable RLS with permissive policies (RECOMMENDED)
-- ============================================
-- This allows all authenticated users to access all data
-- Unauthenticated users can only access public comparativas via share_token

-- Enable RLS on comparativas table
ALTER TABLE public.comparativas ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can do everything
CREATE POLICY "Authenticated users can read comparativas"
ON public.comparativas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert comparativas"
ON public.comparativas
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update comparativas"
ON public.comparativas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comparativas"
ON public.comparativas
FOR DELETE
TO authenticated
USING (true);

-- Policy: Public access to comparativas via share_token (for public links)
CREATE POLICY "Public can read comparativas by token"
ON public.comparativas
FOR SELECT
TO anon, authenticated
USING (share_token IS NOT NULL);

-- Enable RLS on comparativa_items table
ALTER TABLE public.comparativa_items ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can do everything
CREATE POLICY "Authenticated users can read comparativa_items"
ON public.comparativa_items
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert comparativa_items"
ON public.comparativa_items
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update comparativa_items"
ON public.comparativa_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comparativa_items"
ON public.comparativa_items
FOR DELETE
TO authenticated
USING (true);

-- Policy: Public access to comparativa_items for public comparativas
CREATE POLICY "Public can read comparativa_items for public comparativas"
ON public.comparativa_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.comparativas
    WHERE comparativas.id = comparativa_items.comparativa_id
    AND comparativas.share_token IS NOT NULL
  )
);

-- Enable RLS on unidades table
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can do everything
CREATE POLICY "Authenticated users can read unidades"
ON public.unidades
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert unidades"
ON public.unidades
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update unidades"
ON public.unidades
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete unidades"
ON public.unidades
FOR DELETE
TO authenticated
USING (true);

-- Policy: Public can read unidades that are in public comparativas
CREATE POLICY "Public can read unidades in public comparativas"
ON public.unidades
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.comparativa_items
    INNER JOIN public.comparativas ON comparativas.id = comparativa_items.comparativa_id
    WHERE comparativa_items.unidad_id = unidades.id
    AND comparativas.share_token IS NOT NULL
  )
);

-- Enable RLS on contactos table
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can do everything
CREATE POLICY "Authenticated users can read contactos"
ON public.contactos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert contactos"
ON public.contactos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update contactos"
ON public.contactos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contactos"
ON public.contactos
FOR DELETE
TO authenticated
USING (true);

-- Policy: Public can read contactos that are in public comparativas
CREATE POLICY "Public can read contactos in public comparativas"
ON public.contactos
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.comparativas
    WHERE comparativas.contacto_id = contactos.id
    AND comparativas.share_token IS NOT NULL
  )
);

-- Enable RLS on proyectos table (if exists)
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage proyectos"
ON public.proyectos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS on ciudades table (if exists)
ALTER TABLE public.ciudades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read ciudades"
ON public.ciudades
FOR SELECT
TO anon, authenticated
USING (true);

-- Enable RLS on barrios table (if exists)
ALTER TABLE public.barrios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read barrios"
ON public.barrios
FOR SELECT
TO anon, authenticated
USING (true);

