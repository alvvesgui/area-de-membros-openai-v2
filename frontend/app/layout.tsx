// frontend/app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"

// REMOVIDO: import { SidebarProvider } from "@/components/ui/sidebar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Área de Membros",
  description: "Plataforma de Acesso e Dashboard",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // AVISO: Se a funcionalidade de cookies da sidebar não for mais usada,
  // você pode remover as linhas abaixo também.
  // const cookieStore = await cookies()
  // const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* REMOVIDO: <SidebarProvider defaultOpen={defaultOpen}> */}
        {children}
        {/* REMOVIDO: </SidebarProvider> */}
      </body>
    </html>
  )
}

