import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'guigaralves@gmail.com';

  // Verifica se já existe o usuário
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Usuário já existe.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Teste@1234', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Guilherme',
      email,
      password: hashedPassword,
      isSubscriber: true,
    },
  });

  console.log('Usuário criado:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
