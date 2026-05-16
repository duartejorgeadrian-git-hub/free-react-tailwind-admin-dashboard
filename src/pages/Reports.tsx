import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Download, AlertTriangle, CheckCircle2, Clock, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useMunicipality } from '@/context/MunicipalityContext';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export default function Reports() {
  const { hasPermission } = useAuth();
  const { selectedMunicipality } = useMunicipality();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'all'>('all');
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [selectedMunicipality?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const municipalityParam = selectedMunicipality?.id ? `?municipalityId=${selectedMunicipality.id}` : '';
      const response = await fetch(`${API_URL}/api/alerts${municipalityParam}`);
      const data = await response.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: alerts.length,
    activas: alerts.filter(a => a.status === 'activa').length,
    en_atencion: alerts.filter(a => a.status === 'en_atencion').length,
    resueltas: alerts.filter(a => a.status === 'resuelta').length,
    criticas: alerts.filter(a => a.severity === 'critica').length,
  };

  const byType = alerts.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySeverity = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!hasPermission('view_audit')) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">No tiene permisos para ver reportes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxType = Math.max(...Object.values(byType), 1);
  const maxSev = Math.max(...Object.values(bySeverity), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Reportes y Estadísticas
          </h1>
          <p className="text-muted-foreground">Análisis en tiempo real del municipio seleccionado</p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="outline">
           <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Total</p>
                <p className="text-3xl font-black">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="bg-rose-50 border-rose-100">
              <CardContent className="p-4">
                <p className="text-xs text-rose-600 mb-1 uppercase font-bold">Activas</p>
                <p className="text-3xl font-black text-rose-700">{stats.activas}</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-100">
              <CardContent className="p-4">
                <p className="text-xs text-amber-600 mb-1 uppercase font-bold">En atención</p>
                <p className="text-3xl font-black text-amber-700">{stats.en_atencion}</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-4">
                <p className="text-xs text-emerald-600 mb-1 uppercase font-bold">Resueltas</p>
                <p className="text-3xl font-black text-emerald-700">{stats.resueltas}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <p className="text-xs text-blue-600 mb-1 uppercase font-bold">Críticas</p>
                <p className="text-3xl font-black text-blue-700">{stats.criticas}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Distribución por Tipo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(byType).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase"><span>{type}</span><span>{count}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600" style={{ width: `${(count / maxType) * 100}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Nivel de Severidad</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(bySeverity).map(([sev, count]) => (
                  <div key={sev}>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase"><span>{sev}</span><span>{count}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${sev === 'critica' ? 'bg-rose-600' : 'bg-indigo-400'}`} style={{ width: `${(count / maxSev) * 100}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
  )
}
