"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPhone, formatCurrency } from "@/lib/utils";

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchTeachers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/teachers?${params}`);
      const json = await res.json();
      if (json.success) {
        setTeachers(json.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(fetchTeachers, 300);
    return () => clearTimeout(timer);
  }, [fetchTeachers]);

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/teachers/${selectedTeacher}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeleteDialogOpen(false);
        setSelectedTeacher(null);
        fetchTeachers();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Professores</h1>
          <p className="text-sm text-zinc-500">Gerencie os professores da escola</p>
        </div>
        <Button onClick={() => router.push("/teachers/new")}>
          <Plus className="h-4 w-4 mr-2" />Novo Professor
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Buscar por nome, especialidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">CPF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Especialidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Valor Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">
                      {search ? "Nenhum professor encontrado para esta busca" : "Nenhum professor cadastrado"}
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 cursor-pointer" onClick={() => router.push(`/teachers/${teacher.id}`)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium dark:bg-zinc-800">
                            {teacher.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium">{teacher.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{teacher.cpf}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{formatPhone(teacher.phone)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{teacher.specialty || "-"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{formatCurrency(teacher.hourlyRate)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={teacher.status === "ACTIVE" ? "success" : "secondary"}>
                          {teacher.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/teachers/${teacher.id}`); }}>
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/teachers/${teacher.id}/edit`); }}>
                              <Pencil className="mr-2 h-4 w-4" />Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); setSelectedTeacher(teacher.id); setDeleteDialogOpen(true); }}>
                              <Trash2 className="mr-2 h-4 w-4" />Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja desativar este professor? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Excluindo...</> : "Desativar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
