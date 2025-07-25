"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Import Card components

interface QuestionButtonsProps {
  iframeId: string
  iframeSrc: string
}

export function QuestionButtons({ iframeId, iframeSrc }: QuestionButtonsProps) {
  const questions = [
    "Como melhorar a experiência do cliente?",
    "Quais os principais KPIs de CX?",
    "Estratégias para retenção de clientes",
    "Como otimizar o atendimento ao cliente?",
    "Ferramentas de automação para CX",
    "Melhores práticas de feedback do cliente",
    "O que é Customer Journey?",
    "Como criar um mapa de empatia?",
    "Qual a importância do NPS?",
  ]

  const sendQuestionToIframe = (question: string) => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: "question", payload: question }, iframeSrc)
      console.log(`Pergunta enviada para o iframe: ${question}`)
    } else {
      console.error("Iframe não encontrado ou não carregado.")
    }
  }

  const [isChatOpen, setIsChatOpen] = React.useState(false)

  return (
    <Card className="w-full">
      {" "}
      {/* Wrap in Card */}
      <CardHeader>
        <CardTitle className="text-xl font-bold">Sugestões de Perguntas</CardTitle> {/* Smaller title */}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {" "}
          {/* Use flex-wrap for a tag-like layout */}
          {questions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="default" // Use default size for a more compact button
              className="h-auto px-4 py-2 text-sm bg-transparent" // Adjust padding and font size
              onClick={() => sendQuestionToIframe(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </CardContent>
      {/* Mobile Chat Trigger */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full p-4 shadow-lg">
              <MessageSquare className="h-6 w-6" />
              <span className="sr-only">Abrir Chat</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="flex h-[90vh] max-h-[90vh] w-[95vw] max-w-[95vw] flex-col p-0">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>Leadrix</DialogTitle>
            </DialogHeader>
            <iframe
              id={iframeId}
              src={iframeSrc}
              className="h-full w-full flex-1 rounded-b-lg border-0"
              title="Chatbot Iframe"
            />
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}
