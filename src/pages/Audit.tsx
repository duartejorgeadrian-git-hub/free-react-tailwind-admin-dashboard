import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield, Clock, Link2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export default function Audit() {
  const { hasPermission, user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAuditLog();
    }
  }, [user?.id]);

  const fetchAuditLog = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const headers: any = {
        'x-user-id': user.id
      };
      const response = await fetch(`${API_URL}/api/audit?_=${Date.now()}`, { headers });
      const data = await response.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar auditoría');
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('view_audit')) {
    return <div className="flex items-center justify-center h-[60vh]"><Card className="p-6 text-center"><Shield className="h-12 w-12 mx-auto mb-4 opacity-20" /><h2 className="text-lg font-bold">Acceso Restringido</h2></Card></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Registro de Auditoría</h1>
          <p className="text-muted-foreground">Trazabilidad completa de acciones del sistema</p>
        </div>
        <Button onClick={fetchAuditLog} disabled={loading} variant="outline"><RefreshCw className={`h-4 w-4 mr-2 ${loading?'animate-spin':''}`} /> Actualizar</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Registros</p><p className="text-2xl font-bold">{entries.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[10px] font-bold uppercase text-green-600 mb-1">Exitosos</p><p className="text-2xl font-bold text-green-700">{entries.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[10px] font-bold uppercase text-rose-600 mb-1">Fallidos</p><p className="text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[10px] font-bold uppercase text-amber-600 mb-1">Alertas</p><p className="text-2xl font-bold text-amber-700">{entries.filter(e => e.entityType === 'alert').length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5" /> Timeline Forense</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-40 w-full" /> : entries.length === 0 ? <p className="text-center py-12 text-muted-foreground italic">No hay acciones registradas aún.</p> : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {entries.map((e) => (
                  <div key={e.id} className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[10px] font-mono">{new Date(e.timestamp).toLocaleString('es-AR')}</Badge>
                      <Badge className="text-[10px]">{e.action.replace('_',' ')}</Badge>
                    </div>
                    <p className="text-sm font-bold">{e.userName || 'Sistema'} <span className="font-normal text-muted-foreground">ejecutó acción sobre</span> {e.entityType}</p>
                    <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> {e.hash}</span>
                      <span>ID: {e.id.slice(0,8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
