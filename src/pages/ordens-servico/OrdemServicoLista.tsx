import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useOrdensServico, STATUS_OS_CONFIG, type StatusOS } from "@/hooks/useOrdensServico";
import { calcularPrazoOS, EXPIRACAO_CONFIG } from "@/utils/orcamentoUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_ICONS: Record<StatusOS, React.ElementType> = {
  pendente:    Clock,
  em_andamento:AlertCircle,
  concluido:   CheckCircle2,
  entregue:    PackageCheck,
  cancelado:   XCircle,
};

export default function OrdemServicoLista() {
  const navigate = useNavigate();
  const { ordensServico, isLoading, deletar } = useOrdensServico();
  const [filtroStatus, setFiltroStatus] = useState<StatusOS | "todos">("todos");
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const filtradas =
    filtroStatus === "todos"
      ? ordensServico
      : ordensServico.filter((os) => os.status === filtroStatus);

  const totais = {
    total: ordensServico.length,
    pendentes: ordensServico.filter((o) => o.status === "pendente").length,
    em_andamento: ordensServico.filter((o) => o.status === "em_andamento").length,
    concluidas: ordensServico.filter((o) => o.status === "concluido" || o.status === "entregue").length,
    prazo_critico: ordensServico.filter((o) => {
      const exp = calcularPrazoOS(o.prazo, o.status);
      return exp && (exp.status === "critico" || exp.status === "expirado");
    }).length,
  };

  const handleDeletar = () => {
    if (!deletandoId) return;
    deletar.mutate(deletandoId, { onSettled: () => setDeletandoId(null) });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
              <p className="text-sm text-muted-foreground">Acompanhe o trabalho de laboratório</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: totais.total, color: "text-foreground" },
            { label: "Pendentes", value: totais.pendentes, color: "text-yellow-600" },
            { label: "Em Andamento", value: totais.em_andamento, color: "text-blue-600" },
            { label: "Concluídas", value: totais.concluidas, color: "text-green-600" },
            { label: "Prazo crítico", value: totais.prazo_critico, color: "text-red-600" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Filtro */}
        <div className="flex items-center gap-3">
          <Select
            value={filtroStatus}
            onValueChange={(v) => setFiltroStatus(v as StatusOS | "todos")}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {(Object.keys(STATUS_OS_CONFIG) as StatusOS[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_OS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{filtradas.length} resultado(s)</span>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº OS</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Dentista</TableHead>
                <TableHead>Protético</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
              ) : filtradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Nenhuma ordem de serviço encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtradas.map((os) => {
                  const cfg = STATUS_OS_CONFIG[os.status];
                  const Icon = STATUS_ICONS[os.status];
                  return (
                    <TableRow key={os.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/ordens-servico/${os.id}`)}>
                      <TableCell className="font-mono font-semibold">#{os.numero_os}</TableCell>
                      <TableCell>{os.paciente?.nome ?? "—"}</TableCell>
                      <TableCell>{os.dentista?.nome ?? "—"}</TableCell>
                      <TableCell>{os.protetico?.nome ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={`${cfg.color} ${cfg.bgColor} border-0 gap-1`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          if (!os.prazo) return "—";
                          const exp = calcularPrazoOS(os.prazo, os.status);
                          const dateStr = format(new Date(os.prazo + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR });
                          if (!exp || exp.status === "ok") return dateStr;
                          const cfg2 = EXPIRACAO_CONFIG[exp.status];
                          return (
                            <span className="flex flex-col gap-0.5">
                              <span>{dateStr}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg2.badgeClass}`}>
                                {cfg2.label(exp.diasRestantes)}
                              </span>
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {os.orcamento
                          ? <span className="text-teal-600 font-medium">#{os.orcamento.numero_orcamento}</span>
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/ordens-servico/${os.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletandoId(os.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Confirm delete */}
      <AlertDialog open={!!deletandoId} onOpenChange={(o) => !o && setDeletandoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Ordem de Serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os itens da OS serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletar}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
