import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import type { Municipality } from '@/types';

interface MunicipalityContextType {
  selectedMunicipality: Municipality | null;
  setSelectedMunicipality: (municipality: Municipality | null) => void;
  municipalities: Municipality[];
  loading: boolean;
}

const MunicipalityContext = createContext<MunicipalityContextType | undefined>(undefined);

export const MunicipalityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMunicipalities = async () => {
      setLoading(true);
      try {
        const res = await apiService.getMunicipalities();
        if (res && res.success && Array.isArray(res.data)) {
          setMunicipalities(res.data);

          const savedId = localStorage.getItem('selectedMunicipalityId');
          const currentMuni = res.data.find((m: Municipality) => m.id === savedId);

          // LÓGICA DE AUTOLIMPIEZA: Si el ID guardado no existe en la DB actual, resetear al primero válido
          if (!currentMuni && res.data.length > 0) {
            console.log('🔄 Detectada desincronización de ID. Auto-reparando...');
            setSelectedMunicipality(res.data[0]);
            localStorage.setItem('selectedMunicipalityId', res.data[0].id);
          } else {
            setSelectedMunicipality(currentMuni || res.data[0] || null);
          }
        }
      } catch (error) {
        console.error('Error sincronizando municipios:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMunicipalities();
  }, []);

  useEffect(() => {
    if (selectedMunicipality) {
      localStorage.setItem('selectedMunicipalityId', selectedMunicipality.id);

      // Aplicar color primario dinámico a todo el sistema (Variable CSS)
      const color = selectedMunicipality.primary_color || '#1e40af';
      document.documentElement.style.setProperty('--primary', color);

      // También podemos aplicar una versión clara para fondos si fuera necesario
      // document.documentElement.style.setProperty('--primary-light', `${color}20`);
    }
  }, [selectedMunicipality]);

  return (
    <MunicipalityContext.Provider value={{ selectedMunicipality, setSelectedMunicipality, municipalities, loading }}>
      {children}
    </MunicipalityContext.Provider>
  );
};

export const useMunicipality = () => {
  const context = useContext(MunicipalityContext);
  if (context === undefined) {
    throw new Error('useMunicipality must be used within a MunicipalityProvider');
  }
  return context;
};
