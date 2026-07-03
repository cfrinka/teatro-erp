"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

const enrollments = [
  { id: "1", student: "Ana Beatriz Silva", course: "Teatro Iniciante", class: "Turma A - Seg/Qua 14:00", date: "2025-01-10", monthlyFee: 250, status: "ACTIVE" },
  { id: "2", student: "Carlos Eduardo Lima", course: "Teatro Intermediário", class: "Turma B - Ter/Qui 16:00", date: "2025-02-05", monthlyFee: 300, status: "ACTIVE" },
  { id: "3", student: "Mariana Oliveira", course: "Teatro Avançado", class: "Turma C - Seg/Qua 18:00", date: "2024-09-15", monthlyFee: 350, status: "CANCELLED" },
  { id: "4", student: "Pedro Henrique Santos", course: "Teatro Musical", class: "Turma D - Seg/Qua/Sex 18:00", date: "2025-03-01", monthlyFee: 400, status: "ACTIVE" },
];

const statusLabels: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "info" }> = {
  ACTIVE: { label: "Ativa", variant: "success" },
  CANCELLED: { label: "Cancelada", variant: "destructive" },
  TRANSFERRED: { label: "Transferida", variant: "warning" },
  COMPLETED: { label: "Concluída", variant: "info" },
};

export default function EnrollmentsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const filtered = enrollments.filter((e) =>
    e.student.toLowerCase().includes(search.toLowerCase()) ||
    e.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Matrículas</h1>
          <p className="text-sm text-zinc-500">Gerencie as matrículas dos alunos</p>
        </div>
        <Button onClick={() => router.push("/enrollments/new")}><Plus className="h-4 w-4 mr-2" />Nova Matrícula</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Buscar matrícula..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Aluno</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Curso</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Turma</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 cursor-pointer">
                  <td className="px-4 py-3 text-sm font-medium">{e.student}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{e.course}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{e.class}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(e.monthlyFee)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusLabels[e.status]?.variant || "secondary"}>
                      {statusLabels[e.status]?.label || e.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
