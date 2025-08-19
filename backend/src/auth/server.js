const express = require('express');
const app = express();
const authRoutes = require('./routes/auth'); // Importa o arquivo de rotas

// Rota de teste
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'A rota de teste está funcionando diretamente no server.js!' });
});

app.listen(3333, () => {
  console.log('Backend is running on: http://127.0.0.1:3333');
});

app.listen(3333, () => {
  console.log('Backend is running on: http://127.0.0.1:3333');
});