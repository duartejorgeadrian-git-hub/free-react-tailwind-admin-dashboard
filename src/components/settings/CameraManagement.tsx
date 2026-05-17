import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit, 
  MapPin, 
  Search, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Settings2,
  Video,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMunicipality } from '@/context/MunicipalityContext';
import { toast } from 'sonner';

const rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = (rawUrl.split(' ')[0] || `http://${window.location.hostname}:3001`).trim();

// Custom Leaflet Icons for camera management
const cameraIcon = L.divIcon({
  className: 'custom-camera-icon',
  html: `<div style="background-color: #6366f1; width: 14px; height: 14px; border-radius: 3px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const cameraEditIcon = L.divIcon({
  className: 'custom-camera-icon-edit',
  html: `<div style="background-color: #f97316; width: 20px; height: 20px; border-radius: 4px; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; animation: bounce 1s infinite alternate;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface CameraItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  feed_url?: string;
  municipality_id: string;
  is_active: boolean;
}

interface MunicipalityItem {
  id: string;
  name: string;
  code: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}

// Leaflet helper to handle center updates programmatically
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// Leaflet helper to capture map clicks and create camera
function MapClickEvents({ onMapClick, enabled }: { onMapClick: (lat: number, lng: number) => void; enabled: boolean }) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export function CameraManagement() {
  const { profile, role } = useAuth();
  const { selectedMunicipality } = useMunicipality();

  // Permisos
  const isSuperadmin = role === 'superadmin';
  const targetMunicipalityId = isSuperadmin 
    ? (selectedMunicipality?.id || 'muni-rgl-santacruz-001')
    : (profile?.municipalityId || 'muni-rgl-santacruz-001');

  // Estados locales
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuniId, setSelectedMuniId] = useState<string>(targetMunicipalityId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingMap, setIsEditingMap] = useState(false);
  const [isClickToAddMode, setIsClickToAddMode] = useState(false);

  // Estado para el modal de Crear/Editar
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<CameraItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formFeedUrl, setFormFeedUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  // Referencia para centrar mapa en geolocalización
  const [mapCenter, setMapCenter] = useState<[number, number]>([-51.6226, -69.2181]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Cargar lista de municipios (sólo para superadmin)
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tenants`);
        if (response.ok) {
          const data = await response.json();
          setMunicipalities(data);

          // Buscar el municipio actual para centrar el mapa inicial
          const current = data.find((m: any) => m.id === selectedMuniId);
          if (current?.latitude && current?.longitude) {
            setMapCenter([Number(current.latitude), Number(current.longitude)]);
            setMapZoom(13);
          }
        }
      } catch (err) {
        console.error('Error fetching municipalities:', err);
      }
    };

    fetchMunicipalities();
  }, []);

  // Sincronizar selección de municipio desde la barra superior de la app
  useEffect(() => {
    if (targetMunicipalityId) {
      setSelectedMuniId(targetMunicipalityId);
    }
  }, [targetMunicipalityId]);

  // Cargar cámaras cuando cambia el municipio seleccionado
  const fetchCameras = async () => {
    if (!selectedMuniId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cameras?municipalityId=${selectedMuniId}`);
      if (response.ok) {
        const data = await response.json();
        setCameras(data);
      }
    } catch (err) {
      console.error('Error loading cameras:', err);
      toast.error('Error al cargar la red de cámaras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
    
    // Centrar el mapa en la municipalidad seleccionada
    if (municipalities.length > 0) {
      const current = municipalities.find(m => m.id === selectedMuniId);
      if (current?.latitude && current?.longitude) {
        setMapCenter([Number(current.latitude), Number(current.longitude)]);
        setMapZoom(13); // Restablecer a zoom municipal amplio
      }
    }
  }, [selectedMuniId, municipalities]);

  // Filtrado local de cámaras
  const filteredCameras = useMemo(() => {
    return cameras.filter(cam => {
      const nameMatch = cam.name.toLowerCase().includes(searchQuery.toLowerCase());
      const addrMatch = cam.address?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      return nameMatch || addrMatch;
    });
  }, [cameras, searchQuery]);

  // Acción: Mover cámara arrastrándola en el mapa
  const handleCameraDragEnd = async (cameraId: string, newLat: number, newLng: number) => {
    try {
      const response = await fetch(`${API_URL}/api/cameras/${cameraId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': profile?.user_id || ''
        },
        body: JSON.stringify({ latitude: newLat, longitude: newLng })
      });

      if (response.ok) {
        setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, latitude: newLat, longitude: newLng } : c));
        toast.success('Ubicación de cámara calibrada correctamente');
      } else {
        throw new Error('Error al actualizar posición');
      }
    } catch (err) {
      toast.error('No se pudo guardar la ubicación en el servidor');
      fetchCameras(); // Revertir a la posición guardada
    }
  };

  // Abrir Modal para Crear
  const handleOpenAddDialog = (lat?: number, lng?: number) => {
    setEditingCamera(null);
    setFormName('');
    setFormLat(lat !== undefined ? lat.toFixed(6) : mapCenter[0].toFixed(6));
    setFormLng(lng !== undefined ? lng.toFixed(6) : mapCenter[1].toFixed(6));
    setFormAddress('');
    setFormFeedUrl('https://www.w3schools.com/html/mov_bbb.mp4'); // Feed demo de base
    setFormIsActive(true);
    setIsDialogOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditDialog = (camera: CameraItem) => {
    setEditingCamera(camera);
    setFormName(camera.name);
    setFormLat(camera.latitude.toString());
    setFormLng(camera.longitude.toString());
    setFormAddress(camera.address || '');
    setFormFeedUrl(camera.feed_url || '');
    setFormIsActive(camera.is_active !== false);
    setIsDialogOpen(true);
  };

  // Guardar Formulario (Crear/Editar)
  const handleSaveCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLat || !formLng) {
      toast.error('Por favor, complete los campos obligatorios');
      return;
    }

    setIsSaving(true);
    const cameraPayload = {
      name: formName,
      latitude: parseFloat(formLat),
      longitude: parseFloat(formLng),
      address: formAddress,
      feed_url: formFeedUrl,
      municipality_id: selectedMuniId,
      is_active: formIsActive
    };

    try {
      let response;
      if (editingCamera) {
        // Editar
        response = await fetch(`${API_URL}/api/cameras/${editingCamera.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': profile?.user_id || ''
          },
          body: JSON.stringify(cameraPayload)
        });
      } else {
        // Crear
        response = await fetch(`${API_URL}/api/cameras`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': profile?.user_id || ''
          },
          body: JSON.stringify(cameraPayload)
        });
      }

      if (response.ok) {
        toast.success(editingCamera ? 'Cámara actualizada correctamente' : 'Nueva cámara de seguridad registrada');
        setIsDialogOpen(false);
        fetchCameras();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar Cámara
  const handleDeleteCamera = async (cameraId: string, name: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar la cámara "${name}" de forma permanente?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/cameras/${cameraId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': profile?.user_id || ''
        }
      });

      if (response.ok) {
        toast.success('Cámara de seguridad eliminada');
        fetchCameras();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (err) {
      toast.error('No se pudo eliminar la cámara');
    }
  };

  // Geolocalizar en el Mapa (Centrar mapa en la cámara)
  const handleGeolocateCamera = (camera: CameraItem) => {
    setMapCenter([camera.latitude, camera.longitude]);
    setMapZoom(17); // Zoom dinámico de primer plano para la cámara
    toast.info(`Centrando mapa en: ${camera.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Selector Municipal y Acciones Rápidas */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-900/5 px-4 py-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Settings2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-sm text-slate-800 m-0">Jurisdicción de Cámaras</h3>
            <p className="text-[11px] text-slate-500 m-0">Seleccione el municipio para ver o calibrar los feeds de video</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {isSuperadmin ? (
            <Select value={selectedMuniId} onValueChange={setSelectedMuniId}>
              <SelectTrigger className="w-[200px] h-9 bg-white shadow-sm">
                <SelectValue placeholder="Seleccione municipio" />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="secondary" className="px-3 py-1.5 font-bold bg-white text-indigo-700 border border-slate-200">
              {municipalities.find(m => m.id === selectedMuniId)?.name || 'Municipio Local'}
            </Badge>
          )}

          <Button 
            onClick={() => handleOpenAddDialog()}
            size="sm"
            className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar Cámara
          </Button>

          <Button 
            onClick={fetchCameras}
            variant="outline"
            size="icon"
            className="w-9 h-9 bg-white"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Grid del Mapa y Listado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Lado Izquierdo: Mapa de Calibración Interactivo */}
        <Card className="lg:col-span-7 flex flex-col min-h-[500px]">
          <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Mapa de Calibración
              </CardTitle>
              <CardDescription className="text-[11px]">
                {isClickToAddMode ? 'HAGA CLICK EN EL MAPA PARA REGISTRAR LA CÁMARA' : 'Gestiona y arrastra puntos geográficos para calibrar las cámaras'}
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isClickToAddMode ? "destructive" : "outline"}
                size="sm"
                className="h-8 text-[11px] font-bold"
                onClick={() => {
                  setIsClickToAddMode(!isClickToAddMode);
                  if (isEditingMap) setIsEditingMap(false);
                }}
              >
                {isClickToAddMode ? 'CANCELAR CAPTURA' : 'UBICAR POR MAPA'}
              </Button>

              <Button
                variant={isEditingMap ? "destructive" : "secondary"}
                size="sm"
                className="h-8 text-[11px] font-bold"
                onClick={() => {
                  setIsEditingMap(!isEditingMap);
                  if (isClickToAddMode) setIsClickToAddMode(false);
                }}
              >
                {isEditingMap ? (
                  <><Lock className="w-3.5 h-3.5 mr-1" /> BLOQUEAR ARRASTRE</>
                ) : (
                  <><Unlock className="w-3.5 h-3.5 mr-1" /> MOVER PINES</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative min-h-[400px]">
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              className="absolute inset-0 w-full h-full z-0"
              doubleClickZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {cameras.map(camera => {
                const lat = Number(camera.latitude);
                const lng = Number(camera.longitude);
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <Marker
                    key={camera.id}
                    position={[lat, lng]}
                    icon={isEditingMap ? cameraEditIcon : cameraIcon}
                    draggable={isEditingMap}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const pos = marker.getLatLng();
                        handleCameraDragEnd(camera.id, pos.lat, pos.lng);
                      }
                    }}
                  >
                    <Popup>
                      <div className="p-1 max-w-[180px]">
                        <h4 className="font-bold text-xs text-slate-800 m-0 mb-1">{camera.name}</h4>
                        <p className="text-[10px] text-slate-500 m-0 leading-tight mb-2">{camera.address || 'Sin dirección registrada'}</p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleOpenEditDialog(camera)}
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-[9px] px-2 py-0"
                          >
                            <Edit className="w-3 h-3 mr-1" /> Editar
                          </Button>
                          {camera.feed_url && (
                            <a 
                              href={camera.feed_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center justify-center h-7 text-[9px] px-2 py-0 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 font-bold"
                            >
                              <Video className="w-3 h-3 mr-1" /> Stream
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <MapController center={mapCenter} zoom={mapZoom} />
              <MapClickEvents 
                enabled={isClickToAddMode} 
                onMapClick={(lat, lng) => {
                  setIsClickToAddMode(false);
                  handleOpenAddDialog(lat, lng);
                }} 
              />
            </MapContainer>

            {isClickToAddMode && (
              <div className="absolute top-4 left-4 z-[1000] bg-amber-50 text-amber-800 text-xs px-3 py-2 rounded-lg border border-amber-300 shadow-md font-medium animate-pulse">
                📌 Haga click en el mapa en la ubicación de la cámara para registrarla.
              </div>
            )}

            {isEditingMap && (
              <div className="absolute top-4 left-4 z-[1000] bg-orange-50 text-orange-800 text-xs px-3 py-2 rounded-lg border border-orange-300 shadow-md font-medium">
                🔥 Calibración activa: arrastre los pines naranjas a sus coordenadas reales.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lado Derecho: Listado de Cámaras */}
        <Card className="lg:col-span-5 flex flex-col min-h-[500px]">
          <CardHeader className="py-4 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-500" />
                  Red de Monitoreo
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Total de {filteredCameras.length} cámaras configuradas en este sector
                </CardDescription>
              </div>
            </div>
            <div className="mt-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Buscar por calle o nombre..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[460px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-300" />
                <p className="text-xs text-slate-400 font-medium">Cargando feeds de video...</p>
              </div>
            ) : filteredCameras.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Camera className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold">No se encontraron cámaras</p>
                <p className="text-xs text-slate-400">Cree un punto o cambie los términos de búsqueda</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-semibold text-[11px] text-slate-500 py-2">Identificador</TableHead>
                    <TableHead className="font-semibold text-[11px] text-slate-500 py-2">Estado</TableHead>
                    <TableHead className="font-semibold text-[11px] text-slate-500 py-2 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCameras.map(camera => (
                    <TableRow key={camera.id} className="hover:bg-slate-50/50">
                      <TableCell className="py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-xs text-slate-700 line-clamp-1">{camera.name}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{camera.address || 'Sin dirección'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        {camera.is_active !== false ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 text-[9px] px-1.5 py-0">Activo</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-500">Inactiva</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            onClick={() => handleGeolocateCamera(camera)}
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 hover:bg-slate-100 rounded text-slate-500"
                            title="Centrar en el Mapa"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleOpenEditDialog(camera)}
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 hover:bg-slate-100 rounded text-indigo-600"
                            title="Editar Parámetros"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCamera(camera.id, camera.name)}
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 hover:bg-rose-50 rounded text-rose-500"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal / Dialog para Agregar/Editar Cámara */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl border border-slate-200">
          <form onSubmit={handleSaveCamera}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Camera className="w-5 h-5 text-indigo-600" />
                {editingCamera ? 'Editar Cámara de Seguridad' : 'Registrar Nueva Cámara'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Ingrese las coordenadas y credenciales del feed de transmisión segura para la red municipal.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Nombre de la Cámara */}
              <div className="space-y-1">
                <Label htmlFor="cam-name" className="text-xs font-bold text-slate-700">Nombre de la Cámara <span className="text-rose-500">*</span></Label>
                <Input
                  id="cam-name"
                  placeholder="ej. Cámara Calle Kircher & San Martín"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                />
              </div>

              {/* Coordenadas Geográficas (Latitud y Longitud) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cam-lat" className="text-xs font-bold text-slate-700">Latitud <span className="text-rose-500">*</span></Label>
                  <Input
                    id="cam-lat"
                    type="number"
                    step="any"
                    placeholder="-51.6226"
                    value={formLat}
                    onChange={e => setFormLat(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cam-lng" className="text-xs font-bold text-slate-700">Longitud <span className="text-rose-500">*</span></Label>
                  <Input
                    id="cam-lng"
                    type="number"
                    step="any"
                    placeholder="-69.2181"
                    value={formLng}
                    onChange={e => setFormLng(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-1">
                <Label htmlFor="cam-addr" className="text-xs font-bold text-slate-700">Dirección Descriptiva</Label>
                <Input
                  id="cam-addr"
                  placeholder="ej. Av. San Martín 1500"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                />
              </div>

              {/* URL del Stream de Video */}
              <div className="space-y-1">
                <Label htmlFor="cam-feed" className="text-xs font-bold text-slate-700">URL del Feed de Video (RTSP/Web/HLS)</Label>
                <Input
                  id="cam-feed"
                  placeholder="rtsp://usuario:clave@host:puerto o URL demo (.mp4)"
                  value={formFeedUrl}
                  onChange={e => setFormFeedUrl(e.target.value)}
                />
                <p className="text-[10px] text-slate-400">
                  Deje el valor por defecto para utilizar el reproductor de video de alta definición simulado.
                </p>
              </div>

              {/* Estado Activo / Inactivo */}
              <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 mt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Habilitar Transmisión</span>
                  <span className="text-[10px] text-slate-400">Determina si la cámara se muestra en el mapa activo del operador</span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  checked={formIsActive}
                  onChange={e => setFormIsActive(e.target.checked)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" className="h-9">
                  Cancelar
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                size="sm" 
                className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  'Guardar Cámara'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
