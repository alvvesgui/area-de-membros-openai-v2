// frontend/next.config.js (ou .mjs)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESTA É A SEÇÃO CRUCIAL PARA O REDIRECIONAMENTO DE ROTAS DO BACKEND
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Redireciona tudo que começa com /api para o backend (ex: /api/chat, /api/conversations)
        destination: 'http://localhost:3333/api/:path*',
      },
      {
        source: '/auth/:path*', // Redireciona tudo que começa com /auth para o backend (ex: /auth/login, /auth/google-login)
        destination: 'http://localhost:3333/auth/:path*',
      },
      // Se houver outras rotas do backend que o frontend chama sem prefixo '/api' ou '/auth',
      // você precisará adicionar mais regras de 'source'/'destination' aqui.
    ];
  },
  // Configuração para carregamento de imagens externas (necessário para imagens de perfil do Google, por exemplo)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
      },
      // Adicione outros domínios de imagem remota aqui se for usar
    ],
  },
  // Outras configurações do Next.js, se você tiver
  // Por exemplo, se estiver usando o App Router:
  // experimental: {
  //   appDir: true,
  // },
};

export default nextConfig;