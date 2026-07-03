"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, weekDaysLabels } from "@/lib/utils";

const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

const scheduleData = [
  { id: "1", className: "Teatro Iniciante", teacher: "Carlos Mendes", room: "Sala 1", weekDay: "MONDAY", timeStart: "14:00", timeEnd: "16:00", level: "Iniciante" },
  { id: "2", className: "Teatro Intermediário", teacher: "Ana Paula", room: "Sala 2", weekDay: "TUESDAY", timeStart: "16:00", timeEnd: "18:00", level: "Intermediário" },
  { id: "3", className: "Teatro Avançado", teacher: "Roberto Lima", room: "Sala 3", weekDay: "WEDNESDAY", timeStart: "18:00", timeEnd: "20:00", level: "Avançado" },
  { id: "4", className: "Teatro Musical", teacher: "Juliana Costa", room: "Sala 1", weekDay: "MONDAY", timeStart: "18:00", timeEnd: "20:00", level: "Avançado" },
  { id: "5", className: "Dança Teatral", teacher: "Marina Silva", room: "Estúdio", weekDay: "THURSDAY", timeStart: "14:00", timeEnd: "16:00", level: "Intermediário" },
  { id: "6", className: "Interpretação", teacher: "Pedro Alves", room: "Sala 2", weekDay: "WEDNESDAY", timeStart: "14:00", timeEnd: "16:00", level: "Iniciante" },
  { id: "7", className: "Expressão Corporal", teacher: "Luiza Santos", room: "Estúdio", weekDay: "FRIDAY", timeStart: "10:00", timeEnd: "12:00", level: "Iniciante" },
  { id: "8", className: "Teatro Juvenil", teacher: "Carlos Mendes", room: "Sala 1", weekDay: "SATURDAY", timeStart: "09:00", timeEnd: "11:00", level: "Juvenil" },
];

const levelColors: Record<string, "success" | "info" | "warning" | "secondary"> = {
  "Iniciante": "success",
  "Intermediário": "info",
  "Avançado": "warning",
  "Juvenil": "secondary",
};

export default function SchedulePage() {
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = React.useState(0);

  const weekLabel = currentWeek === 0
    ? "Esta semana"
    : currentWeek === -1
      ? "Semana passada"
      : currentWeek === 1
        ? "Próxima semana"
        : `Semana ${Math.abs(currentWeek) + 1}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Agenda</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Grade de horários das turmas
          </p>
        </div>
        <Button onClick={() => router.push("/classes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Turma
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(currentWeek - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium">{weekLabel}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(currentWeek + 1)}>
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {weekDays.map((day) => {
          const dayClasses = scheduleData.filter((s) => s.weekDay === day);
          return (
            <Card key={day} className="min-h-[300px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                  {weekDaysLabels[day]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayClasses.length === 0 ? (
                  <p className="text-center text-xs text-zinc-400 py-8">
                    Nenhuma aula
                  </p>
                ) : (
                  dayClasses.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
                          {s.className}
                        </span>
                        <Badge variant={levelColors[s.level] || "secondary"} className="text-[10px]">
                          {s.level}
                        </Badge>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {s.timeStart} - {s.timeEnd}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {s.room}
                        </div>
                        <div className="text-zinc-400">{s.teacher}</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2025-07-15", title: "Apresentação Turma A", time: "19:00", local: "Teatro Principal" },
              { date: "2025-07-20", title: "Reunião de Pais", time: "18:00", local: "Sala de Reuniões" },
              { date: "2025-08-01", title: "Início das Matrículas", time: "08:00", local: "Secretaria" },
              { date: "2025-08-10", title: "Festival de Teatro", time: "14:00", local: "Teatro Municipal" },
            ].map((event, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      {event.date.split("-")[2]}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][parseInt(event.date.split("-")[1]) - 1]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{event.title}</p>
                    <p className="text-xs text-zinc-500">{event.time} • {event.local}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Detalhes</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
