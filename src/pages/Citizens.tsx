import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Search,
  UserCheck,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { Skeleton } from '@/components/ui/skeleton';
import type { Citizen, CitizenProfile, CourseWithProgress } from '@/types';
import { CitizenProfileCard } from '@/components/citizens/CitizenProfileCard';
import { CitizenCoursesCard } from '@/components/citizens/CitizenCoursesCard';
import { useMunicipality } from '@/context/MunicipalityContext';

interface CitizenWithProfile {
  citizen: Citizen;
  profile: CitizenProfile | null;
  alertCount: number;
}

export default function Citizens() {
  const { hasPermission } = useAuth();
  const { activeMunicipality } = useMunicipality();
  const [citizens, setCitizens] = useState<CitizenWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenWithProfile | null>(null);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    fetchCitizens();
  }, [activeMunicipality]);

  useEffect(() => {
    if (selectedCitizen) {
      fetchCourses(selectedCitizen.citizen.id);
      fetchBadges(selectedCitizen.citizen.id);
    }
  }, [selectedCitizen]);

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;
      const municipalityParam = activeMunicipality ? `?municipalityId=${activeMunicipality.id}` : '';
      const response = await fetch(`${apiUrl}/api/citizens${municipalityParam}`);
      const data = await response.json();

      // La API local debería devolver los ciudadanos con sus perfiles unidos
      setCitizens(data);
    } catch (error) {
      console.error('Error fetching citizens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (citizenId: string) => {
    const res = await apiService.getCitizenCourses(citizenId);
    if (res.success) {
      setCourses(res.data as any);
    }
  };

  const fetchBadges = async (citizenId: string) => {
    const res = await apiService.getCitizenBadges(citizenId);
    if (res.success) {
      setBadges(res.data);
    }
  };

  // Filter citizens
  const filteredCitizens = citizens.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.citizen.dni.toLowerCase().includes(searchLower) ||
      item.profile?.nombre.toLowerCase().includes(searchLower) ||
      item.profile?.apellido.toLowerCase().includes(searchLower) ||
      item.profile?.email?.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const stats = {
    total: citizens.length,
    active: citizens.filter(c => c.citizen.isActive).length,
    highRisk: citizens.filter(c => c.profile?.riskLevel === 'alto').length,
  };

  const getRiskBadgeVariant = (level: string): 'destructive' | 'secondary' | 'outline' => {
    switch (level) {
      case 'alto': return 'destructive';
      case 'medio': return 'secondary';
      default: return 'outline';
    }
  };

  if (!hasPermission('view_citizen_profile')) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              No tiene permisos para ver perfiles de ciudadanos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Ciudadanos Registrados
          </h1>
          <p className="text-muted-foreground">
            Perfiles y capacitación de usuarios del sistema de alertas
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por DNI, nombre, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Registrados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.highRisk}</p>
              <p className="text-xs text-muted-foreground">Alto Riesgo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Citizens List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Lista de Ciudadanos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="space-y-2 p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredCitizens.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No se encontraron ciudadanos
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredCitizens.map((item) => (
                      <button
                        key={item.citizen.id}
                        onClick={() => setSelectedCitizen(item)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${
                          selectedCitizen?.citizen.id === item.citizen.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                        }`}
                      >
                        <Avatar>
                          <AvatarImage src={item.profile?.photoUrl || undefined} />
                          <AvatarFallback>
                            {item.profile 
                              ? `${item.profile.nombre[0]}${item.profile.apellido[0]}`
                              : 'NN'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.profile 
                              ? `${item.profile.nombre} ${item.profile.apellido}`
                              : 'Sin perfil'
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            DNI: {item.citizen.dni}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {item.profile && (
                            <Badge variant={getRiskBadgeVariant(item.profile.riskLevel)} className="text-xs">
                              {item.profile.riskLevel}
                            </Badge>
                          )}
                          {item.alertCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {item.alertCount} alertas
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Citizen Detail */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCitizen && selectedCitizen.profile ? (
            <>
              <CitizenProfileCard 
                citizen={selectedCitizen.citizen} 
                profile={selectedCitizen.profile as any} 
              />
              <CitizenCoursesCard courses={courses} badges={badges} />
            </>
          ) : (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Seleccione un ciudadano para ver su perfil completo</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
