import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Download, FileText, TrendingUp, CheckCircle, DollarSign, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRelatorioOrcamentos } from "@/hooks/useRelatorioOrcamentos";
import { downloadCSV } from "@/utils/exportUtils";

const STATUS_COLOR: Record<string, string> = {
  rascunho: "bg-gray-400",
  enviado: "bg-blue-500",
  aprovado: "bg-emerald-500",
  recusado: "bg-rose-500",
  contrato_assinado: "bg-purple-500",
};

export default function RelatorioOrcamentos() {
  const [dataInicio, setDataInicio] = useState<Date>(new Date(new Date().setDate(1)));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [showCalendarInicio, setShowCalendarInicio] = useState(false);
  const [showCalendarFim, setShowCalendarFim] = useState(false);

  const { dados, loading } = useRelatorioOrcamentos(dataInicio, dataFim);

  const handleExportCSV = () => {
    try {
      const rows = [
        ...dados.por_status.map((s) => ({
          Secao: "Status",
          Descricao: s.label,
          Quantidade: s.count,
          Percentual: `${s.percentual.toFixed(1)}%`,
          Valor: s.valor_total,
        })),
        ...dados.top_procedimentos.map((p) => ({
          Secao: "Top Procedimentos",
          Descricao: p.nome,
          Quantidade: p.count,
          Percentual: "",
          Valor: p.valor_total,
        })),
        ...dados.por_dentista.map((d) => ({
          Secao: "Por Dentista",
          Descricao: d.nome,
          Quantidade: d.total,
          Percentual: `${d.aprovados} aprovados`,
          Valor: d.valor_aprovado,
        })),
      ];
      downloadCSV(rows, "Relatorio_Orcamentos");
      toast.success("CSV exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar CSV");
    }
  };

  const fmtBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const maxProcCount = dados.top_procedimentos[0]?.count ?? 1;
  const maxStatusCount = Math.max(...dados.por_status.map((s) => s.count), 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatório de Orçamentos</h1>
            <p className="text-muted-foreground">Taxa de aprovação, ticket médio e funil de conversão</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover open={showCalendarInicio} onOpenChange={setShowCalendarInicio}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4" />
                  Início: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataInicio}
                  onSelect={(date) => { if (date) { setDataInicio(date); setShowCalendarInicio(false); } }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover open={showCalendarFim} onOpenChange={setShowCalendarFim}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4" />
                  Fim: {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataFim}
                  onSelect={(date) => { if (date) { setDataFim(date); setShowCalendarFim(false); } }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" className="gap-2 border-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all" onClick={handleExportCSV}>
              <Download className="w-4 h-4 text-emerald-600" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-32" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="medical-card border-l-4 border-l-slate-500 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-slate-50 rounded-lg"><FileText className="h-5 w-5 text-slate-600" /></div>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-100 font-bold">TOTAL</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-gray-800">{dados.total}</div>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Orçamentos no período</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className={`medical-card border-l-4 shadow-sm hover:shadow-md transition-all ${dados.taxa_aprovacao >= 50 ? "border-l-emerald-500" : "border-l-amber-500"}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${dados.taxa_aprovacao >= 50 ? "bg-emerald-50" : "bg-amber-50"}`}>
                      <CheckCircle className={`h-5 w-5 ${dados.taxa_aprovacao >= 50 ? "text-emerald-600" : "text-amber-600"}`} />
                    </div>
                    <Badge variant="outline" className={`${dados.taxa_aprovacao >= 50 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"} font-bold`}>APROVAÇÃO</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-gray-800">{dados.taxa_aprovacao.toFixed(1)}%</div>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Aprovados vs recusados</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="medical-card border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold">TICKET MÉDIO</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-gray-800">{fmtBRL(dados.ticket_medio)}</div>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Média dos aprovados</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="medical-card border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-teal-50 rounded-lg"><DollarSign className="h-5 w-5 text-teal-600" /></div>
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-100 font-bold">APROVADO</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-gray-800">{fmtBRL(dados.total_aprovado)}</div>
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      Perdido: <span className="text-rose-500">{fmtBRL(dados.total_perdido)}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* BarChart por mês */}
        <Card className="medical-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Evolução Mensal
            </CardTitle>
            <CardDescription>Total de orçamentos, aprovados e recusados por mês</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : dados.por_mes.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Nenhum orçamento no período</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.por_mes} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar dataKey="total" name="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={18} />
                    <Bar dataKey="aprovados" name="Aprovados" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                    <Bar dataKey="recusados" name="Recusados" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Status + Top Procedimentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-teal-700">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : dados.por_status.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum dado no período</p>
              ) : (
                <div className="space-y-4">
                  {dados.por_status.map((s) => (
                    <div key={s.status} className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{s.label}</span>
                          <span className="text-sm text-muted-foreground">{s.count} ({s.percentual.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`${STATUS_COLOR[s.status] ?? "bg-gray-400"} h-2 rounded-full`}
                            style={{ width: `${Math.min((s.count / maxStatusCount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right w-28 shrink-0">
                        <span className="text-sm font-medium">{fmtBRL(s.valor_total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Top Procedimentos (aprovados)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : dados.top_procedimentos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum procedimento aprovado no período</p>
              ) : (
                <div className="space-y-4">
                  {dados.top_procedimentos.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate pr-2">{p.nome}</span>
                          <span className="text-sm text-muted-foreground shrink-0">{p.count}x</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min((p.count / maxProcCount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right w-28 shrink-0">
                        <span className="text-sm font-medium text-blue-600">{fmtBRL(p.valor_total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Por Dentista */}
        <Card className="medical-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Desempenho por Dentista
            </CardTitle>
            <CardDescription>Total de orçamentos e taxa de aprovação por profissional</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : dados.por_dentista.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum dado no período</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dentista</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Aprovados</TableHead>
                    <TableHead className="text-center">Taxa</TableHead>
                    <TableHead className="text-right">Valor Aprovado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.por_dentista.map((d, i) => {
                    const taxa = d.total > 0 ? (d.aprovados / d.total) * 100 : 0;
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{d.nome}</TableCell>
                        <TableCell className="text-center">{d.total}</TableCell>
                        <TableCell className="text-center text-emerald-600 font-semibold">{d.aprovados}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={taxa >= 50 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                            {taxa.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-teal-600">{fmtBRL(d.valor_aprovado)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Perdidos */}
        {!loading && dados.total_perdido > 0 && (
          <Card className="medical-card border-2 border-rose-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-rose-800 uppercase tracking-tight">Orçamentos Recusados</p>
                  <p className="text-2xl font-black text-rose-600">{fmtBRL(dados.total_perdido)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {dados.por_status.find(s => s.status === "recusado")?.count ?? 0} orçamentos não convertidos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
