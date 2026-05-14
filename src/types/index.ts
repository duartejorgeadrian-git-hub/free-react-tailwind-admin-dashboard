export interface Municipality {
  id: string;
  name: string;
  province: string;
  code: string;
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
  municipalityId: string;
}

export interface MapCamera {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  is_active: boolean;
  distance?: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  avatar_url?: string;
  nivel_ciudadano: number;
  puntos_pcc: number;
  verificado: boolean;
}
