// C:\Users\guiga\area-de-membros-v2\backend\create-admin-user.ts

import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs'); // CORREÇÃO: Usando 'require' para garantir a importação correta do bcryptjs
import * as readline from 'readline'; // Para ler entrada do usuário

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdminUser() {
  try {
    console.log('--- Criar Novo Usuário Administrador ---');

    const name = await prompt('Digite o nome do usuário: ');
    const email = await prompt('Digite o email do usuário: ');

    // Validação simples de e-mail
    if (!email.includes('@') || !email.includes('.')) {
      console.error('Erro: Email inválido.');
      rl.close();
      return;
    }

    const password = await prompt('Digite a senha para o usuário: ');

    // Validação simples de senha
    if (password.length < 6) {
      console.error('Erro: A senha deve ter pelo menos 6 caracteres.');
      rl.close();
      return;
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`Erro: Usuário com o email "${email}" já existe.`);
      rl.close();
      return;
    }

    // Hashear a senha - Agora usando 'bcrypt.hash' diretamente
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isSubscriber: true, // Define como assinante por padrão para usuários criados manualmente
      },
    });

    console.log('\n✅ Usuário criado com sucesso!');
    console.log('Detalhes do Usuário:');
    console.log(`ID: ${newUser.id}`);
    console.log(`Nome: ${newUser.name}`);
    console.log(`Email: ${newUser.email}`);
    console.log(`Assinante: ${newUser.isSubscriber}`);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdminUser();