"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  GraduationCap,
  Phone,
  Mail,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPhone } from "@/lib/utils";

export default function TeacherDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [teacher, setTeacher] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const id = typeof params.id === "string" ? params.id : "";
    fetch(`/api/teachers/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTeacher(json.data);
        else setError(json.error || "Professor não encontrado");
      })
      .catch(() => setError("Erro ao carregar professor"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error || "Professor não encontrado"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{teacher.name}</h1>
            <p className="text-sm text-zinc-500">{teacher.specialty || "Sem especialidade"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={teacher.status === "ACTIVE" ? "success" : "secondary"}>
            {teacher.status === "ACTIVE" ? "Ativo" : "Inativo"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => router.push(`/teachers/${teacher.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-5 w-5 text-zinc-500" />Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">CPF</p>
                <p className="text-sm font-medium">{teacher.cpf}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Especialidade</p>
                <p className="text-sm font-medium">{teacher.specialty || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-5 w-5 text-zinc-500" />Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">Telefone</p>
                <p className="text-sm font-medium">{teacher.phone ? formatPhone(teacher.phone) : "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">E-mail</p>
                <p className="text-sm font-medium">{teacher.email || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-zinc-500" />Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-xs text-zinc-500">Valor Hora</p>
              <p className="text-lg font-bold">{formatCurrency(teacher.hourlyRate)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-zinc-500" />Disponibilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{teacher.availability || "Não informada"}</p>
          </CardContent>
        </Card>
      </div>

      {teacher.curriculum && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currículo / Formação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">{teacher.curriculum}</p>
          </CardContent>
        </Card>
      )}

      {teacher.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{teacher.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
