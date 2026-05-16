export type AppRole =
  | 'operador'
  | 'supervisor'
  | 'auditor'
  | 'director'
  | 'admin_municipal'
  | 'superadmin'
  | 'admin';

export interface Municipality {
  id: string;
  name: string;
  province: string;
  code: string;
  latitude?: number;
  longitude?: number;
  primary_color?: string;
  logo_url?: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'critica' | 'alta' | 'media' | 'baja';
  status: 'activa' | 'en_atencion' | 'resuelta' | 'archivada';
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  createdAt: string;
  resolvedAt?: string;
  municipalityId: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  front_photo_url?: string;
  rear_photo_url?: string;
  audio_url?: string;
}

export interface MapCamera {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  is_active: boolean;
  distance?: number;
  code?: string;
  feed_url?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  email?: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  avatar_url?: string;
  nivel_ciudadano: number;
  puntos_pcc: number;
  verificado: boolean;
  municipalityId?: string;
  role?: AppRole;
}

export interface Citizen {
  id: string;
  dni: string;
  municipalityId: string;
  createdAt: string;
  isActive: boolean;
}

export interface CitizenProfile {
  id: string;
  citizenId: string;
  nombre: string;
  apellido: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  riskLevel: 'alto' | 'medio' | 'bajo';
  createdAt: string;
}

export interface CourseWithProgress {
  id: string;
  title: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'not_started';
}
