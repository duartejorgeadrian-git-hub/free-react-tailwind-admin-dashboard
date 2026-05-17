import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { Loader2 } from "lucide-react";

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
  const { user, loading, hasPermission } = useAuth();

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

  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
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
