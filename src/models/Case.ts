// backend/src/models/Case.ts
export interface Case {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'ARCHIVADO';
  vencimiento?: string;
  creado_por: number;
  asignado_a?: number;
  created_at: string;
  updated_at: string;
}

export interface CaseCreate {
  nombre: string;
  descripcion: string;
  estado: string;
  vencimiento?: string;
  creado_por: number;
  asignado_a?: number;
}

export interface CaseUpdate {
  nombre?: string;
  descripcion?: string;
  estado?: string;
  vencimiento?: string;
  asignado_a?: number;
}