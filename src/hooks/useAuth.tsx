import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { UserProfile, AppRole } from '@/types';

interface AuthContextType {
  user: { id: string; username: string; role: string } | null;
  profile: UserProfile | null;
  role: AppRole | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  signUp: (username: string, password: string, profileData: any) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateAuthData: (data: { user?: any; profile?: any; role?: AppRole }) => void;
}

export type { AppRole };

const rolePermissions: Record<string, string[]> = {
  operador: ['view_alerts'],
  supervisor: ['view_alerts', 'manage_alerts', 'view_citizen_profile', 'view_reports'],
  auditor: ['view_audit'],
  director: ['view_alerts', 'manage_alerts', 'view_citizen_profile', 'view_reports', 'view_audit'],
  admin_municipal: ['view_alerts', 'manage_alerts', 'view_citizen_profile', 'view_reports', 'view_audit', 'manage_users', 'manage_config'],
  superadmin: ['view_alerts', 'manage_alerts', 'view_citizen_profile', 'view_reports', 'view_audit', 'manage_users', 'manage_config', 'manage_tenants'],
  admin: ['view_alerts', 'manage_alerts', 'view_citizen_profile', 'view_reports', 'view_audit', 'manage_users', 'manage_config', 'manage_tenants'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = (rawUrl.split(' ')[0] || `http://${window.location.hostname}:3001`).trim();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const hasPermission = (permission: string) => {
    if (!role) return false;
    return rolePermissions[role]?.includes(permission) ?? false;
  };

  const hasAnyRole = (roles: AppRole[]) => {
    if (!role) return false;
    return roles.includes(role);
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('auth_session');
    if (savedAuth) {
      try {
        const { user: savedUser, profile: savedProfile } = JSON.parse(savedAuth);
        setUser(savedUser);
        setProfile(savedProfile);
        setRole(savedUser?.role || savedProfile?.role || 'operador');
      } catch (e) {
        localStorage.removeItem('auth_session');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (username: string, password: string, profileData: any) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({ username, password, ...profileData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en registro');
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Credenciales inválidas');

      const authSession = {
        user: data.user,
        profile: data.profile,
        token: data.token
      };

      localStorage.setItem('auth_session', JSON.stringify(authSession));
      setUser(data.user);
      setProfile(data.profile);
      setRole(data.user.role || 'operador');

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_session');
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    try {
      console.log('🔄 Sincronizando perfil con el servidor...');
      // Añadimos un pequeño delay para asegurar que el server actualizó la DB
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch(`${API_URL}/api/users`);
      const users = await response.json();
      const me = users.find((u: any) => u.id === user.id);

      if (me) {
        console.log('✅ Datos recuperados:', me.nombre, me.apellido);
        const updatedProfile = {
          ...me,
          nombre: me.nombre || '',
          apellido: me.apellido || ''
        };

        setProfile(updatedProfile);
        setRole(me.role as AppRole);

        const savedAuth = localStorage.getItem('auth_session');
        if (savedAuth) {
          const session = JSON.parse(savedAuth);
          session.profile = updatedProfile;
          session.user.role = me.role;
          localStorage.setItem('auth_session', JSON.stringify(session));
        }
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  const updateAuthData = (data: { user?: any; profile?: any; role?: AppRole }) => {
    const savedAuth = localStorage.getItem('auth_session');
    const session = savedAuth ? JSON.parse(savedAuth) : {};

    if (data.user) {
      setUser(data.user);
      session.user = data.user;
    }
    if (data.profile) {
      setProfile(data.profile);
      session.profile = data.profile;
    }
    if (data.role) {
      setRole(data.role);
    }

    localStorage.setItem('auth_session', JSON.stringify(session));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        hasPermission,
        hasAnyRole,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
