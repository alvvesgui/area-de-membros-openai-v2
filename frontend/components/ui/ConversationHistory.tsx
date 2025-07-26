// frontend/components/ui/ConversationHistory.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
// Certifique-se de que este caminho está correto:
// '..' sobe um nível (de 'ui' para 'components'), e então encontra 'chatService'
import { getChatHistory } from '../chatService'; 

// Se você não tem ScrollArea, use uma div simples como na última versão
// import { ScrollArea } from "@/components/ui/scroll-area"; 

// Interface para um item do histórico de conversas,
// correspondendo ao que o seu backend (Prisma ChatHistory) retorna.
interface Conversation {
  id: number;
  userId: number;
  question: string;
  answer?: string;
  timestamp: string; 
}

export function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true); 
    setError(null);    

    try {
      const data = await getChatHistory();
      setConversations(data); 
    } catch (err: unknown) { // ALTERAÇÃO AQUI: 'err' agora é 'unknown'
      if (err instanceof Error) { // Verificação de tipo
        if (err.message.includes('Usuário não autenticado')) {
          setError('Sessão expirada ou usuário não autenticado. Por favor, faça login novamente.');
          localStorage.removeItem('access_token');    
          localStorage.removeItem('is_subscriber'); 
        } else {
          setError(err.message || 'Falha ao carregar histórico de conversas.');
        }
      } else { // Caso o erro não seja uma instância de Error
        setError('Falha ao carregar histórico de conversas: ' + JSON.stringify(err));
      }
    } finally {
      setLoading(false); 
    }
  }, []); 

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <SheetContent side="right" className="flex flex-col">
      <SheetHeader>
        <SheetTitle>Histórico de Conversas</SheetTitle>
        <SheetDescription>
          Visualize suas conversas anteriores com o chatbot.
        </SheetDescription>
      </SheetHeader>
      
      <Separator className="my-4" /> 
      
      {/* Usando div simples com rolagem se você não tem ScrollArea */}
      <div className="flex-1 overflow-y-auto pr-2">
        {loading && <p className="text-center text-gray-500">Carregando histórico...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!loading && !error && conversations.length === 0 && (
          <p className="text-center text-gray-500">Nenhuma conversa encontrada ainda.</p>
        )}
        
        {!loading && !error && conversations.length > 0 && (
          <div className="space-y-4"> 
            {conversations.map((conv) => (
              <div 
                key={conv.id} 
                className="border border-gray-200 dark:border-gray-700 p-3 rounded-md bg-gray-50 dark:bg-gray-700"
              >
                <p className="font-semibold text-gray-800 dark:text-gray-200">Você: {conv.question}</p>
                {conv.answer && <p className="text-sm text-muted-foreground mt-1">Bot: {conv.answer}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(conv.timestamp).toLocaleString()} 
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SheetContent>
  );
}