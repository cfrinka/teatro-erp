"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Send, MessageSquare, Mail, Phone, Bell, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

const communications = [
  { id: "1", type: "EMAIL", subject: "Boas-vindas novos alunos", content: "Sejam bem-vindos ao semestre 2025.2!", recipients: 45, sentAt: "2025-07-01T10:00:00", status: "SENT" },
  { id: "2", type: "WHATSAPP", subject: "Lembrete de aula", content: "Aula amanhã às 14h. Não esquecer o material!", recipients: 12, sentAt: "2025-06-28T08:00:00", status: "SENT" },
  { id: "3", type: "NOTIFICATION", subject: "Apresentação semestral", content: "A apresentação de fim de semestre será no dia 15/07.", recipients: 89, sentAt: "2025-06-25T14:30:00", status: "SENT" },
  { id: "4", type: "EMAIL", subject: "Atraso nas mensalidades", content: "Gentileza regularizar as mensalidades em aberto.", recipients: 8, sentAt: "2025-06-20T09:00:00", status: "SCHEDULED" },
  { id: "5", type: "SMS", subject: "Matrículas abertas", content: "Matrículas para o próximo semestre já estão abertas!", recipients: 0, sentAt: null, status: "DRAFT" },
];

const typeIcons: Record<string, React.ElementType> = {
  EMAIL: Mail,
  SMS: Phone,
  WHATSAPP: MessageSquare,
  NOTIFICATION: Bell,
  BULLETIN: MessageSquare,
};

const typeLabels: Record<string, string> = {
  EMAIL: "E-mail",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  NOTIFICATION: "Notificação",
  BULLETIN: "Comunicado",
};

const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "warning" }> = {
  SENT: { label: "Enviado", variant: "success" },
  SCHEDULED: { label: "Agendado", variant: "warning" },
  DRAFT: { label: "Rascunho", variant: "secondary" },
};

export default function CommunicationsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = communications.filter((c) =>
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Comunicação</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Envie mensagens e comunicados para alunos, pais e professores
          </p>
        </div>
        <Button onClick={() => router.push("/communications/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Mensagem
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Enviar E-mail", icon: Mail, desc: "Para alunos ou turmas", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" },
          { label: "WhatsApp", icon: MessageSquare, desc: "Mensagem instantânea", color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" },
          { label: "Notificação", icon: Bell, desc: "No app e portal", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400" },
          { label: "Comunicado", icon: Send, desc: "Para todos os alunos", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400" },
        ].map((item) => (
          <Card key={item.label} className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Buscar mensagens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((msg) => {
              const Icon = typeIcons[msg.type] || Mail;
              const config = statusConfig[msg.status] || { label: msg.status, variant: "secondary" as const };
              return (
                <div
                  key={msg.id}
                  className="flex items-start gap-4 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {msg.subject}
                      </span>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-1">{msg.content}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {typeLabels[msg.type]}
                      </Badge>
                      <span className="text-xs text-zinc-400">
                        {msg.recipients > 0 ? `${msg.recipients} destinatários` : "Sem destinatários"}
                      </span>
                      {msg.sentAt && (
                        <span className="text-xs text-zinc-400">
                          {formatDateTime(msg.sentAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
