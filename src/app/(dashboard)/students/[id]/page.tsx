"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCpf, formatPhone } from "@/lib/utils";

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [student, setStudent] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const id = typeof params.id === "string" ? params.id : "";
    fetch(`/api/students/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStudent(json.data);
        else setError(json.error || "Aluno não encontrado");
      })
      .catch(() => setError("Erro ao carregar aluno"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${params.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        router.push("/students");
        router.refresh();
      } else {
        alert(json.error || "Erro ao excluir");
      }
    } catch {
      alert("Erro ao excluir aluno");
    } finally {
      setDeleting(false);
    }
  };

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

  if (error || !student) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">
          {error || "Aluno não encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {student.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {student.artisticName && `Nome artístico: ${student.artisticName}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              student.status === "ACTIVE"
                ? "success"
                : student.status === "CANCELLED"
                  ? "destructive"
                  : "secondary"
            }
          >
            {student.status === "ACTIVE"
              ? "Ativo"
              : student.status === "INACTIVE"
                ? "Inativo"
                : student.status === "CANCELLED"
                  ? "Cancelado"
                  : student.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/students/${student.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-zinc-500" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">CPF</p>
                <p className="text-sm font-medium">
                  {formatCpf(student.cpf)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">RG</p>
                <p className="text-sm font-medium">{student.rg || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Data de Nascimento</p>
                <p className="text-sm font-medium">
                  {formatDate(student.birthDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Gênero</p>
                <p className="text-sm font-medium">
                  {student.gender
                    ? student.gender === "MASCULINO"
                      ? "Masculino"
                      : student.gender === "FEMININO"
                        ? "Feminino"
                        : student.gender
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-5 w-5 text-zinc-500" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">Telefone</p>
                <p className="text-sm font-medium">
                  {student.phone ? formatPhone(student.phone) : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">E-mail</p>
                <p className="text-sm font-medium">
                  {student.email || "-"}
                </p>
              </div>
            </div>
            {student.whatsapp && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-xs text-zinc-500">WhatsApp</p>
                  <p className="text-sm font-medium">
                    {formatPhone(student.whatsapp)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-zinc-500" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.street ? (
              <>
                <p className="text-sm">
                  {student.street}, {student.number}
                  {student.complement && ` - ${student.complement}`}
                </p>
                <p className="text-sm text-zinc-500">
                  {student.neighborhood && `${student.neighborhood} - `}
                  {student.city}/{student.state}
                  {student.zipCode && ` - CEP: ${student.zipCode}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500">
                Nenhum endereço cadastrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Responsible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Responsáveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500">Responsável Financeiro</p>
              <p className="text-sm font-medium">
                {student.financialResponsible || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Responsável Legal</p>
              <p className="text-sm font-medium">
                {student.legalResponsible || "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {student.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {student.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <span>Cadastrado em: {formatDate(student.createdAt)}</span>
        <span>Atualizado em: {formatDate(student.updatedAt)}</span>
      </div>
    </div>
  );
}
