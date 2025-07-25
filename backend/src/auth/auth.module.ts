import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule, PassportModule.register({ defaultStrategy: 'google' })],
  providers: [
    AuthService,
    GoogleStrategy,
    {
      provide: 'GOOGLE_STRATEGY_OPTIONS',
      useFactory: (configService: ConfigService) => ({
        clientID: configService.get<string>('GOOGLE_CLIENT_ID_BACKEND'),
        clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET_BACKEND'),
        callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
        scope: ['email', 'profile'],
        passReqToCallback: true,
      }),
      inject: [ConfigService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
