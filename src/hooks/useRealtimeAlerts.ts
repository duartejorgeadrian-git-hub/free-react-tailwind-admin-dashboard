import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Alert } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

interface UseRealtimeAlertsProps {
  onNewAlert?: (alert: Alert) => void;
  onAlertUpdated?: (alert: Alert) => void;
  municipalityId?: string;
}

export const useRealtimeAlerts = (props?: UseRealtimeAlertsProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const municipalityId = props?.municipalityId;

  const fetchActiveAlerts = async () => {
    try {
      setLoading(true);
      const url = municipalityId
        ? `${API_URL}/api/alerts?municipalityId=${municipalityId}`
        : `${API_URL}/api/alerts`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
      }

      const data = await response.json();

      // Mapear campos de MySQL a CamelCase si es necesario
      const mapped = data.map((row: any) => ({
        ...row,
        createdAt: row.created_at,
        municipalityId: row.municipality_id
      }));

      setAlerts(mapped);
    } catch (err) {
      console.error('Error fetching alerts from XAMPP:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAlerts();

    // Conectar al Socket de nuestro servidor Node.js con máxima compatibilidad
    const socket = io(API_URL, {
      transports: ['polling'], // Forzamos polling para saltar bloqueos de firewall/browser
      upgrade: true,           // Permitimos que suba a websocket si puede
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      withCredentials: true,
      autoConnect: true
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Conectado al servidor de alertas');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión socket:', error);
      setIsConnected(false);
    });

    // Escuchar nuevas alertas
    socket.on('new_alert', (newAlert: any) => {
      // Filtrar por municipio si hay uno seleccionado
      if (municipalityId && newAlert.municipality_id && newAlert.municipality_id !== municipalityId) {
        return;
      }

      const alert: Alert = {
        ...newAlert,
        createdAt: newAlert.created_at || new Date().toISOString(),
        municipalityId: newAlert.municipality_id
      };
      setAlerts((prev) => [alert, ...prev]);
      props?.onNewAlert?.(alert);

      // Sonido de alerta (Opcional)
      const audio = new Audio('/alert-sound.mp3');
      audio.play().catch(() => {});
    });

    // Escuchar actualizaciones (cuando se atiende una alerta)
    // OJO: el status que viene por socket está tipado como string,
    // normalizamos/casteamos a la unión permitida por el tipo Alert.
    const normalizeStatus = (s: string): Alert['status'] => {
      const v = (s || '').toLowerCase().trim();
      if (v === 'activa' || v === 'en_atencion' || v === 'resuelta' || v === 'archivada') return v;
      return 'activa';
    };

    socket.on('alert_updated', (updatedData: { id: string, status: string }) => {
      const nextStatus = normalizeStatus(updatedData.status);
      setAlerts((prev) => {
        const updatedAlerts = prev.map((a) =>
          a.id === updatedData.id
            ? { ...a, status: nextStatus, resolvedAt: nextStatus === 'resuelta' ? new Date().toISOString() : a.resolvedAt }
            : a
        );

        const updatedAlert = updatedAlerts.find(a => a.id === updatedData.id);
        if (updatedAlert) {
          props?.onAlertUpdated?.(updatedAlert);
        }

        return updatedAlerts;
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [municipalityId]);

  const stats = {
    criticas: alerts.filter(a => a.severity === 'critica' && (a.status === 'activa' || a.status === 'en_atencion')).length,
    activas: alerts.filter(a => a.status === 'activa').length,
    en_atencion: alerts.filter(a => a.status === 'en_atencion').length,
    resueltas_hoy: alerts.filter(a => a.status === 'resuelta').length,
  };

  return { alerts, loading, stats, isConnected };
};
