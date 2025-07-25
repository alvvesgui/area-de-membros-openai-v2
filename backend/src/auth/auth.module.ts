// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer'; // <--- NOVO IMPORT
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'; // <--- NOVO IMPORT

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    // --- NOVO BLOCO: Configuração do MailerModule ---
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Precisa importar ConfigModule para acessar variáveis de ambiente
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          port: parseInt(configService.get('EMAIL_PORT')!, 10), // Converte a porta para número
          secure: configService.get('EMAIL_SECURE') === 'true', // Converte string 'true'/'false' para boolean
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"${configService.get('EMAIL_FROM_NAME')}" <${configService.get('EMAIL_USER')}>`,
        },
        template: {
          dir: process.cwd() + '/src/templates', // Caminho para seus templates de e-mail (criaremos essa pasta!)
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService], // Injete ConfigService aqui também
    }),
    // --- Fim do NOVO BLOCO ---
  ],
  providers: [AuthService, PrismaService, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}