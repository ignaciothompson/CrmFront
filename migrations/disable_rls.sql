-- DISABLE RLS (Only for development/testing)
-- WARNING: This disables all security. Only use in development!
-- For production, use enable_rls_policies.sql instead

-- Disable RLS on all tables
ALTER TABLE public.comparativas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparativa_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contactos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciudades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barrios DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (optional, only if you want to clean up)
-- DROP POLICY IF EXISTS "Authenticated users can read comparativas" ON public.comparativas;
-- DROP POLICY IF EXISTS "Authenticated users can insert comparativas" ON public.comparativas;
-- DROP POLICY IF EXISTS "Authenticated users can update comparativas" ON public.comparativas;
-- DROP POLICY IF EXISTS "Authenticated users can delete comparativas" ON public.comparativas;
-- DROP POLICY IF EXISTS "Public can read comparativas by token" ON public.comparativas;
-- ... (repeat for other tables)

