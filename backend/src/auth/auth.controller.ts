// backend/src/auth/auth.controller.ts

import { Controller, Post, Body, UseGuards, Get, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Este é o fluxo de redirecionamento, não usado no seu frontend atual.
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    return this.authService.login(req.user);
  }

  @Post('login/google')
  async googleLoginFromFrontend(@Body('idToken') idToken: string) {
    return this.authService.validateGoogleTokenAndLogin(idToken);
  }

  @Post('signup')
  async signup(@Body() signupDto: any) {
    return this.authService.signup(signupDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email é obrigatório.');
    }
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!token || !email || !newPassword) {
      throw new BadRequestException('Token, email e nova senha são obrigatórios.');
    }
    return this.authService.resetPassword(token, email, newPassword);
  }
}