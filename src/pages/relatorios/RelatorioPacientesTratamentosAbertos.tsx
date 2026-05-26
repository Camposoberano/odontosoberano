import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Printer, AlertCircle, Phone, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function RelatorioPacientesTratamentosAbertos() {
  const { user } = useAuth();

  const { data: pacientes = [], isLoading } = useQuery({
    queryKey: ["relatorio-tratamentos-abertos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Pacientes com orçamento aprovado mas sem agendamento futuro
      const hoje = new Date().toISOString();

      // Busca pacientes com orcamento aprovado
      const { data: orcamentosData, error: e1 } = await supabase
        .from("orcamentos")
        .select("paciente_id, created_at, pacientes(nome, telefone, cpf, ultima_consulta)")
        .eq("status", "aprovado");
      if (e1) throw e1;

      // Busca agendamentos futuros (confirmados)
      const { data: agendamentosData, error: e2 } = await supabase
        .from("agendamentos")
        .select("paciente_id")
        .gte("data_agendamento", hoje)
        .not("status", "eq", "cancelado");
      if (e2) throw e2;

      const comAgendamentoFuturo = new Set((agendamentosData || []).map(a => a.paciente_id));

      // Agrupar por paciente
      const mapa: Record<string, any> = {};
      for (const o of (orcamentosData || [])) {
        if (!o.paciente_id || comAgendamentoFuturo.has(o.paciente_id)) continue;
        if (!mapa[o.paciente_id]) {
          const p = o.pacientes as any;
          mapa[o.paciente_id] = {
            id: o.paciente_id,
            nome: p?.nome ?? "—",
            telefone: p?.telefone ?? null,
            cpf: p?.cpf ?? null,
            ultima_consulta: p?.ultima_consulta ?? null,
          };
        }
      }
      return Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome));
    },
  });

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">
              TRATAMENTOS ABERTOS SEM CONSULTA
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Pacientes com orçamento aprovado e sem agendamento futuro
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="h-9 px-4 text-base font-black">
              <AlertCircle className="w-4 h-4 mr-2" />
              {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""}
            </Badge>
            <Button variant="outline" onClick={() => window.print()} className="gap-2 no-print">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Pacientes que precisam de agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : pacientes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                🎉 Todos os pacientes com tratamento aprovado têm consulta agendada.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Paciente</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">CPF</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Última Consulta</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Telefone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.map((p: any) => (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{p.nome}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {p.cpf ? p.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.ultima_consulta && !isNaN(new Date(p.ultima_consulta).getTime())
                            ? format(new Date(p.ultima_consulta), "dd/MM/yyyy", { locale: ptBR })
                            : <span className="text-orange-500 font-bold">Nunca</span>}
                        </td>
                        <td className="px-4 py-3">
                          {p.telefone ? (
                            <a href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-green-600 hover:underline font-medium">
                              <Phone className="w-3 h-3" /> {p.telefone}
                            </a>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
