# Plantilla Excel para Importación de Unidades

## Columnas Requeridas (Obligatorias)

Estas columnas son **obligatorias** y deben estar presentes en el archivo Excel:

| Columna | Tipo | Descripción | Valores Permitidos / Ejemplo |
|---------|------|-------------|------------------------------|
| **tipoUnidad** | Texto | Tipo de unidad | `Apartamento`, `Casa`, `Chacra`, `Campo` |
| **dormitorios** | Número | Cantidad de dormitorios (0 = Monoambiente) | `0`, `1`, `2`, `3`, `4`, etc. |
| **banos** | Número | Cantidad de baños | `1`, `2`, `3`, `4`, etc. |
| **precio** | Número | Precio en USD | `175000`, `250000`, etc. |
| **estadoComercial** | Texto | Estado comercial de la unidad | `En venta`, `En alquiler`, `Reservada`, `Vendida`, `Pre-venta`, `En Pozo` |

## Columnas Opcionales (Recomendadas)

Estas columnas son opcionales pero recomendadas para una mejor importación:

| Columna | Tipo | Descripción | Valores Permitidos / Ejemplo |
|---------|------|-------------|------------------------------|
| **proyectoId** | Texto | ID del proyecto (UUID) | `550e8400-e29b-41d4-a716-446655440000` |
| **ciudad** | Texto | Nombre de la ciudad | `Montevideo`, `Maldonado`, `Canelones` |
| **ciudadId** | Número | ID de la ciudad | `1`, `2`, `3` |
| **barrio** | Texto | Nombre del barrio | `Pocitos`, `Carrasco`, `Ciudad Vieja` |
| **barrioId** | Número | ID del barrio | `1`, `2`, `3`, etc. |
| **nombre** | Texto | Nombre de la unidad | `Apto 302`, `Casa 12`, `Local 5` |
| **orientacion** | Texto | Orientación de la unidad | `Norte`, `Noreste`, `Este`, `Sudeste`, `Sur`, `Suroeste`, `Oeste`, `Noroeste` |
| **distribucion** | Texto | Distribución de la unidad | `Frente/Esquinero`, `Frente/Central`, `Contrafrente/Esquinero`, `Contrafrente/Central`, `Lateral`, `Inferior` |
| **pisoCategoria** | Texto | Categoría del piso | `Bajo`, `Medio`, `Alto` |
| **tamanoM2** | Número | Tamaño en metros cuadrados | `65`, `120`, `180` |
| **precioUSD** | Número | Precio en USD (alternativo a `precio`) | `175000`, `250000` |
| **expensasUSD** | Número | Expensas en USD | `120`, `200`, `0` |
| **amenities** | Texto | Amenities separados por comas | `Terraza, Piscina, Parrillero` o `Garage, Terraza` |
| **extras** | Texto | Extras separados por comas (alias de amenities) | `Terraza, Piscina` |
| **visibilidad** | Texto | Visibilidad de la publicación | `Publicado`, `No publicado` |
| **publicacionInterna** | Texto | Estado de publicación interna | `Activo`, `Stand By`, `Vendido` |
| **disponibilidad** | Texto | Disponibilidad de la unidad | `No disponible`, `Disponible: publicada`, `Disponible: reventa publicada`, `Disponible: reventa no publicada`, `Disponible: con renta publicada`, `Disponible: con renta no publicada`, `Reservada para venta`, `Reservada por promotor`, `Vendida` |
| **ocupacion** | Texto | Estado de ocupación | `A ocupar`, `1 a 6 meses`, `7 meses 1 año`, `1 a 2 años`, `Mas de 2 años` |
| **imagenUrl** | Texto | URL de la imagen principal | `https://example.com/imagen.jpg` |
| **desarrollador** | Texto | Nombre del desarrollador | `Constructora ABC`, `Inmobiliaria XYZ` |
| **localidad** | Texto | Localidad | `Pocitos`, `Carrasco`, `Punta del Este` |
| **direccion** | Texto | Dirección completa | `Av. 18 de Julio 1234` |
| **entrega** | Fecha | Fecha de entrega | `2024-12-31` o formato Excel de fecha |
| **fechaEntrega** | Fecha | Fecha de entrega (alternativo a `entrega`) | `2024-12-31` |
| **terraza** | Texto | Tiene terraza | `Si`, `No`, `Extra` |
| **garage** | Texto | Tiene garage | `Si`, `No`, `Extra` |
| **altura** | Número | Altura del edificio | `3`, `5`, `10` |
| **tamanoTerraza** | Número | Tamaño de terraza en m² | `15`, `25`, `30` |
| **tamanoGarage** | Número | Tamaño de garage en m² | `12`, `18`, `25` |
| **precioGarage** | Número | Precio del garage en USD | `15000`, `20000`, `0` |

## Ejemplo de Plantilla Excel

### Primera Fila (Headers)

```
proyectoId | ciudad | barrio | nombre | tipoUnidad | dormitorios | banos | precio | estadoComercial | orientacion | distribucion | tamanoM2 | expensasUSD | amenities | visibilidad | disponibilidad
```

### Ejemplo de Datos (Segunda Fila)

```
550e8400-e29b-41d4-a716-446655440000 | Montevideo | Pocitos | Apto 302 | Apartamento | 2 | 1 | 175000 | En venta | Norte | Frente/Esquinero | 65 | 120 | Terraza, Piscina | Publicado | Disponible: publicada
```

## Notas Importantes

### 1. Valores por Defecto
- Si no se especifica `tipoUnidad`, se usará `Apartamento`
- Si no se especifica `dormitorios`, se usará `1`
- Si no se especifica `banos`, se usará `1`
- Si no se especifica `estadoComercial`, se usará `En venta`
- Si no se especifica `visibilidad`, se usará `Publicado`
- Si no se especifica `disponibilidad`, se usará `Disponible: publicada`
- Si no se especifica `expensasUSD`, se usará `0`

### 2. Mapeo de Columnas Alternativas
El sistema acepta estos nombres alternativos:
- `tipo` → se mapea a `tipoUnidad`
- `precioUSD` → se mapea a `precio` (si `precio` no está presente)
- `fechaEntrega` → se mapea a `entrega` (si `entrega` no está presente)
- `extras` → se mapea a `amenities`

### 3. Formato de Fechas
Las fechas pueden estar en formato:
- Excel serial number (número de serie de Excel)
- Formato ISO: `YYYY-MM-DD` (ejemplo: `2024-12-31`)
- Formato de fecha estándar de Excel

### 4. Arrays y Listas
- `amenities` y `extras`: Separar valores con comas. Ejemplo: `Terraza, Piscina, Parrillero`
- Los espacios alrededor de las comas se eliminan automáticamente

### 5. IDs vs Nombres
- Puedes usar `ciudad` (nombre) o `ciudadId` (número ID)
- Puedes usar `barrio` (nombre) o `barrioId` (número ID)
- Si usas nombres, el sistema intentará encontrar el ID correspondiente

### 6. Campos Numéricos
- Todos los campos numéricos deben ser números válidos
- No incluir símbolos de moneda ($, USD, etc.) en los números
- Usar punto (.) como separador decimal si es necesario

## Plantilla CSV (Alternativa)

Si prefieres trabajar con CSV, aquí está el formato:

```csv
proyectoId,ciudad,barrio,nombre,tipoUnidad,dormitorios,banos,precio,estadoComercial,orientacion,distribucion,tamanoM2,expensasUSD,amenities,visibilidad,disponibilidad
550e8400-e29b-41d4-a716-446655440000,Montevideo,Pocitos,Apto 302,Apartamento,2,1,175000,En venta,Norte,Frente/Esquinero,65,120,"Terraza, Piscina",Publicado,Disponible: publicada
```

## Validaciones

El sistema validará automáticamente:
- ✅ Campos obligatorios están presentes
- ✅ Valores numéricos son números válidos
- ✅ Valores de texto están en las listas permitidas
- ✅ Fechas tienen formato válido
- ✅ IDs de referencia existen en la base de datos

## Errores Comunes a Evitar

1. ❌ **No usar valores fuera de las listas permitidas** (ej: `tipoUnidad = "Departamento"` en lugar de `Apartamento`)
2. ❌ **No dejar campos obligatorios vacíos**
3. ❌ **No usar formato incorrecto en números** (ej: `$175,000` en lugar de `175000`)
4. ❌ **No usar comillas en campos de texto** (a menos que sea parte del valor)
5. ❌ **No mezclar IDs y nombres** sin consistencia

## Ejemplo Completo de Archivo Excel

| proyectoId | ciudad | barrio | nombre | tipoUnidad | dormitorios | banos | precio | estadoComercial | orientacion | tamanoM2 | expensasUSD | amenities | visibilidad | disponibilidad |
|------------|--------|--------|--------|------------|-------------|-------|--------|-----------------|-------------|----------|-------------|-----------|-------------|----------------|
| 550e8400... | Montevideo | Pocitos | Apto 302 | Apartamento | 2 | 1 | 175000 | En venta | Norte | 65 | 120 | Terraza, Piscina | Publicado | Disponible: publicada |
| 550e8400... | Canelones | Ciudad de la Costa | Casa 12 | Casa | 3 | 2 | 260000 | En venta | Sur | 120 | 0 | Parrillero, Garage | Publicado | Disponible: publicada |
| | Montevideo | Prado | Casa Prado | Casa | 4 | 3 | 350000 | Reservada | Este | 180 | 0 | Garage | No publicado | Reservada para venta |

---

**Nota**: Puedes descargar esta plantilla y completarla con tus datos. El sistema de importación te permitirá mapear las columnas manualmente si los nombres no coinciden exactamente.

