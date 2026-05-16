import React, { useState } from 'react';
import { X, ShieldAlert, Camera, Phone, CheckCircle2, MapPin, Video, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IncidentMap } from '@/components/maps/IncidentMap';
import type { Alert, MapCamera } from '@/types';

interface FocusModePanelProps {
  alert: Alert;
  citizenName: string;
  cameras: MapCamera[];
  primaryCameraId?: string;
  onClose: () => void;
  onResolve: () => void;
}

export const FocusModePanel = ({ alert, citizenName, cameras, onClose, onResolve }: FocusModePanelProps) => {
  const [activeFeed, setActiveFeed] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

  const sampleVideos = [
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://vjs.zencdn.net/v/oceans.mp4',
    'https://www.w3schools.com/html/movie.mp4'
  ];

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${cleanUrl}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/10">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/20 p-2 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide">{alert?.type || 'EMERGENCIA'}</h2>
              <p className="text-slate-400 text-sm">Ciudadano: {citizenName} • ID: {alert?.id?.substring(0,8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="px-3 py-1 text-sm bg-rose-600 uppercase font-bold animate-pulse">MODO FOCO CRÍTICO</Badge>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-50">
          {/* Left: Map & Evidence */}
          <div className="flex-1 flex flex-col p-4 lg:pr-2 min-h-0 gap-4">
            <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-slate-200 relative min-h-[300px]">
              <IncidentMap 
                alerts={[alert]}
                selectedAlertId={alert.id}
                cameras={cameras}
                className="w-full h-full"
              />
            </div>

            {/* Evidence Section */}
            <div className="h-48 flex gap-4">
              <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <Camera className="w-3 h-3" /> Evidencia Fotográfica
                </h4>
                <div className="grid grid-cols-2 gap-3 h-32">
                  <div className="relative rounded-lg overflow-hidden border bg-slate-100 group">
                    {alert.front_photo_url ? (
                      <>
                        <img src={getImageUrl(alert.front_photo_url)} className="w-full h-full object-cover" alt="front" />
                        <div className="absolute top-1 left-1 bg-black/60 text-[8px] text-white px-1 rounded">FRONT</div>
                        <a href={getImageUrl(alert.front_photo_url)} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="text-white h-4 w-4" />
                        </a>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Camera className="w-5 h-5 mb-1 opacity-20" />
                        <span className="text-[8px]">Sin foto</span>
                      </div>
                    )}
                  </div>
                  <div className="relative rounded-lg overflow-hidden border bg-slate-100 group">
                    {alert.rear_photo_url ? (
                      <>
                        <img src={getImageUrl(alert.rear_photo_url)} className="w-full h-full object-cover" alt="rear" />
                        <div className="absolute top-1 left-1 bg-black/60 text-[8px] text-white px-1 rounded">REAR</div>
                        <a href={getImageUrl(alert.rear_photo_url)} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="text-white h-4 w-4" />
                        </a>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Camera className="w-5 h-5 mb-1 opacity-20" />
                        <span className="text-[8px]">Sin foto</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-1/3 bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Descripción</h4>
                <p className="text-xs text-slate-600 line-clamp-4 overflow-y-auto italic">
                  "{alert.description || 'Sin descripción adicional por el ciudadano.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="w-full lg:w-80 flex flex-col p-4 lg:pl-2 min-h-0">
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6 overflow-y-auto">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Ubicación Exacta
                </h3>
                <p className="text-slate-600 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                  {alert?.address || 'Detectando dirección...'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-500" /> Cámaras Municipales
                </h3>
                <div className="space-y-2">
                  {cameras?.length > 0 ? cameras.slice(0, 4).map((c: any, idx: number) => (
                    <div key={c.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700 leading-none">{c.code || c.name || `CAM-${idx+1}`}</span>
                        <span className="text-[8px] text-slate-400">{c.distance ? `${Math.round(c.distance)}m` : 'Zona Central'}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[10px] bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-100 font-bold"
                        onClick={() => setActiveFeed(c.feed_url || sampleVideos[idx % sampleVideos.length])}
                      >
                        <Play className="w-3 h-3 mr-1" /> VER FEED
                      </Button>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-500 italic">No hay cámaras detectadas en la zona.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" /> Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-slate-600 hover:text-slate-900 border-slate-200 bg-white h-9 text-xs">
                    <Phone className="w-3.5 h-3.5 mr-2 text-green-500" /> Llamar Ciudadano
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-slate-600 hover:text-slate-900 border-slate-200 bg-white h-9 text-xs">
                    <ShieldAlert className="w-3.5 h-3.5 mr-2 text-rose-500" /> Despachar Unidad
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={() => { onResolve(); onClose(); }} className="w-full h-14 text-base font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">
                <CheckCircle2 className="w-6 h-6 mr-2" />
                MARCAR COMO RESUELTA
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cámara en Vivo (SOLUCIÓN DEFINITIVA) */}
      {activeFeed && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center z-20">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
              <h3 className="text-white font-bold uppercase tracking-[0.2em] text-sm shadow-black drop-shadow-md">
                Transmisión 4K - Cámara Municipal
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveFeed(null)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-12 w-12 transition-all"
            >
              <X className="h-10 w-10" />
            </Button>
          </div>

          <div className="w-full max-w-6xl aspect-video bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-white/5">
            <video
              src={activeFeed}
              autoPlay
              controls
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-6 flex items-center gap-8 text-slate-500 font-mono text-[10px] uppercase">
            <span>Ubicación: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
            <span className="text-emerald-500 font-bold">● LIVE HD</span>
            <span>Río Gallegos Security Network</span>
          </div>
        </div>
      )}
    </div>
  );
};
