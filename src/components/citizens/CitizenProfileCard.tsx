import React from 'react';

export const CitizenProfileCard = ({ citizen, profile }: any) => {
  if (!profile && !citizen) {
    return (
      <div className="p-6 border rounded-xl bg-white">
        <p className="text-gray-500">Selecciona un ciudadano para ver su perfil</p>
      </div>
    );
  }

  const citizenData = citizen || {};
  const profileData = profile || {};

  return (
    <div className="p-6 border rounded-xl bg-white space-y-4">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Perfil del Ciudadano</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre completo */}
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Nombre completo</span>
          <p className="font-medium text-gray-800">
            {profileData.nombre} {profileData.apellido}
          </p>
        </div>

        {/* DNI */}
        <div className="space-y-1">
          <span className="text-sm text-gray-500">DNI</span>
          <p className="font-medium text-gray-800">{citizenData.dni}</p>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Email</span>
          <p className="font-medium text-gray-800">
            {profileData.email || 'No registrado'}
          </p>
        </div>

        {/* Teléfono */}
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Teléfono</span>
          <p className="font-medium text-gray-800">
            {profileData.telefono || 'No registrado'}
          </p>
        </div>
      </div>

      {/* Estado y nivel */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-gray-500">Nivel ciudadano</span>
            <p className="font-medium text-blue-600">
              Nivel {citizenData.level || 1}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-gray-500">Puntos PCC</span>
            <p className="font-medium text-green-600">
              {citizenData.points || 0} pts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};