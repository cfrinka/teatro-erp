"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, BookOpen, Clock, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const id = typeof params.id === "string" ? params.id : "";
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCourse(json.data);
        else setError(json.error || "Curso não encontrado");
      })
      .catch(() => setError("Erro ao carregar curso"))
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

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error || "Curso não encontrado"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{course.name}</h1>
            <p className="text-sm text-zinc-500">{course.description || "Sem descrição"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={course.status === "ACTIVE" ? "success" : "secondary"}>
            {course.status === "ACTIVE" ? "Ativo" : "Inativo"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${course.id}/edit`)}>
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
                <p className="text-sm text-zinc-500">Carga Horária</p>
                <p className="text-2xl font-bold mt-1">{course.workload}h</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Clock className="h-6 w-6 text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Taxa Matrícula</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(course.enrollmentFee)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Mensalidade</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(course.monthlyFee)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Máx. Alunos</p>
                <p className="text-2xl font-bold mt-1">{course.maxStudents}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {course.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{course.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Classes */}
      {course.classes && course.classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Turmas ({course.classes.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Turma</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Alunos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {course.classes.map((cls: any) => (
                  <tr key={cls.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 cursor-pointer" onClick={() => router.push(`/classes/${cls.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium">{cls.room || cls.id}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600">{cls._count?.enrollments || 0} matriculados</td>
                    <td className="px-4 py-3">
                      <Badge variant={cls.status === "ACTIVE" ? "success" : "secondary"}>
                        {cls.status === "ACTIVE" ? "Ativa" : "Inativa"}
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
