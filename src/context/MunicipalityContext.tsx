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
      const res = await apiService.getMunicipalities();
      if (res.success && res.data.length > 0) {
        setMunicipalities(res.data);
        // Intentar recuperar del localStorage o usar el primero
        const savedId = localStorage.getItem('selectedMunicipalityId');
        const saved = res.data.find((m: Municipality) => m.id === savedId);
        setSelectedMunicipality(saved || res.data[0]);
      }
      setLoading(false);
    };
    loadMunicipalities();
  }, []);

  useEffect(() => {
    if (selectedMunicipality) {
      localStorage.setItem('selectedMunicipalityId', selectedMunicipality.id);
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
