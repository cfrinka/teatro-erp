"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetchCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: "100" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/courses?${params}`);
      const json = await res.json();
      if (json.success) {
        setCourses(json.data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Cursos</h1>
          <p className="text-sm text-zinc-500">Gerencie os cursos oferecidos</p>
        </div>
        <Button onClick={() => router.push("/courses/new")}><Plus className="h-4 w-4 mr-2" />Novo Curso</Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Buscar curso..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-3/4 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-zinc-500">
            {search ? "Nenhum curso encontrado para esta busca" : "Nenhum curso cadastrado"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push(`/courses/${course.id}`)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{course.name}</h3>
                  <Badge variant={course.status === "ACTIVE" ? "success" : "secondary"}>
                    {course.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Carga Horária</span><span>{course.workload}h</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Matrícula</span><span>{formatCurrency(course.enrollmentFee)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Mensalidade</span><span className="font-medium">{formatCurrency(course.monthlyFee)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Vagas</span><span>{course.maxStudents} alunos</span></div>
                  {course._count?.classes !== undefined && (
                    <div className="flex justify-between"><span className="text-zinc-500">Turmas</span><span>{course._count.classes}</span></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
