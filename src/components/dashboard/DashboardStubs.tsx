import React from 'react';

export const SystemStatusBar = () => <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold">ESTADO DEL SISTEMA: ONLINE · 4 ALERTAS CRÍTICAS</div>;

export const EnhancedAlertCard = ({ alert, onSelect, isSelected }: any) => (
  <div 
    onClick={onSelect}
    className={`p-4 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-200'}`}
  >
    <p className="font-bold text-sm uppercase">{alert.type}</p>
    <p className="text-xs text-slate-500">{alert.address}</p>
  </div>
);

export const EnhancedOperatorsPanel = () => <div className="p-4 border rounded-xl">OPERADORES ACTIVOS: 2</div>;

export const FocusModePanel = ({ onClose }: any) => (
  <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
    <div className="bg-white p-8 rounded-2xl w-full max-w-4xl h-[80vh] relative">
      <button onClick={onClose} className="absolute top-4 right-4 font-bold">X</button>
      <h2 className="text-2xl font-bold mb-4">MODO FOCO</h2>
      <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
        <p className="text-slate-400">Streaming de cámara en vivo...</p>
      </div>
    </div>
  </div>
);

export const IncidentMap = () => <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center">MAPA INTERACTIVO (LEAFLET)</div>;
