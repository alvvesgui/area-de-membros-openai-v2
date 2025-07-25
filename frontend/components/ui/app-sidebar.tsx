"use client"

import { Home, MessageSquare, Settings, Users } from "lucide-react" // Remover History e HelpCircle
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, toggleSidebar } = useSidebar()

  const handleNavigation = () => {
    if (isMobile) {
      toggleSidebar() // Close sidebar on mobile after navigation
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Área de Membros V2</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard" onClick={handleNavigation}>
                    <Home className="h-4 w-4 shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
                  <Link href="/dashboard/settings" onClick={handleNavigation}>
                    <Settings className="h-4 w-4 shrink-0" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/users"}>
                  <Link href="/dashboard/users" onClick={handleNavigation}>
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* Remover Histórico de Conversas e Central de Ajuda daqui */}
        {/* Eles foram movidos para o DashboardHeader */}
        <Button className="w-full" variant="secondary">
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
