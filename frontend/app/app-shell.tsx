// frontend/app/app-shell.tsx
"use client"; // ESSENCIAL: Este é um Client Component

import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/ui/dashboard-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from 'next/navigation'; // Hook para obter a rota atual

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Se a rota atual for /login, não renderize o DashboardHeader e a Sidebar
  // Você pode adicionar outras rotas de autenticação aqui se tiver (ex: /register, /forgot-password)
  const isAuthPage = pathname === '/login';

  // Se for uma página de autenticação, apenas renderize os filhos sem o layout do dashboard
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Para todas as outras páginas, renderize o layout completo do dashboard
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <DashboardHeader />
            <main className="flex-1 overflow-auto pt-16">
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}