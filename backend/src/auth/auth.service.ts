// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID_BACKEND')!,
    );
  }

  // --- LOGIN POR E-MAIL E SENHA ---
  async validateUser(email: string, password: string) {
    console.log('--- Início da Tentativa de Login (Email/Senha) ---');
    console.log('Email recebido:', email);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('Erro: Usuário não encontrado para o email:', email);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.password) {
      console.log('Erro: Usuário encontrado, mas sem senha cadastrada:', user.email);
      throw new UnauthorizedException('Credenciais inválidas. Usuário cadastrado via Google.');
    }

    console.log('Usuário encontrado:', user.email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Resultado da comparação de senha (bcrypt.compare):', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Erro: Senha inválida para o usuário:', user.email);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log('Login bem-sucedido para o usuário:', user.email);
    return user;
  }

  // --- MÉTODO GENÉRICO PARA GERAR O TOKEN DE ACESSO (JWT) ---
  async login(user: any) {
    const payload = { sub: user.id, email: user.email, isSubscriber: user.isSubscriber };
    console.log('Gerando token JWT para payload:', payload);
    return {
      access_token: this.jwtService.sign(payload),
      isSubscriber: user.isSubscriber,
    };
  }

  // --- MÉTODO que valida idToken do Google do frontend ---
  async validateGoogleTokenAndLogin(idToken: string) {
    console.log('--- Início validateGoogleTokenAndLogin (com idToken do frontend) ---');
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID_BACKEND')!,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email || !payload.email_verified || !payload.sub) {
        console.log('Erro: Payload do Google token inválido, incompleto ou email não verificado.');
        throw new UnauthorizedException('Token inválido ou email não verificado.');
      }

      console.log('Payload do Google token verificado:', payload.email);

      const user = await this.findGoogleUser({
        email: payload.email,
        name: payload.name || payload.email,
        picture: payload.picture,
        googleId: payload.sub,
      });

      return this.login(user);
    } catch (error) {
      console.error('Erro na verificação do ID Token do Google ou usuário não autorizado:', error.message);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Falha na autenticação Google');
    }
  }

  // --- MÉTODO para ENCONTRAR (e NÃO MAIS CRIAR AUTOMATICAMENTE) o usuário Google ---
  async findGoogleUser(profile: { email: string; name: string; picture?: string; googleId: string }) {
    console.log('--- Início findGoogleUser (APENAS ENCONTRA, NÃO CRIA) ---');
    console.log('Tentando encontrar usuário Google com email:', profile.email);

    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      console.log(`ERRO: Usuário Google com email "${profile.email}" NÃO encontrado no banco de dados. Acesso negado.`);
      throw new UnauthorizedException('Acesso negado. Seu email não está cadastrado como assinante.');
    } else {
      console.log('Usuário Google encontrado no banco de dados:', user.email);
    }
    
    return user;
  }

  // --- CADASTRO MANUAL (Para você cadastrar os assinantes) ---
  async signup(data: {
    email: string;
    password: string;
    name?: string;
    isSubscriber?: boolean;
  }) {
    console.log('--- Início do Cadastro (signup) ---');
    console.log('Dados de cadastro recebidos:', data.email);
    return this.createUser(data);
  }

  // Método privado para criar o usuário no banco de dados
  private async createUser(data: {
    email: string;
    password: string;
    name?: string;
    isSubscriber?: boolean;
  }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        console.log('Erro: E-mail já cadastrado:', data.email);
        throw new UnauthorizedException('E-mail já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log('Senha criptografada (hash):', hashedPassword);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || '',
        isSubscriber: data.isSubscriber ?? true,
      },
    });
    console.log('Usuário cadastrado com sucesso:', user.email);
    return user;
  }

  // --- NOVOS MÉTODOS PARA RECUPERAÇÃO DE SENHA ---
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log(`Tentativa de redefinição para email não encontrado: ${email}`);
      return { message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' };
    }

    if (!user.password) {
      console.log(`Usuário Google sem senha manual tentou redefinir: ${email}`);
      return { message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' };
    }

    const resetToken = this.jwtService.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '15m' }
    );
    
    const frontendResetUrl = this.configService.get('FRONTEND_RESET_PASSWORD_URL');
    const resetLink = `${frontendResetUrl}?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Redefinição de Senha - Sua Área de Assinantes',
        template: 'reset-password',
        context: {
          name: user.name || user.email,
          resetUrl: resetLink,
          expiresIn: 15,
          year: new Date().getFullYear(),
        },
      });
      console.log(`Email de redefinição enviado para: ${user.email}`);
      return { message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' };
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error.message);
      return { message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' };
    }
  }

  async resetPassword(token: string, email: string, newPassword: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(token) as { userId: string, email: string };

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId, email: email },
      });

      if (!user || payload.email !== email) {
        throw new BadRequestException('Token inválido ou email não corresponde.');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      console.log(`Senha redefinida com sucesso para o usuário: ${user.email}`);
      return { message: 'Senha redefinida com sucesso!' };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.error('Erro de redefinição: Token expirado.');
        throw new UnauthorizedException('O link de redefinição expirou. Por favor, solicite um novo.');
      }
      if (error.name === 'JsonWebTokenError') {
        console.error('Erro de redefinição: Token JWT inválido.', error.message);
        throw new UnauthorizedException('Token de redefinição inválido.');
      }
      console.error('Erro geral ao redefinir senha:', error.message);
      throw error;
    }
  }
}