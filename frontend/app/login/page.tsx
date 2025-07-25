// C:\Users\guiga\area-de-membros-v2\frontend\app\login\page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, LogIn, Chrome, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// IMPORTAÇÕES DO GOOGLE OAUTH
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// **ESTE É O LOCAL CORRETO PARA ESSAS VARIÁVEIS**
// Variável de ambiente para o Google Client ID (para frontend)
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Variável de ambiente para a URL base do backend
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const showAlert = (message: string) => {
    alert(message);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      showAlert("Por favor, preencha o campo de e-mail.");
      return;
    }
    if (!password.trim()) {
      showAlert("Por favor, preencha o campo de senha.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Credenciais inválidas. Tente novamente.");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("is_subscriber", data.isSubscriber);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÕES DE LOGIN DO GOOGLE ---
  // Função que será chamada quando o login com Google for bem-sucedido
  const onGoogleLoginSuccess = async (credentialResponse: any) => {
    console.log('Login Google SUCESSO:', credentialResponse);
    if (!credentialResponse.credential) {
      setError("Token de credencial do Google não recebido.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Envia o idToken para o seu backend
      const response = await fetch(`${BACKEND_BASE_URL}/auth/login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: credentialResponse.credential }), // 'credential' é o idToken
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer login com Google no backend.');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('is_subscriber', data.isSubscriber);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com falhas no login do Google
  const onGoogleLoginError = () => {
    console.error('Login Google FALHOU');
    setError('Login com Google falhou. Tente novamente.');
  };

  // --- Renderização do Componente ---
  return (
    // IMPORTANTE: Envolver todo o componente com GoogleOAuthProvider
    // Ele precisa do clientId para funcionar.
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}> 
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:flex-row md:justify-between md:p-8">
        {/* Login Card Section */}
        <div className="flex w-full items-center justify-center md:w-1/2">
          <Card className="w-full max-w-md p-6 shadow-lg md:p-8">
            <CardHeader className="items-center space-y-4">
              <Image
                src="/images/logo.png"
                alt="Área de Membros V2 Logo"
                width={200}
                height={200}
                className="mb-4"
              />
              <CardTitle className="text-center space-y-1">Transforme sua experiência com IA!</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Faça login para acessar seu painel inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exibição de erro do backend */}
              {error && (
                <div className="text-red-500 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail:</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha:</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      className="pl-10"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <LogIn className="mr-2 h-4 w-4" /> {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              {/* Separator "ou" - Centralized */}
              <div className="relative flex w-full items-center justify-center">
                <Separator className="flex-grow" />
                <span className="mx-4 text-sm text-muted-foreground">ou</span>
                <Separator className="flex-grow" />
              </div>

              {/* SUBSTITUIÇÃO AQUI: Usando GoogleLogin diretamente */}
              {GOOGLE_CLIENT_ID ? ( // Renderiza apenas se o Client ID estiver configurado
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={onGoogleLoginSuccess}
                    onError={onGoogleLoginError}
                    width="100%" // Ajusta a largura do botão
                    text="continue_with" // Opcional: Altera o texto do botão
                    theme="filled_blue" // Opcional: Altera o tema
                    // Outras props do GoogleLogin podem ser adicionadas aqui
                    // Se precisar de um estilo customizado, o ideal é usar `render` prop
                    // mas para começar, o botão padrão já ajuda.
                  />
                </div>
              ) : (
                <Button variant="outline" className="w-full bg-transparent" disabled={true}>
                  <Chrome className="mr-2 h-4 w-4" /> Login com Google (ID não configurado)
                </Button>
              )}


              {/* Esqueceu a Senha? Modal Trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="w-full text-sm text-primary hover:underline">
                    Esqueceu a senha?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Redefinir Senha</DialogTitle>
                    <DialogDescription>
                      Digite seu e-mail abaixo para receber um link de redefinição de senha.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reset-email">E-mail:</Label>
                      <Input id="reset-email" type="email" placeholder="seu@email.com" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <KeyRound className="mr-2 h-4 w-4" /> Enviar Link
                  </Button>
                </DialogContent>
              </Dialog>

              {/* Test Button for Dashboard */}
              <div className="mt-6 text-center">
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Section */}
        <div className="hidden w-full items-center justify-center p-8 md:flex md:w-1/2">
          <Image
            src="/images/robot-human.png"
            alt="Human and robot conversing"
            width={500}
            height={500}
            className="h-auto max-w-full rounded-lg object-cover shadow-xl"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}