import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AudioSettingsProvider } from "@/hooks/useAudioSettings";
import { MunicipalityProvider } from "@/context/MunicipalityContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/MainDashboard";
import Alerts from "./pages/Alerts";
import Citizens from "./pages/Citizens";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { Loader2, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function PermissionRoute({ children, permission }: { children: React.ReactNode; permission: string }) {
  const { user, loading, hasPermission, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [hasLogged, setHasLogged] = useState(false);

  useEffect(() => {
    if (user && !loading && !hasPermission(permission) && !hasLogged) {
      setHasLogged(true);
      setShowWarning(true);

      const logSecurityAttempt = async () => {
        try {
          const rawUrl = import.meta.env.VITE_API_URL || '';
          const API_URL = (rawUrl.split(' ')[0] || `http://${window.location.hostname}:3001`).trim();
          await fetch(`${API_URL}/api/audit/log`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: user.id,
              action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
              entityType: 'security',
              entityId: user.id,
              details: {
                username: user.username,
                role: role,
                attemptedUrl: location.pathname,
                permissionRequired: permission,
                timestamp: new Date().toISOString()
              }
            })
          });
        } catch (err) {
          console.error('Error logging security attempt:', err);
        }
      };

      logSecurityAttempt();
    }
  }, [user, loading, hasPermission, permission, hasLogged, location.pathname, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (showWarning) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white tracking-wide">
              ACCESO NO AUTORIZADO
            </h3>
            <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">
              Incidente de Seguridad Registrado
            </p>
          </div>

          <div className="text-slate-300 text-sm leading-relaxed text-left bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <p className="mb-2">
              Se ha registrado un intento de acceso no autorizado a la sección protegida:
            </p>
            <code className="block bg-slate-900 px-2.5 py-1.5 rounded text-rose-300 text-xs font-mono mb-3 truncate">
              {location.pathname}
            </code>
            <p className="text-slate-400 text-xs">
              Esta acción viola los protocolos de seguridad municipal de la plataforma. Su cuenta <strong>@{user.username}</strong> y comportamiento han sido reportados automáticamente al <strong>Administrador Municipal</strong> y al <strong>SuperAdmin Global</strong> para auditoría inmediata.
            </p>
          </div>

          <button
            onClick={() => {
              setShowWarning(false);
              navigate(role === 'auditor' ? '/auditoria' : '/', { replace: true });
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-rose-900/30 active:scale-[0.98] transition-all duration-150"
          >
            Entendido, Volver a Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function DashboardRoute() {
  const { role } = useAuth();
  if (role === 'auditor') {
    return <Navigate to="/auditoria" replace />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MunicipalityProvider>
          <AudioSettingsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  <Route path="/" element={<ProtectedRoute><DashboardRoute /></ProtectedRoute>} />
                  <Route path="/alertas" element={<PermissionRoute permission="view_alerts"><Alerts /></PermissionRoute>} />
                  <Route path="/ciudadanos" element={<PermissionRoute permission="view_citizen_profile"><Citizens /></PermissionRoute>} />
                  <Route path="/historial" element={<PermissionRoute permission="view_alerts"><History /></PermissionRoute>} />
                  <Route path="/reportes" element={<PermissionRoute permission="view_reports"><Reports /></PermissionRoute>} />
                  <Route path="/auditoria" element={<PermissionRoute permission="view_audit"><Audit /></PermissionRoute>} />
                  <Route path="/usuarios" element={<Navigate to="/configuracion" replace />} />
                  <Route path="/tenants" element={<Navigate to="/configuracion" replace />} />
                  <Route path="/configuracion" element={<PermissionRoute permission="manage_config"><Settings /></PermissionRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AudioSettingsProvider>
        </MunicipalityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
