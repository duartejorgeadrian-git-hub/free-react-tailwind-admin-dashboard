import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation2, Lock, Unlock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Alert, MapCamera } from '@/types';

interface FiberLayer {
  name: string;
  path: { lat: number; lng: number }[];
}

interface IncidentMapProps {
  alerts: Alert[];
  selectedAlertId?: string;
  cameras?: MapCamera[];
  className?: string;
  center?: { lat: number; lng: number };
}

// Icono de cámara
const cameraIcon = L.divIcon({
  className: 'custom-camera-icon',
  html: `<div style="background-color: #6366f1; width: 14px; height: 14px; border-radius: 3px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Icono de cámara en modo edición (más grande y resaltado)
const cameraEditIcon = L.divIcon({
  className: 'custom-camera-icon-edit',
  html: `<div style="background-color: #f59e0b; width: 20px; height: 20px; border-radius: 4px; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; animation: bounce 1s infinite alternate;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom icons based on severity
const createCustomIcon = (severity: string) => {
  let color = '#3b82f6'; // default blue
  if (severity === 'critica') color = '#ef4444'; // red
  else if (severity === 'alta') color = '#f97316'; // orange
  else if (severity === 'media') color = '#eab308'; // yellow

  return L.divIcon({
    className: 'custom-alert-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); animation: pulse 2s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// Component to handle map zooming to selected alert or municipality center
function MapController({
  alerts,
  selectedAlertId,
  center
}: {
  alerts: Alert[],
  selectedAlertId?: string,
  center?: { lat: number; lng: number }
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedAlertId) {
      const selected = alerts.find(a => a.id === selectedAlertId);
      if (selected && selected.latitude && selected.longitude) {
        map.setView([selected.latitude, selected.longitude], 16, {
          animate: true,
          duration: 1
        });
      }
    } else if (alerts.length > 0) {
      // If no alert is selected but there are alerts, fit bounds to all alerts
      const bounds = L.latLngBounds(alerts.filter(a => a.latitude && a.longitude).map(a => [a.latitude, a.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (center) {
      // If no alerts, go to municipality center
      map.setView([center.lat, center.lng], 13, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedAlertId, alerts, map, center]);

  return null;
}

export const IncidentMap = ({ 
  alerts = [],
  selectedAlertId,
  cameras = [],
  className,
  center
}: IncidentMapProps) => {
  const { toast } = useToast();
  const { role } = useAuth();
  // Default center: Río Gallegos, Santa Cruz
  const defaultCenter: [number, number] = [-51.6226, -69.2181];
  const [fiberLayers, setFiberLayers] = useState<FiberLayer[]>([]);
  const [isEditingCameras, setIsEditingCameras] = useState(false);
  const [localCameras, setLocalCameras] = useState<MapCamera[]>(cameras);

  // Actualizar cámaras locales cuando cambian las props
  useEffect(() => {
    setLocalCameras(cameras);
  }, [cameras]);

  // Solo el superadmin puede editar cámaras
  const canEdit = role === 'superadmin';

  useEffect(() => {
    fetch('/fiber_layers.json')
      .then(res => res.json())
      .then(data => setFiberLayers(data))
      .catch(err => console.error('Error loading fiber layers:', err));
  }, []);

  const handleCameraMove = useCallback(async (cameraId: string, newLat: number, newLng: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;
      const response = await fetch(`${apiUrl}/api/cameras/${cameraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: newLat, longitude: newLng })
      });

      if (response.ok) {
        // Actualizar estado local para que el marcador se quede en la nueva posición
        setLocalCameras(prevCameras =>
          prevCameras.map(cam =>
            cam.id === cameraId
              ? { ...cam, latitude: newLat, longitude: newLng }
              : cam
          )
        );

        toast({
          title: "Ubicación actualizada",
          description: "La posición de la cámara se guardó correctamente.",
        });
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la nueva ubicación.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 z-0 ${className}`}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-5px); }
        }
      `}</style>

      {/* Control de Edición - Solo visible para Superadmin */}
      {canEdit && (
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <Button
            variant={isEditingCameras ? "destructive" : "secondary"}
            size="sm"
            className="shadow-md font-bold"
            onClick={() => setIsEditingCameras(!isEditingCameras)}
          >
            {isEditingCameras ? (
              <><Lock className="w-4 h-4 mr-2" /> BLOQUEAR MAPA</>
            ) : (
              <><Unlock className="w-4 h-4 mr-2" /> EDITAR CÁMARAS</>
            )}
          </Button>
          {isEditingCameras && (
            <div className="bg-amber-100 text-amber-800 text-[10px] p-2 rounded border border-amber-300 shadow-sm animate-in slide-in-from-left-2">
              <strong>MODO EDICIÓN ACTIVO:</strong><br />
              Arrastra los puntos naranjas para<br />corregir la ubicación.
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={defaultCenter} 
        zoom={13} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Alertas Activas">
            <LayerGroup>
              {alerts.map(alert => (
                alert.latitude && alert.longitude && (
                  <Marker
                    key={alert.id}
                    position={[alert.latitude, alert.longitude]}
                    icon={createCustomIcon(alert.severity)}
                    zIndexOffset={selectedAlertId === alert.id ? 1000 : 0}
                  >
                    <Popup className="custom-popup rounded-xl">
                      <div className="p-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                            <Navigation2 className="w-4 h-4 text-rose-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm m-0 uppercase">{alert.type}</h4>
                            <p className="text-[10px] text-slate-500 m-0 capitalize">{alert.severity}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 m-0 mb-2 line-clamp-2">{alert.address}</p>
                        <div className="text-[9px] font-mono bg-slate-100 p-1.5 rounded text-slate-500 text-center">
                          {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Cámaras de Seguridad">
            <LayerGroup>
              {localCameras.map(camera => {
                const lat = Number(camera.latitude);
                const lng = Number(camera.longitude);

                if (isNaN(lat) || isNaN(lng) || lat === 0) return null;

                return (
                  <Marker
                    key={camera.id}
                    position={[lat, lng]}
                    icon={isEditingCameras ? cameraEditIcon : cameraIcon}
                    draggable={isEditingCameras}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        handleCameraMove(camera.id, position.lat, position.lng);
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <p className="font-bold">{camera.name}</p>
                        <p className="text-slate-500">{camera.address || 'Sin dirección'}</p>
                        {isEditingCameras && (
                          <div className="mt-2 text-amber-600 font-bold flex items-center gap-1">
                            <Save className="w-3 h-3" /> Arrastra para mover
                          </div>
                        )}
                        {!isEditingCameras && (
                          <div className="mt-1 px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] inline-block font-semibold">CÁMARA</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Trazado de Fibra Óptica">
            <LayerGroup>
              {fiberLayers.map((layer, idx) => (
                <Polyline
                  key={`${layer.name}-${idx}`}
                  positions={layer.path.map(p => [p.lat, p.lng])}
                  color={layer.name.includes('SS SERVICIOS') ? '#06b6d4' : '#6366f1'}
                  weight={3}
                  opacity={0.7}
                >
                  <Popup>
                    <div className="text-xs font-bold">{layer.name}</div>
                  </Popup>
                </Polyline>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        <MapController
          alerts={alerts}
          selectedAlertId={selectedAlertId}
          center={center}
        />
      </MapContainer>
    </div>
  );
};
