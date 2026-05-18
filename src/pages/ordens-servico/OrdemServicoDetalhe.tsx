import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  Play,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdemServico, useOrdensServico, STATUS_OS_CONFIG, type StatusOS } from "@/hooks/useOrdensServico";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PROXIMOS_STATUS: Partial<Record<StatusOS, { next: StatusOS; label: string; icon: React.ElementType }>> = {
  pendente:    { next: "em_andamento", label: "Iniciar trabalho",    icon: Play },
  em_andamento:{ next: "concluido",    label: "Marcar como concluído", icon: CheckCircle2 },
  concluido:   { next: "entregue",     label: "Marcar como entregue", icon: Truck },
};

export default function OrdemServicoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: os, isLoading } = useOrdemServico(id);
  const { mudarStatus } = useOrdensServico();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!os) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">
          Ordem de serviço não encontrada.
        </div>
      </DashboardLayout>
    );
  }

  const cfg = STATUS_OS_CONFIG[os.status];
  const proximoStatus = PROXIMOS_STATUS[os.status];

  const handleAvancarStatus = () => {
    if (!proximoStatus) return;
    mudarStatus.mutate({ id: os.id, status: proximoStatus.next });
  };

  const dataFormatada = (d: string | null) => {
    if (!d) return "—";
    try { return format(new Date(d), "dd/MM/yyyy", { locale: ptBR }); }
    catch { return d; }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/ordens-servico")}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold">OS #{os.numero_os}</h1>
              <p className="text-sm text-muted-foreground">
                Criada em {dataFormatada(os.created_at)}
              </p>
            </div>
            <Badge className={`${cfg.color} ${cfg.bgColor} border-0 text-sm px-3 py-1`}>
              {cfg.label}
            </Badge>
          </div>

          <div className="flex gap-2 flex-wrap">
            {os.orcamento && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/orcamentos/${os.orcamento.id}`}>
                  <FileText className="w-4 h-4 mr-1" />
                  Orçamento #{os.orcamento.numero_orcamento}
                </Link>
              </Button>
            )}
            {proximoStatus && (
              <Button
                size="sm"
                onClick={handleAvancarStatus}
                disabled={mudarStatus.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <proximoStatus.icon className="w-4 h-4 mr-1" />
                {proximoStatus.label}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Paciente" value={os.paciente?.nome} />
              <Row label="Dentista" value={os.dentista?.nome} />
              <Row label="Protético" value={os.protetico?.nome} />
              <Row label="Cor do dente" value={os.cor_dente} />
              <Row label="Prazo" value={dataFormatada(os.prazo)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {os.observacoes || "Nenhuma observação."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Itens */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Itens da OS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dente</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(os.ordem_servico_itens ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum item.
                    </TableCell>
                  </TableRow>
                ) : (
                  (os.ordem_servico_itens ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">
                        {item.dente_numero ? `#${item.dente_numero}` : "—"}
                      </TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell className="text-right">{item.quantidade}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Criada em {dataFormatada(os.created_at)}</span>
            </div>
            {os.status !== "pendente" && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-500" />
                <span>
                  Última atualização: {dataFormatada(os.updated_at)} — {cfg.label}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
