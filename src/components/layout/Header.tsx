import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, ChevronDown, User, LogOut, Settings, Volume2, VolumeX, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { apiService } from '@/services/apiService';
import type { Municipality } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useAudioSettings } from '@/hooks/useAudioSettings';
import { useMunicipality } from '@/context/MunicipalityContext';

// Audio Control Component

// Audio Control Component
function AudioControl() {
  const { settings, toggleMute, setVolume, playAlertSound } = useAudioSettings();

  const handleTestSound = () => {
    playAlertSound('alta');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-900 hover:bg-slate-100 relative"
          title={settings.muted ? 'Sonido desactivado' : 'Sonido activado'}
        >
          {settings.muted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
          {settings.muted && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-alert-critical rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Alertas Sonoras</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-8 px-2"
            >
              {settings.muted ? (
                <>
                  <VolumeX className="w-4 h-4 mr-1" />
                  Silenciado
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-1" />
                  Activo
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Volumen</span>
              <span>{Math.round(settings.volume * 100)}%</span>
            </div>
            <Slider
              value={[settings.volume * 100]}
              onValueChange={(value) => setVolume(value[0] / 100)}
              max={100}
              step={5}
              disabled={settings.muted}
              className="w-full"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTestSound}
            disabled={settings.muted}
            className="w-full"
          >
            Probar Sonido
          </Button>

          <p className="text-xs text-muted-foreground">
            Las alertas críticas y altas reproducirán un sonido de notificación.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface HeaderProps {
  selectedMunicipality: Municipality | null;
  onMunicipalityChange: (municipality: Municipality) => void;
}

// Lista completa de provincias de Argentina
const PROVINCIAS_ARGENTINA = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
  "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

export function Header({ selectedMunicipality, onMunicipalityChange }: HeaderProps) {
  const { profile, role, signOut } = useAuth();
  const { municipalities } = useMunicipality();
  const [alertsCount, setAlertsCount] = useState({ active: 0, pending: 0, total: 0 });
  const [selectedProvince, setSelectedProvince] = useState<string>("Santa Cruz");

  useEffect(() => {
    const loadCounts = async () => {
      const countsRes = await apiService.getActiveAlertsCount();
      if (countsRes.success) setAlertsCount(countsRes.data);
    };

    loadCounts();
    
    if (selectedMunicipality) {
      setSelectedProvince(selectedMunicipality.province || "Santa Cruz");
    }

    const interval = setInterval(loadCounts, 30000);
    return () => clearInterval(interval);
  }, [selectedMunicipality]);

  const getRoleLabel = (userRole: string | null) => {
    const labels: Record<string, string> = {
      operador: 'Operador',
      supervisor: 'Supervisor',
      auditor: 'Auditor',
    };
    return userRole ? labels[userRole] || userRole : 'Sin rol';
  };

  const getRoleBadgeVariant = (userRole: string | null) => {
    const variants: Record<string, string> = {
      operador: 'secondary',
      supervisor: 'default',
      auditor: 'outline',
    };
    return userRole ? variants[userRole] || 'secondary' : 'secondary';
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Filtrar municipios por la provincia seleccionada
  const filteredMunicipalities = municipalities.filter(
    (m) => m.province === selectedProvince
  );

  return (
    <header className="h-16 bg-white text-slate-900 border-b border-slate-200 shadow-sm flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {/* Sidebar Trigger */}
        <SidebarTrigger className="text-slate-500 hover:text-slate-900 transition-colors mr-2" />
        
        {/* Selector de Provincia */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-700 font-medium gap-2 h-9 px-3"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">{selectedProvince}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 max-h-[70vh] overflow-y-auto">
            {PROVINCIAS_ARGENTINA.map((prov) => (
              <DropdownMenuItem
                key={prov}
                onClick={() => setSelectedProvince(prov)}
                className={selectedProvince === prov ? 'bg-primary/5 text-primary font-medium' : ''}
              >
                {prov}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Selector de Municipio (Tenant) - Filtrado por Provincia */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-slate-900 hover:bg-slate-100 gap-2 font-bold h-9"
              disabled={filteredMunicipalities.length === 0}
            >
              {filteredMunicipalities.length > 0
                ? (selectedMunicipality?.province === selectedProvince ? selectedMunicipality.name : 'Seleccionar Ciudad')
                : 'Sin Tenants'}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {filteredMunicipalities.map((mun) => (
              <DropdownMenuItem
                key={mun.id}
                onClick={() => onMunicipalityChange(mun)}
                className={`flex items-center justify-between gap-4 ${selectedMunicipality?.id === mun.id ? 'bg-primary/5 text-primary' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{mun.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{mun.code}</p>
                </div>
                {(mun as any).activeAlerts > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">{(mun as any).activeAlerts}</span>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4">
        {/* Audio Settings */}
        <AudioControl />

        {/* Alert Notifications */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-slate-900 hover:bg-slate-100"
          >
            <Bell className="w-5 h-5" />
            {alertsCount.active > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-alert-critical text-alert-critical-foreground text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                {alertsCount.active}
              </span>
            )}
          </Button>
          
          <div className="text-xs text-slate-500 hidden md:block">
            <span className="text-alert-critical font-medium">{alertsCount.active}</span> activas · 
            <span className="text-alert-high font-medium ml-1">{alertsCount.pending}</span> en atención
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* User Menu */}
        {profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-slate-900 hover:bg-slate-100 gap-2 h-12"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 bg-white p-1">
                  {selectedMunicipality?.logo_url ? (
                    <img
                      src={selectedMunicipality.logo_url}
                      className="w-full h-full object-contain"
                      alt="muni-logo"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = ''; // Fallback a icono si la URL falla
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                  {!selectedMunicipality?.logo_url && <User className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold leading-tight">
                    {profile.nombre && profile.apellido
                      ? `${profile.nombre} ${profile.apellido}`
                      : profile.username || 'Usuario'}
                  </p>
                  <Badge 
                    variant={getRoleBadgeVariant(role) as 'default' | 'secondary' | 'destructive' | 'outline'}
                    className="text-[9px] px-1.5 py-0 uppercase tracking-tighter h-4"
                  >
                    {getRoleLabel(role)}
                  </Badge>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile.email || `@${profile.username}`}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedMunicipality?.name || 'Sin municipio'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
