// backend/src/conversation/conversation.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Ajuste o caminho se necessário

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  // MUDANÇA: Este método vai ser o novo `saveChatHistory`
  // Ele salva uma nova entrada de conversa.
  async saveChatHistory(userId: number, question: string, answer?: string) { // 'answer' pode ser opcional
    return this.prisma.conversation.create({ // Usando 'conversation' como seu modelo
      data: {
        userId,
        question,
        answer,
        // createdAt será adicionado automaticamente se você tiver @default(now()) no Prisma
      },
    });
  }

  // MUDANÇA: Este método vai ser o novo `getChatHistory`
  // Ele obtém todas as conversas de um usuário.
  async getChatHistory(userId: number) {
    return this.prisma.conversation.findMany({ // Usando 'conversation' como seu modelo
      where: { userId },
      orderBy: { createdAt: 'asc' }, // Ordena por data de criação
    });
  }
}