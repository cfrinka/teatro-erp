"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function fetchApi(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Erro ao salvar");
  return json.data;
}

export default function NewStudentPage() {
  const router = useRouter();
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
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await fetchApi("/api/students", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/students");
      router.refresh();
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Novo Aluno
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Preencha os dados para cadastrar um novo aluno
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
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
                placeholder="Nome do aluno"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
              <Input
                label="Nome Artístico"
                placeholder="Nome artístico (opcional)"
                value={form.artisticName}
                onChange={(e) => updateField("artisticName", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="CPF *"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => updateField("cpf", e.target.value)}
                required
              />
              <Input
                label="RG"
                placeholder="RG (opcional)"
                value={form.rg}
                onChange={(e) => updateField("rg", e.target.value)}
              />
              <Input
                label="Data de Nascimento *"
                type="date"
                value={form.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Gênero</Label>
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
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              <Input
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Input
                  label="Logradouro"
                  placeholder="Rua, Avenida..."
                  value={form.street}
                  onChange={(e) => updateField("street", e.target.value)}
                />
              </div>
              <Input
                label="Número"
                placeholder="Nº"
                value={form.number}
                onChange={(e) => updateField("number", e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Complemento"
                  placeholder="Apto, Bloco..."
                  value={form.complement}
                  onChange={(e) => updateField("complement", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Input
                label="Bairro"
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={(e) => updateField("neighborhood", e.target.value)}
              />
              <Input
                label="Cidade"
                placeholder="Cidade"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
              <Input
                label="Estado"
                placeholder="UF"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                maxLength={2}
              />
              <Input
                label="CEP"
                placeholder="00000-000"
                value={form.zipCode}
                onChange={(e) => updateField("zipCode", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Responsible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Responsáveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Responsável Financeiro"
                placeholder="Nome do responsável financeiro"
                value={form.financialResponsible}
                onChange={(e) =>
                  updateField("financialResponsible", e.target.value)
                }
              />
              <Input
                label="Responsável Legal"
                placeholder="Nome do responsável legal"
                value={form.legalResponsible}
                onChange={(e) =>
                  updateField("legalResponsible", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Observações sobre o aluno..."
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Aluno
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
