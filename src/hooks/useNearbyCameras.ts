import { useState, useEffect, useMemo } from 'react';

export interface MapCamera {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  is_active: boolean;
  distance?: number;
}

interface UseNearbyCamerasProps {
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  limit?: number;
  showAll?: boolean;
  municipalityId?: string;
}

export const useNearbyCameras = ({
  latitude,
  longitude,
  radiusMeters = 5000,
  limit = 5,
  showAll = false,
  municipalityId
}: UseNearbyCamerasProps) => {
  const [cameras, setCameras] = useState<MapCamera[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCameras = async () => {
      setLoading(true);
      try {
        const rawUrl = import.meta.env.VITE_API_URL || '';
        const apiUrl = (rawUrl.split(' ')[0] || `http://${window.location.hostname}:3001`).trim();

        let url = `${apiUrl}/api/cameras`;
        if (municipalityId) {
          url += `?municipalityId=${municipalityId}`;
        }
        const response = await fetch(url);
        const allCameras: any[] = await response.json();

        // Si showAll es true, o no hay coordenadas de referencia, mostramos todo
        if (showAll || !latitude || !longitude || latitude === -51.6226) {
          const activeCameras = allCameras
            .filter(cam => cam.is_active !== false)
            .map(cam => ({
              ...cam,
              latitude: Number(cam.latitude),
              longitude: Number(cam.longitude),
              feed_url: cam.feed_url
            }))
            .filter(cam => !isNaN(cam.latitude) && !isNaN(cam.longitude));

          setCameras(activeCameras);
          return;
        }

        // Si NO está showAll y TENEMOS coordenadas de alerta (GPS del usuario)
        const camerasWithDistance = allCameras
          .map(cam => {
            const lat = Number(cam.latitude);
            const lng = Number(cam.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;
            const dist = calculateDistance(latitude, longitude, lat, lng);
            return { ...cam, latitude: lat, longitude: lng, distance: dist, feed_url: cam.feed_url };
          })
          .filter((cam): cam is MapCamera => cam !== null && cam.is_active !== false);

        // Ordenar por cercanía al usuario y tomar solo las 5 (o el límite indicado)
        const nearby = camerasWithDistance
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          .slice(0, limit);

        setCameras(nearby);
      } catch (error) {
        console.error('Error fetching cameras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [latitude, longitude, limit, showAll, municipalityId]);

  const primaryCamera = useMemo(() => cameras[0] || null, [cameras]);

  return { cameras, primaryCamera, loading };
};

// Función auxiliar para calcular distancia en metros (Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
