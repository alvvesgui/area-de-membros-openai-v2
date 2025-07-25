// vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // Adicione outras variáveis VITE_ que você usar aqui, se houver
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}