// Core domain models and enums used across the app

export type Ciudad = 'Montevideo' | 'Maldonado' | 'Canelones';

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
  ciudad: Ciudad;
  barrio: string;
  tipo: TipoResidencia; // Casa / Apartamento / Complejo
  createdAt?: number;
  updatedAt?: number;
}

export interface Unidad {
  id: string;
  proyectoId: string;

  // Denormalized from proyecto for filtering
  ciudad: Ciudad;
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
  ciudad?: Ciudad;
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
  createdAt?: number;
  updatedAt?: number;
}


