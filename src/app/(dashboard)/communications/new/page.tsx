"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const typeOptions = [
  { value: "EMAIL", label: "E-mail" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SMS", label: "SMS" },
  { value: "NOTIFICATION", label: "Notificação" },
  { value: "BULLETIN", label: "Comunicado" },
];

const recipientTypeOptions = [
  { value: "ALL_STUDENTS", label: "Todos os Alunos" },
  { value: "ALL_PARENTS", label: "Todos os Pais" },
  { value: "ALL_TEACHERS", label: "Todos os Professores" },
  { value: "SPECIFIC_STUDENTS", label: "Alunos Específicos" },
  { value: "CLASS", label: "Turma Específica" },
];

export default function NewCommunicationPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [students, setStudents] = React.useState<any[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({
    type: "EMAIL" as string,
    subject: "",
    content: "",
    recipientType: "ALL_STUDENTS" as string,
    recipients: [] as string[],
    classId: "",
    scheduledFor: "",
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

  const toggleRecipient = (id: string) => {
    setForm((prev) => ({
      ...prev,
      recipients: prev.recipients.includes(id)
        ? prev.recipients.filter((r) => r !== id)
        : [...prev.recipients, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.recipientType === "SPECIFIC_STUDENTS" && form.recipients.length === 0) {
      setError("Selecione pelo menos um aluno");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          recipients: form.recipientType === "SPECIFIC_STUDENTS" ? form.recipients : [],
          classId: form.recipientType === "CLASS" ? form.classId : null,
          scheduledFor: form.scheduledFor || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/communications");
        router.refresh();
      } else throw new Error(json.error || "Erro ao enviar");
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Nova Mensagem</h1>
          <p className="text-sm text-zinc-500">Envie comunicados para alunos, pais e professores</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-zinc-500" />Nova Comunicação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Destinatários *</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.recipientType}
                  onChange={(e) => setForm((p) => ({ ...p, recipientType: e.target.value, recipients: [], classId: "" }))}
                >
                  {recipientTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.recipientType === "SPECIFIC_STUDENTS" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Selecionar Alunos</label>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                  {students.length === 0 ? (
                    <p className="text-sm text-zinc-400 p-2">Nenhum aluno encontrado</p>
                  ) : (
                    students.map((s: any) => (
                      <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={form.recipients.includes(s.id)}
                          onChange={() => toggleRecipient(s.id)}
                        />
                        {s.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {form.recipientType === "CLASS" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Turma</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  value={form.classId}
                  onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                >
                  <option value="">Selecione uma turma...</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.course?.name || c.room || c.id}</option>
                  ))}
                </select>
              </div>
            )}

            <Input label="Assunto *" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Conteúdo *</label>
              <textarea
                className="min-h-[200px] w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                required
                placeholder="Escreva sua mensagem aqui..."
              />
            </div>
            <Input label="Agendar para (opcional)" type="datetime-local" value={form.scheduledFor} onChange={(e) => setForm((p) => ({ ...p, scheduledFor: e.target.value }))} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <><Send className="mr-2 h-4 w-4" />Enviar Mensagem</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
