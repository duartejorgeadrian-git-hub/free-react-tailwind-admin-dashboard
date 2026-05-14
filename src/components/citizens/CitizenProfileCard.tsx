import React from 'react';
import { Mail, Phone, Fingerprint, Award, ShieldCheck, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const CitizenProfileCard = ({ citizen, profile }: any) => {
  if (!profile && !citizen) return null;

  const citizenData = citizen || {};
  const profileData = profile || {};

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl">
      {/* Header con degradado estilo App */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        <div className="absolute -bottom-12 left-8">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src={profileData.photoUrl} />
            <AvatarFallback className="bg-slate-200 text-slate-600 text-2xl font-bold">
              {profileData.nombre?.[0]}{profileData.apellido?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute top-4 right-6">
          <Badge className="bg-white/20 text-white border-white/40 backdrop-blur-md">
            CIUDADANO ACTIVO
          </Badge>
        </div>
      </div>

      <div className="pt-16 pb-8 px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {profileData.nombre} {profileData.apellido}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-slate-500">
              <Fingerprint className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide">DNI: {citizenData.dni}</span>
            </div>
          </div>

          <div className="flex gap-3">
             <div className="text-center px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Nivel</p>
                <p className="text-xl font-black text-blue-700">{citizenData.level || 1}</p>
             </div>
             <div className="text-center px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Puntos</p>
                <p className="text-xl font-black text-emerald-700">{citizenData.points || 0}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Correo Electrónico</p>
              <p className="text-sm font-semibold text-slate-700">{profileData.email || 'Sin registrar'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Teléfono</p>
              <p className="text-sm font-semibold text-slate-700">{profileData.telefono || 'Sin registrar'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium italic">Perfil validado por RG Alerta</span>
          </div>
          <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4" />
             <span className="text-xs">Registrado en 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};
