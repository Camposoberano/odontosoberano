import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Search, Edit, Trash2, ArrowUpCircle, ArrowDownCircle,
  TrendingUp, TrendingDown, Clock, AlertCircle, FileText,
  Wallet, Tag, ChevronDown, ChevronUp, Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFluxoCaixa, type FluxoCaixa as FluxoCaixaType, type PrevisaoEntrada } from "@/hooks/useFluxoCaixa";
import { FluxoCaixaForm } from "@/components/financeiro/FluxoCaixaForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (d: string) => {
  try { return format(new Date(d), "dd/MM/yyyy", { locale: ptBR }); } catch { return d; }
};

// Cores por categoria
const CAT_COLORS: Record<string, string> = {
  "Tratamento Odontológico": "#10b981",
  "Tratamento": "#34d399",
  "Ortodontia": "#6366f1",
  "Consulta": "#3b82f6",
  "Material Odontológico": "#f97316",
  "Aluguel": "#ef4444",
  "Salários": "#f43f5e",
  "Equipamentos": "#8b5cf6",
  "Comissões": "#ec4899",
  "Outros": "#6b7280",
};
const getCatColor = (cat: string) => CAT_COLORS[cat] ?? "#6b7280";

export default function FluxoCaixa() {
  const navigate = useNavigate();
  const { movimentacoes, previsoes, isLoading, createMovimentacao, updateMovimentacao, deleteMovimentacao } = useFluxoCaixa();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedMov, setSelectedMov] = useState<FluxoCaixaType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movToDelete, setMovToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"all" | "Entrada" | "Saída">("all");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todas");
  const [showAllPrevisoes, setShowAllPrevisoes] = useState(false);

  const handleSubmit = async (data: any) => {
    if (selectedMov) await updateMovimentacao({ id: selectedMov.id, ...data });
    else await createMovimentacao(data);
    setSelectedMov(null);
  };

  const handleEdit = (mov: FluxoCaixaType) => { setSelectedMov(mov); setFormOpen(true); };
  const handleDelete = (id: string) => { setMovToDelete(id); setDeleteDialogOpen(true); };
  const confirmDelete = async () => {
    if (movToDelete) { await deleteMovimentacao(movToDelete); setMovToDelete(null); }
    setDeleteDialogOpen(false);
  };

  // Categorias únicas
  const categorias = useMemo(() => {
    const s = new Set(movimentacoes.map(m => m.categoria).filter(Boolean));
    return ["Todas", ...Array.from(s).sort()];
  }, [movimentacoes]);

  const filtered = useMemo(() => {
    return movimentacoes.filter(m => {
      const matchSearch = !search || m.descricao?.toLowerCase().includes(search.toLowerCase())
        || m.categoria?.toLowerCase().includes(search.toLowerCase());
      const matchTipo = filtroTipo === "all" || m.tipo === filtroTipo;
      const matchCat = filtroCategoria === "Todas" || m.categoria === filtroCategoria;
      return matchSearch && matchTipo && matchCat;
    });
  }, [movimentacoes, search, filtroTipo, filtroCategoria]);

  // KPIs dos dados filtrados
  const totalEntradas = filtered.filter(m => m.tipo === "Entrada").reduce((s, m) => s + Number(m.valor), 0);
  const totalSaidas = filtered.filter(m => m.tipo === "Saída").reduce((s, m) => s + Number(m.valor), 0);
  const saldo = totalEntradas - totalSaidas;

  const totalPrevisoes = previsoes.reduce((s, p) => s + Number(p.valor), 0);
  const totalVencidas = previsoes.filter(p => p.status === "Vencida").reduce((s, p) => s + Number(p.valor), 0);

  // Movimentações com saldo acumulado (mais recente primeiro)
  const movsComSaldo = useMemo(() => {
    return [...filtered]
      .sort((a, b) => new Date(a.data_movimentacao).getTime() - new Date(b.data_movimentacao).getTime())
      .reduce((acc, mov) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
        acc.push({ ...mov, saldo: prev + (mov.tipo === "Entrada" ? Number(mov.valor) : -Number(mov.valor)) });
        return acc;
      }, [] as (FluxoCaixaType & { saldo: number })[])
      .reverse();
  }, [filtered]);

  // Resumo por categoria
  const resumoCategorias = useMemo(() => {
    const map = new Map<string, { entrada: number; saida: number }>();
    filtered.forEach(m => {
      const cat = m.categoria || "Outros";
      const cur = map.get(cat) ?? { entrada: 0, saida: 0 };
      if (m.tipo === "Entrada") cur.entrada += Number(m.valor);
      else cur.saida += Number(m.valor);
      map.set(cat, cur);
    });
    return Array.from(map.entries())
      .map(([cat, v]) => ({ cat, ...v, total: v.entrada - v.saida }))
      .sort((a, b) => (b.entrada + b.saida) - (a.entrada + a.saida));
  }, [filtered]);

  const prevVisiveis = showAllPrevisoes ? previsoes : previsoes.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 rounded-full" style={{ background: "#f8cc72" }} />
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Fluxo de Caixa</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-4">Movimentações financeiras da clínica</p>
          </div>
          <Button
            onClick={() => { setSelectedMov(null); setFormOpen(true); }}
            className="gap-2 font-bold shadow-md hover:shadow-lg transition-shadow"
            style={{ background: "#010101", color: "#f8cc72" }}
          >
            <Plus className="w-4 h-4" />
            Nova Movimentação
          </Button>
        </div>

        {/* ── KPIs ────────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Entradas */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold">ENTRADAS</Badge>
                </div>
                <div className="text-2xl font-black text-emerald-700">{fmt(totalEntradas)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filtered.filter(m => m.tipo === "Entrada").length} registros
                </p>
              </CardContent>
            </Card>

            {/* Saídas */}
            <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <ArrowDownCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <Badge className="bg-rose-50 text-rose-700 border-rose-100 text-[10px] font-bold">SAÍDAS</Badge>
                </div>
                <div className="text-2xl font-black text-rose-700">{fmt(totalSaidas)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filtered.filter(m => m.tipo === "Saída").length} registros
                </p>
              </CardContent>
            </Card>

            {/* Saldo */}
            <Card className={`border-l-4 ${saldo >= 0 ? "border-l-blue-500" : "border-l-orange-500"} shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${saldo >= 0 ? "bg-blue-50" : "bg-orange-50"}`}>
                    <Wallet className={`w-5 h-5 ${saldo >= 0 ? "text-blue-600" : "text-orange-600"}`} />
                  </div>
                  <Badge className={`text-[10px] font-bold ${saldo >= 0 ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}>
                    SALDO
                  </Badge>
                </div>
                <div className={`text-2xl font-black ${saldo >= 0 ? "text-blue-700" : "text-orange-700"}`}>{fmt(saldo)}</div>
                <p className="text-xs text-muted-foreground mt-1">período filtrado</p>
              </CardContent>
            </Card>

            {/* A Receber */}
            <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: "#f8cc72" }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ background: "#fef9ec" }}>
                    <Clock className="w-5 h-5" style={{ color: "#b8860b" }} />
                  </div>
                  <Badge className="text-[10px] font-bold" style={{ background: "#fef9ec", color: "#b8860b", borderColor: "#f8cc72" }}>
                    A RECEBER
                  </Badge>
                </div>
                <div className="text-2xl font-black" style={{ color: "#b8860b" }}>{fmt(totalPrevisoes)}</div>
                {totalVencidas > 0 && (
                  <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fmt(totalVencidas)} vencido
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Filtros ──────────────────────────────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Tipo tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                {(["all", "Entrada", "Saída"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setFiltroTipo(t)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      filtroTipo === t
                        ? t === "Entrada"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : t === "Saída"
                            ? "bg-rose-600 text-white border-rose-600"
                            : "text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                    style={filtroTipo === t && t === "all" ? { background: "#010101" } : {}}
                  >
                    {t === "all" ? `Todos (${movimentacoes.length})` : t === "Entrada" ? `↑ Entradas (${movimentacoes.filter(m => m.tipo === "Entrada").length})` : `↓ Saídas (${movimentacoes.filter(m => m.tipo === "Saída").length})`}
                  </button>
                ))}
              </div>

              {/* Categorias + Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {categorias.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFiltroCategoria(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                        filtroCategoria === cat
                          ? "text-white border-transparent"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                      style={filtroCategoria === cat && cat !== "Todas"
                        ? { background: getCatColor(cat) }
                        : filtroCategoria === cat
                          ? { background: "#010101" }
                          : {}}
                    >
                      {cat === "Todas" ? `Todas as categorias` : cat}
                    </button>
                  ))}
                </div>
                <div className="relative sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar descrição..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Resultado */}
              <div className="text-xs text-muted-foreground">
                {filtered.length === movimentacoes.length
                  ? `${movimentacoes.length} movimentações`
                  : `${filtered.length} de ${movimentacoes.length} movimentações`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Tabela de movimentações ─────────────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#f8cc72" }} />
              Movimentações
              <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {isLoading ? (
              <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
            ) : movsComSaldo.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-semibold">Nenhuma movimentação encontrada</p>
                <p className="text-sm mt-1">Ajuste os filtros ou cadastre uma nova movimentação</p>
                <Button
                  className="mt-4 gap-2"
                  variant="outline"
                  onClick={() => { setFiltroTipo("all"); setFiltroCategoria("Todas"); setSearch(""); }}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Descrição</th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Categoria</th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Tipo</th>
                      <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Valor</th>
                      <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Saldo</th>
                      <th className="py-3 px-4 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {movsComSaldo.map((mov, i) => (
                      <tr
                        key={mov.id}
                        className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                      >
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-xs">
                          {fmtDate(mov.data_movimentacao)}
                        </td>
                        <td className="py-3 px-4 font-semibold max-w-[200px] truncate">
                          {mov.descricao || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ background: getCatColor(mov.categoria || "Outros") }}
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {mov.categoria || "Outros"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {mov.tipo === "Entrada" ? (
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                              <ArrowUpCircle className="w-3.5 h-3.5" /> Entrada
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-700 font-semibold text-xs">
                              <ArrowDownCircle className="w-3.5 h-3.5" /> Saída
                            </span>
                          )}
                        </td>
                        <td className={`py-3 px-4 text-right font-black ${mov.tipo === "Entrada" ? "text-emerald-700" : "text-rose-700"}`}>
                          {mov.tipo === "Saída" && "−"}{fmt(Number(mov.valor))}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold text-xs ${mov.saldo >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                          {fmt(mov.saldo)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(mov)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(mov.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Resumo por Categoria ─────────────────────────────────────────────── */}
        {resumoCategorias.length > 0 && !isLoading && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Tag className="w-4 h-4" style={{ color: "#f8cc72" }} />
                Resumo por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {resumoCategorias.map(({ cat, entrada, saida, total }) => (
                  <div
                    key={cat}
                    className="p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                    style={{ borderLeftColor: getCatColor(cat), borderLeftWidth: 3 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: getCatColor(cat) }} />
                      <span className="text-xs font-black text-gray-700 truncate">{cat}</span>
                    </div>
                    {entrada > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Entradas</span>
                        <span className="font-bold text-emerald-700">{fmt(entrada)}</span>
                      </div>
                    )}
                    {saida > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Saídas</span>
                        <span className="font-bold text-rose-700">{fmt(saida)}</span>
                      </div>
                    )}
                    {entrada > 0 && saida > 0 && (
                      <div className="flex justify-between text-xs border-t mt-1 pt-1">
                        <span className="font-semibold">Líquido</span>
                        <span className={`font-black ${total >= 0 ? "text-blue-700" : "text-orange-700"}`}>{fmt(total)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Previsão de Entradas ─────────────────────────────────────────────── */}
        {previsoes.length > 0 && (
          <Card className="shadow-sm" style={{ borderLeftColor: "#f8cc72", borderLeftWidth: 4 }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-black" style={{ color: "#b8860b" }}>
                  <Clock className="w-4 h-4" />
                  Previsão de Entradas
                  <Badge className="text-[10px]" style={{ background: "#fef9ec", color: "#b8860b", borderColor: "#f8cc72" }}>
                    {previsoes.length} conta{previsoes.length !== 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
                <span className="text-xl font-black" style={{ color: "#b8860b" }}>{fmt(totalPrevisoes)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contas a receber pendentes. Registre o recebimento em{" "}
                <button className="underline font-semibold" style={{ color: "#b8860b" }} onClick={() => navigate("/financeiro/contas-receber")}>
                  Contas a Receber
                </button>.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ background: "#fef9ec" }}>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#b8860b" }}>Descrição</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: "#b8860b" }}>Categoria</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#b8860b" }}>Vencimento</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#b8860b" }}>Valor</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#b8860b" }}>Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {prevVisiveis.map((p: PrevisaoEntrada) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.descricao}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">{p.categoria}</td>
                      <td className={`px-4 py-3 text-xs font-semibold ${p.status === "Vencida" ? "text-rose-600" : "text-slate-600"}`}>
                        {fmtDate(p.data_movimentacao)}
                      </td>
                      <td className="px-4 py-3 text-right font-black" style={{ color: "#b8860b" }}>
                        {fmt(Number(p.valor))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] gap-1 ${p.status === "Vencida" ? "bg-rose-100 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
                          {p.status === "Vencida" ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {p.orcamento && (
                          <Link to={`/orcamentos/${p.orcamento.id}`} className="flex items-center gap-1 text-xs hover:underline" style={{ color: "#b8860b" }}>
                            <FileText className="w-3 h-3" />
                            #{p.orcamento.numero_orcamento}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previsoes.length > 5 && (
                <div className="flex justify-center py-3 border-t">
                  <Button variant="ghost" size="sm" onClick={() => setShowAllPrevisoes(v => !v)} className="gap-1 text-xs">
                    {showAllPrevisoes
                      ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</>
                      : <><ChevronDown className="w-3 h-3" /> Ver todos ({previsoes.length})</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

      <FluxoCaixaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        movimentacao={selectedMov}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A movimentação será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
