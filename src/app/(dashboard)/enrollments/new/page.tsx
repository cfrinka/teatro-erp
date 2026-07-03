"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export default function NewEnrollmentPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [students, setStudents] = React.useState<any[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [selectedClass, setSelectedClass] = React.useState<any>(null);
  const [form, setForm] = React.useState({
    studentId: "",
    classId: "",
    monthlyFee: "0",
    contractDate: new Date().toISOString().split("T")[0],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
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

  // Auto-populate monthly fee when class changes
  React.useEffect(() => {
    const cls = classes.find((c: any) => c.id === form.classId);
    if (cls) {
      setSelectedClass(cls);
      setForm((prev) => ({
        ...prev,
        monthlyFee: cls.course?.monthlyFee?.toString() || "0",
      }));
    } else {
      setSelectedClass(null);
    }
  }, [form.classId, classes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          monthlyFee: parseFloat(form.monthlyFee),
          endDate: form.endDate || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/enrollments");
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Nova Matrícula</h1>
          <p className="text-sm text-zinc-500">Matricule um aluno em uma turma</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5 text-zinc-500" />Dados da Matrícula
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
                    <option key={c.id} value={c.id}>
                      {c.course?.name || "Curso"} - {c.room || "Sem sala"} ({c.startTime || "?"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClass && (
              <div className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
                <p className="font-medium text-zinc-600 dark:text-zinc-400">Informações da Turma</p>
                <div className="mt-1 text-zinc-500">
                  <p>Curso: {selectedClass.course?.name}</p>
                  <p>Vagas: {selectedClass._count?.enrollments || 0}/{selectedClass.maxStudents}</p>
                  {selectedClass.course?.monthlyFee && (
                    <p>Mensalidade do curso: {formatCurrency(selectedClass.course.monthlyFee)}</p>
                  )}
                </div>
              </div>
            )}

            <Input label="Valor da Mensalidade (R$) *" type="number" step="0.01" value={form.monthlyFee} onChange={(e) => setForm((p) => ({ ...p, monthlyFee: e.target.value }))} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Data do Contrato *" type="date" value={form.contractDate} onChange={(e) => setForm((p) => ({ ...p, contractDate: e.target.value }))} required />
              <Input label="Data de Início *" type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} required />
            </div>
            <Input label="Data de Término" type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
            <Input label="Observações" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Criar Matrícula</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
