import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfiguracoesComunicacao } from "@/hooks/useConfiguracoesComunicacao";
import { Bell, MessageCircle, Phone, AlertTriangle, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function Comunicacao() {
  const { config, isLoading, saveConfig, isSaving } = useConfiguracoesComunicacao();

  const [form, setForm] = useState({
    confirmacao_ativa: false,
    confirmacao_horas_antes: 24,
    confirmacao_canal: "whatsapp" as "whatsapp" | "sms",
    lembrete_ativo: false,
    lembrete_horas_antes: 2,
    lembrete_canal: "whatsapp" as "whatsapp" | "sms",
    alerta_saldo_ativo: false,
  });

  useEffect(() => {
    if (config) {
      setForm({
        confirmacao_ativa: config.confirmacao_ativa,
        confirmacao_horas_antes: config.confirmacao_horas_antes,
        confirmacao_canal: config.confirmacao_canal,
        lembrete_ativo: config.lembrete_ativo,
        lembrete_horas_antes: config.lembrete_horas_antes,
        lembrete_canal: config.lembrete_canal,
        alerta_saldo_ativo: config.alerta_saldo_ativo,
      });
    }
  }, [config]);

  const horasOptions = [1, 2, 4, 6, 12, 24, 48];

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">
              CONFIGURAÇÕES DE COMUNICAÇÃO
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Notificações e lembretes automáticos para pacientes
            </p>
          </div>
          <Button
            onClick={() => saveConfig(form)}
            disabled={isSaving || isLoading}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {/* Confirmação de consulta */}
        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" /> Confirmação de Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Enviar confirmação automática</p>
                <p className="text-xs text-muted-foreground">Mensagem enviada antes da consulta solicitando confirmação</p>
              </div>
              <Switch
                checked={form.confirmacao_ativa}
                onCheckedChange={(v) => {
                  const next = { ...form, confirmacao_ativa: v };
                  setForm(next);
                  saveConfig(next);
                }}
              />
            </div>
            {form.confirmacao_ativa && (
              <div className="grid grid-cols-2 gap-4 pl-1 border-l-2 border-green-200 ml-1">
                <div className="space-y-2">
                  <Label>Enviar com antecedência de</Label>
                  <Select
                    value={String(form.confirmacao_horas_antes)}
                    onValueChange={(v) => setForm((f) => ({ ...f, confirmacao_horas_antes: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {horasOptions.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h} hora{h !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select
                    value={form.confirmacao_canal}
                    onValueChange={(v) => setForm((f) => ({ ...f, confirmacao_canal: v as "whatsapp" | "sms" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lembrete de consulta */}
        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" /> Lembrete de Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Enviar lembrete automático</p>
                <p className="text-xs text-muted-foreground">Lembrete enviado próximo ao horário da consulta</p>
              </div>
              <Switch
                checked={form.lembrete_ativo}
                onCheckedChange={(v) => {
                  const next = { ...form, lembrete_ativo: v };
                  setForm(next);
                  saveConfig(next);
                }}
              />
            </div>
            {form.lembrete_ativo && (
              <div className="grid grid-cols-2 gap-4 pl-1 border-l-2 border-blue-200 ml-1">
                <div className="space-y-2">
                  <Label>Enviar com antecedência de</Label>
                  <Select
                    value={String(form.lembrete_horas_antes)}
                    onValueChange={(v) => setForm((f) => ({ ...f, lembrete_horas_antes: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {horasOptions.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h} hora{h !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select
                    value={form.lembrete_canal}
                    onValueChange={(v) => setForm((f) => ({ ...f, lembrete_canal: v as "whatsapp" | "sms" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerta saldo */}
        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Alerta de Saldo Baixo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Ativar alerta de saldo baixo</p>
                <p className="text-xs text-muted-foreground">Notificação quando o saldo do fluxo de caixa estiver baixo</p>
              </div>
              <Switch
                checked={form.alerta_saldo_ativo}
                onCheckedChange={(v) => {
                  const next = { ...form, alerta_saldo_ativo: v };
                  setForm(next);
                  saveConfig(next);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
