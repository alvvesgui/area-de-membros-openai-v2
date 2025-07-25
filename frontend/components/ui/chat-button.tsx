"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Bot, X } from "lucide-react"

export function ChatButton() {
  const iframeUrl = "https://app.chatvolt.ai/agents/cm0vthnd901sai91sdbq1wbgq/iframe"

  return (
    // O botão flutuante e o modal são visíveis apenas em dispositivos móveis (md:hidden)
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 rounded-full p-4 shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors z-40 md:hidden"
          aria-label="Abrir chat com assistente virtual"
        >
          <Bot className="h-7 w-7" />
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed inset-0 h-full w-full max-w-none rounded-none p-0 overflow-hidden border-none shadow-none bg-white flex flex-col">
        <div className="flex justify-end p-4 bg-gray-900">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
              <X className="h-6 w-6" />
              <span className="sr-only">Fechar chat</span>
            </Button>
          </DialogClose>
        </div>
        <iframe
          src={iframeUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="microphone; camera"
          title="Chat com Assistente Virtual"
          className="flex-1"
        />
      </DialogContent>
    </Dialog>
  )
}
