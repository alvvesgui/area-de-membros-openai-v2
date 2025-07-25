// backend/src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth') // Este é o prefixo da rota: /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login') // Rota para login manual: /auth/login
  async login(@Body() loginDto: any) { // Idealmente, use um DTO para tipagem segura (e.g., LoginDto)
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    // AuthService.validateUser já lança UnauthorizedException, então não precisamos de um if aqui.
    return this.authService.login(user); // Gera e retorna o JWT
  }

  // Rota para iniciar o fluxo de autenticação Google (via redirecionamento, geralmente é um GET)
  // Esta rota é para o fluxo tradicional de Passport, onde o NestJS redireciona para o Google.
  // SEU FRONTEND NÃO USA ESTA ROTA para o login do Google com @react-oauth/google.
  // Ela está aqui por completude ou para outros fluxos.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Redireciona para a tela de consentimento do Google.
    // O req.user será preenchido após o callback.
  }

  // Rota de callback do Google para o fluxo de redirecionamento (via GET)
  // Esta URL DEVE ser a mesma que você configurou em GOOGLE_CALLBACK_URL no seu .env do backend
  // e em "URIs de redirecionamento autorizados" no Google Cloud Console.
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    // req.user contém os dados do usuário após a autenticação bem-sucedida pelo GoogleStrategy.
    // Agora, faça o login no seu sistema e gere o JWT.
    return this.authService.login(req.user); // Usa o método de login para gerar o token
  }

  // --- NOVA ROTA PARA O LOGIN COM GOOGLE DO FRONTEND ---
  // Esta rota é a que seu frontend está chamando via POST com o idToken.
  @Post('login/google') // Endpoint: /auth/login/google
  async googleLoginFromFrontend(@Body('idToken') idToken: string) {
    // Chama o AuthService para validar o idToken do Google
    // e autenticar/registrar o usuário no seu banco de dados.
    return this.authService.validateGoogleTokenAndLogin(idToken);
  }

  @Post('signup') // Rota para registro: /auth/signup
  async signup(@Body() signupDto: any) { // Idealmente, use um DTO para tipagem segura (e.g., SignupDto)
    return this.authService.signup(signupDto);
  }

  // --- NOVAS ROTAS PARA RECUPERAÇÃO DE SENHA ---

  @Post('forgot-password') // Endpoint: /auth/forgot-password
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email é obrigatório.');
    }
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password') // Endpoint: /auth/reset-password
  async resetPassword(
    @Body('token') token: string,
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!token || !email || !newPassword) {
      throw new BadRequestException('Token, email e nova senha são obrigatórios.');
    }
    // TODO: Adicione validações de senha forte aqui se desejar (ex: mínimo de caracteres, letras/números)
    return this.authService.resetPassword(token, email, newPassword);
  }
}