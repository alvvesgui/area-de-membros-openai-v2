// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Adicione esta configuração CORS ---
  app.enableCors({
  origin: '*', // Permite qualquer origem - APENAS PARA TESTES!
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
 });
  // --- Fim da configuração CORS ---

  const port = process.env.PORT || 3333; // Usa a variável de ambiente PORT ou 3333 como padrão
  await app.listen(port);
  console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();