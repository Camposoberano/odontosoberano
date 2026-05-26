import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Birthday, Phone, Printer, Users } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

// Ícone de aniversário via cake-slice
import { Cake } from "lucide-react";

function calcularIdade(dataNasc: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNasc + "T00:00:00");
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function diasParaAniversario(dataNasc: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNasc + "T00:00:00");
  const proxAniv = new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate());
  if (proxAniv < hoje) proxAniv.setFullYear(hoje.getFullYear() + 1);
  return Math.ceil((proxAniv.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RelatorioAniversariantes() {
  const { user } = useAuth();
  const [dias, setDias] = useState(30);

  const { data: pacientes = [], isLoading } = useQuery({
    queryKey: ["relatorio-aniversariantes", user?.id, dias],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("id, nome, telefone, data_nascimento, cpf, status")
        .eq("status", "Ativo")
        .not("data_nascimento", "is", null)
        .order("nome");
      if (error) throw error;

      const hoje = new Date();
      return (data || [])
        .filter(p => {
          const d = diasParaAniversario(p.data_nascimento!);
          return d >= 0 && d <= dias;
        })
        .sort((a, b) => diasParaAniversario(a.data_nascimento!) - diasParaAniversario(b.data_nascimento!));
    },
  });

  const handlePrint = () => window.print();

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">
              ANIVERSARIANTES
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Pacientes com aniversário nos próximos dias
            </p>
          </div>
          <Button variant="outline" onClick={handlePrint} className="gap-2 no-print">
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
        </div>

        {/* Filtro */}
        <Card className="rounded-2xl border-2">
          <CardContent className="p-4 flex items-end gap-4">
            <div className="space-y-1">
              <Label>Próximos dias</Label>
              <div className="flex gap-2">
                {[7, 15, 30, 60].map(d => (
                  <Button key={d} size="sm" variant={dias === d ? "default" : "outline"}
                    onClick={() => setDias(d)} className="rounded-xl">
                    {d} dias
                  </Button>
                ))}
              </div>
            </div>
            <Badge variant="secondary" className="h-9 px-4 text-base font-black">
              <Users className="w-4 h-4 mr-2" />
              {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""}
            </Badge>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-500" />
              Lista de Aniversariantes — próximos {dias} dias
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : pacientes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum aniversariante nos próximos {dias} dias.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Paciente</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Data Aniversário</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Idade</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Faltam</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Telefone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.map(p => {
                      const faltam = diasParaAniversario(p.data_nascimento!);
                      return (
                        <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-800">{p.nome}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {format(new Date(p.data_nascimento! + "T00:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{calcularIdade(p.data_nascimento!)} anos</td>
                          <td className="px-4 py-3">
                            <Badge variant={faltam === 0 ? "default" : faltam <= 7 ? "destructive" : "secondary"}
                              className="text-xs">
                              {faltam === 0 ? "🎂 Hoje!" : `${faltam} dias`}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {p.telefone ? (
                              <a href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-green-600 hover:underline font-medium">
                                <Phone className="w-3 h-3" /> {p.telefone}
                              </a>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })}
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
