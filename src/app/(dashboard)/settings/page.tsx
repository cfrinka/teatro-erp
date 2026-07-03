"use client";

import * as React from "react";
import { Save, Building2, CreditCard, Bell, Shield, Palette, Globe, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [saving, setSaving] = React.useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Configurações</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gerencie as configurações do sistema
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* School Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-zinc-500" />
              Informações da Escola
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome da Escola</Label>
              <Input defaultValue="Escola de Teatro" className="mt-1" />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input defaultValue="Rua das Artes, 123" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input defaultValue="(11) 99999-8888" className="mt-1" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input defaultValue="contato@escoladeteatro.com.br" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>CNPJ</Label>
              <Input defaultValue="00.000.000/0001-00" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-zinc-500" />
              Configurações Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Valor Padrão da Mensalidade</Label>
              <Input type="number" defaultValue="250" className="mt-1" />
            </div>
            <div>
              <Label>Percentual de Multa por Atraso (%)</Label>
              <Input type="number" defaultValue="2" className="mt-1" />
            </div>
            <div>
              <Label>Juros por Dia de Atraso (%)</Label>
              <Input type="number" defaultValue="0.33" step="0.01" className="mt-1" />
            </div>
            <div>
              <Label>Dia de Vencimento Padrão</Label>
              <Input type="number" defaultValue="10" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Academic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-5 w-5 text-zinc-500" />
              Configurações Acadêmicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ano Letivo</Label>
              <Input defaultValue="2025" className="mt-1" />
            </div>
            <div>
              <Label>Máximo de Alunos por Turma</Label>
              <Input type="number" defaultValue="20" className="mt-1" />
            </div>
            <div>
              <Label>Dias Úteis da Semana</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm cursor-pointer hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <input type="checkbox" defaultChecked={day !== "Sáb"} className="rounded" />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-zinc-500" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notificações por E-mail</Label>
                <p className="text-xs text-zinc-500">Enviar e-mails automáticos para alunos e pais</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notificações SMS</Label>
                <p className="text-xs text-zinc-500">Enviar SMS para lembretes de pagamento</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">WhatsApp</Label>
                <p className="text-xs text-zinc-500">Integração com WhatsApp para comunicados</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Lembretes de Aula</Label>
                <p className="text-xs text-zinc-500">Notificar alunos sobre aulas do dia seguinte</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-zinc-500" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Autenticação em Dois Fatores</Label>
                <p className="text-xs text-zinc-500">Exigir 2FA para administradores</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Bloqueio por Inatividade</Label>
                <p className="text-xs text-zinc-500">Bloquear sessão após 30 minutos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label>Política de Senhas</Label>
              <select className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                <option>Padrão (8 caracteres)</option>
                <option>Forte (12 caracteres, 2FA obrigatório)</option>
                <option>Personalizado</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-5 w-5 text-zinc-500" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tema Padrão</Label>
              <select className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                <option>Sistema</option>
                <option>Claro</option>
                <option>Escuro</option>
              </select>
            </div>
            <div>
              <Label>Idioma</Label>
              <select className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                <option>Português (Brasil)</option>
                <option>English</option>
                <option>Español</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Modo Compacto</Label>
                <p className="text-xs text-zinc-500">Reduzir espaçamento da interface</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
