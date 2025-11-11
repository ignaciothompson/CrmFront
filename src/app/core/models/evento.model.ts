// Auditoría de acciones - modelos de eventos

export type EventoTipo = 'Nuevo' | 'Editado' | 'Eliminado';
export type EventoCategoria = 'Contactos' | 'Unidades' | 'Entrevistas' | 'ListaNegra' | 'Usuarios';

export interface EventoData<T> {
  current: T;
  previous?: T;
  changes?: Record<string, { oldValue: any; newValue: any }>;
}

export interface Evento<T = any> {
  id?: string;
  tipo: EventoTipo;
  categoria: EventoCategoria;
  fecha: string; // ISO date string
  usuario?: string; // opcional: id/email del usuario
  data: EventoData<T>;
}

// Resúmenes de entidades auditadas (extensibles)
export interface ContactoAudit {
  id?: string;
  nombre?: string;
  apellido?: string;
  mail?: string;
}

export interface UnidadAudit {
  id?: string;
  nombre?: string;
  proyectoId?: string;
  ciudad?: string;
}


