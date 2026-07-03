"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  GraduationCap,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "warning" | "danger" | "success";
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        variant === "warning" && "border-yellow-200 dark:border-yellow-900",
        variant === "danger" && "border-red-200 dark:border-red-900",
        variant === "success" && "border-green-200 dark:border-green-900"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={trend.positive ? "text-green-500" : "text-red-500"}
                >
                  {trend.positive ? "↑" : "↓"} {trend.value}%
                </span>
                <span className="text-zinc-400">vs mês anterior</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              variant === "default" &&
                "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
              variant === "warning" &&
                "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
              variant === "danger" &&
                "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
              variant === "success" &&
                "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const metrics = {
  totalStudents: 156,
  activeStudents: 142,
  totalTeachers: 18,
  totalClasses: 24,
  monthlyRevenue: 45800,
  expectedRevenue: 52000,
  overduePayments: 8,
  dueTodayPayments: 5,
  todayEvents: [
    { id: "1", title: "Aula de Teatro Iniciante", time: "14:00 - 15:30", type: "Aula" },
    { id: "2", title: "Ensaio Geral - Peça Othon", time: "16:00 - 18:00", type: "Ensaio" },
    { id: "3", title: "Reunião de Pais", time: "19:00 - 20:30", type: "Reunião" },
  ],
  upcomingEvents: [
    { id: "4", title: "Apresentação - Turma Infantil", date: "2025-07-10", type: "Apresentação" },
    { id: "5", title: "Workshop de Improvisação", date: "2025-07-15", type: "Workshop" },
  ],
};

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Bem-vindo ao Teatro ERP, {session?.user?.name?.split(" ")[0] || "Usuário"}!
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total de Alunos" value={metrics.totalStudents} icon={Users} trend={{ value: 12, positive: true }} />
        <MetricCard title="Alunos Ativos" value={metrics.activeStudents} icon={Users} variant="success" />
        <MetricCard title="Professores" value={metrics.totalTeachers} icon={GraduationCap} />
        <MetricCard title="Turmas" value={metrics.totalClasses} icon={ClipboardList} trend={{ value: 8, positive: true }} />
      </div>

      {/* Financial Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Receita do Mês" value={formatCurrency(metrics.monthlyRevenue)} icon={DollarSign} variant="success" trend={{ value: 15, positive: true }} />
        <MetricCard title="Receita Prevista" value={formatCurrency(metrics.expectedRevenue)} icon={TrendingUp} />
        <MetricCard title="Mensalidades Vencidas" value={metrics.overduePayments} icon={AlertTriangle} variant="danger" />
        <MetricCard title="Vencendo Hoje" value={metrics.dueTodayPayments} icon={Calendar} variant="warning" />
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Agenda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-zinc-500" />
              Agenda do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.todayEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium dark:bg-zinc-800">
                    {event.time.split(" - ")[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-zinc-500">{event.time}</p>
                  </div>
                  <Badge variant="secondary">{event.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-zinc-500" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium dark:bg-zinc-800">
                    {event.date.split("-")[2]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-zinc-500">{formatDate(event.date)}</p>
                  </div>
                  <Badge variant="info">{event.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
