"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const typeOptions = [
  { value: "CONTRACT", label: "Contrato" },
  { value: "FORM", label: "Formulário" },
  { value: "REPORT", label: "Relatório" },
  { value: "CERTIFICATE", label: "Certificado" },
  { value: "OTHER", label: "Outro" },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [students, setStudents] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({
    title: "",
    type: "OTHER" as string,
    category: "",
    description: "",
    fileUrl: "",
    studentId: "",
    enrollmentId: "",
    tags: "",
  });

  React.useEffect(() => {
    fetch("/api/students?pageSize=500")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStudents(res.data.data || []);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags,
          studentId: form.studentId || null,
          enrollmentId: form.enrollmentId || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/documents");
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Novo Documento</h1>
          <p className="text-sm text-zinc-500">Adicione contratos, formulários, certificados e outros documentos</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-zinc-500" />Dados do Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Título *" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required placeholder="Nome do documento" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo *</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <Input label="Categoria" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Ex: Contratos, Matrículas" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição do documento..."
              />
            </div>
            <Input label="URL do Arquivo" value={form.fileUrl} onChange={(e) => setForm((p) => ({ ...p, fileUrl: e.target.value }))} placeholder="https://..." />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Aluno (opcional)</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.studentId}
                  onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                >
                  <option value="">Nenhum</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <Input label="ID da Matrícula (opcional)" value={form.enrollmentId} onChange={(e) => setForm((p) => ({ ...p, enrollmentId: e.target.value }))} />
            </div>
            <Input label="Tags" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="tag1, tag2, tag3" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar Documento</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
