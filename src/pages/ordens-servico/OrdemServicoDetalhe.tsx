import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  Play,
  FileText,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdemServico, useOrdensServico, STATUS_OS_CONFIG, type StatusOS } from "@/hooks/useOrdensServico";
import { useProteticos } from "@/hooks/useProteticos";
import { calcularPrazoOS, EXPIRACAO_CONFIG } from "@/utils/orcamentoUtils";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PROXIMOS_STATUS: Partial<Record<StatusOS, { next: StatusOS; label: string; icon: React.ElementType }>> = {
  pendente:    { next: "em_andamento", label: "Iniciar trabalho",     icon: Play },
  em_andamento:{ next: "concluido",    label: "Marcar como concluído", icon: CheckCircle2 },
  concluido:   { next: "entregue",     label: "Marcar como entregue", icon: Truck },
};

export default function OrdemServicoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: os, isLoading } = useOrdemServico(id);
  const { mudarStatus, atualizar } = useOrdensServico();
  const { proteticos } = useProteticos();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    protetico_id: "" as string,
    prazo: "",
    cor_dente: "",
    observacoes: "",
  });

  const abrirEdit = () => {
    if (!os) return;
    setForm({
      protetico_id: os.protetico_id ? String(os.protetico_id) : "",
      prazo: os.prazo ?? "",
      cor_dente: os.cor_dente ?? "",
      observacoes: os.observacoes ?? "",
    });
    setEditOpen(true);
  };

  const salvarEdit = () => {
    if (!os) return;
    atualizar.mutate(
      {
        id: os.id,
        protetico_id: form.protetico_id ? Number(form.protetico_id) : null,
        prazo: form.prazo || null,
        cor_dente: form.cor_dente || null,
        observacoes: form.observacoes || null,
      },
      { onSuccess: () => setEditOpen(false) }
    );
  };

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
        {/* Back */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/ordens-servico")}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>

        {/* Header */}
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
            <Button variant="outline" size="sm" onClick={abrirEdit}>
              <Pencil className="w-4 h-4 mr-1" />
              Editar
            </Button>
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

        {/* Prazo alert */}
        {(() => {
          const exp = calcularPrazoOS(os.prazo, os.status);
          if (!exp || exp.status === "ok") return null;
          const cfgExp = EXPIRACAO_CONFIG[exp.status];
          return (
            <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${cfgExp.alertClass}`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${cfgExp.iconClass}`} />
              <span>Prazo: {cfgExp.label(exp.diasRestantes)}</span>
            </div>
          );
        })()}

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

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar OS #{os.numero_os}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Protético</Label>
              <Select
                value={form.protetico_id}
                onValueChange={(v) => setForm((f) => ({ ...f, protetico_id: v === "_none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar protético..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhum</SelectItem>
                  {proteticos.filter((p) => p.ativo).map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={form.prazo}
                onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Cor do dente</Label>
              <Input
                placeholder="Ex: A2, B1..."
                value={form.cor_dente}
                onChange={(e) => setForm((f) => ({ ...f, cor_dente: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Observações</Label>
              <Textarea
                rows={3}
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={salvarEdit}
              disabled={atualizar.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
