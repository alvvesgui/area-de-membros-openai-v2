// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declaração para evitar que o Prisma Client seja instanciado múltiplas vezes em desenvolvimento
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento, use uma instância global para evitar hot-reloads criarem novas conexões
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;