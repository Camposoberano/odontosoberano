import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DollarSign, Download, Calendar, TrendingUp, TrendingDown, ArrowUp,
  AlertCircle, Wallet, Activity, CreditCard, Users, Search, Clock,
  ArrowDown, ChevronDown, ChevronUp,
} from "lucide-react";
import { useRelatorioFinanceiro } from "@/hooks/useRelatorioFinanceiro";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  ComposedChart, Line,
} from "recharts";
import { motion } from "framer-motion";
import { downloadCSV } from "@/utils/exportUtils";

const fmt = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const fmtDate = (d: string) => {
  try { return format(parseISO(d), "dd/MM/yyyy", { locale: ptBR }); } catch { return d; }
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

export default function RelatorioFinanceiro() {
  const [dataInicio, setDataInicio] = useState<Date>(new Date(new Date().setDate(1)));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [showCalendarInicio, setShowCalendarInicio] = useState(false);
  const [showCalendarFim, setShowCalendarFim] = useState(false);
  const [buscaEntradas, setBuscaEntradas] = useState("");
  const [sortEntradas, setSortEntradas] = useState<"data" | "valor">("data");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showAllEntradas, setShowAllEntradas] = useState(false);
  const [showAllPendentes, setShowAllPendentes] = useState(false);
  const [filtroForma, setFiltroForma] = useState<string>("Todos");
  const [filtroPendente, setFiltroPendente] = useState<string>("Todos");

  const { dadosFinanceiros: d, loading } = useRelatorioFinanceiro(dataInicio, dataFim);

  const margemLucro = d.receitas_total > 0
    ? ((d.saldo / d.receitas_total) * 100).toFixed(1)
    : "0.0";

  // Formas de pagamento únicas para filtro
  const formasUnicas = useMemo(() => {
    const s = new Set(d.receitas_detalhadas.map(r => r.forma_pagamento));
    return ["Todos", ...Array.from(s).sort()];
  }, [d.receitas_detalhadas]);

  // Filtrar e ordenar entradas
  const entradasFiltradas = useMemo(() => {
    let arr = d.receitas_detalhadas.filter(r => {
      const matchBusca = !buscaEntradas ||
        r.paciente.toLowerCase().includes(buscaEntradas.toLowerCase()) ||
        r.forma_pagamento.toLowerCase().includes(buscaEntradas.toLowerCase()) ||
        r.descricao.toLowerCase().includes(buscaEntradas.toLowerCase());
      const matchForma = filtroForma === "Todos" || r.forma_pagamento === filtroForma;
      return matchBusca && matchForma;
    });
    arr = [...arr].sort((a, b) => {
      if (sortEntradas === "data") {
        return sortDir === "desc"
          ? new Date(b.data).getTime() - new Date(a.data).getTime()
          : new Date(a.data).getTime() - new Date(b.data).getTime();
      }
      return sortDir === "desc" ? b.valor - a.valor : a.valor - b.valor;
    });
    return arr;
  }, [d.receitas_detalhadas, buscaEntradas, sortEntradas, sortDir, filtroForma]);

  // Filtro de pendentes por status
  const pendentesFiltrados = useMemo(() => {
    if (filtroPendente === "Todos") return d.contas_receber_a_entrar;
    return d.contas_receber_a_entrar.filter(c => c.status === filtroPendente);
  }, [d.contas_receber_a_entrar, filtroPendente]);

  const entradasVisiveis = showAllEntradas ? entradasFiltradas : entradasFiltradas.slice(0, 10);
  const pendentesVisiveis = showAllPendentes ? pendentesFiltrados : pendentesFiltrados.slice(0, 8);

  const toggleSort = (col: "data" | "valor") => {
    if (sortEntradas === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortEntradas(col); setSortDir("desc"); }
  };

  const handleExportCSV = () => {
    try {
      const rows = [
        ...d.receitas_por_categoria.map(r => ({ Tipo: "RECEITA", Categoria: r.categoria, Valor: r.valor })),
        ...d.despesas_por_categoria.map(r => ({ Tipo: "DESPESA", Categoria: r.categoria, Valor: r.valor })),
        ...d.fluxo_mensal.map(f => ({ Tipo: "FLUXO", Mes: f.mes, Receitas: f.receitas, Despesas: f.despesas, Saldo: f.saldo })),
        ...d.receitas_detalhadas.map(r => ({ Tipo: "ENTRADA", Paciente: r.paciente, Data: fmtDate(r.data), Forma: r.forma_pagamento, Valor: r.valor, Descricao: r.descricao })),
      ];
      downloadCSV(rows, "Relatorio_Financeiro");
      toast.success("CSV exportado!");
    } catch { toast.error("Erro ao exportar CSV"); }
  };

  const SortBtn = ({ col, label }: { col: "data" | "valor"; label: string }) => (
    <button
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 font-semibold text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      {sortEntradas === col
        ? sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
        : <ChevronDown className="w-3 h-3 opacity-30" />
      }
    </button>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Cabeçalho ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatório Financeiro</h1>
            <p className="text-muted-foreground">Análise completa da situação financeira da clínica</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <Popover open={showCalendarInicio} onOpenChange={setShowCalendarInicio}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4" />
                  Início: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dataInicio}
                  onSelect={(date) => { if (date) { setDataInicio(date); setShowCalendarInicio(false); } }}
                  locale={ptBR} initialFocus />
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
                <CalendarComponent mode="single" selected={dataFim}
                  onSelect={(date) => { if (date) { setDataFim(date); setShowCalendarFim(false); } }}
                  locale={ptBR} initialFocus />
              </PopoverContent>
            </Popover>

            <Button variant="outline" className="gap-2 border-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all" onClick={handleExportCSV}>
              <Download className="w-4 h-4 text-emerald-600" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* ── KPIs resumo ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Card key={i} className="medical-card"><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "RECEITAS", value: fmt(d.receitas_total), sub: "Total realizado no período", icon: TrendingUp, color: "emerald", border: "border-l-emerald-500", bg: "bg-emerald-50", icon_color: "text-emerald-600", badge_class: "bg-emerald-50 text-emerald-700 border-emerald-100" },
              { label: "DESPESAS", value: fmt(d.despesas_total), sub: "Total de saídas pagas", icon: TrendingDown, color: "rose", border: "border-l-rose-500", bg: "bg-rose-50", icon_color: "text-rose-600", badge_class: "bg-rose-50 text-rose-700 border-rose-100" },
              { label: "SALDO REAL", value: fmt(d.saldo), sub: "Lucro líquido operacional", icon: DollarSign, color: d.saldo >= 0 ? "blue" : "orange", border: d.saldo >= 0 ? "border-l-blue-500" : "border-l-orange-500", bg: d.saldo >= 0 ? "bg-blue-50" : "bg-orange-50", icon_color: d.saldo >= 0 ? "text-blue-600" : "text-orange-600", badge_class: d.saldo >= 0 ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-orange-50 text-orange-700 border-orange-100" },
              { label: "MARGEM", value: `${margemLucro}%`, sub: "Rentabilidade sobre receita", icon: TrendingUp, color: "purple", border: "border-l-purple-500", bg: "bg-purple-50", icon_color: "text-purple-600", badge_class: "bg-purple-50 text-purple-700 border-purple-100" },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`medical-card border-l-4 ${kpi.border} shadow-sm hover:shadow-md transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 ${kpi.bg} rounded-lg`}>
                        <kpi.icon className={`h-5 w-5 ${kpi.icon_color}`} />
                      </div>
                      <Badge variant="outline" className={`${kpi.badge_class} font-bold`}>{kpi.label}</Badge>
                    </div>
                    <div className="mt-4">
                      <div className={`text-2xl lg:text-3xl font-black ${i === 2 && d.saldo < 0 ? "text-rose-600" : "text-gray-800"}`}>{kpi.value}</div>
                      <p className="text-xs font-medium text-muted-foreground mt-1">{kpi.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Fluxo de Caixa (Area + Linha de Saldo) ─────────────────────────── */}
        <Card className="medical-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Fluxo de Caixa Mensal
            </CardTitle>
            <CardDescription>Receitas, despesas e resultado por mês</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[340px] w-full">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={d.fluxo_mensal} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(value: any, name: string) => [fmt(Number(value)), name]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                    <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#gradReceitas)" />
                    <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} fill="url(#gradDespesas)" />
                    <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} strokeDasharray="5 3" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Pendências ─────────────────────────────────────────────────────── */}
        <Card className="medical-card border-2 border-primary/10 shadow-sm">
          <CardHeader className="bg-primary/5 border-b-2 border-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl font-black text-primary">
              <AlertCircle className="w-5 h-5" />
              Projetado — Valores Pendentes
            </CardTitle>
            <CardDescription className="font-bold text-primary/70">Não realizados — a receber e a pagar</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-24 w-full rounded-xl" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* A Receber */}
                <div className="p-4 border-2 border-orange-100 rounded-xl bg-orange-50/40 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg"><Wallet className="w-4 h-4 text-orange-600" /></div>
                    <span className="text-sm font-black text-orange-800 uppercase">A Receber</span>
                    <Badge className="ml-auto bg-orange-100 text-orange-700 text-[10px]">{d.contas_receber_pendente_count} contas</Badge>
                  </div>
                  <div className="text-2xl font-black text-orange-600">{fmt(d.contas_receber_pendente)}</div>
                  <p className="text-[10px] font-bold text-orange-600/70 mt-1 uppercase">Entradas pendentes / vencidas</p>
                </div>

                {/* A Pagar */}
                <div className="p-4 border-2 border-rose-100 rounded-xl bg-rose-50/40 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-rose-100 rounded-lg"><AlertCircle className="w-4 h-4 text-rose-600" /></div>
                    <span className="text-sm font-black text-rose-800 uppercase">A Pagar</span>
                    <Badge className="ml-auto bg-rose-100 text-rose-700 text-[10px]">{d.contas_pagar_pendente_count} contas</Badge>
                  </div>
                  <div className="text-2xl font-black text-rose-600">{fmt(d.contas_pagar_pendente)}</div>
                  <p className="text-[10px] font-bold text-rose-600/70 mt-1 uppercase">Saídas pendentes / vencidas</p>
                </div>

                {/* Saldo Projetado */}
                <div className={`p-4 border-2 rounded-xl group ${(d.contas_receber_pendente - d.contas_pagar_pendente) >= 0 ? "border-blue-100 bg-blue-50/40" : "border-rose-100 bg-rose-50/40"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${(d.contas_receber_pendente - d.contas_pagar_pendente) >= 0 ? "bg-blue-100" : "bg-rose-100"}`}>
                      <DollarSign className={`w-4 h-4 ${(d.contas_receber_pendente - d.contas_pagar_pendente) >= 0 ? "text-blue-600" : "text-rose-600"}`} />
                    </div>
                    <span className={`text-sm font-black uppercase ${(d.contas_receber_pendente - d.contas_pagar_pendente) >= 0 ? "text-blue-800" : "text-rose-800"}`}>Saldo Projetado</span>
                  </div>
                  <div className={`text-2xl font-black ${(d.contas_receber_pendente - d.contas_pagar_pendente) >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                    {fmt(d.contas_receber_pendente - d.contas_pagar_pendente)}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">A receber − a pagar</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Controle de Entradas ────────────────────────────────────────────── */}
        <Card className="medical-card shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <ArrowDown className="w-5 h-5 text-emerald-600" />
                    Controle de Entradas
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">{entradasFiltradas.length} registros</Badge>
                  </CardTitle>
                  <CardDescription>Quem pagou, quando, quanto e como — período selecionado</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente, forma, desc..."
                    value={buscaEntradas}
                    onChange={e => setBuscaEntradas(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>
              {/* Filtro por forma de pagamento */}
              {formasUnicas.length > 2 && (
                <div className="flex flex-wrap gap-2">
                  {formasUnicas.map(forma => {
                    const count = forma === "Todos"
                      ? d.receitas_detalhadas.length
                      : d.receitas_detalhadas.filter(r => r.forma_pagamento === forma).length;
                    return (
                      <button
                        key={forma}
                        onClick={() => { setFiltroForma(forma); setShowAllEntradas(false); }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          filtroForma === forma
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
                        }`}
                      >
                        {forma} <span className="opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : entradasFiltradas.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Nenhuma entrada no período</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-3"><SortBtn col="data" label="Data" /></th>
                      <th className="text-left py-3 px-3 font-semibold text-xs text-muted-foreground">Paciente</th>
                      <th className="text-left py-3 px-3 font-semibold text-xs text-muted-foreground">Forma</th>
                      <th className="text-left py-3 px-3 font-semibold text-xs text-muted-foreground">Categoria</th>
                      <th className="text-right py-3 px-3"><SortBtn col="valor" label="Valor" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entradasVisiveis.map((r, i) => (
                      <tr key={r.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{fmtDate(r.data)}</td>
                        <td className="py-2.5 px-3 font-semibold">{r.paciente}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-[10px] font-semibold">{r.forma_pagamento}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground text-xs">{r.categoria || r.descricao || "—"}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-700">{fmt(r.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {entradasFiltradas.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 bg-muted/20">
                        <td colSpan={4} className="py-2.5 px-3 font-black text-sm">
                          {showAllEntradas ? "Total" : `Top ${Math.min(10, entradasFiltradas.length)} de ${entradasFiltradas.length}`}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                          {fmt(entradasVisiveis.reduce((s, r) => s + r.valor, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
                {entradasFiltradas.length > 10 && (
                  <div className="flex justify-center pt-3">
                    <Button variant="ghost" size="sm" onClick={() => setShowAllEntradas(v => !v)} className="gap-2 text-xs">
                      {showAllEntradas ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</> : <><ChevronDown className="w-3 h-3" /> Ver todos ({entradasFiltradas.length})</>}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Forma de pagamento + Dentista ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pizza — Forma de Pagamento */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <CreditCard className="w-5 h-5 text-[#c9a84c]" />
                Receitas por Forma de Pagamento
              </CardTitle>
              <CardDescription>Como os pacientes estão pagando no período</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-64 w-full rounded-xl" />
                : d.receitas_por_forma_pagamento.length === 0
                  ? <p className="text-center text-muted-foreground py-12">Nenhum dado no período</p>
                  : (
                    <div className="space-y-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={d.receitas_por_forma_pagamento} dataKey="valor" nameKey="forma"
                            cx="50%" cy="50%" outerRadius={80} innerRadius={38} paddingAngle={3}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {d.receitas_por_forma_pagamento.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
                            formatter={(value: any) => [fmt(Number(value)), ""]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5">
                        {d.receitas_por_forma_pagamento.map((item, i) => {
                          const pct = d.receitas_total > 0 ? (item.valor / d.receitas_total * 100).toFixed(1) : "0.0";
                          return (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-sm font-semibold">{item.forma}</span>
                                <Badge variant="secondary" className="text-[10px]">{item.count}x</Badge>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-slate-800">{fmt(item.valor)}</span>
                                <span className="text-xs text-slate-400 ml-2">{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
              }
            </CardContent>
          </Card>

          {/* Ranking — Receita por Dentista */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Users className="w-5 h-5 text-violet-500" />
                Vendas por Profissional
              </CardTitle>
              <CardDescription>Ranking de faturamento por dentista no período</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-64 w-full rounded-xl" />
                : d.receitas_por_dentista.length === 0
                  ? <p className="text-center text-muted-foreground py-12">Nenhum agendamento com valor no período</p>
                  : (() => {
                    const totalDentistas = d.receitas_por_dentista.reduce((a, x) => a + x.valor, 0);
                    const medalColors = ["#f8cc72", "#9ca3af", "#cd7f32"];
                    const medalBg = ["bg-amber-50 border-amber-200", "bg-gray-50 border-gray-200", "bg-orange-50 border-orange-200"];
                    const barColors = ["#8b5cf6", "#6366f1", "#a78bfa", "#c4b5fd", "#ddd6fe"];
                    return (
                      <div className="space-y-3">
                        {d.receitas_por_dentista.map((item, i) => {
                          const pct = totalDentistas > 0 ? (item.valor / totalDentistas) * 100 : 0;
                          const isTop3 = i < 3;
                          return (
                            <div key={i} className={`p-3 rounded-xl border ${isTop3 ? medalBg[i] : "bg-muted/20 border-muted"}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shadow-sm border-2"
                                    style={{
                                      background: isTop3 ? medalColors[i] : "#e5e7eb",
                                      borderColor: isTop3 ? medalColors[i] : "#d1d5db",
                                      color: i === 0 ? "#78350f" : i === 1 ? "#374151" : "#7c2d12"
                                    }}>
                                    {i + 1}
                                  </div>
                                  <div>
                                    <div className="text-sm font-black leading-tight">{item.dentista}</div>
                                    <div className="text-[10px] text-muted-foreground">{item.count} atendimentos</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-base font-black" style={{ color: barColors[i % barColors.length] }}>{fmt(item.valor)}</div>
                                  <div className="text-[10px] text-muted-foreground">{pct.toFixed(1)}% do total</div>
                                </div>
                              </div>
                              <div className="w-full bg-white/60 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full transition-all"
                                  style={{ width: `${Math.min(pct, 100)}%`, background: barColors[i % barColors.length] }} />
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2 border-t flex justify-between text-xs text-muted-foreground font-semibold">
                          <span>{d.receitas_por_dentista.length} profissionais</span>
                          <span>Total: {fmt(totalDentistas)}</span>
                        </div>
                      </div>
                    );
                  })()
              }
            </CardContent>
          </Card>
        </div>

        {/* ── Receitas por Categoria + Despesas por Categoria ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Receitas por Categoria — barras horizontais */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black text-emerald-700 flex items-center gap-2">
                <ArrowUp className="w-5 h-5" />
                Receitas por Categoria
              </CardTitle>
              <CardDescription>Distribuição das entradas no período</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                : d.receitas_por_categoria.length === 0
                  ? <p className="text-center text-muted-foreground py-8">Nenhuma receita no período</p>
                  : (
                    <div className="space-y-3">
                      {d.receitas_por_categoria.map((item, i) => {
                        const pct = d.receitas_total > 0 ? (item.valor / d.receitas_total) * 100 : 0;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold truncate max-w-[180px]">{item.categoria}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                                <span className="text-sm font-black text-emerald-700">{fmt(item.valor)}</span>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
              }
            </CardContent>
          </Card>

          {/* Despesas por Categoria — pizza + barras */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black text-rose-700 flex items-center gap-2">
                <ArrowDown className="w-5 h-5" />
                Despesas por Categoria
              </CardTitle>
              <CardDescription>Para onde estão indo as saídas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                : d.despesas_por_categoria.length === 0
                  ? <p className="text-center text-muted-foreground py-8">Nenhuma despesa no período</p>
                  : (
                    <div className="space-y-4">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={d.despesas_por_categoria} dataKey="valor" nameKey="categoria"
                            cx="50%" cy="50%" outerRadius={65} innerRadius={28} paddingAngle={3}
                            label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""} labelLine={false}>
                            {d.despesas_por_categoria.map((_, i) => <Cell key={i} fill={["#ef4444","#f97316","#eab308","#ec4899","#8b5cf6","#06b6d4"][i % 6]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }}
                            formatter={(value: any) => [fmt(Number(value)), ""]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {d.despesas_por_categoria.map((item, i) => {
                          const pct = d.despesas_total > 0 ? (item.valor / d.despesas_total) * 100 : 0;
                          const cor = ["#ef4444","#f97316","#eab308","#ec4899","#8b5cf6","#06b6d4"][i % 6];
                          return (
                            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cor }} />
                                <span className="text-sm font-semibold">{item.categoria}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                                <span className="text-sm font-black text-rose-700">{fmt(item.valor)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
              }
            </CardContent>
          </Card>
        </div>

        {/* ── Contas a Receber (Pendentes / Vencidas) ─────────────────────────── */}
        {(loading || d.contas_receber_a_entrar.length > 0) && (
          <Card className="medical-card shadow-sm border-l-4 border-l-orange-400">
            <CardHeader>
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-black text-orange-700">
                      <Clock className="w-5 h-5" />
                      Contas a Receber
                      <Badge className="bg-orange-100 text-orange-700">{pendentesFiltrados.length}</Badge>
                    </CardTitle>
                    <CardDescription>Recebimentos em aberto — visão geral da clínica</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-orange-700">
                      {fmt(pendentesFiltrados.reduce((s, c) => s + c.valor, 0))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{filtroPendente === "Todos" ? "total em aberto" : filtroPendente.toLowerCase()}</div>
                  </div>
                </div>
                {/* Filtro de status */}
                <div className="flex gap-2">
                  {[
                    { key: "Todos", label: "Todos", count: d.contas_receber_a_entrar.length },
                    { key: "Pendente", label: "Pendentes", count: d.contas_receber_a_entrar.filter(c => c.status === "Pendente").length },
                    { key: "Vencida", label: "Vencidas", count: d.contas_receber_a_entrar.filter(c => c.status === "Vencida" || c.dias_atraso > 0).length },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => { setFiltroPendente(tab.key); setShowAllPendentes(false); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        filtroPendente === tab.key
                          ? tab.key === "Vencida" ? "bg-rose-600 text-white border-rose-600" : "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left py-3 px-3 font-semibold text-xs text-muted-foreground">Paciente</th>
                        <th className="text-left py-3 px-3 font-semibold text-xs text-muted-foreground">Descrição</th>
                        <th className="text-left py-3 px-3 font-semibold text-xs text-muted-foreground">Vencimento</th>
                        <th className="text-left py-3 px-3 font-semibold text-xs text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-3 font-semibold text-xs text-muted-foreground">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendentesVisiveis.map((c, i) => (
                        <tr key={c.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                          <td className="py-2.5 px-3 font-semibold">{c.paciente}</td>
                          <td className="py-2.5 px-3 text-muted-foreground text-xs">{c.descricao || "—"}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={c.dias_atraso > 0 ? "text-rose-600 font-semibold" : "text-muted-foreground"}>
                              {c.data_vencimento ? fmtDate(c.data_vencimento) : "—"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {c.status === "Vencida" || c.dias_atraso > 0
                              ? <Badge className="bg-rose-100 text-rose-700 text-[10px]">Vencida {c.dias_atraso > 0 ? `(${c.dias_atraso}d)` : ""}</Badge>
                              : <Badge className="bg-orange-100 text-orange-700 text-[10px]">Pendente</Badge>
                            }
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-orange-700">{fmt(c.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 bg-muted/20">
                        <td colSpan={4} className="py-2.5 px-3 font-black text-sm">
                          {showAllPendentes ? "Total" : `Top ${Math.min(8, pendentesFiltrados.length)} de ${pendentesFiltrados.length}`}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-orange-700">
                          {fmt(pendentesVisiveis.reduce((s, c) => s + c.valor, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  {pendentesFiltrados.length > 8 && (
                    <div className="flex justify-center pt-3">
                      <Button variant="ghost" size="sm" onClick={() => setShowAllPendentes(v => !v)} className="gap-2 text-xs">
                        {showAllPendentes ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</> : <><ChevronDown className="w-3 h-3" /> Ver todos ({pendentesFiltrados.length})</>}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
