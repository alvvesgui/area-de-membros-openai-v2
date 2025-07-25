import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  const email = 'teste@exemplo.com'; // Mude para o email que quiser
  const name = 'Usuário Teste'; // Mude para o nome que quiser
  const senha = '123456'; // Mude para a senha que quiser

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(senha, 10);

  // Cria o usuário
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      oauthId: null, // usuário local, sem login social
    },
  });

  console.log('Usuário criado:', user);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
