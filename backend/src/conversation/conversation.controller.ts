// backend/src/conversation/conversation.controller.ts

import { Controller, Get, Post, Body, /* REMOVER UseGuards temporariamente */ Request } from '@nestjs/common';
import { ConversationService } from './conversation.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Comentar esta linha também

@Controller('chat')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  // @UseGuards(JwtAuthGuard) // <-- COMENTE ESTA LINHA
  @Get('history')
  async getChatHistory(@Request() req) {
    // ...
    // Para este teste, se req.user.id for null, você pode usar um ID fixo para debug
    // Ex: const userId = req.user?.id || 1; // Use um ID de usuário que exista no seu banco
    const userId = req.user ? req.user.id : 1; // Ou um ID fixo para teste sem login
    return this.conversationService.getChatHistory(userId);
  }

  // @UseGuards(JwtAuthGuard) // <-- COMENTE ESTA LINHA
  @Post('history')
  async saveChatHistory(@Request() req, @Body() body: { question: string; answer?: string }) {
    // Para este teste, se req.user.id for null, você pode usar um ID fixo para debug
    // Ex: const userId = req.user?.id || 1;
    const userId = req.user ? req.user.id : 1; // Ou um ID fixo para teste sem login
    return this.conversationService.saveChatHistory(userId, body.question, body.answer);
  }
}