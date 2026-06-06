import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, FileText, Eye, Edit, Trash2, Copy, AlertTriangle,
  Clock, CheckCircle, TrendingUp, DollarSign, Search, XCircle,
  FileCheck, FilePen, Send,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calcularExpiracao, EXPIRACAO_CONFIG } from "@/utils/orcamentoUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useOrcamentos, StatusOrcamento } from "@/hooks/useOrcamentos";

const STATUS_CONFIG: Record<StatusOrcamento, {
  label: string;
  icon: React.ElementType;
  border: string;
  bg: string;
  badge: string;
  text: string;
}> = {
  rascunho:          { label: "Rascunho",           icon: FilePen,      border: "border-l-gray-400",   bg: "bg-gray-50",    badge: "bg-gray-100 text-gray-700",   text: "text-gray-600" },
  enviado:           { label: "Enviado",             icon: Send,         border: "border-l-blue-400",   bg: "bg-blue-50/40", badge: "bg-blue-100 text-blue-700",   text: "text-blue-600" },
  aprovado:          { label: "Aprovado",            icon: CheckCircle,  border: "border-l-emerald-500",bg: "bg-emerald-50/40",badge: "bg-emerald-100 text-emerald-700",text: "text-emerald-600" },
  recusado:          { label: "Recusado",            icon: XCircle,      border: "border-l-rose-500",   bg: "bg-rose-50/40", badge: "bg-rose-100 text-rose-700",   text: "text-rose-600" },
  contrato_assinado: { label: "Contrato Assinado",   icon: FileCheck,    border: "border-l-purple-500", bg: "bg-purple-50/40",badge: "bg-purple-100 text-purple-700",text: "text-purple-600" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ListaOrcamentos() {
  const navigate = useNavigate();
  const { orcamentos, isLoading, deletar, duplicar } = useOrcamentos();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    return orcamentos.filter(o => {
      const matchStatus = filtroStatus === "todos" || o.status === filtroStatus;
      const matchSearch = !search ||
        (o.paciente?.nome ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (o.dentista?.nome ?? "").toLowerCase().includes(search.toLowerCase()) ||
        String(o.numero_orcamento).includes(search);
      return matchStatus && matchSearch;
    });
  }, [orcamentos, filtroStatus, search]);

  const kpi = useMemo(() => ({
    total: orcamentos.length,
    aprovados: orcamentos.filter(o => o.status === "aprovado" || o.status === "contrato_assinado").length,
    pendentes: orcamentos.filter(o => o.status === "rascunho" || o.status === "enviado").length,
    recusados: orcamentos.filter(o => o.status === "recusado").length,
    valorAprovado: orcamentos
      .filter(o => o.status === "aprovado" || o.status === "contrato_assinado")
      .reduce((s, o) => s + o.total_liquido, 0),
  }), [orcamentos]);

  const expirandoCount = orcamentos.filter(o => {
    const exp = calcularExpiracao(o.created_at, o.validade_dias, o.status);
    return exp && (exp.status === "expirado" || exp.status === "critico" || exp.status === "expirando");
  }).length;

  const tabs = [
    { key: "todos",            label: "Todos",             count: orcamentos.length },
    { key: "rascunho",         label: "Rascunho",          count: orcamentos.filter(o => o.status === "rascunho").length },
    { key: "enviado",          label: "Enviado",           count: orcamentos.filter(o => o.status === "enviado").length },
    { key: "aprovado",         label: "Aprovado",          count: orcamentos.filter(o => o.status === "aprovado").length },
    { key: "contrato_assinado",label: "Contrato",          count: orcamentos.filter(o => o.status === "contrato_assinado").length },
    { key: "recusado",         label: "Recusado",          count: orcamentos.filter(o => o.status === "recusado").length },
  ].filter(t => t.count > 0 || t.key === "todos");

  const handleDelete = async () => {
    if (!deletandoId) return;
    await deletar.mutateAsync(deletandoId);
    setDeletandoId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 rounded-full" style={{ background: "#f8cc72" }} />
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Orçamentos</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-4">Gerencie os orçamentos da clínica</p>
          </div>
          <Button
            onClick={() => navigate("/orcamentos/novo")}
            className="gap-2 font-bold shadow-md hover:shadow-lg transition-shadow shrink-0"
            style={{ background: "#010101", color: "#f8cc72" }}
          >
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </Button>
        </div>

        {/* ── KPIs ────────────────────────────────────────────────────────────── */}
        {!isLoading && orcamentos.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-slate-400 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-slate-100 rounded-lg"><FileText className="w-4 h-4 text-slate-500" /></div>
                  <Badge className="bg-slate-100 text-slate-600 text-[10px] font-bold">TOTAL</Badge>
                </div>
                <div className="text-3xl font-black text-gray-800">{kpi.total}</div>
                <p className="text-xs text-muted-foreground">orçamentos</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-emerald-50 rounded-lg"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-bold">APROVADOS</Badge>
                </div>
                <div className="text-3xl font-black text-emerald-700">{kpi.aprovados}</div>
                <p className="text-xs text-muted-foreground">convertidos</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg"><Clock className="w-4 h-4 text-blue-500" /></div>
                  <Badge className="bg-blue-100 text-blue-700 text-[10px] font-bold">PENDENTES</Badge>
                </div>
                <div className="text-3xl font-black text-blue-700">{kpi.pendentes}</div>
                <p className="text-xs text-muted-foreground">em aberto</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: "#f8cc72" }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg" style={{ background: "#fef9ec" }}>
                    <DollarSign className="w-4 h-4" style={{ color: "#b8860b" }} />
                  </div>
                  <Badge className="text-[10px] font-bold" style={{ background: "#fef9ec", color: "#b8860b", borderColor: "#f8cc72" }}>VALOR</Badge>
                </div>
                <div className="text-xl font-black" style={{ color: "#b8860b" }}>{fmt(kpi.valorAprovado)}</div>
                <p className="text-xs text-muted-foreground">aprovado</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Banner de expiração */}
        {!isLoading && expirandoCount > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                {expirandoCount} orçamento{expirandoCount !== 1 ? "s" : ""} com validade próxima ao vencimento
              </p>
              <p className="text-xs text-amber-600">Revise os orçamentos expirados ou expirando em breve</p>
            </div>
          </div>
        )}

        {/* ── Filtros ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Tabs de status */}
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map(tab => {
              const cfg = tab.key !== "todos" ? STATUS_CONFIG[tab.key as StatusOrcamento] : null;
              const isActive = filtroStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFiltroStatus(tab.key)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                  style={isActive ? { background: tab.key === "todos" ? "#010101" : undefined } : {}}
                >
                  {cfg && isActive && <cfg.icon className="w-3.5 h-3.5" />}
                  {tab.label}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20" : "bg-muted"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente, dentista, nº..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {filtrados.length} de {orcamentos.length} orçamentos
          </p>
        </div>

        {/* ── Cards Grid ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-lg">Nenhum orçamento encontrado</p>
            <p className="text-sm mt-1">
              {search || filtroStatus !== "todos" ? "Ajuste os filtros" : "Crie o primeiro orçamento da clínica"}
            </p>
            {(search || filtroStatus !== "todos") ? (
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setFiltroStatus("todos"); }}>
                Limpar filtros
              </Button>
            ) : (
              <Button className="mt-4 gap-2" style={{ background: "#010101", color: "#f8cc72" }} onClick={() => navigate("/orcamentos/novo")}>
                <Plus className="w-4 h-4" /> Novo Orçamento
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((o) => {
              const cfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.rascunho;
              const StatusIcon = cfg.icon;
              const exp = calcularExpiracao(o.created_at, o.validade_dias, o.status);
              const inicial = (o.paciente?.nome ?? "?").charAt(0).toUpperCase();

              return (
                <Card
                  key={o.id}
                  className={`border-l-4 ${cfg.border} shadow-sm hover:shadow-lg transition-all cursor-pointer group`}
                  onClick={() => navigate(`/orcamentos/${o.id}`)}
                >
                  <CardContent className="p-5">
                    {/* Top row: nº + status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-muted-foreground font-bold">
                        #{o.numero_orcamento}
                      </span>
                      <Badge className={`${cfg.badge} text-[10px] font-semibold flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </Badge>
                    </div>

                    {/* Paciente */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                        style={{ background: "#010101" }}
                      >
                        {inicial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-800 truncate leading-tight">
                          {o.paciente?.nome ?? <span className="text-muted-foreground italic text-sm">Sem paciente</span>}
                        </p>
                        {o.dentista?.nome && (
                          <p className="text-xs text-muted-foreground truncate">{o.dentista.nome}</p>
                        )}
                      </div>
                    </div>

                    {/* Valor */}
                    <div className="mb-3">
                      <div className="text-2xl font-black" style={{ color: "#010101" }}>
                        {fmt(o.total_liquido)}
                      </div>
                    </div>

                    {/* Data + validade */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>{new Date(o.created_at).toLocaleDateString("pt-BR")}</span>
                      {exp && exp.status !== "ok" && (
                        <span className={`font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${EXPIRACAO_CONFIG[exp.status].badgeClass}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {EXPIRACAO_CONFIG[exp.status].label(exp.diasRestantes)}
                        </span>
                      )}
                      {exp && exp.status === "ok" && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(exp.dataExpiracao, "dd/MM/yy", { locale: ptBR })}
                        </span>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 pt-3 border-t border-border/50">
                      <Button
                        size="sm" variant="ghost"
                        className="flex-1 h-8 text-xs gap-1 hover:bg-muted"
                        onClick={e => { e.stopPropagation(); navigate(`/orcamentos/${o.id}`); }}
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="flex-1 h-8 text-xs gap-1 hover:bg-muted"
                        onClick={e => { e.stopPropagation(); navigate(`/orcamentos/${o.id}/editar`); }}
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="flex-1 h-8 text-xs gap-1 hover:bg-muted"
                        title="Duplicar"
                        onClick={async e => {
                          e.stopPropagation();
                          const novo = await duplicar.mutateAsync(o.id);
                          navigate(`/orcamentos/${novo.id}/editar`);
                        }}
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                        onClick={e => { e.stopPropagation(); setDeletandoId(o.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deletandoId} onOpenChange={() => setDeletandoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os itens do orçamento serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
