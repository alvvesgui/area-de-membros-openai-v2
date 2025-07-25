// backend/src/auth/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  // O logger precisa ser instanciado APÓS a chamada do super() OU ser estático
  // Para ser usado no constructor, a forma mais fácil é passar a instância do Logger
  // Ou, para simplificar e garantir que não haja erro de 'this' antes do super,
  // podemos fazer a inicialização do logger de forma diferente, ou mover os logs.
  // No seu caso, o problema é o `this.logger` antes do `super()`.

  // Vamos reestruturar o construtor para chamar super() primeiro.
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    // 1. Chame super() primeiro.
    // É importante passar as opções aqui para o construtor da Strategy base.
    // Aqui usamos uma função para garantir que as variáveis sejam lidas
    // antes de passar para o super().
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID_BACKEND');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET_BACKEND');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    // Validação e logs que você tinha, mas agora no lugar certo
    // Vamos usar um logger global ou apenas console.log aqui para evitar o problema do 'this'
    const logger = new Logger(GoogleStrategy.name); // Instancia o Logger aqui dentro do construtor, ou use Logger diretamente

    logger.log(`[GoogleStrategy] Tentando carregar variáveis de ambiente...`);
    logger.log(`[GoogleStrategy] GOOGLE_CLIENT_ID_BACKEND: ${clientID}`);
    logger.log(`[GoogleStrategy] GOOGLE_CLIENT_SECRET_BACKEND: ${clientSecret ? '*****' : 'Não definido'}`);
    logger.log(`[GoogleStrategy] GOOGLE_CALLBACK_URL: ${callbackURL}`);

    if (!clientID || !clientSecret || !callbackURL) {
      logger.error('ERRO CRÍTICO: Variáveis de ambiente do Google OAuth NÃO DEFINIDAS!');
      logger.error(`Verifique: GOOGLE_CLIENT_ID_BACKEND, GOOGLE_CLIENT_SECRET_BACKEND, GOOGLE_CALLBACK_URL.`);
      throw new Error('Google OAuth environment variables are missing or undefined. Cannot start application.');
    }

    // 2. Agora chame super() com as opções
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  // O logger para outros métodos pode ser declarado normalmente.
  private readonly logger = new Logger(GoogleStrategy.name);

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const userProfile = {
      email: profile.emails[0].value,
      name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
      picture: profile.photos[0].value,
      googleId: profile.id,
    };

    try {
      // **Correção para 'Property 'find' does not exist on type 'AuthService'.**
      // Seu AuthService provavelmente tem um método chamado 'findOrCreateGoogleUser' ou similar
      // que você tinha antes. Precisa usar o nome correto do método que você tem no AuthService.
      // Vou colocar o 'findGoogleUser' que você usou anteriormente.
      const user = await this.authService.findGoogleUser(userProfile);
      done(null, user);
    } catch (error) {
      this.logger.error(`[GoogleStrategy] Erro na validação do usuário: ${error.message}`);
      done(error, false);
    }
  }
}