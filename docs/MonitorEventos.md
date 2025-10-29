# Monitor de Eventos (Auditoría de Acciones)

El `EventMonitorService` es un servicio transversal (Core) diseñado para registrar todas las acciones críticas del usuario (creación, edición, eliminación) en una colección centralizada de Firestore llamada `eventos`.

Su propósito principal es proporcionar un historial de auditoría detallado, incluyendo la capacidad de rastrear los cambios específicos realizados durante una operación de **edición**.

## 1. Arquitectura y Componentes

|

| Componente | Tipo | Ubicación Recomendada | Responsabilidad Principal |

| Evento | Modelo/Interfaz | core/models/evento.model.ts | Define la estructura de datos que se guarda en Firestore. |

| EventMonitorService | Servicio Core | core/services/event-monitor.service.ts | Lógica para construir, mapear y persistir el objeto Evento en Firestore. |

| Servicios de Dominio | Puntos de Inserción | features/*/services/*.service.ts | Inyectan EventMonitorService y llaman a sus métodos después de una operación exitosa. |

| Colección eventos | Firestore | Raíz de la DB | Almacena todos los registros de auditoría. |

## 2. Modelos de Datos (`evento.model.ts`)

Se definen interfaces claras para estructurar el objeto de auditoría, permitiendo almacenar datos detallados solo para la categoría relevante (Contacto, Unidad, etc.).

### Interfaz `Evento` (El objeto que se guarda)

```
// Define el tipo de acción (Nuevo, Editado, Eliminado)
export type EventoTipo = 'Nuevo' | 'Editado' | 'Eliminado';

// Define las categorías de las colecciones auditadas
export type EventoCategoria = 'Contactos' | 'Unidades' | 'Entrevistas' | 'ListaNegra';

export interface Evento {
  id?: string;
  tipo: EventoTipo;
  categoria: EventoCategoria; 
  fecha: Date;
  usuario: string; // ID o Email del usuario

  // Contenedores de datos específicos de la categoría. Solo uno debe estar presente.
  contacto?: EventoData<ContactoAudit & Record<string, any>>;
  unidad?: EventoData<UnidadAudit & Record<string, any>>;
  // ... otros
}


```

### Interfaz `EventoData<T>` (Estructura de la Auditoría)

Esta interfaz es crucial para manejar la trazabilidad de las ediciones:

```
export interface EventoData<T> {
  current: T; // El estado del objeto DESPUÉS de la operación (Nuevo, Editado, Eliminado)
  
  // SOLO presente si tipo === 'Editado'
  previous?: T; // El estado del objeto ANTES de la edición
  
  // SOLO presente si tipo === 'Editado'
  changes?: Record<string, any>; // Lista de los campos que cambiaron: { campo: { oldValue: '...', newValue: '...' } }
}


```

### Interfaces de Auditoría (`ContactoAudit`, `UnidadAudit`)

Definen el resumen de la información que se mostrará en el log para identificar rápidamente el registro afectado.

```
export interface ContactoAudit {
  id: string;
  nombreApellido: string;
  // ... otros campos para auditoría detallada
}

export interface UnidadAudit {
  id: string;
  nombre: string;
  proyecto: string;
  // ... otros campos para auditoría detallada
}


```

## 3. Uso del `EventMonitorService`

El servicio expone tres métodos públicos que deben ser llamados desde los Servicios de Dominio (ej: `ContactoService`, `UnidadService`) después de que la operación de Firestore se haya completado con éxito.

### A. Para Creación (`new`)

Se llama después de que un nuevo documento se haya agregado a Firestore.

| Parámetro | Descripción |

| categoria | La colección afectada (ej: 'Contactos'). |

| newObject | El objeto completo recién creado. |

```
// Dentro de ContactoService.addContacto(...)
// ... (código de adición a Firestore) ...
await this.eventMonitor.new('Contactos', newContactoData);


```

### B. Para Eliminación (`delete`)

Se llama después de que un documento se haya eliminado de Firestore. Se recomienda obtener el objeto antes de eliminarlo para guardar una copia de lo que fue borrado.

| Parámetro | Descripción |

| categoria | La colección afectada (ej: 'Unidades'). |

| deletedObject | El objeto completo antes de ser eliminado. |

```
// Dentro de UnidadService.deleteUnidad(...)
// ... (código de obtención de datos antes de borrar) ...
// ... (código de eliminación de Firestore) ...
await this.eventMonitor.delete('Unidades', deletedUnidadData);


```

### C. Para Edición (`edit`)

**Este es el caso más importante.** Requiere recuperar el estado del objeto **antes** de la actualización y pasar tanto la versión antigua como la nueva. El servicio se encargará de calcular las diferencias.

| Parámetro | Descripción |

| categoria | La colección afectada (ej: 'Contactos'). |

| oldObject | El objeto completo ANTES de la actualización. |

| newObject | El objeto completo DESPUÉS de aplicar los cambios. |

```
// Dentro de ContactoService.updateContacto(...)
// 1. Obtener oldObject
// 2. Aplicar la actualización en Firestore
// 3. Generar newObject (oldObject + partialUpdate)
await this.eventMonitor.edit('Contactos', oldContact, newContact);


```

## 4. Implementación Clave en el Servicio

La función clave es `EventMonitorService.edit()`, que utiliza una función auxiliar `getChanges()` para comparar los objetos:

```
// Función auxiliar dentro de EventMonitorService
private getChanges(oldObj: any, newObj: any): Record<string, any> {
  const changes: Record<string, any> = {};
  for (const key in newObj) {
    if (oldObj.hasOwnProperty(key) && oldObj[key] !== newObj[key]) {
      changes[key] = {
        oldValue: oldObj[key],
        newValue: newObj[key]
      };
    }
  }
  return changes;
}


```

Esta función garantiza que en el registro de auditoría solo se almacenen los campos que realmente se modificaron, optimizando el tamaño del documento de Firestore.

## 5. Reglas de Seguridad de Firestore (CRÍTICO)

La colección `eventos` **solo debe permitir escritura** por parte de usuarios autenticados. La lectura debe estar restringida a roles de administrador o a una página de administración específica, ya que contiene información sensible sobre la actividad del usuario.

**Sugerencia de Reglas (Pseudo-código):**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite la creación/escritura (log) si el usuario está autenticado
    match /eventos/{document} {
      allow create: if request.auth != null;
      allow update, delete, read: if false; // Denegar lectura y modificación
    }
    // Para entornos con roles, podrías agregar:
    // allow read: if exists(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'admin';
  }
}


```
