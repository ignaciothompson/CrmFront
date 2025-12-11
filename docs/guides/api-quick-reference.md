# API Quick Reference Guide

## Overview

Quick reference for API endpoints to be implemented for n8n integration.

## Base URL

```
Production: https://your-cloudflare-tunnel-url/api
Development: http://localhost:5001/crmdashboard-f4c86/us-central1/api
```

**Note**: Replace `your-cloudflare-tunnel-url` with your actual Cloudflare tunnel URL.

## Authentication

### Method 1: API Key Header
```http
X-API-Key: your-api-key-here
```

### Method 2: Query Parameter
```
?apiKey=your-api-key-here
```

## Endpoints

### Unidades

#### Create Single Unidad
```http
POST /api/unidades
Content-Type: application/json

{
  "proyectoId": "proyecto-123",
  "ciudad": "Montevideo",
  "barrio": "Pocitos",
  "tipo": "Apartamento",
  "dormitorios": 2,
  "banos": 1,
  "nombre": "Apto 302",
  "precioUSD": 175000,
  "tamanoM2": 65,
  "visibilidad": "Publicado",
  "disponibilidad": "Disponible: publicada"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "unidad-abc123",
    "unidad": { ... }
  }
}
```

#### Create Multiple Unidades (Batch)
```http
POST /api/unidades/batch
Content-Type: application/json

{
  "unidades": [
    { "proyectoId": "...", "ciudad": "...", ... },
    { "proyectoId": "...", "ciudad": "...", ... }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "created": 5,
    "failed": 0,
    "results": [
      { "id": "unidad-1", "success": true },
      { "id": "unidad-2", "success": true }
    ]
  }
}
```


#### List Unidades
```http
GET /api/unidades?ciudad=Montevideo&barrio=Pocitos&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unidades": [...],
    "total": 100,
    "limit": 50
  }
}
```

#### Get Unidad by ID
```http
GET /api/unidades/:id
```

#### Update Unidad
```http
PUT /api/unidades/:id
Content-Type: application/json

{
  "precioUSD": 180000,
  "disponibilidad": "Vendida"
}
```

#### Delete Unidad
```http
DELETE /api/unidades/:id
```

### Proyectos

#### List Proyectos
```http
GET /api/proyectos
```

#### Get Proyecto by ID
```http
GET /api/proyectos/:id
```

## Unidad Data Model

### Required Fields
- `proyectoId`: string
- `ciudad`: "Montevideo" | "Maldonado" | "Canelones"
- `barrio`: string
- `tipo`: "Apartamento" | "Casa" | "Complejo"
- `dormitorios`: number (0 = Monoambiente)
- `banos`: number
- `visibilidad`: "Publicado" | "No publicado"
- `disponibilidad`: See enum values below

### Optional Fields
- `nombre`: string
- `orientacion`: "Norte" | "Noreste" | "Este" | "Sudeste" | "Sur" | "Suroeste" | "Oeste" | "Noroeste"
- `distribucion`: "Frente/Esquinero" | "Frente/Central" | "Contrafrente/Esquinero" | "Contrafrente/Central" | "Lateral" | "Inferior"
- `pisoCategoria`: "Bajo" | "Medio" | "Alto"
- `tamanoM2`: number
- `precioUSD`: number
- `expensasUSD`: number
- `extras`: string[]
- `ocupacion`: "A ocupar" | "1 a 6 meses" | "7 meses 1 año" | "1 a 2 años" | "Mas de 2 años"
- `imagenUrl`: string

### Disponibilidad Enum
- "No disponible"
- "Disponible: publicada"
- "Disponible: reventa publicada"
- "Disponible: reventa no publicada"
- "Disponible: con renta publicada"
- "Disponible: con renta no publicada"
- "Reservada para venta"
- "Reservada por promotor"
- "Vendida"

## Excel Column Mapping Examples

### Common Column Name Variations

| Field | Possible Column Names |
|-------|----------------------|
| proyectoId | "Proyecto ID", "ProyectoId", "proyecto_id", "Proyecto", "ID Proyecto" |
| nombre | "Nombre", "Unidad", "Apto", "Casa", "Unidad Nombre" |
| dormitorios | "Dormitorios", "Dorm", "Cuartos", "Bedrooms", "Dorm." |
| banos | "Baños", "Banos", "Bathrooms", "Baño" |
| precioUSD | "Precio USD", "PrecioUSD", "Precio", "Price USD", "Precio (USD)" |
| tamanoM2 | "M2", "m²", "Metros", "Tamaño M2", "Superficie" |
| ciudad | "Ciudad", "City", "Localidad" |
| barrio | "Barrio", "Neighborhood", "Zona" |
| tipo | "Tipo", "Tipo Unidad", "Type" |

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid unidad data",
    "details": [
      "proyectoId is required",
      "ciudad must be one of: Montevideo, Maldonado, Canelones"
    ]
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

### Not Found Error
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Unidad not found"
  }
}
```

## n8n Workflow Example

### Workflow Steps
1. **Trigger** - File system, webhook, or scheduled
2. **Read Binary File** - Get Excel file content
3. **Spreadsheet File Node** - Parse Excel to JSON
   - File Format: `xlsx`
   - Options: First row as column names
4. **Code/Set Node** - Transform Excel columns to API format
   - Map `Proyecto ID` → `proyectoId`
   - Map `Dorm` → `dormitorios`
   - Map `Baños` → `banos`
   - Map `Precio USD` → `precioUSD`
   - etc.
5. **HTTP Request** - POST to `/api/unidades/batch`
   - Method: POST
   - URL: `https://your-cloudflare-tunnel-url/api/unidades/batch`
   - Headers: `X-API-Key: {{ $env.API_KEY }}`
   - Body: JSON array of unidades
6. **IF Node** - Check if import was successful
7. **Send Email/Notification** - Notify on errors

### n8n HTTP Request Configuration (Batch)
```json
{
  "method": "POST",
  "url": "https://your-cloudflare-tunnel-url/api/unidades/batch",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "X-API-Key",
        "value": "={{ $env.API_KEY }}"
      },
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "bodyContentType": "json",
  "jsonBody": "={{ $json.unidades }}",
  "options": {}
}
```

### n8n Transformation Example (Code Node)
```javascript
// Transform Excel row to API format
const unidades = $input.all().map(item => {
  const row = item.json;
  return {
    proyectoId: row['Proyecto ID'] || row['ProyectoId'],
    ciudad: row['Ciudad'] || 'Montevideo',
    barrio: row['Barrio'] || '',
    tipo: row['Tipo'] || 'Apartamento',
    dormitorios: parseInt(row['Dorm'] || row['Dormitorios'] || '1'),
    banos: parseInt(row['Baños'] || row['Banos'] || '1'),
    nombre: row['Unidad'] || row['Nombre'] || '',
    precioUSD: row['Precio USD'] ? parseFloat(row['Precio USD']) : undefined,
    tamanoM2: row['M2'] ? parseFloat(row['M2']) : undefined,
    visibilidad: row['Visibilidad'] || 'Publicado',
    disponibilidad: row['Disponibilidad'] || 'Disponible: publicada'
  };
});

return unidades.map(u => ({ json: u }));
```

## Testing

### Using cURL

#### Create Unidad
```bash
curl -X POST https://us-central1-crmdashboard-f4c86.cloudfunctions.net/api/unidades \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "proyectoId": "proyecto-123",
    "ciudad": "Montevideo",
    "barrio": "Pocitos",
    "tipo": "Apartamento",
    "dormitorios": 2,
    "banos": 1,
    "visibilidad": "Publicado",
    "disponibilidad": "Disponible: publicada"
  }'
```

#### Batch Create (from n8n)
```bash
curl -X POST https://your-cloudflare-tunnel-url/api/unidades/batch \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "unidades": [
      {
        "proyectoId": "proyecto-123",
        "ciudad": "Montevideo",
        "barrio": "Pocitos",
        "tipo": "Apartamento",
        "dormitorios": 2,
        "banos": 1,
        "visibilidad": "Publicado",
        "disponibilidad": "Disponible: publicada"
      }
    ]
  }'
```

## Notes

- **Self-Hosted n8n**: Since n8n is self-hosted behind Cloudflare tunnels, ensure the tunnel URL is properly configured
- **API Key**: Store API key securely in n8n credentials or environment variables
- **Excel Parsing**: n8n handles Excel parsing client-side, API only accepts JSON
- **Batch Size**: Consider splitting large batches (100+ unidades) into smaller chunks for better error handling
- **Timestamps**: All timestamps are in milliseconds (Unix epoch)
- **Dates**: Should be formatted as ISO 8601 strings (YYYY-MM-DD)
- **Numbers**: Should be sent as numbers, not strings
- **Arrays**: Arrays (like `extras`) should be sent as JSON arrays
- **Empty Values**: Empty strings are treated as undefined/null for optional fields

