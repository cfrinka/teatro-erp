"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, ClipboardList, MapPin, Clock, Users, GraduationCap, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { weekDaysLabels } from "@/lib/utils";

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [cls, setCls] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const id = typeof params.id === "string" ? params.id : "";
    fetch(`/api/classes/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCls(json.data);
        else setError(json.error || "Turma não encontrada");
      })
      .catch(() => setError("Erro ao carregar turma"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error || "Turma não encontrada"}</div>
      </div>
    );
  }

  const weekDays = typeof cls.weekDays === "string" ? JSON.parse(cls.weekDays) : cls.weekDays;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{cls.course?.name || "Turma"}</h1>
            <p className="text-sm text-zinc-500">{cls.room || "Sem sala definida"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cls.status === "ACTIVE" ? "success" : cls.status === "COMPLETED" ? "info" : "secondary"}>
            {cls.status === "ACTIVE" ? "Ativa" : cls.status === "COMPLETED" ? "Concluída" : "Inativa"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => router.push(`/classes/${cls.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Horário</p>
                <p className="text-lg font-bold mt-1">{cls.startTime} - {cls.endTime}</p>
              </div>
              <Clock className="h-8 w-8 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Dias da Semana</p>
                <p className="text-sm font-bold mt-1">{weekDays?.map((d: string) => weekDaysLabels[d]).join(", ")}</p>
              </div>
              <Calendar className="h-8 w-8 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Professor</p>
                <p className="text-sm font-bold mt-1">{cls.teacher?.name || "Não atribuído"}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Alunos Matriculados</p>
                <p className="text-lg font-bold mt-1">{cls.enrollments?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {cls.enrollments && cls.enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alunos Matriculados ({cls.enrollments.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Aluno</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {cls.enrollments.map((enrollment: any) => (
                  <tr key={enrollment.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 cursor-pointer" onClick={() => router.push(`/students/${enrollment.student.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium">{enrollment.student.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={enrollment.status === "ACTIVE" ? "success" : "destructive"}>
                        {enrollment.status === "ACTIVE" ? "Ativa" : "Cancelada"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
