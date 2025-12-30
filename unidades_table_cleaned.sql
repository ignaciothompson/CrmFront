-- Cleaned unidades table definition
-- Removed unused columns: city, area_comun, equipamiento, piso_proyecto, unidades_totales, tipo_propiedad
-- Added: entrega (for fechaEntrega mapping)

CREATE TABLE IF NOT EXISTS public.unidades (
  id character varying NOT NULL,
  proyecto_id character varying NULL,
  nombre character varying NULL,
  tipo_unidad character varying NULL,
  estado_comercial character varying NULL,
  precio numeric NULL,
  moneda character varying NULL DEFAULT 'USD'::character varying,
  responsable character varying NULL,
  comision numeric NULL,
  entrega character varying NULL,                    -- Delivery date (mapped from fechaEntrega)
  dormitorios integer NULL,
  banos integer NULL,
  orientacion character varying NULL,
  distribucion character varying NULL,
  m2_internos numeric NULL,
  m2_totales numeric NULL,
  piso integer NULL,
  superficie_edificada numeric NULL,
  superficie_terreno numeric NULL,
  plantas integer NULL,
  hectareas numeric NULL,
  altura character varying NULL,
  deleted_at timestamp without time zone NULL,
  created_at timestamp without time zone NULL,
  updated_at timestamp without time zone NULL,
  ciudad character varying NULL,
  barrio character varying NULL,
  ciudad_id integer NULL,
  barrio_id integer NULL,
  desarrollador character varying NULL,
  terraza character varying NULL,
  garage character varying NULL,
  tamano_terraza numeric NULL,
  tamano_garage numeric NULL,
  precio_garage numeric NULL,
  amenities jsonb NULL DEFAULT '[]'::jsonb,
  CONSTRAINT unidades_pkey PRIMARY KEY (id),
  CONSTRAINT unidades_barrio_id_fkey FOREIGN KEY (barrio_id) REFERENCES barrios (id),
  CONSTRAINT unidades_ciudad_id_fkey FOREIGN KEY (ciudad_id) REFERENCES ciudades (id),
  CONSTRAINT unidades_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
) TABLESPACE pg_default;

-- Index for soft deletes
CREATE INDEX IF NOT EXISTS idx_unidades_deleted_at 
ON public.unidades USING btree (deleted_at) 
TABLESPACE pg_default
WHERE (deleted_at IS NULL);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_unidades_updated_at 
BEFORE UPDATE ON unidades 
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

