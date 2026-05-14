import { useState } from 'react';
import {
  X,
  Phone,
  Shield,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Music,
  AlertTriangle,
  Navigation,
  Copy,
  Play,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AlertDetailPanelProps {
  alert: any;
  onAlertUpdated: (alert: any) => void;
}

export const AlertDetailPanel = ({ alert, onAlertUpdated }: AlertDetailPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [activeFeed, setActiveFeed] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

  // Videos de ejemplo para la simulación
  const sampleVideos = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  ];

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/alerts/${alert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Error al actualizar alerta');

      const updatedAlert = { ...alert, status: newStatus };

      // Para que desaparezca el detalle del panel principal:
      // - Si se marca como resuelta, cerramos el panel (selectedAlert = null).
      // - Evitamos enviar updatedAlert cuando resuelta para que el parent no re-renderice el detalle.
      if (newStatus === 'resuelta') {
        onAlertUpdated(null);
      } else {
        onAlertUpdated(updatedAlert);
      }

      toast.success(`Alerta marcada como ${newStatus}`);

      // Forzar refresco del listado:
      // el panel se cierra, pero el filtro depende del estado en `useRealtimeAlerts`.
      // Si el evento `alert_updated` no llega (o el backend no emite), la alerta quedará visible.
      window.dispatchEvent(new CustomEvent('alerts:refetch'));
    } catch (error) {
      toast.error('No se pudo actualizar el estado de la alerta');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Número copiado al portapapeles');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activa': return <Badge variant="destructive" className="animate-pulse">CRÍTICA</Badge>;
      case 'en_atencion': return <Badge className="bg-amber-500">EN PROCESO</Badge>;
      case 'resuelta': return <Badge className="bg-green-500">RESUELTA</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCall = () => {
    if (alert.telefono) {
      window.location.href = `tel:${alert.telefono}`;
    } else {
      toast.error('El ciudadano no tiene teléfono registrado');
    }
  };

  const handleWhatsApp = () => {
    if (!alert.telefono) {
      toast.error('El ciudadano no tiene teléfono registrado');
      return;
    }
    const cleanPhone = alert.telefono.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola ${alert.nombre}, soy el operador del Centro de Monitoreo de Río Gallegos. Recibimos su alerta de ${alert.type} y estamos procesando su caso.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const mediaFiles = alert.media_urls ? JSON.parse(alert.media_urls) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl border-none">
        <CardHeader className="border-b flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Gestión de Caso #{alert.id.slice(-4)}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(alert.status)}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {alert.address || 'Ubicación desconocida'}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onAlertUpdated(null)}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                <Shield className="h-4 w-4 text-primary" /> Protocolo de Actuación
              </h3>

              <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Ciudadano: {alert.nombre} {alert.apellido}</span>
                  <span className="text-xs text-muted-foreground">DNI: {alert.dni || 'No disponible'}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2 h-12" onClick={handleCall}>
                      <Phone className="h-4 w-4 text-green-600" />
                      Llamar
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 h-12" onClick={handleWhatsApp}>
                      <MessageSquare className="h-4 w-4 text-emerald-500" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => copyToClipboard(alert.telefono)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {alert.telefono && <p className="text-center text-xs font-mono text-muted-foreground">{alert.telefono}</p>}

                  <Button variant="outline" className="justify-start gap-2 h-12">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    Despachar Móvil Policial
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold flex items-center gap-2 border-b pb-2 mt-6">
                <Video className="h-4 w-4 text-primary" /> Cámaras Cercanas (SIM)
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[1, 2, 3].map((cam, idx) => (
                  <div key={cam} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm border hover:border-primary/50 transition-colors">
                    <span className="flex items-center gap-2"><Video className="h-4 w-4 text-muted-foreground" /> Cámara {cam} - Zona {idx + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                      onClick={() => setActiveFeed(sampleVideos[idx % sampleVideos.length])}
                    >
                      <Play className="h-3 w-3 mr-1" /> VER FEED
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                <ImageIcon className="h-4 w-4 text-primary" /> Evidencia Multimedia (SAMSUNG SOS)
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {alert.front_photo_url && (
                  <div className="relative aspect-square bg-black rounded-lg overflow-hidden border group">
                    <img src={`${API_URL}${alert.front_photo_url}`} className="w-full h-full object-cover" alt="frontal" />
                    <div className="absolute top-1 left-1 bg-black/60 text-[10px] text-white px-1 rounded">FRONTAL</div>
                    <a href={`${API_URL}${alert.front_photo_url}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="text-white h-6 w-6" />
                    </a>
                  </div>
                )}
                {alert.rear_photo_url && (
                  <div className="relative aspect-square bg-black rounded-lg overflow-hidden border group">
                    <img src={`${API_URL}${alert.rear_photo_url}`} className="w-full h-full object-cover" alt="trasera" />
                    <div className="absolute top-1 left-1 bg-black/60 text-[10px] text-white px-1 rounded">TRASERA</div>
                    <a href={`${API_URL}${alert.rear_photo_url}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="text-white h-6 w-6" />
                    </a>
                  </div>
                )}
                {alert.audio_url && (
                  <div className="col-span-2 p-3 bg-muted rounded-lg border">
                    <p className="text-xs font-medium mb-2 flex items-center gap-2">
                      <Music className="h-3 w-3" /> AUDIO DE EMERGENCIA (AMB)
                    </p>
                    <audio src={`${API_URL}${alert.audio_url}`} controls className="w-full h-8" />
                  </div>
                )}

                {(!alert.front_photo_url && !alert.rear_photo_url && !alert.audio_url) && (
                  <div className="col-span-2 py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No se adjuntó evidencia multimedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Modal de Cámara en Vivo */}
        <Dialog open={!!activeFeed} onOpenChange={() => setActiveFeed(null)}>
          <DialogContent className="max-w-3xl bg-black border-none p-0 overflow-hidden">
            <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
              <DialogTitle className="text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-red-500 animate-pulse" />
                TRANSMISIÓN EN VIVO - CÁMARA MUNICIPAL
              </DialogTitle>
            </DialogHeader>
            <video
              src={activeFeed || ''}
              autoPlay
              controls
              className="w-full aspect-video"
            />
            <div className="absolute bottom-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
              REC ● LIVE
            </div>
          </DialogContent>
        </Dialog>

        <div className="p-4 border-t bg-muted/20 flex gap-3">
          {alert.status !== 'resuelta' && (
            <>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg font-bold"
                onClick={() => handleUpdateStatus('resuelta')}
                disabled={loading}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> MARCAR COMO RESUELTA
              </Button>
              {alert.status === 'activa' && (
                <Button
                  variant="outline"
                  className="flex-1 h-12 font-semibold"
                  onClick={() => handleUpdateStatus('en_atencion')}
                  disabled={loading}
                >
                  <Clock className="mr-2 h-5 w-5" /> TOMAR CASO
                </Button>
              )}
            </>
          )}
          {alert.status === 'resuelta' && (
             <Button variant="secondary" className="flex-1 h-12" disabled>
                ESTE CASO YA FUE RESUELTO Y ARCHIVADO
             </Button>
          )}
        </div>
      </Card>
    </div>
  );
};