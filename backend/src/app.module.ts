// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // IMPORTA ConfigModule
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // adiciona isso aqui, global para toda a aplicação
    UsersModule,
    AuthModule,
    PrismaModule,
    ConversationModule,
  ],
})
export class AppModule {}
