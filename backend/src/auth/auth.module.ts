// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'; // **Adicione esta linha**

// Importe seu PrismaModule. O caminho pode variar, ajuste se necessário.
// Ex: se prisma.module.ts estiver em `src/prisma/`, o caminho é `../prisma/prisma.module`
import { PrismaModule } from '../../prisma/prisma.module'; // **Adicione/Verifique esta linha**

// Se você usa o MailerService, adicione a importação do MailerModule
import { MailerModule } from '@nestjs-modules/mailer'; // **Adicione esta linha, se usar MailerService**

import { GoogleStrategy } from './google.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // **Adicione esta linha se tiver um AuthController**

// Se seu AuthService interage com usuários de outros módulos (ex: UsersService), importe aqui.
// import { UsersModule } from '../users/users.module'; // Descomente e adicione se precisar

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'google' }),
    PrismaModule, // **Inclua o PrismaModule aqui nos imports**

    // **Configuração do JWT Module: CRÍTICO para o JwtService**
    JwtModule.registerAsync({
      // `imports` é necessário para que o `ConfigService` possa ser injetado no `useFactory`
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' }, // Opcional: tempo de expiração do token (ex: 60 minutos)
      }),
      inject: [ConfigService], // Diz ao NestJS para injetar o ConfigService
    }),

    // **Configuração do MailerModule (se você usa MailerService no AuthService)**
    // Descomente e ajuste conforme suas credenciais e configurações de e-mail.
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<boolean>('MAIL_SECURE'), // Geralmente true para portas 465
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"Seu Nome/App" <noreply@seuapp.com>', // Remetente padrão
        },
        // Se usar templates de e-mail (Handlebars, Pug, etc.), descomente e configure:
        // template: {
        //   dir: process.cwd() + '/templates/', // Exemplo de caminho para templates
        //   options: {
        //     strict: true,
        //   },
        // },
      }),
      inject: [ConfigService],
    }),

    // **Se seu AuthService depende de UsersModule, descomente:**
    // UsersModule,
  ],
  controllers: [
    AuthController, // **Adicione seu AuthController aqui**
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    // Removido: 'GOOGLE_STRATEGY_OPTIONS' - Não é mais necessário aqui.
  ],
  exports: [AuthService, JwtModule], // **Exporte JwtModule se precisar de JwtService em outros módulos**
})
export class AuthModule {}