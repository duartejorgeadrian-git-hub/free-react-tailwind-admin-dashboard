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

                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/alertas" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                  <Route path="/ciudadanos" element={<ProtectedRoute><Citizens /></ProtectedRoute>} />
                  <Route path="/historial" element={<ProtectedRoute><History /></ProtectedRoute>} />
                  <Route path="/reportes" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="/auditoria" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
                  <Route path="/usuarios" element={<Navigate to="/configuracion" replace />} />
                  <Route path="/tenants" element={<Navigate to="/configuracion" replace />} />
                  <Route path="/configuracion" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

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
