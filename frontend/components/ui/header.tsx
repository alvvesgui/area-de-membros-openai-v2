"use client"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HelpCircle, History, Search } from "lucide-react"

export function Header() {
  const historyItems = [
    "Conversa com Suporte (Ontem)",
    "Dúvidas sobre Faturamento (01/07)",
    "Configuração de Conta (28/06)",
  ]

  return (
    <header className="fixed top-0 left-0 right-0 w-full p-4 bg-gray-900 text-white flex items-center justify-between shadow-md z-50">
      {/* Logo da Empresa Lydrix */}
      <div className="flex-shrink-0">
        <Image src="/images/logo.png" alt="Lydrix Logo" width={100} height={30} priority />
      </div>

      {/* Barra de Busca */}
      <div className="flex-1 mx-4 max-w-sm">
        <Input
          type="text"
          placeholder="Buscar conversas"
          className="w-full bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-gray-600"
        />
      </div>

      {/* Ícones de Ação */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Ícone de Ajuda com Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Ajuda</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-lg bg-white text-gray-900 p-6">
            <h2 className="text-lg font-semibold mb-2">Suporte Lydrix</h2>
            <p className="text-sm">
              Para entrar em contato com o suporte, mande um e-mail para{" "}
              <span className="font-medium text-blue-600">suporte@lidrics.com.br</span>.
            </p>
          </DialogContent>
        </Dialog>

        {/* Ícone de Histórico de Conversas com Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
              <History className="h-5 w-5" />
              <span className="sr-only">Histórico de conversas</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white text-gray-900 border border-gray-200 shadow-lg">
            {historyItems.length > 0 ? (
              historyItems.map((item, index) => (
                <DropdownMenuItem key={index} className="cursor-pointer hover:bg-gray-100">
                  {item}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Nenhum histórico recente</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Ícone de Busca (mantido do layout anterior, se desejar) */}
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 md:hidden">
          <Search className="h-5 w-5" />
          <span className="sr-only">Buscar</span>
        </Button>
      </div>
    </header>
  )
}
