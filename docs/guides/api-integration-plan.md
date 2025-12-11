# API Integration Plan for n8n Workflow

## Overview

This document outlines the plan to implement API-based functions that allow n8n workflows to access and create unidades (units) data in the CRM system. The primary use case is uploading Excel files with varying formats, converting them to JSON, and importing unidades via API endpoints.

## Current State Analysis

### Architecture
- **Frontend**: Angular 20 application
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Current Data Access**: Client-side only via AngularFire services
- **Existing Excel Import**: Frontend component (`importar.ts`) using `xlsx` library

### Unidad Data Model
The `Unidad` interface includes:
- **Required fields**: `proyectoId`, `ciudad`, `barrio`, `tipo`, `dormitorios`, `banos`, `visibilidad`, `disponibilidad`
- **Optional fields**: `nombre`, `orientacion`, `distribucion`, `pisoCategoria`, `tamanoM2`, `precioUSD`, `expensasUSD`, `extras[]`, `ocupacion`, `imagenUrl`
- **Metadata**: `createdAt`, `updatedAt`, `activo`

### Current Service Layer
- `UnidadService`: Handles CRUD operations via Firestore
- `ProyectoService`: Manages proyectos (projects)
- `EventMonitorService`: Tracks audit events

## Solution Architecture

### Recommended Approach: Firebase Cloud Functions

**Why Cloud Functions?**
- ✅ Native Firebase integration
- ✅ Serverless, scalable, cost-effective
- ✅ Direct Firestore access with admin SDK
- ✅ Built-in authentication handling
- ✅ No separate server infrastructure needed
- ✅ Can reuse existing Firestore security rules

### Alternative Approach: Standalone Node.js API Server

**Consider if:**
- Need more control over server infrastructure
- Require custom middleware or complex routing
- Want to host on different platform (Vercel, Railway, etc.)

## Implementation Plan

### Phase 1: Setup Firebase Cloud Functions

#### 1.1 Initialize Functions Directory
```bash
cd crm-dashboard-fe
firebase init functions
# Select TypeScript
# Install dependencies: Yes
```

#### 1.2 Project Structure
```
crm-dashboard-fe/
├── functions/
│   ├── src/
│   │   ├── index.ts              # Main entry point
│   │   ├── api/
│   │   │   ├── unidades.ts       # Unidades API endpoints
│   │   │   └── proyectos.ts      # Proyectos API endpoints
│   │   ├── services/
│   │   │   ├── excel-parser.ts   # Excel parsing logic
│   │   │   ├── unidad-mapper.ts  # Flexible field mapping
│   │   │   └── firestore.ts      # Firestore operations
│   │   ├── types/
│   │   │   └── api.ts            # API request/response types
│   │   └── utils/
│   │       ├── validation.ts    # Data validation
│   │       └── errors.ts        # Error handling
│   ├── package.json
│   └── tsconfig.json
└── firebase.json                 # Update with functions config
```

### Phase 2: API Endpoints Design

#### 2.1 Unidades Endpoints

**POST `/api/unidades`**
- **Purpose**: Create single unidad
- **Auth**: API Key or Firebase Auth Token
- **Request Body**:
  ```json
  {
    "proyectoId": "string",
    "ciudad": "Montevideo" | "Maldonado" | "Canelones",
    "barrio": "string",
    "tipo": "Apartamento" | "Casa" | "Complejo",
    "dormitorios": number,
    "banos": number,
    "nombre": "string (optional)",
    "precioUSD": number (optional),
    "tamanoM2": number (optional),
    ...
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "firestore-doc-id",
      "unidad": { ... }
    }
  }
  ```

**POST `/api/unidades/batch`**
- **Purpose**: Create multiple unidades in one request
- **Request Body**:
  ```json
  {
    "unidades": [
      { ...unidad1 },
      { ...unidad2 },
      ...
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "created": 5,
      "failed": 0,
      "results": [
        { "id": "...", "success": true },
        ...
      ]
    }
  }
  ```


**GET `/api/unidades`**
- **Purpose**: List unidades with optional filters
- **Query Params**: `?ciudad=Montevideo&barrio=Pocitos&limit=50`
- **Response**:
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

**GET `/api/unidades/:id`**
- **Purpose**: Get single unidad by ID
- **Response**:
  ```json
  {
    "success": true,
    "data": { ...unidad }
  }
  ```

**PUT `/api/unidades/:id`**
- **Purpose**: Update unidad
- **Request Body**: Partial unidad object
- **Response**: Updated unidad

**DELETE `/api/unidades/:id`**
- **Purpose**: Delete unidad
- **Response**: Success confirmation

#### 2.2 Proyectos Endpoints (Supporting)

**GET `/api/proyectos`**
- List all proyectos (needed for mapping proyectoId in Excel)

**GET `/api/proyectos/:id`**
- Get proyecto by ID

### Phase 3: n8n Excel Processing (Client-Side)

Since n8n will handle Excel parsing, the API only needs to accept JSON data. n8n workflow will:

1. **Read Excel File** - Use n8n's Excel node or HTTP request
2. **Parse to JSON** - Convert Excel rows to JSON objects
3. **Transform Data** - Map Excel columns to API format using n8n's mapping nodes
4. **Call Batch API** - POST to `/api/unidades/batch` with JSON array

**Example n8n Transformation:**
- Excel columns: `Proyecto ID`, `Unidad`, `Dorm`, `Baños`, `Precio USD`
- Map to: `proyectoId`, `nombre`, `dormitorios`, `banos`, `precioUSD`
- Use n8n's "Set" node or Code node for transformation

**Benefits:**
- ✅ No need for Excel parsing library in Cloud Functions
- ✅ More flexible - n8n users can customize mapping per workflow
- ✅ Simpler API - just accepts JSON
- ✅ Better error handling - n8n can show which rows failed

### Phase 4: Authentication & Authorization

#### 4.1 Simplified Authentication (Self-Hosted n8n)

Since n8n is self-hosted behind Cloudflare tunnels with only 3 users, we can use a simpler approach:

**Option A: Simple API Key (Recommended)**
- Store API keys in environment variables or Firestore
- Single API key shared by all n8n workflows
- Simple header validation

**Option B: Environment-Based (Simplest)**
- Use environment variable for API key
- No database lookup needed
- Fastest for small team

**Option C: Cloudflare Tunnel Auth (Most Secure)**
- Rely on Cloudflare tunnel authentication
- API endpoints only accessible via tunnel
- No API key needed if tunnel is properly secured

#### 4.2 Implementation (Simple API Key)

```typescript
// functions/src/middleware/auth.ts

const API_KEY = process.env.API_KEY || '';

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  // If no API_KEY set, skip auth (for development)
  if (!API_KEY) {
    console.warn('API_KEY not set, skipping authentication');
    return next();
  }
  
  const providedKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!providedKey || providedKey !== API_KEY) {
    return res.status(401).json({ 
      success: false,
      error: { 
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key' 
      }
    });
  }
  
  next();
};
```

**For Production:**
- Set API key in Cloud Functions environment: `firebase functions:config:set api.key="your-secret-key"`
- Access via: `functions.config().api.key`

### Phase 5: Error Handling & Validation

#### 5.1 Validation Rules

```typescript
// functions/src/utils/validation.ts

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateUnidad(unidad: Partial<Unidad>): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!unidad.proyectoId) errors.push('proyectoId is required');
  if (!unidad.ciudad) errors.push('ciudad is required');
  if (!unidad.barrio) errors.push('barrio is required');
  if (unidad.dormitorios === undefined) errors.push('dormitorios is required');
  if (unidad.banos === undefined) errors.push('banos is required');
  
  // Type validation
  if (unidad.dormitorios !== undefined && typeof unidad.dormitorios !== 'number') {
    errors.push('dormitorios must be a number');
  }
  
  // Enum validation
  const validCiudades = ['Montevideo', 'Maldonado', 'Canelones'];
  if (unidad.ciudad && !validCiudades.includes(unidad.ciudad)) {
    errors.push(`ciudad must be one of: ${validCiudades.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### 5.2 Error Response Format

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

### Phase 6: n8n Workflow Integration

#### 6.1 Workflow Steps

1. **Trigger**: File upload (webhook, file system, scheduled, etc.)
2. **Read Excel File**: Use n8n's "Read Binary File" or "Read from File System" node
3. **Parse Excel**: Use n8n's "Spreadsheet File" node to convert Excel → JSON
4. **Transform Data**: Use n8n's "Set" or "Code" node to map Excel columns to API format
   - Map `Proyecto ID` → `proyectoId`
   - Map `Dorm` → `dormitorios`
   - Map `Baños` → `banos`
   - etc.
5. **Call Batch API**: POST to `/api/unidades/batch` with transformed JSON array
6. **Handle Response**: 
   - Check for errors
   - Log results
   - Send notifications if needed

#### 6.2 Example n8n Workflow

```
[Webhook/File System] 
  → [Read Binary File] 
  → [Spreadsheet File: Parse Excel] 
  → [Code: Transform columns] 
  → [HTTP Request: POST /api/unidades/batch] 
  → [IF: Check for errors] 
  → [Send Email/Notification on Error]
```

#### 6.3 n8n Configuration Notes

- **Cloudflare Tunnel**: API endpoint accessible via tunnel URL
- **API Key**: Store in n8n credentials, use in HTTP Request headers
- **Error Handling**: n8n can retry failed requests automatically
- **Batch Size**: Consider splitting large batches (100+ unidades) into smaller chunks

### Phase 7: Implementation Steps

#### Step 1: Setup Cloud Functions (Day 1)
- [ ] Initialize Firebase Functions
- [ ] Configure TypeScript
- [ ] Setup basic Express server
- [ ] Deploy test endpoint

#### Step 2: Core API Endpoints (Day 2-3)
- [ ] Implement authentication middleware
- [ ] Create GET `/api/unidades` endpoint
- [ ] Create POST `/api/unidades` endpoint
- [ ] Create GET `/api/unidades/:id` endpoint
- [ ] Create PUT `/api/unidades/:id` endpoint
- [ ] Create DELETE `/api/unidades/:id` endpoint

#### Step 3: Batch Operations (Day 4)
- [ ] Implement POST `/api/unidades/batch` endpoint
- [ ] Add transaction support for batch operations
- [ ] Implement error handling for partial failures

#### Step 4: Testing & Documentation (Day 5)
- [ ] Test batch endpoint with sample JSON data
- [ ] Create API documentation
- [ ] Document n8n workflow examples

#### Step 5: Supporting Endpoints (Day 6)
- [ ] Implement GET `/api/proyectos` endpoint
- [ ] Add proyecto lookup for validation

#### Step 6: n8n Integration & Testing (Day 7)
- [ ] Create example n8n workflow JSON
- [ ] Test end-to-end workflow with Cloudflare tunnel
- [ ] Document n8n setup instructions
- [ ] Test with real Excel files via n8n

### Phase 8: Security Considerations

1. **API Key Management**
   - Store API key in Cloud Functions environment variables
   - Use Cloudflare tunnel for network-level security
   - Simple single key is sufficient for 3 users

2. **Rate Limiting**
   - Optional: Basic rate limiting (e.g., 1000 requests/hour)
   - Not critical with only 3 users, but good practice
   - Can be implemented via Cloudflare or in functions

3. **Input Validation**
   - Validate all inputs strictly
   - Sanitize data before Firestore writes
   - Prevent injection attacks

4. **Error Messages**
   - Don't expose sensitive information in errors
   - Log detailed errors server-side only

5. **Cloudflare Tunnel Security**
   - Ensure tunnel is properly secured
   - Use Cloudflare Access if needed for additional auth
   - Monitor tunnel access logs

### Phase 9: Monitoring & Logging

1. **Cloud Functions Logs**
   - Use Firebase Console for function logs
   - Set up alerts for errors

2. **Metrics**
   - Track API usage per endpoint
   - Monitor response times
   - Track success/failure rates

3. **Audit Trail**
   - Log all API requests
   - Track which API key made which requests
   - Store in Firestore `apiLogs` collection

## File Structure Summary

```
crm-dashboard-fe/
├── functions/
│   ├── src/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   ├── unidades.ts
│   │   │   └── proyectos.ts
│   │   ├── services/
│   │   │   └── firestore.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── types/
│   │   │   └── api.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── errors.ts
│   ├── package.json
│   └── tsconfig.json
├── firebase.json
└── docs/
    └── guides/
        └── api-integration-plan.md (this file)
```

## Dependencies Required

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "firebase-admin": "^13.5.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "typescript": "^5.0.0"
  }
}
```

**Note**: No need for `xlsx` or `multer` since n8n handles Excel parsing.

## API Documentation Template

### Base URL
```
https://us-central1-crmdashboard-f4c86.cloudfunctions.net/api
```

### Authentication
Include API key in headers:
```
X-API-Key: your-api-key-here
```

Or as query parameter:
```
?apiKey=your-api-key-here
```

### Endpoints

[Detailed endpoint documentation will be created during implementation]

## Next Steps

1. **Review and Approve Plan**: Review this plan and confirm approach
2. **Setup Development Environment**: Initialize Cloud Functions
3. **Implement Phase by Phase**: Follow the implementation steps
4. **Test with Sample Data**: Use existing Excel files to test
5. **Deploy and Integrate**: Deploy functions and integrate with n8n

## Questions to Consider

1. **API Key Storage**: Where should we store the API key?
   - Cloud Functions environment variable (recommended)
   - Firestore collection (if you want to manage multiple keys)

2. **ProyectoId Resolution**: How should n8n handle proyectoId in Excel?
   - By name (lookup proyecto by nombre in n8n workflow)?
   - By ID (require exact ID in Excel)?
   - Auto-create proyectos if not found (via separate API call)?

3. **Error Handling**: How should we handle partial failures in batch imports?
   - Continue and report all errors (recommended)?
   - Stop on first error?
   - Rollback entire batch?

4. **Cloudflare Tunnel**: What's the tunnel URL/domain?
   - Needed for API endpoint configuration

## Conclusion

This plan provides a comprehensive roadmap for implementing API endpoints that n8n can use to import unidades. Since n8n will handle Excel parsing client-side, the API focuses on clean JSON endpoints for CRUD operations.

The simplified architecture (no Excel parsing in the API) makes the solution:
- ✅ **Simpler**: Less code, fewer dependencies
- ✅ **More Flexible**: n8n users can customize Excel parsing per workflow
- ✅ **Easier to Maintain**: Separation of concerns
- ✅ **Faster**: No file upload/parsing overhead in Cloud Functions

With Cloudflare tunnels providing network-level security and simple API key authentication, this solution is perfect for a small team of 3 users.

