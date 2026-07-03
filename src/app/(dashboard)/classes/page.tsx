"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { weekDaysLabels } from "@/lib/utils";

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetchClasses = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: "100" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/classes?${params}`);
      const json = await res.json();
      if (json.success) {
        setClasses(json.data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(fetchClasses, 300);
    return () => clearTimeout(timer);
  }, [fetchClasses]);

  const parseWeekDays = (wd: any): string[] => {
    if (Array.isArray(wd)) return wd;
    try { return JSON.parse(wd); } catch { return []; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Turmas</h1>
          <p className="text-sm text-zinc-500">Gerencie as turmas e alocação de professores</p>
        </div>
        <Button onClick={() => router.push("/classes/new")}><Plus className="h-4 w-4 mr-2" />Nova Turma</Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Buscar turma..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Curso</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Professor</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Sala</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Dias</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Horário</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Alunos</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">
                    {search ? "Nenhuma turma encontrada para esta busca" : "Nenhuma turma cadastrada"}
                  </td>
                </tr>
              ) : (
                classes.map((c) => {
                  const weekDays = parseWeekDays(c.weekDays);
                  return (
                    <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 cursor-pointer" onClick={() => router.push(`/classes/${c.id}`)}>
                      <td className="px-4 py-3 text-sm font-medium">{c.course?.name || "Curso"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{c.teacher?.name || "Não atribuído"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{c.room || "-"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{weekDays.map((d: string) => weekDaysLabels[d] || d).join(", ")}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{c.startTime} - {c.endTime}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={c._count?.enrollments >= c.maxStudents ? "text-red-600 font-medium" : "text-zinc-600"}>
                          {c._count?.enrollments || 0}/{c.maxStudents}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.status === "ACTIVE" ? "success" : c.status === "COMPLETED" ? "info" : "secondary"}>
                          {c.status === "ACTIVE" ? "Ativa" : c.status === "COMPLETED" ? "Concluída" : "Inativa"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
