import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, ChevronDown, User, LogOut, Settings, Volume2, VolumeX } from 'lucide-react';
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

export function Header({ selectedMunicipality, onMunicipalityChange }: HeaderProps) {
  const { profile, role, signOut } = useAuth();
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [alertsCount, setAlertsCount] = useState({ active: 0, pending: 0, total: 0 });

  useEffect(() => {
    const loadData = async () => {
      const [munRes, countsRes] = await Promise.all([
        apiService.getMunicipalities(),
        apiService.getActiveAlertsCount(),
      ]);
      
      if (munRes.success) setMunicipalities(munRes.data);
      if (countsRes.success) setAlertsCount(countsRes.data);
    };
    
    loadData();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(async () => {
      const countsRes = await apiService.getActiveAlertsCount();
      if (countsRes.success) setAlertsCount(countsRes.data);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  return (
    <header className="h-16 bg-white text-slate-900 border-b border-slate-200 shadow-sm flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Sidebar Trigger for Mobile/Desktop Toggle */}
        <SidebarTrigger className="text-slate-500 hover:text-slate-900 transition-colors mr-2" />
        
        {/* Municipality Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-slate-900 hover:bg-slate-100 gap-2"
            >
              {selectedMunicipality?.name || 'Seleccionar Municipio'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {municipalities.map((mun) => (
              <DropdownMenuItem
                key={mun.id}
                onClick={() => onMunicipalityChange(mun)}
                className={selectedMunicipality?.id === mun.id ? 'bg-accent' : ''}
              >
                <div>
                  <p className="font-medium">{mun.name}</p>
                  <p className="text-xs text-muted-foreground">{mun.province}</p>
                </div>
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
                className="text-slate-900 hover:bg-slate-100 gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">
                    {profile.nombre} {profile.apellido}
                  </p>
                  <Badge 
                    variant={getRoleBadgeVariant(role) as 'default' | 'secondary' | 'destructive' | 'outline'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {getRoleLabel(role)}
                  </Badge>
                </div>
                <ChevronDown className="w-4 h-4" />
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
