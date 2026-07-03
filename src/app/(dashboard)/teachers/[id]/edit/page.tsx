"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = React.useState(true);
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
    status: "ACTIVE",
  });

  React.useEffect(() => {
    const id = typeof params.id === "string" ? params.id : "";
    fetch(`/api/teachers/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const t = json.data;
          setForm({
            name: t.name || "",
            cpf: t.cpf || "",
            phone: t.phone || "",
            email: t.email || "",
            specialty: t.specialty || "",
            curriculum: t.curriculum || "",
            availability: t.availability || "",
            hourlyRate: t.hourlyRate?.toString() || "0",
            notes: t.notes || "",
            status: t.status || "ACTIVE",
          });
        } else setError(json.error || "Professor não encontrado");
      })
      .catch(() => setError("Erro ao carregar professor"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/teachers/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hourlyRate: parseFloat(form.hourlyRate),
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/teachers/${params.id}`);
        router.refresh();
      } else throw new Error(json.error || "Erro ao salvar");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Editar Professor</h1>
          <p className="text-sm text-zinc-500">{form.name}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-5 w-5 text-zinc-500" />Dados do Professor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome Completo *" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
              <Input label="CPF" value={form.cpf} onChange={(e) => updateField("cpf", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="E-mail" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              <Input label="Telefone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Especialidade" value={form.specialty} onChange={(e) => updateField("specialty", e.target.value)} />
              <Input label="Valor Hora (R$)" type="number" step="0.01" value={form.hourlyRate} onChange={(e) => updateField("hourlyRate", e.target.value)} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
            </div>
            <Input label="Disponibilidade" value={form.availability} onChange={(e) => updateField("availability", e.target.value)} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Currículo / Formação</label>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={form.curriculum}
                onChange={(e) => updateField("curriculum", e.target.value)}
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
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar Alterações</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
