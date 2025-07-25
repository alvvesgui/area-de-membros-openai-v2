"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";
import DashboardHeader from "@/components/ui/dashboard-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { MessageCircleHeart, Bot } from "lucide-react";

export default function DashboardPage() {
  const iframeSrc =
    "https://app.chatvolt.ai/agents/cm0vthnd901sai91sdbq1wbgq/iframe";
  const iframeId = "chat-iframe";

  const [showChatMobile, setShowChatMobile] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader onHelpClick={() => setShowHelpModal(true)} />
      <div className="flex flex-1 pt-16">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col md:flex-row">
          {/* Conteúdo principal - lado esquerdo */}
          <main className="flex-1 overflow-y-auto p-4 md:w-2/3 md:p-6 lg:w-2/3">
            <div className="max-w-xl mx-auto text-center mb-6">
              <div className="mb-4 flex justify-center">
                <MessageCircleHeart className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Bem-vindo à nossa Área de Membros
              </h1>
              <p className="mt-2 text-gray-600">
                Converse com nosso assistente virtual para tirar dúvidas,
                receber ajuda personalizada ou explorar novos recursos.
              </p>
            </div>

            {/* Botão flutuante no mobile */}
            <button
              onClick={() => setShowChatMobile(true)}
              className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg md:hidden"
              aria-label="Abrir chat"
            >
              <Bot className="h-6 w-6" />
            </button>

            {/* Modal chat no mobile */}
            {showChatMobile && (
              <div className="fixed inset-0 z-50 flex flex-col bg-white">
                <div className="flex items-center justify-between p-4 border-b shadow-sm">
                  <h2 className="text-lg font-medium text-gray-800">
                    Assistente Virtual
                  </h2>
                  <button
                    onClick={() => setShowChatMobile(false)}
                    className="text-sm text-blue-600"
                    aria-label="Fechar chat"
                  >
                    Fechar
                  </button>
                </div>
                <iframe
                  id={iframeId}
                  src={iframeSrc}
                  className="flex-1 w-full border-0"
                  title="Chatbot Iframe"
                />
              </div>
            )}

            {/* Modal ajuda */}
            {showHelpModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">
                    Ajuda
                  </h3>
                  <p className="mb-6 text-gray-700">
                    Para entrar em contato com o nosso suporte, mande um e-mail
                    para{" "}
                    <a
                      href="mailto:2.suporte.com.br"
                      className="text-blue-600 underline"
                    >
                      guilherme@leadrix.com.br
                    </a>
                    .
                  </p>
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    aria-label="Fechar ajuda"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Chat fixo desktop - lado direito largo */}
          <aside className="hidden md:block md:w-2/5 lg:w-1/3">
            <div className="sticky top-16 h-[calc(100vh-4rem)] p-4 md:p-6">
              <iframe
                id={iframeId}
                src={iframeSrc}
                className="h-full w-full rounded-lg border-0 shadow-md"
                title="Chatbot Iframe"
              />
            </div>
          </aside>
        </SidebarInset>
      </div>
    </div>
  );
}
