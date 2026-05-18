import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Eye, Edit, Trash2, Copy, AlertTriangle, Clock, CheckCircle, TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calcularExpiracao, EXPIRACAO_CONFIG } from "@/utils/orcamentoUtils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrcamentos, StatusOrcamento } from "@/hooks/useOrcamentos";

const STATUS_CONFIG: Record<
  StatusOrcamento,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }
> = {
  rascunho:          { label: "Rascunho",           variant: "secondary", color: "text-gray-500" },
  enviado:           { label: "Enviado",             variant: "default",   color: "text-blue-600" },
  aprovado:          { label: "Aprovado",            variant: "default",   color: "text-green-600" },
  recusado:          { label: "Recusado",            variant: "destructive", color: "text-red-600" },
  contrato_assinado: { label: "Contrato Assinado",   variant: "default",   color: "text-purple-600" },
};

export default function ListaOrcamentos() {
  const navigate = useNavigate();
  const { orcamentos, isLoading, deletar, duplicar } = useOrcamentos();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const filtrados = filtroStatus === "todos"
    ? orcamentos
    : orcamentos.filter((o) => o.status === filtroStatus);

  const expirandoCount = orcamentos.filter((o) => {
    const exp = calcularExpiracao(o.created_at, o.validade_dias, o.status);
    return exp && (exp.status === "expirado" || exp.status === "critico" || exp.status === "expirando");
  }).length;

  const kpi = {
    total: orcamentos.length,
    aprovados: orcamentos.filter((o) => o.status === "aprovado" || o.status === "contrato_assinado").length,
    pendentes: orcamentos.filter((o) => o.status === "rascunho" || o.status === "enviado").length,
    valorAprovado: orcamentos
      .filter((o) => o.status === "aprovado" || o.status === "contrato_assinado")
      .reduce((s, o) => s + o.total_liquido, 0),
  };

  const handleDelete = async () => {
    if (!deletandoId) return;
    await deletar.mutateAsync(deletandoId);
    setDeletandoId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Orçamentos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie os orçamentos da clínica
            </p>
          </div>
          <Button onClick={() => navigate("/orcamentos/novo")} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </Button>
        </div>

        {/* KPI Cards */}
        {!isLoading && orcamentos.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-slate-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Total</span>
                </div>
                <div className="text-2xl font-black text-gray-800">{kpi.total}</div>
                <p className="text-xs text-muted-foreground">orçamentos</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 uppercase">Aprovados</span>
                </div>
                <div className="text-2xl font-black text-gray-800">{kpi.aprovados}</div>
                <p className="text-xs text-muted-foreground">convertidos</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-600 uppercase">Pendentes</span>
                </div>
                <div className="text-2xl font-black text-gray-800">{kpi.pendentes}</div>
                <p className="text-xs text-muted-foreground">em aberto</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-bold text-teal-600 uppercase">Valor</span>
                </div>
                <div className="text-lg font-black text-gray-800">
                  {kpi.valorAprovado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
                <p className="text-xs text-muted-foreground">aprovado</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Banner de expiração */}
        {!isLoading && expirandoCount > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm font-medium">
              <span className="font-bold">{expirandoCount} orçamento{expirandoCount !== 1 ? "s" : ""}</span> com validade vencida ou expirando em breve.
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-3">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filtrados.length} orçamento{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Mobile: lista de cards */}
        <div className="sm:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : filtrados.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Nenhum orçamento encontrado</p>
              <Button variant="link" onClick={() => navigate("/orcamentos/novo")}>Criar primeiro orçamento</Button>
            </div>
          ) : filtrados.map((o) => {
            const cfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.rascunho;
            const exp = calcularExpiracao(o.created_at, o.validade_dias, o.status);
            return (
              <Card key={o.id} className="cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate(`/orcamentos/${o.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">#{o.numero_orcamento}</span>
                        <Badge variant={cfg.variant} className="text-xs capitalize">{cfg.label}</Badge>
                        {exp && exp.status !== "ok" && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${EXPIRACAO_CONFIG[exp.status].badgeClass}`}>
                            {EXPIRACAO_CONFIG[exp.status].label(exp.diasRestantes)}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm truncate">{o.paciente?.nome ?? "Sem paciente"}</p>
                      {o.dentista?.nome && <p className="text-xs text-muted-foreground truncate">{o.dentista.nome}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-sm">{o.total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                      <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/50">
                    <Button size="sm" variant="ghost" className="h-8 flex-1 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/orcamentos/${o.id}`); }}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 flex-1 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/orcamentos/${o.id}/editar`); }}>
                      <Edit className="w-3.5 h-3.5 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 flex-1 text-xs" onClick={async (e) => { e.stopPropagation(); const novo = await duplicar.mutateAsync(o.id); navigate(`/orcamentos/${novo.id}/editar`); }}>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeletandoId(o.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Desktop: tabela */}
        <div className="hidden sm:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Dentista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="w-32 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Nenhum orçamento encontrado</p>
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => navigate("/orcamentos/novo")}
                    >
                      Criar primeiro orçamento
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((o) => {
                  const cfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.rascunho;
                  return (
                    <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell
                        className="font-mono text-sm"
                        onClick={() => navigate(`/orcamentos/${o.id}`)}
                      >
                        #{o.numero_orcamento}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/orcamentos/${o.id}`)}>
                        {o.paciente?.nome ?? <span className="text-muted-foreground italic">Sem paciente</span>}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/orcamentos/${o.id}`)}>
                        {o.dentista?.nome ?? <span className="text-muted-foreground italic">—</span>}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/orcamentos/${o.id}`)}>
                        <Badge variant={cfg.variant} className="capitalize">
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right font-semibold"
                        onClick={() => navigate(`/orcamentos/${o.id}`)}
                      >
                        {o.total_liquido.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell
                        className="text-sm text-muted-foreground"
                        onClick={() => navigate(`/orcamentos/${o.id}`)}
                      >
                        {new Date(o.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/orcamentos/${o.id}`)}>
                        {(() => {
                          const exp = calcularExpiracao(o.created_at, o.validade_dias, o.status);
                          if (!exp) return null;
                          if (exp.status === "ok") return (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(exp.dataExpiracao, "dd/MM/yy", { locale: ptBR })}
                            </span>
                          );
                          const cfg2 = EXPIRACAO_CONFIG[exp.status];
                          return (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${cfg2.badgeClass}`}>
                              <AlertTriangle className="w-3 h-3" />
                              {cfg2.label(exp.diasRestantes)}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => navigate(`/orcamentos/${o.id}`)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => navigate(`/orcamentos/${o.id}/editar`)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Duplicar"
                            onClick={async () => {
                              const novo = await duplicar.mutateAsync(o.id);
                              navigate(`/orcamentos/${novo.id}/editar`);
                            }}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeletandoId(o.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
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
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
