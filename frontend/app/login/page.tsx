"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, LogIn, Chrome, KeyRound } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const showAlert = (message: string) => alert(message);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return showAlert("Por favor, preencha o campo de e-mail.");
    if (!password.trim()) return showAlert("Por favor, preencha o campo de senha.");

    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Credenciais inválidas. Tente novamente.");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("is_subscriber", data.isSubscriber);
      localStorage.setItem("user_id", data.userId); // ADIÇÃO: Salva o ID do usuário
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido durante o login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Token de credencial do Google não recebido.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/auth/login/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer login com Google no backend.");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("is_subscriber", data.isSubscriber);
      localStorage.setItem("user_id", data.userId); // ADIÇÃO: Salva o ID do usuário
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido no login com Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLoginError = () => {
    console.error("Login Google FALHOU");
    setError("Login com Google falhou. Tente novamente.");
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage("Por favor, preencha o campo de e-mail.");
      return;
    }
    setIsResetting(true);
    setResetMessage("");
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Trata a resposta de erro, que contém a mensagem na propriedade 'message'
        throw new Error(data.message || "Ocorreu um erro desconhecido.");
      }

      // Se a resposta for OK, exibe a mensagem de sucesso
      setResetMessage("E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.");
      setIsDialogOpen(true); // Mantém o modal aberto para mostrar a mensagem

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setResetMessage(errorMessage);
      console.error("Erro ao enviar e-mail de redefinição:", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen w-full bg-white md:flex md:h-screen md:overflow-hidden">
        {/* Layout para Mobile (coluna única) */}
        <div className="flex min-h-screen flex-col md:hidden">
          <div className="relative flex h-[35vh] w-full flex-col bg-black text-white">
            <div className="z-10 flex items-center justify-start px-4 py-3">
              <Image src="/images/LOGO_LEADRIX.png" alt="Logo" width={100} height={30} className="h-auto w-24" priority />
            </div>
            <div className="relative flex-1">

              <Image
                src="/images/imagefront.png"
                alt="Pessoa interagindo com IA em ambiente futurista e tecnológico"
                fill
                sizes="(max-width: 768px) 100vw, 33vw" // Otimização para mobile
                className="object-cover opacity-90"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-white px-4 py-6">
            <div className="mx-auto max-w-sm">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="space-y-2 p-0">
                  <CardTitle className="text-xl font-semibold text-gray-900">Acesse sua conta</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Entre com seu e-mail e senha ou continue com o Google
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-6 space-y-5 p-0">
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleLogin} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-sm text-gray-800">
                        E-mail
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          className="h-12 rounded-md border-gray-200 bg-white pl-10 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-sm text-gray-800">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          className="h-12 rounded-md border-gray-200 bg-white pl-10 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="group mt-2 h-12 w-full translate-y-0 rounded-md bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-600 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-0 disabled:opacity-70"
                    >
                      <LogIn className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-500">ou</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  {GOOGLE_CLIENT_ID ? (
                    <div className="w-full">
                      <GoogleLogin
                        onSuccess={onGoogleLoginSuccess}
                        onError={onGoogleLoginError}
                        width="100%"
                        text="continue_with"
                        theme="filled_blue"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-12 w-full border-gray-200 bg-white text-gray-900 transition-all duration-200 hover:scale-[1.01] hover:bg-gray-50"
                      disabled
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Login com Google (ID não configurado)
                    </Button>
                  )}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="mx-auto block w-full text-center text-sm font-medium text-indigo-600 hover:text-violet-600 hover:underline"
                      >
                        Esqueceu a senha?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Redefinir Senha</DialogTitle>
                        <DialogDescription>
                          Digite seu e-mail abaixo para receber um link de redefinição de senha.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="reset-email">E-mail</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="h-11"
                          />
                        </div>
                        {resetMessage && (
                          <p
                            className={`text-center text-sm ${
                              resetMessage.includes("sucesso") ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {resetMessage}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleForgotPassword}
                        className="h-11 w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white transition-all duration-200 hover:scale-[1.01]"
                        disabled={isResetting}
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        {isResetting ? "Enviando..." : "Enviar Link"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                  <div className="h-16" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Layout para Desktop (duas colunas) */}
        <div className="hidden md:flex md:h-full md:w-full">
          {/* Coluna Esquerda - Desktop (fundo branco) */}
          <aside className="relative flex w-1/2 flex-col bg-white text-gray-800">
            <div className="z-10 flex h-full w-full flex-col">
              <div className="z-20 px-10 py-5">
                <Image src="/images/logo.png" alt="Logo" width={160} height={48} className="h-auto w-40" priority />
              </div>
              <div className="relative flex-1">
                {/* === MUDANÇA AQUI: IMAGEM PARA DESKTOP === */}
                <Image
                  src="/images/imagefront.png"
                  alt="Pessoa interagindo com IA em ambiente futurista e tecnológico"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw" // Otimização para desktop
                  className="object-cover opacity-90"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-200 via-white/20 to-transparent" />
                <div className="pointer-events-none absolute bottom-6 left-10 right-10">
                  <h2 className="text-2xl font-semibold tracking-tight text-gray-800/90">
                    Tecnologia que potencializa sua jornada com IA
                  </h2>
                </div>
              </div>
            </div>
          </aside>

          {/* Coluna Direita - Desktop */}
          <main className="flex w-1/2 items-center justify-center bg-white">
            <div className="mx-auto w-full max-w-md">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="space-y-2 p-0">
                  <CardTitle className="text-2xl font-semibold text-gray-900">Acesse sua conta</CardTitle>
                  <CardDescription className="text-base text-gray-500">
                    Entre com seu e-mail e senha ou continue com o Google
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-6 space-y-5 p-0">
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleLogin} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-desktop" className="text-sm text-gray-800">
                        E-mail
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email-desktop"
                          type="email"
                          placeholder="seu@email.com"
                          className="h-11 rounded-md border-gray-200 bg-white pl-10 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password-desktop" className="text-sm text-gray-800">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password-desktop"
                          type="password"
                          placeholder="********"
                          className="h-11 rounded-md border-gray-200 bg-white pl-10 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="group mt-2 h-11 w-full translate-y-0 rounded-md bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-600 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-0 disabled:opacity-70"
                    >
                      <LogIn className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-500">ou</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  {GOOGLE_CLIENT_ID ? (
                    <div className="w-full">
                      <GoogleLogin
                        onSuccess={onGoogleLoginSuccess}
                        onError={onGoogleLoginError}
                        width="100%"
                        text="continue_with"
                        theme="filled_blue"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-11 w-full border-gray-200 bg-white text-gray-900 transition-all duration-200 hover:scale-[1.01] hover:bg-gray-50"
                      disabled
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Login com Google (ID não configurado)
                    </Button>
                  )}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="mx-auto block w-full text-center text-sm font-medium text-indigo-600 hover:text-violet-600 hover:underline"
                      >
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
                          <Label htmlFor="reset-email-desktop">E-mail</Label>
                          <Input
                            id="reset-email-desktop"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="h-11"
                          />
                        </div>
                        {resetMessage && (
                          <p
                            className={`text-center text-sm ${
                              resetMessage.includes("sucesso") ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {resetMessage}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleForgotPassword}
                        className="h-11 w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white transition-all duration-200 hover:scale-[1.01]"
                        disabled={isResetting}
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        {isResetting ? "Enviando..." : "Enviar Link"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}