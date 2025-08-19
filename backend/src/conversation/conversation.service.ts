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

export interface ChatRequest { // Exportado para ser usado no Controller
  messages: Message[];
  conversationId?: string; // string OU undefined (não null)
  userId: number;
}

@Injectable()
export class ConversationService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) { // Injeta o PrismaService
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // A chave é lida do .env
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
    let agentResponseText: string | null | undefined; // Declarar aqui para escopo

    if (conversationId) { // Se conversationId existe (não é undefined)
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
      const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        throw new BadRequestException('Usuário não encontrado no sistema.');
      }

      conversation = await this.prisma.conversation.create({
        data: {
          userId: userId,
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

    // 2. Chamar a API da OpenAI
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

    agentResponseText = completion.choices[0].message.content; // Atribuir valor aqui

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
  async getAllConversations(userId: number) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é necessário para listar conversas.');
    }
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

  async getSingleConversation(conversationId: string, userId: number) {
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
    // Validação de segurança: o usuário só pode acessar suas próprias conversas
    if (conversation.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para acessar esta conversa.');
    }

    return conversation;
  }

  // --- NOVO MÉTODO: Excluir uma conversa ---
  async deleteConversation(conversationId: string, userId: number) {
    if (!conversationId) {
      throw new BadRequestException('ID da conversa é necessário para exclusão.');
    }

    // Primeiro, verifique se a conversa existe e pertence ao usuário
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada para exclusão.');
    }

    // Validação de segurança: garantir que o usuário só pode deletar suas próprias conversas
    if (conversation.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para excluir esta conversa.');
    }

    // Agora, exclua a conversa. Graças ao `onDelete: Cascade` no schema.prisma,
    // todas as mensagens associadas a esta conversa serão excluídas automaticamente.
    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    // Opcional: Você pode retornar um status de sucesso ou uma mensagem.
    return { message: 'Conversa excluída com sucesso!' };
  }
}