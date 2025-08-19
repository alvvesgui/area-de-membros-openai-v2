// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  const prismaService = app.get(PrismaService);
  await prismaService.$connect();
  app.enableShutdownHooks();

  const port = process.env.PORT || 3333;

  // *** AQUI ESTÁ A CORREÇÃO ESSENCIAL ***
  // Ao adicionar '0.0.0.0', o backend aceitará conexões de outros dispositivos na sua rede.
  await app.listen(port, '0.0.0.0'); // <--- Linha corrigida!

  console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();