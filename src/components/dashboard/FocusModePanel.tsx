import React from 'react';
import { X, ShieldAlert, Camera, Phone, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const _citizenName = citizenName; // Use the prop
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/10">
        
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
            <Badge variant="destructive" className="px-3 py-1 text-sm bg-rose-600">MODO FOCO ACTIVO</Badge>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-50">
          {/* Left: Map */}
          <div className="flex-1 p-4 lg:pr-2 min-h-[300px]">
            <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
              <IncidentMap 
                alerts={[alert]}
                selectedAlertId={alert.id}
                cameras={cameras}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="w-full lg:w-96 flex flex-col p-4 lg:pl-2 min-h-0">
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6 overflow-y-auto">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Ubicación
                </h3>
                <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {alert?.address || 'Buscando ubicación...'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-500" /> Cámaras Cercanas
                </h3>
                <div className="space-y-2">
                  {cameras?.length > 0 ? cameras.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-sm font-medium text-slate-700">{c.code}</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs bg-white">Ver Feed</Button>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500 italic">No hay cámaras en el radio.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" /> Protocolo
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-slate-600 hover:text-slate-900 border-slate-200 bg-white">
                    <Phone className="w-4 h-4 mr-2" /> Llamar al Ciudadano
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-slate-600 hover:text-slate-900 border-slate-200 bg-white">
                    <ShieldAlert className="w-4 h-4 mr-2" /> Despachar Móvil Policial
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={() => { onResolve(); onClose(); }} className="w-full h-14 text-base font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 mr-2" />
                MARCAR COMO RESUELTA
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
