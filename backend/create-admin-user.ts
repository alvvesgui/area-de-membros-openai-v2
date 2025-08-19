import { PrismaClient, Prisma } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'guigaralves@gmail.com';
  const password = 'Teste@1234';

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`Usuário com o email "${email}" já existe. Pulando a criação.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin',
        isSubscriber: true,
      },
    });

    console.log(`✅ Usuário admin criado com sucesso! Email: ${email}`);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      console.log('Tabela de usuários não encontrada. Isso é esperado no primeiro deploy. Continuando...');
    } else {
      console.error('❌ Erro ao criar usuário:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});