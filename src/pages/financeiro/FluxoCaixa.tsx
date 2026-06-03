import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileTable } from "@/components/ui/mobile-table";
import { Plus, Search, Edit, Trash2, ArrowUp, ArrowDown, TrendingUp, Clock, AlertCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useFluxoCaixa, type FluxoCaixa as FluxoCaixaType, type PrevisaoEntrada } from "@/hooks/useFluxoCaixa";
import { FluxoCaixaForm } from "@/components/financeiro/FluxoCaixaForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

export default function FluxoCaixa() {
  const navigate = useNavigate();
  const { movimentacoes, previsoes, isLoading, createMovimentacao, updateMovimentacao, deleteMovimentacao } = useFluxoCaixa();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMovimentacao, setSelectedMovimentacao] = useState<FluxoCaixaType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movimentacaoToDelete, setMovimentacaoToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");

  const handleSubmit = async (data: any) => {
    if (selectedMovimentacao) {
      await updateMovimentacao({ id: selectedMovimentacao.id, ...data });
    } else {
      await createMovimentacao(data);
    }
    setSelectedMovimentacao(null);
  };

  const handleEdit = (movimentacao: FluxoCaixaType) => {
    setSelectedMovimentacao(movimentacao);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setMovimentacaoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (movimentacaoToDelete) {
      await deleteMovimentacao(movimentacaoToDelete);
      setMovimentacaoToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, "default" | "secondary"> = {
      Entrada: "default",
      Saída: "secondary",
    };
    const Icon = tipo === "Entrada" ? ArrowUp : ArrowDown;
    const colorClass = tipo === "Entrada" ? "text-green-600" : "text-red-600";
    
    return (
      <Badge variant={variants[tipo] || "default"} className="gap-1">
        <Icon className={`h-3 w-3 ${colorClass}`} />
        {tipo}
      </Badge>
    );
  };

  const filteredMovimentacoes = movimentacoes.filter((mov) => {
    const matchesSearch = 
      mov.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === "all" || mov.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const totalEntradas = filteredMovimentacoes
    .filter(m => m.tipo === "Entrada")
    .reduce((acc, mov) => acc + Number(mov.valor), 0);

  const totalSaidas = filteredMovimentacoes
    .filter(m => m.tipo === "Saída")
    .reduce((acc, mov) => acc + Number(mov.valor), 0);

  const saldoAtual = totalEntradas - totalSaidas;

  const totalPrevisoes = previsoes.reduce((acc, p) => acc + Number(p.valor), 0);
  const totalVencidas = previsoes
    .filter(p => p.status === "Vencida")
    .reduce((acc, p) => acc + Number(p.valor), 0);

  // Calcular saldo acumulado para cada movimentação
  const movimentacoesComSaldo = [...filteredMovimentacoes]
    .sort((a, b) => new Date(a.data_movimentacao).getTime() - new Date(b.data_movimentacao).getTime())
    .reduce((acc, mov) => {
      const ultimoSaldo = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
      const novoSaldo = mov.tipo === "Entrada" 
        ? ultimoSaldo + Number(mov.valor)
        : ultimoSaldo - Number(mov.valor);
      
      acc.push({ ...mov, saldo: novoSaldo });
      return acc;
    }, [] as (FluxoCaixaType & { saldo: number })[])
    .reverse(); // Reverter para mostrar mais recentes primeiro

  const columns = [
    { 
      key: "data_movimentacao", 
      label: "Data",
      render: (value: any) => format(new Date(value), "dd/MM/yyyy", { locale: ptBR })
    },
    { key: "descricao", label: "Descrição" },
    { key: "tipo", label: "Tipo" },
    { key: "categoria", label: "Categoria" },
    { key: "valor", label: "Valor" },
    { key: "saldo", label: "Saldo" },
  ];

  const mobileCardRender = (mov: FluxoCaixaType & { saldo: number }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{mov.descricao}</p>
          <p className="text-sm text-muted-foreground">{mov.categoria}</p>
        </div>
        <div className="text-right">
          <p className={`font-medium ${mov.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}>
            {mov.tipo === "Saída" && "-"}
            {Number(mov.valor).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(mov.data_movimentacao), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {getTipoBadge(mov.tipo)}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Saldo:</p>
          <p className={`font-medium ${mov.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
            {mov.saldo.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </div>
      </div>
    </div>
  );

  const actions = [
    {
      label: "Editar",
      icon: Edit,
      onClick: (mov: FluxoCaixaType & { saldo: number }) => handleEdit(mov),
    },
    {
      label: "Excluir",
      icon: Trash2,
      onClick: (mov: FluxoCaixaType & { saldo: number }) => handleDelete(mov.id),
      variant: "destructive" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
            <p className="text-muted-foreground">Acompanhe as movimentações financeiras da clínica</p>
          </div>
          <Button onClick={() => { setSelectedMovimentacao(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-medium text-muted-foreground">Total Entradas</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="h-4 w-4 text-red-600" />
              <h3 className="text-sm font-medium text-muted-foreground">Total Saídas</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Saldo Atual</h3>
            <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-700">A Receber</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {totalPrevisoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            {totalVencidas > 0 && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {totalVencidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} vencido
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Label htmlFor="tipo-filter">Tipo</Label>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger id="tipo-filter">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Saída">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg">
          <MobileTable
            data={movimentacoesComSaldo}
            columns={columns}
            mobileCardRender={mobileCardRender}
            actions={actions}
            loading={isLoading}
            emptyState={{
              icon: TrendingUp,
              title: searchTerm || tipoFilter !== "all" 
                ? "Nenhuma movimentação encontrada" 
                : "Nenhuma movimentação cadastrada",
              description: searchTerm || tipoFilter !== "all"
                ? "Ajuste os filtros para ver mais resultados"
                : "Comece registrando uma nova movimentação financeira",
              action: searchTerm || tipoFilter !== "all"
                ? {
                    label: "Limpar filtros",
                    onClick: () => {
                      setSearchTerm("");
                      setTipoFilter("all");
                    }
                  }
                : {
                    label: "Nova Movimentação",
                    onClick: () => {
                      setSelectedMovimentacao(null);
                      setFormOpen(true);
                    }
                  }
            }}
          />
        </div>
      </div>

      {/* Seção: Previsão de Entradas (contas a receber pendentes/vencidas) */}
      {previsoes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold">Previsão de Entradas</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {previsoes.length} conta{previsoes.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Contas a receber pendentes originadas de orçamentos aprovados. Marque como "Recebida" em{" "}
            <button
              className="text-primary underline font-medium"
              onClick={() => navigate("/financeiro/contas-receber")}
            >
              Contas a Receber
            </button>{" "}
            para registrar automaticamente no fluxo de caixa.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-blue-700 text-xs uppercase tracking-wide">Descrição</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue-700 text-xs uppercase tracking-wide">Categoria</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue-700 text-xs uppercase tracking-wide">Vencimento</th>
                  <th className="text-right px-4 py-3 font-semibold text-blue-700 text-xs uppercase tracking-wide">Valor</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue-700 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {previsoes.map((p: PrevisaoEntrada) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.descricao}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.categoria}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${p.status === "Vencida" ? "text-red-600" : "text-slate-600"}`}>
                      {format(new Date(p.data_movimentacao), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">
                      {Number(p.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={p.status === "Vencida"
                          ? "bg-red-100 text-red-700 gap-1"
                          : "bg-yellow-100 text-yellow-700 gap-1"}
                      >
                        {p.status === "Vencida"
                          ? <AlertCircle className="w-3 h-3" />
                          : <Clock className="w-3 h-3" />}
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.orcamento && (
                        <Link
                          to={`/orcamentos/${p.orcamento.id}`}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <FileText className="w-3 h-3" />
                          Orç. #{p.orcamento.numero_orcamento}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FluxoCaixaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        movimentacao={selectedMovimentacao}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
