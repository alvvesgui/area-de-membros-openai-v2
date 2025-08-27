// backend/src/conversation/conversation.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class ConversationService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // --- Método para lidar com a lógica de chat ---
  async handleChatMessage(request: { messages: { sender: string; text: string }[]; conversationId?: string; userId: string; }) {
    const { messages, conversationId, userId } = request;

    if (!messages || messages.length === 0) {
      throw new BadRequestException('Mensagens inválidas.');
    }
    if (!userId) {
      throw new BadRequestException('ID do usuário é necessário.');
    }

    const userMessageContent = messages[messages.length - 1].text;

    let conversation;

    if (conversationId) {
      conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });

      if (!conversation) {
        throw new NotFoundException('Conversa não encontrada.');
      }

      if (conversation.userId !== userId) {
        throw new BadRequestException('Você não tem permissão para acessar esta conversa.');
      }

    } else {
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
    }

    // 1. Salvar a Mensagem do Usuário
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        text: userMessageContent,
      },
    });

    // ... (restante da lógica de chamada da OpenAI) ...
    const openaiMessages: ChatCompletionMessageParam[] = messages.map((msg: { sender: string; text: string }) => {
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

    const agentResponseText = completion.choices[0].message.content;

    // 3. Salvar a Mensagem do Agente
    if (agentResponseText) {
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'assistant',
          text: agentResponseText,
        },
      });
    }

    // Opcional: Atualizar o Título da Conversa
    // Verificamos se o título ainda é o padrão antes de atualizar com base na primeira mensagem
    if (conversation.title && conversation.title.startsWith('Nova Conversa') && userMessageContent) {
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { title: userMessageContent.substring(0, 50) + (userMessageContent.length > 50 ? '...' : '') },
      });
    }

    return {
      response: agentResponseText,
      conversationId: conversation.id,
    };
  }

  // --- Métodos para gerenciar o histórico de conversas ---
  async getAllConversations(userId: string) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é necessário para listar conversas.');
    }
    return this.prisma.conversation.findMany({
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true, // Adiciona o título na seleção
        updatedAt: true,
      },
    });
  }

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
    if (conversation.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para acessar esta conversa.');
    }

    return conversation;
  }

  // --- Método para excluir uma conversa ---
  async deleteConversation(conversationId: string, userId: string) {
    if (!conversationId) {
      throw new BadRequestException('ID da conversa é necessário para exclusão.');
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada para exclusão.');
    }
    
    if (conversation.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para excluir esta conversa.');
    }

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { message: 'Conversa excluída com sucesso!' };
  }
}