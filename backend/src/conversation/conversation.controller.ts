// backend/src/conversation/conversation.controller.ts
import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus, BadRequestException, Delete, NotFoundException } from '@nestjs/common';
import { ConversationService, ChatRequest } from './conversation.service'; // Importa o serviço e a interface

@Controller('api') // Define o prefixo base para todas as rotas
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  // --- Rota POST para o chat ---
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async handleChat(
    @Body() body: { messages: any[]; conversationId?: string | null; userId: string } // userId agora é string
  ) {
    const serviceRequest: ChatRequest = {
      messages: body.messages,
      userId: body.userId,
      conversationId: body.conversationId === null ? undefined : body.conversationId
    };

    try {
      const result = await this.conversationService.handleChatMessage(serviceRequest);
      return result;
    } catch (error) {
      console.error("Erro no controlador de chat:", error.message);
      throw new BadRequestException(error.message || 'Erro interno do servidor ao processar chat.');
    }
  }

  // --- Rota GET para listar conversas ---
  @Get('conversations')
  async getConversations(
    @Query('userId') userId: string
  ) {
    // Não precisa de conversão para número, pois o ID é uma string (UUID)
    if (!userId) {
      throw new BadRequestException('ID do usuário inválido.');
    }
    return this.conversationService.getAllConversations(userId);
  }

  // --- Rota GET para obter uma conversa específica ---
  @Get('conversations/:id')
  async getConversationById(
    @Param('id') conversationId: string,
    @Query('userId') userId: string
  ) {
    // Não precisa de conversão para número
    if (!userId) {
      throw new BadRequestException('ID do usuário é necessário.');
    }
    return this.conversationService.getSingleConversation(conversationId, userId);
  }

  // --- Rota DELETE para excluir uma conversa ---
  @Delete('conversations/:id')
  @HttpCode(HttpStatus.OK)
  async deleteConversation(
    @Param('id') conversationId: string,
    @Query('userId') userId: string
  ) {
    // Não precisa de conversão para número
    if (!userId) {
      throw new BadRequestException('ID do usuário é necessário.');
    }

    try {
      return await this.conversationService.deleteConversation(conversationId, userId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error("Erro no controlador ao excluir conversa:", error.message);
      throw new BadRequestException(error.message || 'Erro interno do servidor ao excluir conversa.');
    }
  }
}