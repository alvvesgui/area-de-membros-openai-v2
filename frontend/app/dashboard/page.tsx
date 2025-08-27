'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  
  // A variável de ambiente do backend
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const USER_ID_PLACEHOLDER = 1;

  // Sugestões de perguntas para o início do chat
  const initialSuggestions = [
    'Qual o preço dos seus serviços?',
    'Como posso integrar a IA da Leadrix?',
    'Quais são os principais diferenciais da sua plataforma?',
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Linha corrigida: usando a URL completa do backend
      const response = await fetch(`${API_BASE_URL}/api/conversations?userId=${USER_ID_PLACEHOLDER}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      console.error("Erro ao carregar histórico de conversas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // CÓDIGO CORRIGIDO: O useEffect agora roda apenas uma vez
  useEffect(() => {
    fetchConversations();
  }, []);

  const loadConversation = async (convId: string) => {
    setIsLoading(true);
    try {
      setMessages([]);
      setConversationId(convId);
      setInputMessage("");
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Linha corrigida: usando a URL completa do backend
      const response = await fetch(`${API_BASE_URL}/api/conversations/${convId}?userId=${USER_ID_PLACEHOLDER}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
    } catch (error: Error | unknown) {
      console.error(`Erro ao carregar conversa ${convId}:`, error);
      setMessages([{ sender: 'agent', text: 'Não foi possível carregar esta conversa.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setInputMessage("");
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    fetchConversations();
  };

  const handleDeleteConversation = async (convIdToDelete: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conversa? Esta ação é irreversível.')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Linha corrigida: usando a URL completa do backend
      const response = await fetch(`${API_BASE_URL}/api/conversations/${convIdToDelete}?userId=${USER_ID_PLACEHOLDER}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
        const errorData = await response.json();
        throw new Error(`Erro ao excluir conversa: ${errorData.message || response.statusText}`);
      }

      setConversations(prev => prev.filter(conv => conv.id !== convIdToDelete));

      if (conversationId === convIdToDelete) {
        startNewConversation();
      }
      alert('Conversa excluída com sucesso!');

    } catch (error: Error | unknown) {
      console.error("Erro ao excluir conversa:", error);
      alert(`Falha ao excluir conversa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    if (isLoading) return;

    const newUserMessage: Message = { sender: 'user', text: inputMessage.trim() };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          conversationId: conversationId,
          userId: USER_ID_PLACEHOLDER,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
        const errorData = await response.json();
        throw new Error(`Erro na API: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const agentResponseText = data.response;
      const newConversationId = data.conversationId;

      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
        fetchConversations();
      } else if (newConversationId && conversationId === newConversationId) {
        fetchConversations();
      }

      setMessages(prevMessages => [...prevMessages, { sender: 'agent', text: agentResponseText }]);

    } catch (error: Error | unknown) {
      console.error("Erro ao comunicar com o agente:", error);
      setMessages(prevMessages => [...prevMessages, { sender: 'agent', text: `Desculpe, ocorreu um erro: ${error instanceof Error ? error.message : 'Não consegui me conectar com o agente.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para lidar com o clique nas sugestões
  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
    handleSendMessage();
  };

  const handleHelpClick = () => {
    alert('Pode entrar em contato com o nosso suporte. Envie um e-mail para: guilherme@leadrix.com.br');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const renderAgentMessage = (text: string) => {
    const sanitizedHtml = DOMPurify.sanitize(marked.parse(text, { async: false }));
    return { __html: sanitizedHtml };
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative">
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 p-2 bg-blue-600 text-white rounded-lg z-50 shadow-lg"
          aria-label="Abrir menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
        </button>
      )}
      <div
        className={`fixed inset-y-0 left-0 bg-white shadow-lg p-4 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:w-72 md:flex-shrink-0 md:h-auto md:max-h-full w-full max-w-xs sm:max-w-sm`}
      >
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex justify-end md:hidden mb-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg"
              aria-label="Fechar menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>
          <div className="flex items-center justify-center mb-6 py-2 border-b border-gray-200">
            <img src="images/logo.png" alt="Leadrix Logo" className="h-25" />
          </div>
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out text-lg font-medium shadow-md mb-4"
          >
            + Nova Conversa
          </button>
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              Histórico:
            </h3>
            <div className="space-y-3">
              {isLoading && conversations.length === 0 ? (
                <p className="text-gray-500 text-sm animate-pulse">Carregando histórico...</p>
              ) : conversations.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma conversa encontrada.</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      conversationId === conv.id ? 'bg-blue-100 text-blue-800 font-medium shadow-sm' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    } focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 transition duration-150 ease-in-out`}
                  >
                    <button
                      onClick={() => loadConversation(conv.id)}
                      className="flex-1 text-left text-base truncate font-semibold mr-2"
                    >
                      {conv.title}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conv.updatedAt).toLocaleDateString('pt-BR')} {new Date(conv.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="ml-2 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                      title="Excluir conversa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-auto pt-4 border-t border-gray-200">
          <button
            onClick={handleHelpClick}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition duration-200 ease-in-out mb-2 text-base font-medium"
          >
            Ajuda
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200 ease-in-out text-base font-medium shadow-md"
            title="Sair da aplicação"
          >
            Sair
          </button>
        </div>
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white shadow-md p-5 flex items-center justify-between border-b border-gray-200 relative">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-800 hidden md:block">Agente de IA Leadrix</h2>
          </div>
          {conversationId && !isSidebarOpen && (
            <span className="md:hidden absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-semibold truncate max-w-[calc(100%-160px)] text-center">
              {conversations.find(c => c.id === conversationId)?.title || 'Conversa Selecionada'}
            </span>
          )}
          <div className="flex items-center space-x-4 ml-auto">
            {conversationId && (
              <span className="text-base text-gray-500 hidden md:block">
                Conversa atual: <span className="font-semibold">{conversations.find(c => c.id === conversationId)?.title || 'Carregando...'}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200 ease-in-out text-base font-medium shadow-md"
              title="Sair da aplicação"
            >
              Sair
            </button>
          </div>
        </div>
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center text-gray-500 mt-20">
              <h3 className="text-2xl font-bold mb-2">Comece uma nova conversa</h3>
              <p className="text-base mb-6">Suas conversas serão salvas automaticamente no histórico.</p>
              <div className="flex flex-col items-center space-y-4">
                {initialSuggestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    className="px-6 py-3 bg-white text-gray-800 rounded-full shadow-md hover:bg-gray-100 transition duration-200 ease-in-out font-medium max-w-sm w-full text-lg"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xl px-5 py-3 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-300 text-gray-800 rounded-bl-none'
                  } shadow-md text-base`}
                >
                  {msg.sender === 'agent' ? (
                    <div className="markdown-body" dangerouslySetInnerHTML={renderAgentMessage(msg.text)} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && inputMessage === "" && messages.length > 0 && (
            <div className="flex justify-start mb-4">
              <div className="max-w-xl px-5 py-3 rounded-xl bg-gray-300 text-gray-800 rounded-bl-none shadow-md text-base">
                <div className="flex space-x-1">
                  <span className="animate-bounce dot1">.</span>
                  <span className="animate-bounce dot2">.</span>
                  <span className="animate-bounce dot3">.</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white p-6 border-t border-gray-200 flex items-center shadow-lg">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={isLoading ? "Agente digitando..." : "Digite sua mensagem..."}
            className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none overflow-hidden"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className={`ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center transition duration-200 ease-in-out ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'} shadow-md`}
            disabled={isLoading}
          >
            Enviar
          </button>
        </div>
      </div>
      <style jsx>{`
        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: bold;
        }
        .markdown-body h1 { font-size: 1.5em; }
        .markdown-body h2 { font-size: 1.4em; }
        .markdown-body h3 { font-size: 1.3em; }
        .markdown-body h4 { font-size: 1.2em; }
        .markdown-body h5 { font-size: 1.1em; }
        .markdown-body h6 { font-size: 1em; }
        .markdown-body p,
        .markdown-body ol,
        .markdown-body ul,
        .markdown-body blockquote {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .markdown-body ol,
        .markdown-body ul {
          padding-left: 20px;
        }
        .markdown-body li {
          margin-bottom: 0.2em;
        }
        .markdown-body li p {
          display: inline;
        }
        .markdown-body a {
          color: #2563eb;
          text-decoration: underline;
        }
        .markdown-body strong {
          font-weight: bold;
        }
        .markdown-body em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}