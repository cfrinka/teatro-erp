"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    workload: "0",
    enrollmentFee: "0",
    monthlyFee: "0",
    minAge: "",
    maxAge: "",
    maxStudents: "30",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          workload: parseInt(form.workload),
          enrollmentFee: parseFloat(form.enrollmentFee),
          monthlyFee: parseFloat(form.monthlyFee),
          minAge: form.minAge ? parseInt(form.minAge) : null,
          maxAge: form.maxAge ? parseInt(form.maxAge) : null,
          maxStudents: parseInt(form.maxStudents),
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/courses");
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Novo Curso</h1>
          <p className="text-sm text-zinc-500">Preencha os dados para criar um novo curso</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-zinc-500" />Informações do Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Nome do Curso *" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Descrição do curso..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Carga Horária (h)" type="number" value={form.workload} onChange={(e) => updateField("workload", e.target.value)} />
              <Input label="Taxa de Matrícula (R$)" type="number" step="0.01" value={form.enrollmentFee} onChange={(e) => updateField("enrollmentFee", e.target.value)} />
              <Input label="Mensalidade (R$)" type="number" step="0.01" value={form.monthlyFee} onChange={(e) => updateField("monthlyFee", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Idade Mínima" type="number" value={form.minAge} onChange={(e) => updateField("minAge", e.target.value)} />
              <Input label="Idade Máxima" type="number" value={form.maxAge} onChange={(e) => updateField("maxAge", e.target.value)} />
              <Input label="Máx. Alunos" type="number" value={form.maxStudents} onChange={(e) => updateField("maxStudents", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar Curso</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
