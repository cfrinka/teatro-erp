"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewAttendancePage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [students, setStudents] = React.useState<any[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({
    studentId: "",
    classId: "",
    date: new Date().toISOString().split("T")[0],
    status: "PRESENT" as string,
    content: "",
    notes: "",
  });

  React.useEffect(() => {
    Promise.all([
      fetch("/api/students?pageSize=500").then((r) => r.json()),
      fetch("/api/classes?pageSize=100").then((r) => r.json()),
    ]).then(([studentsRes, classesRes]) => {
      if (studentsRes.success) setStudents(studentsRes.data.data || []);
      if (classesRes.success) setClasses(classesRes.data.data || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/attendance");
        router.refresh();
      } else throw new Error(json.error || "Erro ao registrar");
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Registrar Presença</h1>
          <p className="text-sm text-zinc-500">Registre a presença de um aluno em uma turma</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-5 w-5 text-zinc-500" />Registro de Presença
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Aluno *</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.studentId}
                  onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                  required
                >
                  <option value="">Selecione um aluno...</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Turma *</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.classId}
                  onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                  required
                >
                  <option value="">Selecione uma turma...</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.course?.name || c.room || c.id}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Data *" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status *</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="PRESENT">Presente</option>
                  <option value="ABSENT">Falta</option>
                  <option value="LATE">Atrasado</option>
                  <option value="JUSTIFIED">Justificada</option>
                </select>
              </div>
            </div>
            <Input label="Conteúdo da Aula" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
            <Input label="Observações" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Registrar Presença</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
