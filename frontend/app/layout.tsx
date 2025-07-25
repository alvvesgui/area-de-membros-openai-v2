import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"

import { SidebarProvider } from "@/components/ui/sidebar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Área de Membros V2",
  description: "Plataforma de Acesso e Dashboard",
}

// Adiciona 'async' na função principal
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies() // await aqui
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SidebarProvider defaultOpen={defaultOpen}>
          {children}
        </SidebarProvider>
      </body>
    </html>
  )
}
