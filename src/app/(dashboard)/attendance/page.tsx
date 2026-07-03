"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const records = [
  { id: "1", student: "Ana Beatriz Silva", className: "Teatro Iniciante - Seg/Qua 14:00", date: "2025-07-01", status: "PRESENT", content: "Exercícios de expressão corporal" },
  { id: "2", student: "Carlos Eduardo Lima", className: "Teatro Intermediário - Ter/Qui 16:00", date: "2025-07-01", status: "ABSENT", content: "" },
  { id: "3", student: "Ana Beatriz Silva", className: "Teatro Iniciante - Seg/Qua 14:00", date: "2025-06-28", status: "LATE", content: "Aquecimento vocal" },
  { id: "4", student: "Pedro Henrique Santos", className: "Teatro Musical - Seg/Qua/Sex 18:00", date: "2025-07-01", status: "JUSTIFIED", content: "Exercícios de canto" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "info" }> = {
  PRESENT: { label: "Presente", variant: "success" },
  ABSENT: { label: "Falta", variant: "destructive" },
  JUSTIFIED: { label: "Justificada", variant: "warning" },
  LATE: { label: "Atraso", variant: "info" },
};

export default function AttendancePage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const filtered = records.filter((r) =>
    r.student.toLowerCase().includes(search.toLowerCase()) ||
    r.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Frequência</h1>
          <p className="text-sm text-zinc-500">Registre e acompanhe a frequência dos alunos</p>
        </div>
        <Button onClick={() => router.push("/attendance/new")}><CalendarCheck className="h-4 w-4 mr-2" />Registrar Presença</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Buscar por aluno ou turma..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Aluno</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Turma</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Conteúdo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-sm font-medium">{r.student}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{r.className}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{formatDate(r.date)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[r.status]?.variant || "secondary"}>
                      {statusConfig[r.status]?.label || r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 max-w-[200px] truncate">{r.content || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
