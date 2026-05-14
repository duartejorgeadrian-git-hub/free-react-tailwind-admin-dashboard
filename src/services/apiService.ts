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
    try {
      const response = await fetch(`${API_URL}/api/citizens/${citizenId}/courses`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching citizen courses:', error);
      return { success: false, data: [] };
    }
  },

  async getCitizenBadges(citizenId: string) {
    try {
      const response = await fetch(`${API_URL}/api/citizens/${citizenId}/badges`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching citizen badges:', error);
      return { success: false, data: [] };
    }
  },

  async updateAlertStatus(alertId: string, status: string, userId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_URL}/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ status }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating alert status:', error);
      return { success: false };
    }
  }
};
