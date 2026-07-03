"use client";

import * as React from "react";
import { Search, DollarSign, TrendingUp, AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

const payments = [
  { id: "1", student: "Ana Beatriz Silva", dueDate: "2025-07-10", paidDate: "2025-07-05", amount: 250, status: "PAID", method: "PIX" },
  { id: "2", student: "Carlos Eduardo Lima", dueDate: "2025-07-10", paidDate: null, amount: 300, status: "PENDING", method: null },
  { id: "3", student: "Mariana Oliveira", dueDate: "2025-06-10", paidDate: null, amount: 350, status: "OVERDUE", method: null },
  { id: "4", student: "Pedro Henrique Santos", dueDate: "2025-07-10", paidDate: "2025-07-01", amount: 400, status: "PAID", method: "BOLETO" },
  { id: "5", student: "Julia Rodrigues", dueDate: "2025-05-10", paidDate: null, amount: 250, status: "OVERDUE", method: null },
  { id: "6", student: "Ana Beatriz Silva", dueDate: "2025-08-10", paidDate: null, amount: 250, status: "PENDING", method: null },
];

const statusConfig: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "secondary" | "info" }> = {
  PAID: { label: "Pago", variant: "success" },
  PENDING: { label: "Pendente", variant: "warning" },
  OVERDUE: { label: "Vencido", variant: "destructive" },
  CANCELLED: { label: "Cancelado", variant: "secondary" },
  PARTIAL: { label: "Parcial", variant: "info" },
};

const summaryCards = [
  { title: "Receita do Mês", value: "R$ 45.800,00", icon: TrendingUp, variant: "success" },
  { title: "Receita Prevista", value: "R$ 52.000,00", icon: DollarSign, variant: "default" },
  { title: "Em Atraso", value: "R$ 8.600,00", icon: AlertTriangle, variant: "danger" },
  { title: "Recebido Hoje", value: "R$ 3.200,00", icon: TrendingUp, variant: "success" },
] as const;

export default function FinancialPage() {
  const [search, setSearch] = React.useState("");
  const filtered = payments.filter((p) =>
    p.student.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Financeiro</h1>
          <p className="text-sm text-zinc-500">Controle de mensalidades, recebimentos e inadimplência</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg",
                  card.variant === "success" && "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
                  card.variant === "danger" && "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
                  card.variant === "default" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Buscar por aluno..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Aluno</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Vencimento</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Pagamento</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Método</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-sm font-medium">{p.student}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{formatDate(p.dueDate)}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{p.paidDate ? formatDate(p.paidDate) : "-"}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{p.method || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[p.status]?.variant || "secondary"}>
                      {statusConfig[p.status]?.label || p.status}
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
