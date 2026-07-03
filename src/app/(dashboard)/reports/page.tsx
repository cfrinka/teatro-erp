"use client";

import * as React from "react";
import { BarChart3, Download, FileText, PieChart, TrendingUp, Users, DollarSign, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const reportTypes = [
  {
    title: "Relatório de Alunos",
    description: "Lista completa de alunos com status, matrícula e contato",
    icon: Users,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    formats: ["PDF", "Excel", "CSV"],
  },
  {
    title: "Relatório Financeiro",
    description: "Receitas, despesas, inadimplência e previsões",
    icon: DollarSign,
    color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
    formats: ["PDF", "Excel"],
  },
  {
    title: "Relatório de Frequência",
    description: "Presença por turma, aluno e período",
    icon: CalendarCheck,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
    formats: ["PDF", "Excel", "CSV"],
  },
  {
    title: "Relatório de Turmas",
    description: "Ocupação, horários e desempenho das turmas",
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
    formats: ["PDF", "Excel"],
  },
];

const recentReports = [
  { id: "1", title: "Relatório Financeiro - Junho/2025", type: "Financeiro", generatedAt: "2025-07-01", generatedBy: "Admin", status: "COMPLETED" },
  { id: "2", title: "Lista de Alunos Ativos - Julho/2025", type: "Alunos", generatedAt: "2025-07-01", generatedBy: "Coordenação", status: "COMPLETED" },
  { id: "3", title: "Frequência - Turma A (Junho)", type: "Frequência", generatedAt: "2025-06-30", generatedBy: "Professor", status: "COMPLETED" },
  { id: "4", title: "Inadimplência - 2º Trimestre", type: "Financeiro", generatedAt: "2025-06-25", generatedBy: "Financeiro", status: "COMPLETED" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Relatórios</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gere e exporte relatórios do sistema
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Relatórios Gerados", value: "156", icon: FileText, change: "+12 este mês" },
          { label: "Alunos Ativos", value: "45", icon: Users, change: "+3 este mês" },
          { label: "Receita Mensal", value: formatCurrency(45800), icon: TrendingUp, change: "+8% vs mês anterior" },
          { label: "Exportações", value: "89", icon: Download, change: "Este semestre" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{item.label}</p>
                  <p className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">{item.value}</p>
                  <p className="text-xs text-zinc-400 mt-1">{item.change}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <item.icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Types */}
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tipos de Relatório</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.title} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{report.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{report.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {report.formats.map((format) => (
                      <Button key={format} variant="outline" size="sm" className="text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        {format}
                      </Button>
                    ))}
                    <Button variant="default" size="sm" className="text-xs ml-auto">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Visualizar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <FileText className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{report.title}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Badge variant="secondary" className="text-[10px]">{report.type}</Badge>
                      <span>{report.generatedBy}</span>
                      <span>{report.generatedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
