import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useMunicipality } from '@/context/MunicipalityContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { selectedMunicipality, setSelectedMunicipality } = useMunicipality();

  return (
    <SidebarProvider>
      <AppSidebar />
      
      <SidebarInset className="flex flex-col flex-1 bg-slate-50 min-h-screen overflow-hidden">
        <Header 
          selectedMunicipality={selectedMunicipality}
          onMunicipalityChange={setSelectedMunicipality}
        />
        
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
