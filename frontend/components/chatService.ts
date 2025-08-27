// frontend/components/chatService.ts

// Configura a URL base do seu backend.
// Importante: no Next.js, variáveis de ambiente acessíveis no cliente (navegador)
// DEVEM começar com NEXT_PUBLIC_. Certifique-se de que no seu .env do frontend
// você tem NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333';

// Interface para um item do histórico de conversas,
// correspondendo ao que o backend (Prisma ChatHistory) retorna.
interface ChatHistoryItem {
  id: number;
  userId: string;
  question: string;
  answer?: string; // A resposta é opcional no seu modelo do backend
  timestamp: string; // Data e hora da conversa
}

// Interface para o payload ao salvar uma nova conversa
interface SaveChatHistoryPayload {
  question: string;
  answer?: string;
}

/**
 * Obtém o token JWT do armazenamento local.
 * Ajuste esta função se você armazena o token em outro lugar (ex: contexto, cookies).
 */
function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Busca o histórico de conversas do usuário logado no backend.
 * @returns Uma Promise que resolve para um array de ChatHistoryItem.
 * @throws Erro se o token não for encontrado ou se a requisição falhar.
 */
export async function getChatHistory(): Promise<ChatHistoryItem[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado. Por favor, faça login.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Envia o token JWT no cabeçalho de autorização
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao buscar histórico de chat.');
    }

    const data: ChatHistoryItem[] = await response.json();
    return data;
  } catch (error) {
    console.error('Erro em getChatHistory:', error);
    throw error;
  }
}

/**
 * Salva uma nova conversa (pergunta e resposta opcional) no histórico do backend.
 * @param payload Um objeto contendo a 'question' e opcionalmente a 'answer'.
 * @returns Uma Promise que resolve para um objeto com uma mensagem de sucesso.
 * @throws Erro se o token não for encontrado ou se a requisição falhar.
 */
export async function saveChatHistory(payload: SaveChatHistoryPayload): Promise<{ message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado. Por favor, faça login.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Envia o token JWT
      },
      body: JSON.stringify(payload), // Envia os dados da conversa como JSON
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao salvar histórico de chat.');
    }

    const data: { message: string } = await response.json();
    return data;
  } catch (error) {
    console.error('Erro em saveChatHistory:', error);
    throw error;
  }
}