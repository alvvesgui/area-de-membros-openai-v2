// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConversationModule } from './conversation/conversation.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importe o MailerModule e o HandlebarsAdapter
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    // O ConfigModule deve ser o primeiro
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Adicione a configuração do MailerModule aqui
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          secure: false, // Use false para TLS (porta 587)
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('EMAIL_USER')}>`,
        },
        template: {
          // Certifique-se de que este caminho está correto para seus templates de e-mail
          dir: process.cwd() + '/templates/emails', 
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    PrismaModule,
    ConversationModule,
    AuthModule,
  ],
})
export class AppModule {}