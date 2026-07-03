"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    artisticName: "",
    cpf: "",
    rg: "",
    birthDate: "",
    gender: "",
    phone: "",
    whatsapp: "",
    email: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    financialResponsible: "",
    legalResponsible: "",
    notes: "",
    status: "ACTIVE",
  });

  React.useEffect(() => {
    const id = typeof params.id === "string" ? params.id : "";
    fetch(`/api/students/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const s = json.data;
          setForm({
            name: s.name || "",
            artisticName: s.artisticName || "",
            cpf: s.cpf || "",
            rg: s.rg || "",
            birthDate: s.birthDate
              ? new Date(s.birthDate).toISOString().split("T")[0]
              : "",
            gender: s.gender || "",
            phone: s.phone || "",
            whatsapp: s.whatsapp || "",
            email: s.email || "",
            street: s.street || "",
            number: s.number || "",
            complement: s.complement || "",
            neighborhood: s.neighborhood || "",
            city: s.city || "",
            state: s.state || "",
            zipCode: s.zipCode || "",
            financialResponsible: s.financialResponsible || "",
            legalResponsible: s.legalResponsible || "",
            notes: s.notes || "",
            status: s.status || "ACTIVE",
          });
        } else setError(json.error || "Aluno não encontrado");
      })
      .catch(() => setError("Erro ao carregar aluno"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/students/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/students/${params.id}`);
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Editar Aluno
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {form.name}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-zinc-500" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nome Completo *"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
              <Input
                label="Nome Artístico"
                value={form.artisticName}
                onChange={(e) => updateField("artisticName", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="CPF"
                value={form.cpf}
                onChange={(e) => updateField("cpf", e.target.value)}
              />
              <Input
                label="RG"
                value={form.rg}
                onChange={(e) => updateField("rg", e.target.value)}
              />
              <Input
                label="Data de Nascimento"
                type="date"
                value={form.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Gênero</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="TRANSFERRED">Transferido</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Telefone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              <Input
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Input label="Logradouro" value={form.street} onChange={(e) => updateField("street", e.target.value)} />
              </div>
              <Input label="Número" value={form.number} onChange={(e) => updateField("number", e.target.value)} />
              <div className="sm:col-span-2">
                <Input label="Complemento" value={form.complement} onChange={(e) => updateField("complement", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Input label="Bairro" value={form.neighborhood} onChange={(e) => updateField("neighborhood", e.target.value)} />
              <Input label="Cidade" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
              <Input label="Estado" value={form.state} onChange={(e) => updateField("state", e.target.value)} maxLength={2} />
              <Input label="CEP" value={form.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Responsável Financeiro" value={form.financialResponsible} onChange={(e) => updateField("financialResponsible", e.target.value)} />
              <Input label="Responsável Legal" value={form.legalResponsible} onChange={(e) => updateField("legalResponsible", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Salvar Alterações</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
