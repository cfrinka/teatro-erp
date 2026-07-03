"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText, Download, Eye, Trash2, Filter, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate, truncate } from "@/lib/utils";

const documents = [
  { id: "1", title: "Contrato - Ana Beatriz Silva", type: "CONTRACT", category: "Contratos", student: "Ana Beatriz Silva", uploadedBy: "Admin", createdAt: "2025-01-10", fileSize: "245 KB" },
  { id: "2", title: "Ficha de Matrícula - Carlos Lima", type: "FORM", category: "Matrículas", student: "Carlos Eduardo Lima", uploadedBy: "Admin", createdAt: "2025-02-05", fileSize: "180 KB" },
  { id: "3", title: "Relatório Turma A - Junho", type: "REPORT", category: "Relatórios", student: null, uploadedBy: "Coordenação", createdAt: "2025-06-30", fileSize: "1.2 MB" },
  { id: "4", title: "Certificado - Mariana Oliveira", type: "CERTIFICATE", category: "Certificados", student: "Mariana Oliveira", uploadedBy: "Admin", createdAt: "2025-06-15", fileSize: "320 KB" },
  { id: "5", title: "Atestado de Matrícula - Pedro Santos", type: "OTHER", category: "Documentos", student: "Pedro Henrique Santos", uploadedBy: "Recepção", createdAt: "2025-03-01", fileSize: "95 KB" },
  { id: "6", title: "Relatório Financeiro - Junho", type: "REPORT", category: "Relatórios", student: null, uploadedBy: "Financeiro", createdAt: "2025-07-01", fileSize: "850 KB" },
  { id: "7", title: "Contrato - Julia Rodrigues", type: "CONTRACT", category: "Contratos", student: "Julia Rodrigues", uploadedBy: "Admin", createdAt: "2024-06-20", fileSize: "245 KB" },
];

const typeLabels: Record<string, string> = {
  CONTRACT: "Contrato",
  FORM: "Formulário",
  REPORT: "Relatório",
  CERTIFICATE: "Certificado",
  OTHER: "Outro",
};

const typeColors: Record<string, "success" | "info" | "warning" | "secondary" | "default"> = {
  CONTRACT: "info",
  FORM: "secondary",
  REPORT: "warning",
  CERTIFICATE: "success",
  OTHER: "default",
};

export default function DocumentsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");

  const filtered = documents.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.student?.toLowerCase().includes(search.toLowerCase()));
    const matchesType = !typeFilter || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const categories = [...new Set(documents.map((d) => d.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Documentos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gerencie contratos, formulários e certificados
          </p>
        </div>
        <Button onClick={() => router.push("/documents/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      {/* Categories */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <Card
            key={cat}
            className={`cursor-pointer transition-all hover:shadow-md ${
              typeFilter === cat ? "ring-2 ring-zinc-900 dark:ring-zinc-50" : ""
            }`}
            onClick={() => setTypeFilter(typeFilter === cat ? "" : cat || "")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{cat}</p>
                  <p className="text-xs text-zinc-500">
                    {documents.filter((d) => d.category === cat).length} documentos
                  </p>
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
                placeholder="Buscar documentos..."
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

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Aluno</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Enviado por</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Arquivo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <FileText className="h-4 w-4 text-zinc-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {truncate(doc.title, 40)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={typeColors[doc.type] || "secondary"}>
                        {typeLabels[doc.type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {doc.student || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {doc.uploadedBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{doc.fileSize}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
