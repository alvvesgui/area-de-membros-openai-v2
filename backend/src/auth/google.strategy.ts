// backend/src/auth/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService, // Injetando ConfigService
  ) {
    // Obtenha os valores das variáveis de ambiente ANTES de chamar super().
    const clientID = configService.get('GOOGLE_CLIENT_ID_BACKEND')!;
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET_BACKEND')!;
    const callbackURL = configService.get('GOOGLE_CALLBACK_URL')!;

    super({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  // Este método 'validate' é chamado pelo Passport após a autenticação bem-sucedida do Google.
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
      googleId: profile.id, // O ID único do usuário no Google
    };

    try {
      // CORREÇÃO AQUI: Chamando findGoogleUser (o método que APENAS ENCONTRA o usuário)
      const user = await this.authService.findGoogleUser(userProfile);
      done(null, user); // Passa o objeto 'user' diretamente para 'done'
    } catch (error) {
      // Em caso de erro (incluindo UnauthorizedException se o usuário não for encontrado),
      // informa ao Passport que a autenticação falhou.
      done(error, false);
    }
  }
}