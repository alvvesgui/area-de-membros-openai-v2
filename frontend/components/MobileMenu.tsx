// frontend/components/MobileMenu.tsx (ou onde você quiser guardá-lo)
"use client"

import { useState } from "react"
import Image from "next/image"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const handleHelpClick = () => {
    alert("Para entrar em contato com o suporte, envie um e-mail para guilherme@leadrix.com.br")
    setIsOpen(false) // Fecha o menu após clicar em Ajuda
  }

  return (
    <>
      {/* Botão para Abrir o Menu Mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay e Menu Lateral Mobile (visível apenas quando isOpen é true) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          {/* O menu lateral em si, que desliza */}
          <div className="w-[250px] bg-white h-full shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho do Menu Lateral */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <Image
                  src="/images/logo.png" // <--- ATENÇÃO: VERIFIQUE/AJUSTE ESTE CAMINHO PARA SUA LOGO!
                  alt="Leadrix Logo"
                  width={120}
                  height={35}
                  className="h-8 w-auto"
                  priority
                />
                {/* Botão para Fechar o Menu Lateral */}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Espaçador para empurrar o botão de ajuda para baixo */}
            <div className="flex-1"></div>
            {/* Botão de Ajuda no Menu Lateral */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleHelpClick}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Ajuda
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}