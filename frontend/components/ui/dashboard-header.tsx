// frontend/components/ui/dashboard-header.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, History, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConversationHistory } from "@/components/ui/ConversationHistory";

interface DashboardHeaderProps {
  onHelpClick?: () => void;
}

export default function DashboardHeader({ onHelpClick }: DashboardHeaderProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <TooltipProvider>
      <header className="fixed top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
        {isMobile && (
          <SidebarTrigger onClick={() => setOpenMobile(true)} className="mr-2" />
        )}

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar conversas..."
            className="w-full rounded-lg bg-background pl-9 md:w-[300px] lg:w-[400px]"
          />
        </div>

        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <History className="h-4 w-4" />
                    <span className="sr-only">Histórico de Conversas</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Histórico de Conversas</p>
                </TooltipContent>
              </Tooltip>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-md p-0">
              <SheetHeader className="p-4">
                <SheetTitle>Histórico de Conversas</SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100%-4rem)] overflow-y-auto">
                <ConversationHistory />
              </div>
            </SheetContent>
          </Sheet>

          {/* Botão Ajuda chama a prop onHelpClick */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onHelpClick}
              >
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Central de Ajuda</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Central de Ajuda</p>
            </TooltipContent>
          </Tooltip>

          <img src="/images/logo.png" alt="Leadrix" className="h-20" />
        </div>
      </header>
    </TooltipProvider>
  );
}
