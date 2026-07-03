"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewClassPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [courses, setCourses] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({
    courseId: "",
    teacherId: "",
    room: "",
    weekDays: [] as string[],
    startTime: "",
    endTime: "",
    period: "",
    maxStudents: "20",
  });

  React.useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/teachers").then((r) => r.json()),
    ]).then(([coursesRes, teachersRes]) => {
      if (coursesRes.success) setCourses(coursesRes.data.data || []);
      if (teachersRes.success) setTeachers(teachersRes.data || []);
    });
  }, []);

  const weekDayOptions = [
    { value: "MONDAY", label: "Segunda" },
    { value: "TUESDAY", label: "Terça" },
    { value: "WEDNESDAY", label: "Quarta" },
    { value: "THURSDAY", label: "Quinta" },
    { value: "FRIDAY", label: "Sexta" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" },
  ];

  const toggleWeekDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter((d) => d !== day)
        : [...prev.weekDays, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          weekDays: JSON.stringify(form.weekDays),
          teacherId: form.teacherId || null,
          maxStudents: parseInt(form.maxStudents),
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/classes");
        router.refresh();
      } else throw new Error(json.error || "Erro ao salvar");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Nova Turma</h1>
          <p className="text-sm text-zinc-500">Crie uma nova turma com curso e professor</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ClipboardList className="h-5 w-5 text-zinc-500" />Dados da Turma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Curso *</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.courseId}
                  onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
                  required
                >
                  <option value="">Selecione um curso...</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Professor</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.teacherId}
                  onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))}
                >
                  <option value="">Selecione um professor...</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <Input label="Sala" value={form.room} onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Horário Início *" type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} required />
              <Input label="Horário Fim *" type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Período</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.period}
                  onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>
              <Input label="Máx. Alunos" type="number" value={form.maxStudents} onChange={(e) => setForm((p) => ({ ...p, maxStudents: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Dias da Semana *</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {weekDayOptions.map((day) => (
                  <label
                    key={day.value}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                      form.weekDays.includes(day.value)
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.weekDays.includes(day.value)}
                      onChange={() => toggleWeekDay(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar Turma</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
