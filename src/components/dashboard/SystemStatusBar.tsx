import React from 'react';
import { Activity, Clock, ShieldCheck, Siren } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SystemStatusBarProps {
  stats: { activas: number; criticas: number };
  operatorStats: { online: number; active: number };
  resolvedToday: number;
  avgResponseTime: string;
  isConnected: boolean;
}

export const SystemStatusBar = ({
  stats,
  operatorStats: _operatorStats,
  resolvedToday,
  avgResponseTime,
  isConnected
}: SystemStatusBarProps) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-3 px-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            )}
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            {isConnected ? 'SISTEMA ONLINE' : 'DESCONECTADO'}
          </span>
        </div>
        
        <div className="h-4 w-px bg-slate-700 hidden sm:block" />
        
        <div className="flex items-center gap-3">
          {stats.criticas > 0 && (
            <Badge variant="destructive" className="animate-pulse flex items-center gap-1.5 px-2.5 py-0.5">
              <Siren className="w-3.5 h-3.5" />
              {stats.criticas} CRÍTICAS
            </Badge>
          )}
          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 flex items-center gap-1.5 px-2.5 py-0.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            {stats.activas} Activas
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2 hidden md:flex">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{resolvedToday} resueltas hoy</span>
        </div>
        <div className="h-4 w-px bg-slate-700 hidden md:block" />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>TRP: {avgResponseTime}</span>
        </div>
      </div>
    </div>
  );
};
