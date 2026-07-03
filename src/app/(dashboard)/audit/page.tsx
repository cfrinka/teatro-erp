"use client";

import * as React from "react";
import { Search, ShieldCheck, Filter, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, rolesLabels, timeAgo } from "@/lib/utils";

const auditLogs = [
  { id: "1", user: "Admin", role: "ADMIN", action: "CREATE", entity: "Student", description: "Aluno criado: Ana Beatriz Silva", createdAt: "2025-07-01T10:30:00" },
  { id: "2", user: "Admin", role: "ADMIN", action: "UPDATE", entity: "Payment", description: "Pagamento atualizado: Carlos Lima - PAID", createdAt: "2025-07-01T09:15:00" },
  { id: "3", user: "Coordenação", role: "COORDINATION", action: "CREATE", entity: "Enrollment", description: "Matrícula criada: Pedro Santos em Teatro Musical", createdAt: "2025-06-30T14:00:00" },
  { id: "4", user: "Financeiro", role: "FINANCIAL", action: "UPDATE", entity: "Settings", description: "Configurações do sistema atualizadas", createdAt: "2025-06-30T11:45:00" },
  { id: "5", user: "Recepção", role: "RECEPTION", action: "CREATE", entity: "Student", description: "Aluno criado: Julia Rodrigues", createdAt: "2025-06-29T16:20:00" },
  { id: "6", user: "Admin", role: "ADMIN", action: "DELETE", entity: "Student", description: "Aluno excluído: Teste Excluído", createdAt: "2025-06-29T10:00:00" },
  { id: "7", user: "Professor", role: "TEACHER", action: "CREATE", entity: "Attendance", description: "Presença registrada: Ana Beatriz - PRESENT", createdAt: "2025-06-28T14:30:00" },
  { id: "8", user: "Coordenação", role: "COORDINATION", action: "UPDATE", entity: "Class", description: "Turma atualizada: Teatro Iniciante", createdAt: "2025-06-28T09:00:00" },
];

const actionConfig: Record<string, { label: string; variant: "success" | "destructive" | "info" | "warning" }> = {
  CREATE: { label: "Criação", variant: "success" },
  UPDATE: { label: "Atualização", variant: "info" },
  DELETE: { label: "Exclusão", variant: "destructive" },
  LOGIN: { label: "Login", variant: "warning" },
};

export default function AuditPage() {
  const [search, setSearch] = React.useState("");

  const filtered = auditLogs.filter((log) =>
    log.description.toLowerCase().includes(search.toLowerCase()) ||
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Auditoria</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Registro de todas as ações realizadas no sistema
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total de Registros", value: auditLogs.length.toString(), color: "bg-zinc-100 dark:bg-zinc-800" },
          { label: "Criações (CREATE)", value: auditLogs.filter((l) => l.action === "CREATE").length.toString(), color: "bg-green-100 dark:bg-green-900/50" },
          { label: "Atualizações (UPDATE)", value: auditLogs.filter((l) => l.action === "UPDATE").length.toString(), color: "bg-blue-100 dark:bg-blue-900/50" },
          { label: "Exclusões (DELETE)", value: auditLogs.filter((l) => l.action === "DELETE").length.toString(), color: "bg-red-100 dark:bg-red-900/50" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">{item.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-50">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Buscar nos logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Ação</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Entidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Descrição</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const config = actionConfig[log.action] || { label: log.action, variant: "secondary" as const };
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{log.user}</span>
                          <span className="text-xs text-zinc-500">{rolesLabels[log.role]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{log.entity}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-[300px] truncate">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {formatDateTime(log.createdAt)}
                          </span>
                          <span className="text-xs text-zinc-400">{timeAgo(log.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
