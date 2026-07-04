"use client";

import * as React from "react";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Theater, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const errorMap: Record<string, string> = {
  CredentialsSignin: "Email ou senha inválidos",
  default: "Erro ao fazer login. Tente novamente.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    urlError ? (errorMap[urlError] || errorMap.default) : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Use redirect: true (default) so NextAuth sends json:true to the server,
      // which responds with JSON instead of a 307 redirect.
      // This prevents fetch from following a 307 redirect to /dashboard as POST,
      // which would cause a 405 since the dashboard page only handles GET.
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirectTo: callbackUrl,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao fazer login. Tente novamente."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <Theater className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Teatro ERP
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Faça login para acessar o sistema
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  {...register("email")}
                  error={errors.email?.message}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  className="pl-10 pr-10"
                  {...register("password")}
                  error={errors.password?.message}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-400">
            Sistema de Gestão para Escolas de Teatro
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zinc-900 to-zinc-800 items-center justify-center p-12 dark:from-zinc-950 dark:to-zinc-900">
        <div className="max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Theater className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white">
            Gerencie sua Escola de Teatro
          </h2>
          <p className="text-lg text-zinc-300 leading-relaxed">
            Controle completo de alunos, professores, turmas, matrículas,
            finanças e muito mais em um só lugar.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { label: "Alunos", value: "Gestão Completa" },
              { label: "Financeiro", value: "Controle Total" },
              { label: "Relatórios", value: "Dados em Tempo Real" },
              { label: "Agenda", value: "Calendário Integrado" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-white/5 p-4 backdrop-blur-sm"
              >
                <p className="text-xs font-medium text-zinc-400">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
