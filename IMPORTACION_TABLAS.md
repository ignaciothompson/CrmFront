# Tablas Necesarias para el Sistema de Importación

## Resumen

**No se requieren nuevas tablas** para la funcionalidad básica de importación de unidades. El sistema utiliza las tablas existentes:

- ✅ `unidades` - Ya existe, contiene todos los campos necesarios
- ✅ `proyectos` - Ya existe, se usa para seleccionar proyectos
- ✅ `ciudades` - Ya existe, se usa para seleccionar ciudades
- ✅ `barrios` - Ya existe, se usa para seleccionar barrios

## Campos Utilizados de la Tabla `unidades`

La importación mapea los siguientes campos (según el esquema actual):

### Campos Principales
- `id` (VARCHAR) - Generado automáticamente si no se proporciona
- `proyecto_id` (VARCHAR) - Referencia a proyectos
- `nombre` (VARCHAR) - Nombre de la unidad
- `tipo_unidad` (VARCHAR) - 'Apartamento', 'Casa', 'Chacra', 'Campo'
- `estado_comercial` (VARCHAR) - 'En venta', 'En alquiler', 'Reservada', 'Vendida', 'Pre-venta', 'En Pozo'

### Campos de Ubicación
- `ciudad_id` (INTEGER) - FK a ciudades
- `barrio_id` (INTEGER) - FK a barrios
- `ciudad` (VARCHAR) - Campo legacy (se elimina antes de guardar)
- `barrio` (VARCHAR) - Campo legacy (se elimina antes de guardar)

### Campos de Características
- `dormitorios` (INTEGER)
- `banos` (INTEGER)
- `orientacion` (VARCHAR)
- `distribucion` (VARCHAR)
- `m2_internos` (NUMERIC)
- `m2_totales` (NUMERIC)
- `piso` (INTEGER)
- `superficie_edificada` (NUMERIC)
- `superficie_terreno` (NUMERIC)
- `plantas` (INTEGER)
- `hectareas` (NUMERIC)
- `altura` (VARCHAR)

### Campos de Precio y Comercialización
- `precio` (NUMERIC) - Precio en USD (requerido)
- `moneda` (VARCHAR) - Por defecto 'USD'
- `responsable` (VARCHAR)
- `comision` (NUMERIC)

### Campos de Extras
- `terraza` (VARCHAR) - 'Si', 'No', 'Extra'
- `garage` (VARCHAR) - 'Si', 'No', 'Extra'
- `tamano_terraza` (NUMERIC)
- `tamano_garage` (NUMERIC)
- `precio_garage` (NUMERIC)
- `amenities` (JSONB) - Array de strings

### Campos de Fechas
- `entrega` (VARCHAR) - Fecha de entrega (mapeado desde fechaEntrega)
- `created_at` (TIMESTAMP) - Generado automáticamente
- `updated_at` (TIMESTAMP) - Generado automáticamente
- `deleted_at` (TIMESTAMP) - Para soft deletes

## Tablas Opcionales (Solo si se requiere funcionalidad avanzada)

Si en el futuro quieres agregar funcionalidades como:

### 1. Historial de Importaciones
```sql
CREATE TABLE importaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  archivo_nombre VARCHAR NOT NULL,
  archivo_tamano INTEGER,
  total_filas INTEGER,
  filas_importadas INTEGER,
  filas_fallidas INTEGER,
  estado VARCHAR NOT NULL, -- 'completada', 'fallida', 'cancelada'
  errores JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Mapeos de Columnas Guardados
```sql
CREATE TABLE importacion_mapeos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  nombre VARCHAR NOT NULL,
  tipo_entidad VARCHAR NOT NULL, -- 'unidades', 'contactos', 'proyectos'
  mapeos JSONB NOT NULL, -- Array de {excelColumn, targetField}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Logs de Errores de Importación
```sql
CREATE TABLE importacion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  importacion_id UUID REFERENCES importaciones(id),
  fila_numero INTEGER NOT NULL,
  datos_fila JSONB,
  errores JSONB NOT NULL, -- Array de errores de validación
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Conclusión

**Para la funcionalidad actual, NO se necesitan nuevas tablas.** El sistema está diseñado para trabajar con el esquema existente.

Las tablas opcionales solo serían necesarias si quieres:
- Guardar historial de importaciones
- Permitir reutilizar mapeos de columnas
- Mantener logs detallados de errores

