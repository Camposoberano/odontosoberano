import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Eye, Edit, Trash2, Copy } from "lucide-react";
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
  const { orcamentos, isLoading, deletar } = useOrcamentos();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const filtrados = filtroStatus === "todos"
    ? orcamentos
    : orcamentos.filter((o) => o.status === filtroStatus);

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

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Dentista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-32 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
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
