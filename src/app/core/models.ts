// Core domain models and enums used across the app

// Legacy Ciudad type (string union) - consider migrating to CiudadModel
export type CiudadType = 'Montevideo' | 'Maldonado' | 'Canelones';

export type Orientacion =
  | 'Norte' | 'Noreste' | 'Este' | 'Sudeste'
  | 'Sur' | 'Suroeste' | 'Oeste' | 'Noroeste';

export type TipoResidencia = 'Casa' | 'Apartamento' | 'Complejo';

export type Distribucion =
  | 'Frente/Esquinero' | 'Frente/Central'
  | 'Contrafrente/Esquinero' | 'Contrafrente/Central'
  | 'Lateral' | 'Inferior';

export type PisoCategoria = 'Bajo' | 'Medio' | 'Alto';

export type PublicacionVisibilidad = 'Publicado' | 'No publicado';
export type PublicacionInterna = 'Activo' | 'Stand By' | 'Vendido';

export type Disponibilidad =
  | 'No disponible'
  | 'Disponible: publicada'
  | 'Disponible: reventa publicada'
  | 'Disponible: reventa no publicada'
  | 'Disponible: con renta publicada'
  | 'Disponible: con renta no publicada'
  | 'Reservada para venta'
  | 'Reservada por promotor'
  | 'Vendida';

export type Ocupacion =
  | 'A ocupar'
  | '1 a 6 meses'
  | '7 meses 1 año'
  | '1 a 2 años'
  | 'Mas de 2 años';

// Extras interface: extendable list of string labels
export interface ExtrasCatalogItem { key: string; label: string; }

export interface Proyecto {
  id: string;
  nombre: string;
  tipoProyecto: 'Multiple' | 'Unico';
  ciudad: CiudadType;
  barrio: string;
  tipo: TipoResidencia; // Casa / Apartamento / Complejo
  createdAt?: number;
  updatedAt?: number;
}

export interface Unidad {
  id: string;
  proyectoId: string;

  // Denormalized from proyecto for filtering
  ciudad: CiudadType;
  barrio: string;

  nombre?: string;             // Ej: “Apto 302”
  tipo: TipoResidencia;        // Usually aligns with proyecto.tipo
  orientacion?: Orientacion;
  distribucion?: Distribucion;

  dormitorios: number;         // 0 = Monoambiente, 1..n
  banos: number;               // 1..n
  pisoCategoria?: PisoCategoria;

  tamanoM2?: number;
  precioUSD?: number;
  expensasUSD?: number;

  extras?: string[];           // Array of labels from the extras catalog

  visibilidad: PublicacionVisibilidad;  // Ver
  publicacionInterna?: PublicacionInterna; // Only if No publicado
  disponibilidad: Disponibilidad;       // Mutually-exclusive status

  ocupacion?: Ocupacion;

  imagenUrl?: string;
  activo?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface ContactoPreferencias {
  ciudad?: CiudadType;
  barrio?: string;
  tipo?: TipoResidencia;
  cuartos?: number; // 0..n (0 = Monoambiente)
  precio?: { min?: number; max?: number };
}

export interface ContactoEntrevista {
  proyectoId?: string;
  unidadId?: string;
  comentario?: string;
  fechaISO?: string; // YYYY-MM-DD
  hora?: string;     // HH:mm
  lugar?: string;
}

export interface Contacto {
  id: string;
  nombre: string;
  apellido: string;
  edad?: number;
  telefono: string;
  mail?: string;
  pareja: boolean;
  familia: boolean;
  preferencias?: ContactoPreferencias;
  entrevista?: ContactoEntrevista;
  entrevistaPendiente?: boolean;
  // Seguimiento fields
  tipoContacto?: 'Seguimiento' | 'No seguimiento';
  estado?: string;
  ultimoContacto?: number; // timestamp
  proximoContacto?: number; // timestamp
  createdAt?: number;
  updatedAt?: number;
}

// Ciudad interface (from ciudad.service.ts) - database model
export interface CiudadModel {
  id: number;
  nombre: string;
}

// Alias for backward compatibility
export type Ciudad = CiudadModel;

// Barrio interface (from barrio.service.ts)
export interface Barrio {
  id: number;
  ciudad_id: number;
  nombre: string;
}

// VentaRecord interface (from venta.ts)
export interface VentaRecord {
  id?: string | number;
  date?: number; // epoch ms (normalized to number)
  type: 'venta' | 'renta';
  contacto?: { id: string; nombre?: string } | null;
  contactoId?: string; // For database
  unidad?: { id: string; nombre?: string; localidad?: string };
  unidadId?: string; // For database
  importe?: number; // Valor de la venta/renta
  comision?: number; // Porcentaje de comisión (ej: 3.5 para 3.5%)
  comisionTotal?: number; // Total comisión calculada
  moneda?: string; // 'USD', 'UYU', etc.
  precioUnitario?: number; // Precio de la unidad (usado para calcular comisión si no se especifica)
  meses?: number; // Meses de duración de la renta (solo para tipo renta)
}

// UsuarioData interface (from usuario.ts)
export interface UsuarioData {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  canDelete?: boolean;
  localidades?: string[]; // Array of localidades: 'norte', 'sur', 'este'
  createdAt?: number;
  updatedAt?: number;
}

// ToastMessage interface (from toast.service.ts)
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// ValidationRule interface (from form-validation.service.ts)
export interface ValidationRule {
  field: string;
  label: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | null;
}

// ValidationResult interface (from form-validation.service.ts)
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

