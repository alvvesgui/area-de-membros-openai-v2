// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aqui está a configuração de CORS para permitir requisições do seu front-end na Vercel.
  app.enableCors({
    origin: [
      'https://area-de-membros-openai-v2.vercel.app', // URL da sua aplicação front-end
      'https://area-de-membros-openai-v2.onrender.com' // URL da sua API no Render
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  const prismaService = app.get(PrismaService);
  await prismaService.$connect();
  app.enableShutdownHooks();

  const port = process.env.PORT || 3333;

  // A configuração '0.0.0.0' garante que o servidor esteja acessível publicamente.
  await app.listen(port, '0.0.0.0');

  console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();