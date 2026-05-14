import React from 'react';
import { MapPin, Clock, Camera, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedAlertCardProps {
  alert: any;
  citizenName: string;
  nearestCamera?: { code: string; distance: number };
  isSelected: boolean;
  onSelect: () => void;
  onTake: () => void;
  onResolve: () => void;
  onViewMap: () => void;
}

export const EnhancedAlertCard = ({
  alert,
  citizenName: _citizenName,
  nearestCamera,
  isSelected,
  onSelect,
  onTake,
  onResolve,
  onViewMap
}: EnhancedAlertCardProps) => {
  const isCritical = alert.severity === 'critica';
  const isAttended = alert.status === 'en_atencion';

  return (
    <div 
      onClick={onSelect}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden group",
        isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm hover:border-slate-300",
        isCritical ? (isSelected ? "bg-rose-50 border-rose-200" : "bg-white border-rose-200") : "bg-white border-slate-200"
      )}
    >
      {/* Accent border left */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5",
        isCritical ? "bg-rose-500" : (alert.severity === 'alta' ? "bg-amber-500" : "bg-blue-500")
      )} />

      <div className="flex justify-between items-start mb-2 pl-2">
        <div className="flex items-center gap-2">
          {isCritical && <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />}
          <h3 className="font-bold text-slate-800 uppercase tracking-tight text-sm">
            {alert.type}
          </h3>
        </div>
        <Badge variant={isCritical ? 'destructive' : 'outline'} className={cn("text-[10px] uppercase font-bold", !isCritical && "text-slate-500")}>
          {alert.severity}
        </Badge>
      </div>

      <div className="space-y-1.5 pl-2 mb-4">
        <div className="flex items-start gap-2 text-slate-600 text-xs">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
          <span className="line-clamp-2 leading-tight">{alert.address || 'Ubicación no especificada'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{new Date(alert.createdAt).toLocaleTimeString('es-AR')}</span>
        </div>
        {nearestCamera && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
            <Camera className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Cam: {nearestCamera.code} a {Math.round(nearestCamera.distance)}m</span>
          </div>
        )}
      </div>

      <div className="pl-2 pt-3 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" className="h-8 text-xs font-medium text-slate-600 hover:text-primary" onClick={(e) => { e.stopPropagation(); onViewMap(); }}>
          Ver Mapa
        </Button>
        {isAttended ? (
          <Button size="sm" className="h-8 text-xs font-medium bg-emerald-500 hover:bg-emerald-600" onClick={(e) => { e.stopPropagation(); onResolve(); }}>
            Resolver
          </Button>
        ) : (
          <Button size="sm" className="h-8 text-xs font-medium" onClick={(e) => { e.stopPropagation(); onTake(); }}>
            Tomar Caso <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};
