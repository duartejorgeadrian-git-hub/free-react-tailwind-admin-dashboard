import type { Municipality, Alert } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export const apiService = {
  async getMunicipalities(): Promise<{ success: boolean; data: Municipality[] }> {
    try {
      const response = await fetch(`${API_URL}/api/municipalities`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      return { success: false, data: [] };
    }
  },

  async getActiveAlertsCount() {
    try {
      const response = await fetch(`${API_URL}/api/alerts`);
      const alerts: Alert[] = await response.json();

      const active = alerts.filter(a => a.status === 'activa').length;
      const pending = alerts.filter(a => a.status === 'en_atencion').length;

      return {
        success: true,
        data: { active, pending, total: active + pending }
      };
    } catch (error) {
      console.error('Error fetching alert counts:', error);
      return { success: false, data: { active: 0, pending: 0, total: 0 } };
    }
  },

  async getCitizenCourses(citizenId: string) {
    // Por ahora retornamos vacio o mock hasta tener la tabla en MySQL
    return { success: true, data: [] };
  }
};
