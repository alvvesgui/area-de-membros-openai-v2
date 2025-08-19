// backend/src/conversation/conversation.module.ts
import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { PrismaModule } from '../../prisma/prisma.module'; // Caminho para o PrismaModule

@Module({
  imports: [PrismaModule], // Importa o PrismaModule para que o serviço possa usá-lo
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService], // Exporta o serviço caso outros módulos precisem dele
})
export class ConversationModule {}