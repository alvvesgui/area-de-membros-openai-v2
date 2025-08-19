// backend/src/conversation/conversation.controller.ts
import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus, BadRequestException, Delete, NotFoundException } from '@nestjs/common';
import { ConversationService, ChatRequest } from './conversation.service'; // Importa o serviço e a interface

@Controller('api') // Define o prefixo base para todas as rotas neste controlador (ex: /api/chat)
export class ConversationController { // Mantenha o nome do seu controlador existente
  constructor(private readonly conversationService: ConversationService) {}

  // --- Rota POST para o chat ---
  @Post('chat') // Será acessado como POST /api/chat
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard) // Se estiver usando autenticação (JWT, etc.), adicione o @UseGuards aqui
  async handleChat(
    @Body() body: { messages: any[]; conversationId?: string | null; userId: number } // Tipo do corpo da requisição
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
  @Get('conversations') // Será acessado como GET /api/conversations?userId=123
  // @UseGuards(JwtAuthGuard) // Proteja esta rota com autenticação
  async getConversations(
    @Query('userId') userId: string
  ) {
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      throw new BadRequestException('ID do usuário inválido.');
    }
    return this.conversationService.getAllConversations(parsedUserId);
  }

  // --- Rota GET para obter uma conversa específica ---
  @Get('conversations/:id') // Será acessado como GET /api/conversations/:id_da_conversa?userId=123
  // @UseGuards(JwtAuthGuard) // Proteja esta rota com autenticação
  async getConversationById(
    @Param('id') conversationId: string,
    @Query('userId') userId: string
  ) {
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
        throw new BadRequestException('ID do usuário é necessário e deve ser um número.');
    }
    return this.conversationService.getSingleConversation(conversationId, parsedUserId);
  }

  // --- NOVO ENDPOINT: Excluir uma conversa ---
  @Delete('conversations/:id') // Endpoint DELETE /api/conversations/:id
  @HttpCode(HttpStatus.OK) // Retorna 200 OK em caso de sucesso
  // @UseGuards(JwtAuthGuard) // MUITO IMPORTANTE: Proteger esta rota com autenticação!
  async deleteConversation(
    @Param('id') conversationId: string,
    @Query('userId') userId: string // OU @GetUser('id') userId: number se usar autenticação
  ) {
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      throw new BadRequestException('ID do usuário é necessário e deve ser um número.');
    }

    try {
      return await this.conversationService.deleteConversation(conversationId, parsedUserId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error; // Re-lança as exceções específicas do NestJS
      }
      console.error("Erro no controlador ao excluir conversa:", error.message);
      throw new BadRequestException(error.message || 'Erro interno do servidor ao excluir conversa.');
    }
  }
}