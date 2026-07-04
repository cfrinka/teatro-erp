"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreHorizontal, Loader2, Mail, Phone } from "lucide-react";
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

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  COORDINATION: "Coordenação",
  FINANCIAL: "Financeiro",
  TEACHER: "Professor",
  RECEPTION: "Recepção",
};

const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
  ADMIN: "destructive",
  COORDINATION: "success",
  FINANCIAL: "default",
  TEACHER: "secondary",
  RECEPTION: "outline",
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      const json = await res.json();
      if (json.success) {
        fetchUsers();
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Usuários</h1>
          <p className="text-sm text-zinc-500">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => router.push("/users/new")}>
          <Plus className="h-4 w-4 mr-2" />Novo Usuário
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Função</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">
                      {search ? "Nenhum usuário encontrado para esta busca" : "Nenhum usuário cadastrado"}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium dark:bg-zinc-800">
                            {user.photoUrl ? (
                              <img src={user.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{user.name}</span>
                            {user.phone && (
                              <div className="flex items-center gap-1 text-xs text-zinc-400">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-zinc-600">
                          <Mail className="h-3.5 w-3.5 text-zinc-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={roleColors[user.role] || "default"}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.active ? "success" : "secondary"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.active)}>
                              {user.active ? "Desativar" : "Reativar"}
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
    </div>
  );
}
