const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Importe sua conexão com o banco de dados e o modelo de usuário aqui
// Exemplo: const { User } = require('../db'); 

// Rota de Teste para verificar se o servidor está funcionando corretamente
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'A rota de teste está funcionando!' });
});

// Rota para solicitar o link de redefinição de senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    user.reset_token = resetToken;
    user.reset_token_expiry = resetTokenExpiry;
    await user.save(); 

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Redefinição de Senha - area-de-membros-openai',
      html: `
        <h1>Olá!</h1>
        <p>Recebemos uma solicitação para redefinir a sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Se você não solicitou essa mudança, ignore este e-mail.</p>
      `,
    });

    return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.' });
  } catch (error) {
    console.error('Erro na rota forgot-password:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota para redefinir a senha com o token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token e senha são obrigatórios.' });
    }

    const user = await User.findOne({ reset_token: token });

    if (!user || user.reset_token_expiry < Date.now()) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro na rota reset-password:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;