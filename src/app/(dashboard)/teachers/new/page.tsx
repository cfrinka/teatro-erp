"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewTeacherPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    specialty: "",
    curriculum: "",
    availability: "",
    hourlyRate: "0",
    notes: "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hourlyRate: parseFloat(form.hourlyRate) }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/teachers");
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Novo Professor</h1>
          <p className="text-sm text-zinc-500">Preencha os dados para cadastrar um novo professor</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-5 w-5 text-zinc-500" />
              Dados do Professor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome Completo *" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
              <Input label="CPF *" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => updateField("cpf", e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="E-mail" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              <Input label="Telefone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Especialidade" value={form.specialty} onChange={(e) => updateField("specialty", e.target.value)} />
              <Input label="Valor Hora (R$)" type="number" step="0.01" value={form.hourlyRate} onChange={(e) => updateField("hourlyRate", e.target.value)} />
            </div>
            <Input label="Disponibilidade" placeholder="Ex: Seg a Sex, manhã e tarde" value={form.availability} onChange={(e) => updateField("availability", e.target.value)} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Currículo / Formação</label>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={form.curriculum}
                onChange={(e) => updateField("curriculum", e.target.value)}
                placeholder="Formação acadêmica, cursos, experiências..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Observações</label>
              <textarea
                className="min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar Professor</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
