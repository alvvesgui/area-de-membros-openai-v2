// backend/src/conversation/conversation.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Caminho para o PrismaService
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Tipagens para o que o frontend enviará
interface Message {
  sender: 'user' | 'agent';
  text: string;
}

// Altere a tipagem de userId para string
export interface ChatRequest {
  messages: Message[];
  conversationId?: string;
  userId: string; // userId agora é string
}

@Injectable()
export class ConversationService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) { // Injeta o PrismaService
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // --- Método para lidar com a lógica de chat ---
  async handleChatMessage(request: ChatRequest) {
    const { messages, conversationId, userId } = request;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('Mensagens inválidas.');
    }
    if (!userId) {
      throw new BadRequestException('ID do usuário é necessário.');
    }

    const userMessageContent = messages[messages.length - 1].text;

    let currentConversationId: string;
    let conversation: any;
    let agentResponseText: string | null | undefined;

    if (conversationId) {
      conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });

      if (!conversation) {
        throw new NotFoundException('Conversa não encontrada.');
      }
      currentConversationId = conversation.id;
    } else {
      // É uma NOVA conversa
      // A busca por ID agora usa uma string
      const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        throw new BadRequestException('Usuário não encontrado no sistema.');
      }

      conversation = await this.prisma.conversation.create({
        data: {
          userId: userId, // O userId é passado como string
          title: `Nova Conversa - ${new Date().toLocaleDateString('pt-BR')}`,
        },
        include: { messages: true },
      });
      currentConversationId = conversation.id;
    }

    // 1. Salvar a Mensagem do Usuário
    await this.prisma.message.create({
      data: {
        conversationId: currentConversationId,
        sender: 'user',
        text: userMessageContent,
      },
    });

    // ... (restante da lógica de chamada da OpenAI) ...
    const openaiMessages: ChatCompletionMessageParam[] = messages.map((msg: Message) => {
      const role: "user" | "assistant" = msg.sender === 'user' ? 'user' : 'assistant';
      return {
        role: role,
        content: msg.text,
      };
    });

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
    });

    agentResponseText = completion.choices[0].message.content;

    // 3. Salvar a Mensagem do Agente
    if (agentResponseText) {
      await this.prisma.message.create({
        data: {
          conversationId: currentConversationId,
          sender: 'agent',
          text: agentResponseText,
        },
      });
    }

    // 4. Opcional: Atualizar o Título da Conversa
    if (conversation.title.startsWith('Nova Conversa') && userMessageContent) {
      await this.prisma.conversation.update({
        where: { id: currentConversationId },
        data: { title: userMessageContent.substring(0, 50) + (userMessageContent.length > 50 ? '...' : '') },
      });
    }

    return {
      response: agentResponseText,
      conversationId: currentConversationId,
    };
  }

  // --- Métodos para gerenciar o histórico de conversas ---
  // Altere a tipagem do userId para string
  async getAllConversations(userId: string) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é necessário para listar conversas.');
    }
    // A busca no Prisma agora usa o ID como string
    return this.prisma.conversation.findMany({
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });
  }

  // Altere a tipagem do userId para string
  async getSingleConversation(conversationId: string, userId: string) {
    if (!conversationId) {
      throw new BadRequestException('ID da conversa é necessário.');
    }
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }
    // A validação de segurança também usa a string
    if (conversation.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para acessar esta conversa.');
    }

    return conversation;
  }

  // --- Método para excluir uma conversa ---
  // Altere a tipagem do userId para string
  async deleteConversation(conversationId: string, userId: string) {
    if (!conversationId) {
      throw new BadRequestException('ID da conversa é necessário para exclusão.');
    }

    // A busca e a validação de segurança usarão a string
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada para exclusão.');
    }
    
    // A validação de segurança também usa a string
    if (conversation.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para excluir esta conversa.');
    }

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { message: 'Conversa excluída com sucesso!' };
  }
}