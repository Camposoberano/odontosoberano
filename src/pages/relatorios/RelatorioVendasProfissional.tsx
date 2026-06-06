import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Printer, User, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

type PeriodoKey = "mes_atual" | "mes_anterior" | "custom";

export default function RelatorioVendasProfissional() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<PeriodoKey>("mes_atual");
  const [dataInicio, setDataInicio] = useState(() => format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dataFim, setDataFim] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const getRange = () => {
    if (periodo === "mes_atual") return { inicio: format(startOfMonth(new Date()), "yyyy-MM-dd"), fim: format(endOfMonth(new Date()), "yyyy-MM-dd") };
    if (periodo === "mes_anterior") return { inicio: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"), fim: format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd") };
    return { inicio: dataInicio, fim: dataFim };
  };
  const range = getRange();

  const { data: vendas = [], isLoading } = useQuery({
    queryKey: ["relatorio-vendas-profissional", user?.id, range.inicio, range.fim],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_itens")
        .select(`
          preco_total, quantidade,
          orcamentos!inner(status, created_at, data_aprovacao,
            dentistas(nome)
          )
        `)
        .in("orcamentos.status", ["aprovado", "contrato_assinado"])
        .gte("orcamentos.created_at", range.inicio)
        .lte("orcamentos.created_at", range.fim + "T23:59:59");
      if (error) throw error;

      // Agrupar por dentista
      const mapa: Record<string, { nome: string; qtd_orcamentos: number; total: number }> = {};
      for (const item of (data || [])) {
        const orcamento = item.orcamentos as any;
        const dentista = orcamento?.dentistas;
        const nome = dentista?.nome ?? "Sem profissional";
        if (!mapa[nome]) mapa[nome] = { nome, qtd_orcamentos: 0, total: 0 };
        mapa[nome].total += Number(item.preco_total) || 0;
        mapa[nome].qtd_orcamentos += 1;
      }
      return Object.values(mapa).sort((a, b) => b.total - a.total);
    },
  });

  const totalGeral = vendas.reduce((s, v) => s + v.total, 0);

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">
              VENDAS POR PROFISSIONAL
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Orçamentos aprovados agrupados por dentista
            </p>
          </div>
          <Button variant="outline" onClick={() => window.print()} className="gap-2 no-print">
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
        </div>

        {/* Filtros */}
        <Card className="rounded-2xl border-2">
          <CardContent className="p-4 flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label>Período</Label>
              <div className="flex gap-2">
                {([["mes_atual", "Mês Atual"], ["mes_anterior", "Mês Anterior"], ["custom", "Personalizado"]] as [PeriodoKey, string][]).map(([k, l]) => (
                  <Button key={k} size="sm" variant={periodo === k ? "default" : "outline"} onClick={() => setPeriodo(k)} className="rounded-xl">{l}</Button>
                ))}
              </div>
            </div>
            {periodo === "custom" && (
              <div className="flex gap-3 items-end">
                <div className="space-y-1">
                  <Label>De</Label>
                  <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-36" />
                </div>
                <div className="space-y-1">
                  <Label>Até</Label>
                  <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-36" />
                </div>
              </div>
            )}
            <Badge variant="secondary" className="h-9 px-4 text-base font-black ml-auto">
              Total: {totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Produção por Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : vendas.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Nenhuma venda no período.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Profissional</th>
                      <th className="text-right px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Nº Itens</th>
                      <th className="text-right px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Total (R$)</th>
                      <th className="text-right px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendas.map((v, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" /> {v.nome}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">{v.qtd_orcamentos}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {v.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">
                          {totalGeral > 0 ? ((v.total / totalGeral) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 font-black">
                    <tr>
                      <td className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 text-right">{vendas.reduce((s, v) => s + v.qtd_orcamentos, 0)}</td>
                      <td className="px-4 py-3 text-right">{totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td className="px-4 py-3 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
