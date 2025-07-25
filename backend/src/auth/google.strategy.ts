import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    configService: ConfigService,
  ) {
    // NÃO usa configService.get no construtor direto
    // Faz assim:
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID_BACKEND')!;
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET_BACKEND')!;
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL')!;

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest); // garante o tipo certo
  }

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
      const user = await this.authService.findGoogleUser(userProfile);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
