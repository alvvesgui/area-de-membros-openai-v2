// backend/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '../../../lib/prisma'; // seu arquivo lib/prisma.ts

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = 'asst_t7FWCeeQmALVKhbyf4UfsFHJ';

interface ChatRequestBody {
  messages: { text: string }[];
  conversationId?: string;
  userId: string; // CORREÇÃO: userId agora é string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, conversationId, userId } = body;

    let convId = conversationId;

    // Se não houver conversa, cria uma nova
    if (!convId) {
      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
      }

      const newConversation = await prisma.conversation.create({
        data: {
          userId,
          title: messages[0]?.text || 'Nova conversa',
        },
      });
      convId = newConversation.id;
    }

    const userMessageText = messages[messages.length - 1].text;

    // Salva a mensagem do usuário no banco
    await prisma.message.create({
      data: {
        conversationId: convId,
        sender: 'user',
        text: userMessageText,
      },
    });

    // Cria a thread na OpenAI
    let thread = await openai.beta.threads.create();
    let threadId = thread.id;

    // Adiciona a mensagem do usuário à thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessageText,
    });

    // Executa o assistente
    let run = await openai.beta.threads.runs.create(threadId, { assistant_id: ASSISTANT_ID });

    while (run.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      run = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    }

    // Busca todas as mensagens da thread
    const threadMessages = await openai.beta.threads.messages.list(threadId);

    // Pega a última mensagem do assistente
    const lastAssistantMessage = [...threadMessages.data].reverse().find(m => m.role === 'assistant');

    // Extrai o texto de forma segura
    let agentResponse = '';
    if (lastAssistantMessage && lastAssistantMessage.content.length > 0) {
      const firstBlock = lastAssistantMessage.content[0];
      if ('text' in firstBlock) {
        agentResponse = firstBlock.text.value;
      }
    }

    // Salva a resposta do assistente no banco
    if (agentResponse) {
      await prisma.message.create({
        data: {
          conversationId: convId,
          sender: 'assistant',
          text: agentResponse,
        },
      });
    }

    return NextResponse.json({ response: agentResponse, conversationId: convId });
  } catch (error: any) {
    console.error('Erro na API de Assistants:', error);
    return NextResponse.json({ message: 'Ocorreu um erro ao processar a requisição.' }, { status: 500 });
  }
}