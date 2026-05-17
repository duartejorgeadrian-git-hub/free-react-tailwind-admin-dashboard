import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  FileText, 
  Settings,
  BarChart3,
  History,
  Shield,
  Building2
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  operador: 'Operador',
  supervisor: 'Supervisor',
  auditor: 'Auditor',
  director: 'Director',
  admin_municipal: 'Admin. Municipal',
  superadmin: 'SuperAdmin',
  soporte: 'Soporte Técnico',
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { role, hasPermission, profile } = useAuth();
  const isCollapsed = state === 'collapsed';

  const mainNavItems = [
    { 
      title: 'Centro de Monitoreo', 
      url: '/', 
      icon: LayoutDashboard,
      show: true,
    },
    { 
      title: 'Alertas Activas', 
      url: '/alertas', 
      icon: AlertTriangle,
      show: hasPermission('view_alerts'),
    },
    { 
      title: 'Ciudadanos', 
      url: '/ciudadanos', 
      icon: Users,
      show: hasPermission('view_citizen_profile'),
    },
    { 
      title: 'Historial', 
      url: '/historial', 
      icon: History,
      show: hasPermission('view_alerts'),
    },
  ].filter(item => item.show);

  const adminNavItems = [
    { 
      title: 'Reportes', 
      url: '/reportes', 
      icon: BarChart3,
      show: hasPermission('view_audit'),
    },
    { 
      title: 'Auditoría', 
      url: '/auditoria', 
      icon: FileText,
      show: hasPermission('view_audit'),
    },
    { 
      title: 'Configuración', 
      url: '/configuracion', 
      icon: Settings,
      show: hasPermission('manage_config') || hasPermission('manage_users') || hasPermission('manage_tenants'),
    },
  ].filter(item => item.show);

  return (
    <Sidebar 
      className="border-r-0 bg-slate-950 text-slate-300 shadow-2xl w-64 shrink-0"
      collapsible="none"
    >
      <SidebarHeader className="border-b border-slate-800 bg-slate-950 px-4 py-3 h-16 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-white tracking-wide leading-tight">RG Alerta</h1>
              <span className="text-[10px] text-slate-400 font-medium">Centro de Monitoreo</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2 bg-slate-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] tracking-widest font-bold">
            Operaciones
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-primary/20 hover:text-primary transition-all duration-200"
                      activeClassName="bg-primary/20 text-primary font-medium shadow-sm"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="flex-1">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminNavItems.length > 0 && (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] tracking-widest font-bold">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
                        activeClassName="bg-slate-800 text-white font-medium shadow-sm"
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800 bg-slate-950 p-4">
        {!isCollapsed && (
          <div className="space-y-3">
            {role && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-slate-900 border-slate-700 text-slate-300">
                  {roleLabels[role] || role}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-500 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
              <Shield className="w-5 h-5 text-emerald-500" />
              <div className="text-xs">
                <p className="font-medium text-slate-300">Sistema Seguro</p>
                <p className="text-[10px] text-emerald-500/80">Conexión cifrada AES-256</p>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
