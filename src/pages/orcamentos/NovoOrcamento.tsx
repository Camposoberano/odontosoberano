import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, Save, Send, ChevronLeft } from "lucide-react";
import { DenteSeletor } from "@/components/orcamentos/DenteSeletor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProcedimentoBusca } from "@/components/orcamentos/ProcedimentoBusca";
import { useOrcamentos, useOrcamento, OrcamentoItem } from "@/hooks/useOrcamentos";
import { ProcedimentoCatalogo } from "@/hooks/useProcedimentosCatalogo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PacienteOpcao { id: string; nome: string; telefone?: string }
interface DentistaOpcao { id: string; nome: string }

interface ItemLocal {
  id?: string;
  procedimento_id?: string;
  nome_procedimento: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  observacao?: string;
  dente_numero?: string | null;
}

function calcularTotais(
  itens: ItemLocal[],
  descontoTipo: "percentual" | "valor",
  descontoValor: number
) {
  const bruto = itens.reduce((sum, i) => sum + i.preco_total, 0);
  const desconto =
    descontoTipo === "percentual"
      ? (bruto * descontoValor) / 100
      : descontoValor;
  return { total_bruto: bruto, total_liquido: Math.max(0, bruto - desconto) };
}

export default function NovoOrcamento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;
  const { toast } = useToast();

  const { criar, atualizar } = useOrcamentos();
  const { data: orcamentoExistente, isLoading: carregando } = useOrcamento(id);

  const [pacientes, setPacientes] = useState<PacienteOpcao[]>([]);
  const [dentistas, setDentistas] = useState<DentistaOpcao[]>([]);
  const [pacienteId, setPacienteId] = useState("");
  const [dentistaId, setDentistaId] = useState("");
  const [itens, setItens] = useState<ItemLocal[]>([]);
  const [descontoTipo, setDescontoTipo] = useState<"percentual" | "valor">("valor");
  const [descontoValor, setDescontoValor] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState("À vista");
  const [parcelas, setParcelas] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [validadeDias, setValidadeDias] = useState(30);
  const [salvando, setSalvando] = useState(false);

  // Carregar pacientes e dentistas
  useEffect(() => {
    supabase.from("pacientes").select("id, nome, telefone").order("nome")
      .then(({ data }) => setPacientes((data ?? []) as PacienteOpcao[]));
    supabase.from("dentistas").select("id, nome").order("nome")
      .then(({ data }) => setDentistas((data ?? []) as DentistaOpcao[]));
  }, []);

  // Preencher formulário em modo edição
  useEffect(() => {
    if (!orcamentoExistente) return;
    setPacienteId(orcamentoExistente.paciente_id ?? "");
    setDentistaId(orcamentoExistente.dentista_id ?? "");
    setDescontoTipo(orcamentoExistente.desconto_tipo);
    setDescontoValor(orcamentoExistente.desconto_valor);
    setFormaPagamento(orcamentoExistente.forma_pagamento ?? "À vista");
    setParcelas(orcamentoExistente.parcelas);
    setObservacoes(orcamentoExistente.observacoes ?? "");
    setValidadeDias(orcamentoExistente.validade_dias);
    setItens(
      (orcamentoExistente.orcamento_itens ?? []).map((i) => ({
        id: i.id,
        procedimento_id: i.procedimento_id ?? undefined,
        nome_procedimento: i.nome_procedimento,
        quantidade: i.quantidade,
        preco_unitario: i.preco_unitario,
        preco_total: i.preco_total,
        observacao: i.observacao ?? undefined,
      }))
    );
  }, [orcamentoExistente]);

  const { total_bruto, total_liquido } = calcularTotais(itens, descontoTipo, descontoValor);

  const adicionarProcedimento = useCallback((proc: ProcedimentoCatalogo) => {
    setItens((prev) => [
      ...prev,
      {
        procedimento_id: proc.id,
        nome_procedimento: proc.nome,
        quantidade: 1,
        preco_unitario: proc.preco_sugerido,
        preco_total: proc.preco_sugerido,
      },
    ]);
  }, []);

  const atualizarItem = (index: number, campo: keyof ItemLocal, valor: number | string) => {
    setItens((prev) => {
      const novo = [...prev];
      const item = { ...novo[index], [campo]: valor };
      if (campo === "quantidade" || campo === "preco_unitario") {
        item.preco_total = Number(item.quantidade) * Number(item.preco_unitario);
      }
      novo[index] = item;
      return novo;
    });
  };

  const removerItem = (index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const salvar = async (status: "rascunho" | "enviado") => {
    if (!pacienteId) {
      toast({ title: "Selecione um paciente", variant: "destructive" });
      return;
    }
    if (itens.length === 0) {
      toast({ title: "Adicione ao menos um procedimento", variant: "destructive" });
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        paciente_id: pacienteId,
        dentista_id: dentistaId || null,
        status,
        desconto_tipo: descontoTipo,
        desconto_valor: descontoValor,
        forma_pagamento: formaPagamento,
        parcelas,
        total_bruto,
        total_liquido,
        observacoes: observacoes || null,
        validade_dias: validadeDias,
      };

      let orcamentoId: string;

      if (isEdicao && id) {
        await atualizar.mutateAsync({ id, ...payload });
        orcamentoId = id;
        // sincronizar itens: deletar todos e reinserir
        await supabase.from("orcamento_itens").delete().eq("orcamento_id", id);
      } else {
        const criado = await criar.mutateAsync(payload);
        orcamentoId = criado.id;
      }

      // Inserir itens
      if (itens.length > 0) {
        const { error } = await supabase.from("orcamento_itens").insert(
          itens.map((i) => ({
            orcamento_id: orcamentoId,
            procedimento_id: i.procedimento_id ?? null,
            nome_procedimento: i.nome_procedimento,
            quantidade: i.quantidade,
            preco_unitario: i.preco_unitario,
            preco_total: i.preco_total,
            observacao: i.observacao ?? null,
            dente_numero: i.dente_numero ?? null,
          }))
        );
        if (error) throw error;
      }

      navigate(`/orcamentos/${orcamentoId}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast({ title: "Erro ao salvar", description: msg, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  if (isEdicao && carregando) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orcamentos")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdicao ? "Editar Orçamento" : "Novo Orçamento"}
            </h1>
            <p className="text-sm text-muted-foreground">Preencha os dados e adicione os procedimentos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="xl:col-span-2 space-y-6">
            {/* Paciente e Dentista */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Paciente e Dentista</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Paciente *</Label>
                  <Select value={pacienteId} onValueChange={setPacienteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Dentista Responsável</Label>
                  <Select value={dentistaId} onValueChange={setDentistaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar dentista..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dentistas.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Busca de Procedimentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adicionar Procedimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ProcedimentoBusca onAdicionar={adicionarProcedimento} />
              </CardContent>
            </Card>

            {/* Tabela de Itens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Itens do Orçamento{" "}
                  <span className="text-muted-foreground font-normal text-sm">
                    ({itens.length} item{itens.length !== 1 ? "s" : ""})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itens.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhum procedimento adicionado. Use a busca acima.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Header da tabela */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1">
                      <div className="col-span-4">Procedimento</div>
                      <div className="col-span-2 text-center">Dente</div>
                      <div className="col-span-1 text-center">Qtd</div>
                      <div className="col-span-2 text-right">Valor Unit. (R$)</div>
                      <div className="col-span-2 text-right">Total</div>
                      <div className="col-span-1" />
                    </div>
                    <Separator />
                    {itens.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <Input
                            value={item.nome_procedimento}
                            onChange={(e) => atualizarItem(idx, "nome_procedimento", e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <DenteSeletor
                            value={item.dente_numero}
                            onChange={(v) => atualizarItem(idx, "dente_numero", v ?? "")}
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            min={1}
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(idx, "quantidade", Number(e.target.value))}
                            className="h-8 text-sm text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.preco_unitario}
                            onChange={(e) => atualizarItem(idx, "preco_unitario", Number(e.target.value))}
                            className="h-8 text-sm text-right"
                          />
                        </div>
                        <div className="col-span-2 text-right text-sm font-medium pr-1">
                          {item.preco_total.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removerItem(idx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Informações adicionais, condições especiais..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Painel Lateral de Totais */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {total_bruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>

                {/* Desconto */}
                <div className="space-y-2">
                  <Label className="text-sm">Desconto</Label>
                  <div className="flex gap-2">
                    <Select
                      value={descontoTipo}
                      onValueChange={(v) => setDescontoTipo(v as "percentual" | "valor")}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valor">R$</SelectItem>
                        <SelectItem value="percentual">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={0}
                      step={descontoTipo === "percentual" ? 1 : 0.01}
                      value={descontoValor}
                      onChange={(e) => setDescontoValor(Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>

                {/* Forma de Pagamento */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Forma de Pagamento</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="À vista">À vista</SelectItem>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Débito">Débito</SelectItem>
                      <SelectItem value="Crédito">Crédito</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Parcelas */}
                {(formaPagamento === "Crédito" || formaPagamento === "Parcelado") && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Nº de Parcelas</Label>
                    <Select
                      value={String(parcelas)}
                      onValueChange={(v) => setParcelas(Number(v))}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}x{" "}
                            {n > 1
                              ? `= ${(total_liquido / n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                              : "à vista"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Validade */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Validade (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={validadeDias}
                    onChange={(e) => setValidadeDias(Number(e.target.value))}
                    className="h-8"
                  />
                </div>

                <Separator />

                {/* Botões */}
                <Button
                  className="w-full gap-2"
                  onClick={() => salvar("rascunho")}
                  disabled={salvando}
                  variant="outline"
                >
                  <Save className="w-4 h-4" />
                  Salvar Rascunho
                </Button>
                <Button
                  className="w-full gap-2"
                  onClick={() => salvar("enviado")}
                  disabled={salvando}
                >
                  <Send className="w-4 h-4" />
                  Finalizar e Enviar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
