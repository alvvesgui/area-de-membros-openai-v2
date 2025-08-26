'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
// eslint-disable-next-line
import { getChatHistory } from '@/components/chatService'; 

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
}

// Componente otimizado para renderizar a mensagem do agente
const AgentMessage = ({ text }: { text: string }) => {
  const html = { __html: DOMPurify.sanitize(marked.parse(text) as string) };
  return <div dangerouslySetInnerHTML={html} />;
};

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const USER_ID_PLACEHOLDER = 1;

  const initialSuggestions = [
    'Qual o preço dos seus serviços?',
    'Como posso integrar a IA da Leadrix?',
    'Quais são os principais diferenciais da sua plataforma?',
  ];

  // Scroll automático ao adicionar mensagens
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch histórico de conversas
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/conversations?userId=${USER_ID_PLACEHOLDER}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
        throw new Error(`Erro ao buscar conversas: ${response.statusText}`);
      }

      const data: ConversationItem[] = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Erro ao carregar histórico de conversas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Carregar conversa específica
  const loadConversation = async (convId: string) => {
    setIsLoading(true);
    try {
      setMessages([]);
      setConversationId(convId);
      setInputMessage('');
      if (isSidebarOpen) setIsSidebarOpen(false);

      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/conversations/${convId}?userId=${USER_ID_PLACEHOLDER}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
        throw new Error(`Erro ao carregar conversa: ${response.statusText}`);
      }

      const data = await response.json();
      const loadedMessages: Message[] = data.messages.map((msg: { sender: 'user' | 'agent'; text: string }) => ({
        sender: msg.sender,
        text: msg.text,
      }));
      setMessages(loadedMessages);
    } catch (error: unknown) {
      console.error(`Erro ao carregar conversa ${convId}:`, error);
      setMessages([{ sender: 'agent', text: 'Não foi possível carregar esta conversa.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar nova conversa
  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setInputMessage('');
    if (isSidebarOpen) setIsSidebarOpen(false);
    fetchConversations();
  };

  // Excluir conversa
  const handleDeleteConversation = async (convIdToDelete: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conversa? Esta ação é irreversível.')) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/conversations/${convIdToDelete}?userId=${USER_ID_PLACEHOLDER}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      setConversations(prev => prev.filter(conv => conv.id !== convIdToDelete));

      if (conversationId === convIdToDelete) startNewConversation();
      alert('Conversa excluída com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao excluir conversa:', error);
      alert(`Falha ao excluir conversa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;

    const newUserMessage: Message = { sender: 'user', text: inputMessage.trim() };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          conversationId,
          userId: USER_ID_PLACEHOLDER,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      const agentResponseText = data.response;
      const newConversationId = data.conversationId;

      if (newConversationId && !conversationId) setConversationId(newConversationId);
      fetchConversations();

      setMessages(prev => [...prev, { sender: 'agent', text: agentResponseText }]);
    } catch (error: unknown) {
      console.error('Erro ao comunicar com o agente:', error);
      setMessages(prev => [...prev, { sender: 'agent', text: `Desculpe, ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
    handleSendMessage();
  };

  const handleHelpClick = () => alert('Envie um e-mail para: guilherme@leadrix.com.br');
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-white shadow-lg p-4 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 md:w-72 md:flex-shrink-0 md:h-auto md:max-h-full w-full max-w-xs sm:max-w-sm`}>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 py-2 border-b border-gray-200">
            <img src="images/logo.png" alt="Leadrix Logo" className="h-25" />
          </div>
          {/* Nova conversa */}
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
          >
            + Nova Conversa
          </button>
          {/* Histórico */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Histórico:</h3>
            <div className="space-y-3">
              {isLoading && conversations.length === 0 ? (
                <p className="text-gray-500 text-sm animate-pulse">Carregando histórico...</p>
              ) : conversations.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma conversa encontrada.</p>
              ) : (
                conversations.map((conv: ConversationItem) => (
                  <div key={conv.id} className={`flex items-center justify-between p-3 rounded-lg ${conversationId === conv.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                    <button onClick={() => loadConversation(conv.id)} className="flex-1 text-left text-base truncate font-semibold mr-2">
                      {conv.title}
                      <p className="text-xs text-gray-400 mt-1">{new Date(conv.updatedAt).toLocaleDateString('pt-BR')} {new Date(conv.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }} className="ml-2 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600">🗑️</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-auto pt-4 border-t border-gray-200">
          <button onClick={handleHelpClick} className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 mb-2">Ajuda</button>
          <button onClick={handleLogout} className="w-full px-4 py-3 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 mb-2">Sair</button>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center text-gray-500 mt-20">
              <h3 className="text-2xl font-bold mb-2">Comece uma nova conversa</h3>
              <p className="text-base mb-6">Suas conversas serão salvas automaticamente no histórico.</p>
              <div className="flex flex-col items-center space-y-4">
                {initialSuggestions.map((question, index) => (
                  <button key={index} onClick={() => handleSuggestionClick(question)} className="px-6 py-3 bg-white rounded-full shadow-md hover:bg-gray-100 w-full max-w-sm">{question}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl px-5 py-3 rounded-xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-300 text-gray-800 rounded-bl-none'}`}>
                  {msg.sender === 'agent' ? <AgentMessage text={msg.text} /> : msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="bg-white p-6 border-t border-gray-200 flex items-center shadow-lg">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder={isLoading ? "Agente digitando..." : "Digite sua mensagem..."}
            className="flex-1 p-4 border border-gray-300 rounded-lg text-lg"
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading} className={`ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}>Enviar</button>
        </div>
      </div>
    </div>
  );
}