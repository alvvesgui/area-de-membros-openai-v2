// src/app.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, ConversationModule],
  
})
export class AppModule {}