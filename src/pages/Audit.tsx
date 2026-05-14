import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search,
  Download,
  Shield,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Link2,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  userId: string | null;
  userRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any | null;
  success: boolean;
  errorMessage: string | null;
  timestamp: string;
  hash: string;
  previousHash: string | null;
  userEmail?: string;
  userName?: string;
}

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export default function Audit() {
  const { hasPermission } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/audit`);
      if (!response.ok) throw new Error('Error al cargar auditoría');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching audit log:', error);
      toast.error('Error al cargar el registro de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAudit = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'Usuario', 'Rol', 'Acción', 'Entidad', 'ID Entidad', 'Éxito', 'Hash'].join(','),
        ...filteredEntries.map(e => [
          e.timestamp,
          e.userName || e.userId || 'Sistema',
          e.userRole || 'N/A',
          e.action,
          e.entityType,
          e.entityId || 'N/A',
          e.success ? 'Sí' : 'No',
          e.hash.substring(0, 16) + '...'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Registro de auditoría exportado');
    } catch (error) {
      console.error('Error exporting audit log:', error);
      toast.error('Error al exportar el registro');
    }
  };

  const entityTypes = [...new Set(entries.map(e => e.entityType))];
  const actions = [...new Set(entries.map(e => e.action))];

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === '' ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEntityType = entityTypeFilter === 'all' || entry.entityType === entityTypeFilter;
    const matchesAction = actionFilter === 'all' || entry.action === actionFilter;

    return matchesSearch && matchesEntityType && matchesAction;
  });

  const stats = {
    total: filteredEntries.length,
    success: filteredEntries.filter(e => e.success).length,
    failed: filteredEntries.filter(e => !e.success).length,
    alerts: filteredEntries.filter(e => e.entityType === 'alert').length,
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-AR'),
      time: date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  if (!hasPermission('view_audit')) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              No tiene permisos para ver el registro de auditoría.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Registro de Auditoría
          </h1>
          <p className="text-muted-foreground">
            Trazabilidad completa de acciones del sistema
          </p>
        </div>

        <Button onClick={handleExportAudit} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Registros</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              <p className="text-xs text-muted-foreground">Exitosas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
              <p className="text-xs text-muted-foreground">Fallidas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.alerts}</p>
              <p className="text-xs text-muted-foreground">Alertas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por acción, usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {actions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline de Auditoría
          </CardTitle>
          <CardDescription>
            Cada registro incluye firma de integridad forense
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-start gap-2">
            <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-primary">Registro Inmutable</p>
              <p className="text-muted-foreground mt-0.5">
                Todos los eventos están firmados digitalmente. No es posible modificar registros.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay registros de auditoría disponibles.
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="relative pl-6 space-y-4">
                {filteredEntries.map((entry) => {
                  const { date, time } = formatTimestamp(entry.timestamp);
                  return (
                    <div key={entry.id} className="relative pb-4 border-l-2 border-muted pl-6 last:border-l-0">
                      <div className={cn(
                        'absolute -left-2 top-0 w-4 h-4 rounded-full border-2 border-background',
                        entry.success ? 'bg-green-500' : 'bg-destructive'
                      )} />
                      
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-muted-foreground">{time}</span>
                          <span className="text-[10px] text-muted-foreground">{date}</span>
                          <Badge variant={entry.success ? 'outline' : 'destructive'} className="text-[10px]">
                            {entry.success ? 'Exitosa' : 'Fallida'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{entry.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.entityType} {entry.entityId && `· ${entry.entityId.substring(0, 8)}...`}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                          {entry.userName && <span>Usuario: <strong>{entry.userName}</strong></span>}
                          {entry.userRole && <span>Rol: {entry.userRole}</span>}
                          <span className="flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            {entry.hash?.substring(0, 16)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
