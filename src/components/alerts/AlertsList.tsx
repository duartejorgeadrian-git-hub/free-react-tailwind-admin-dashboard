import React from 'react';

export const AlertsList = ({ alerts, onAlertSelect }: any) => (
  <div className="divide-y">
    {alerts.length === 0 ? (
      <p className="p-4 text-center text-muted-foreground">No hay alertas activas</p>
    ) : (
      alerts.map((a: any) => (
        <button 
          key={a.id} 
          onClick={() => onAlertSelect(a)} 
          className="w-full p-4 text-left hover:bg-slate-50 transition-colors border-b last:border-0"
        >
          <div className="font-bold text-sm uppercase">{a.type}</div>
          <div className="text-xs text-muted-foreground">{a.address}</div>
        </button>
      ))
    )}
  </div>
);
