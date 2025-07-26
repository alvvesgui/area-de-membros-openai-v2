// backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Mantenha o caminho correto

// REMOVA ESTA LINHA:
// import { User } from '@prisma/client'; // Remova esta linha. O tipo 'User' será inferido.

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // O tipo de retorno 'Promise<any>' ou deixe o TS inferir
  // Se precisar de tipagem forte, importe PrismaClient e use PrismaClient.User
  async createUser(data: { email: string; password: string; name?: string }) {
    return this.prisma.user.create({
      data,
    });
  }

  // O tipo de retorno 'Promise<any[]>' ou deixe o TS inferir
  async findAll() {
    return this.prisma.user.findMany();
  }

  // O tipo de retorno 'Promise<any | null>' ou deixe o TS inferir
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Se você tem o método findGoogleUser, adicione-o aqui também, sem o tipo User
  async findGoogleUser(profile: { email: string; googleId: string; name: string; picture: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          oauthId: profile.googleId,
        },
      });
    } else if (user && !user.oauthId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          oauthId: profile.googleId,
        },
      });
    }
    return user;
  }
}