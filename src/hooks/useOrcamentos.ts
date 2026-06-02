import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type StatusOrcamento =
  | "rascunho"
  | "enviado"
  | "aprovado"
  | "recusado"
  | "contrato_assinado"
  | "em_andamento"
  | "finalizado"
  | "entregue";

export interface OrcamentoItem {
  id: string;
  orcamento_id: string;
  procedimento_id: string | null;
  nome_procedimento: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  observacao: string | null;
  dente_numero: string | null;
}

export interface Orcamento {
  id: string;
  numero_orcamento: number;
  paciente_id: string | null;
  dentista_id: string | null;
  status: StatusOrcamento;
  desconto_tipo: "percentual" | "valor";
  desconto_valor: number;
  forma_pagamento: string | null;
  parcelas: number;
  total_bruto: number;
  total_liquido: number;
  observacoes: string | null;
  docuseal_submission_id: string | null;
  pdf_url: string | null;
  validade_dias: number;
  data_envio: string | null;
  data_aprovacao: string | null;
  created_at: string;
  updated_at: string;
  // joins
  paciente?: {
    id: string; nome: string; telefone?: string; email?: string;
    cpf?: string; rg?: string; data_nascimento?: string;
    rua?: string; numero?: string; bairro?: string; cidade?: string; estado?: string; cep?: string;
    responsavel?: string; responsavel_cpf?: string; numero_prontuario?: string;
  } | null;
  dentista?: { id: string; nome: string; cro?: string | null } | null;
  orcamento_itens?: OrcamentoItem[];
}

export interface NovoOrcamentoInput {
  paciente_id?: string;
  dentista_id?: string;
  status?: StatusOrcamento;
  desconto_tipo?: "percentual" | "valor";
  desconto_valor?: number;
  forma_pagamento?: string;
  parcelas?: number;
  total_bruto?: number;
  total_liquido?: number;
  observacoes?: string;
  validade_dias?: number;
}

export interface NovoItemInput {
  procedimento_id?: string;
  nome_procedimento: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  observacao?: string;
  dente_numero?: string | null;
}

const QUERY_KEY = "orcamentos";

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho criado",
  enviado: "Enviado ao paciente",
  aprovado: "Aprovado pelo paciente",
  recusado: "Recusado pelo paciente",
  contrato_assinado: "Contrato assinado",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  entregue: "Entregue",
};

async function sincronizarOdontograma(
  orcamentoId: string,
  status: string,
  userId: string,
) {
  const { data: orc } = await supabase
    .from("orcamentos")
    .select("paciente_id, orcamento_itens(*)")
    .eq("id", orcamentoId)
    .single();
  if (!orc?.paciente_id) return;
  const itensComDente = (orc.orcamento_itens as any[])?.filter(i => i.dente_numero) ?? [];
  if (!itensComDente.length) return;

  const { data: existente } = await supabase
    .from("odontograma")
    .select("id, dados_dentes")
    .eq("paciente_id", orc.paciente_id)
    .maybeSingle();

  const statusLabel = { aprovado: "Aprovado", em_andamento: "Em andamento", finalizado: "Finalizado", entregue: "Entregue" }[status] ?? status;
  const novosDados: Record<string, any> = { ...(existente?.dados_dentes ?? {}) };

  for (const item of itensComDente) {
    const key = String(item.dente_numero);
    const atual = novosDados[key] ?? { numero: Number(item.dente_numero), procedimentos: [] };
    const label = `${item.nome_procedimento} [${statusLabel}]`;
    if (!Array.isArray(atual.procedimentos)) atual.procedimentos = [];
    if (!atual.procedimentos.some((p: string) => p.startsWith(item.nome_procedimento))) {
      atual.procedimentos = [...atual.procedimentos, label];
    } else {
      atual.procedimentos = atual.procedimentos.map((p: string) =>
        p.startsWith(item.nome_procedimento) ? label : p
      );
    }
    novosDados[key] = atual;
  }

  if (existente) {
    await supabase.from("odontograma")
      .update({ dados_dentes: novosDados, user_id: userId })
      .eq("id", existente.id);
  } else {
    await supabase.from("odontograma")
      .insert({ paciente_id: orc.paciente_id, user_id: userId, dados_dentes: novosDados });
  }
}

async function registrarNoProntuario(
  pacienteId: string,
  userId: string,
  texto: string,
  dentistaId?: string | null,
) {
  await supabase.from("evolucoes").insert({
    paciente_id: pacienteId,
    user_id: userId,
    profissional_id: dentistaId ?? null,
    data: new Date().toISOString().split("T")[0],
    texto,
  });
}

export function useOrcamentos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const lista = useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Orcamento[]> => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, email),
          dentista:dentistas(id, nome, cro),
          orcamento_itens(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Orcamento[];
    },
  });

  const criar = useMutation({
    mutationFn: async (input: NovoOrcamentoInput): Promise<Orcamento> => {
      const { data, error } = await supabase
        .from("orcamentos")
        .insert(input)
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, email),
          dentista:dentistas(id, nome, cro),
          orcamento_itens(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as Orcamento;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "Orçamento criado com sucesso" });
      if (data?.paciente_id && user?.id) {
        const fmtValor = (data.total_liquido ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        registrarNoProntuario(
          data.paciente_id,
          user.id,
          `📋 Orçamento #${data.numero_orcamento} criado — Status: ${STATUS_LABELS[data.status] ?? data.status} — Valor total: ${fmtValor}`,
          data.dentista_id,
        );
      }
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar orçamento", description: err.message, variant: "destructive" });
    },
  });

  const atualizar = useMutation({
    mutationFn: async ({ id, ...input }: NovoOrcamentoInput & { id: string }): Promise<Orcamento> => {
      const { data, error } = await supabase
        .from("orcamentos")
        .update({ ...input, ...(user?.id ? { user_id: user.id } : {}) })
        .eq("id", id)
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, email),
          dentista:dentistas(id, nome, cro),
          orcamento_itens(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as Orcamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar orçamento", description: err.message, variant: "destructive" });
    },
  });

  const mudarStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: StatusOrcamento;
    }) => {
      const extra: Record<string, unknown> = {};
      if (status === "enviado") extra.data_envio = new Date().toISOString();
      if (status === "aprovado") extra.data_aprovacao = new Date().toISOString();

      const { data, error } = await supabase
        .from("orcamentos")
        .update({ status, ...extra, ...(user?.id ? { user_id: user.id } : {}) })
        .eq("id", id)
        .select("id, status")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      toast({ title: "Status atualizado" });
      if (user?.id) {
        const cached = queryClient.getQueryData<Orcamento[]>([QUERY_KEY, user.id]);
        const orc = cached?.find(o => o.id === variables.id);
        if (orc?.paciente_id) {
          const label = STATUS_LABELS[variables.status] ?? variables.status;
          registrarNoProntuario(
            orc.paciente_id,
            user.id,
            `📋 Orçamento #${orc.numero_orcamento} — Status alterado para: ${label}`,
            orc.dentista_id,
          );
        }
        // Sync dentes trabalhados no odontograma
        if (["aprovado", "em_andamento", "finalizado", "entregue"].includes(variables.status)) {
          sincronizarOdontograma(variables.id, variables.status, user.id);
        }
      }
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao mudar status", description: err.message, variant: "destructive" });
    },
  });

  const deletar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orcamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "Orçamento excluído" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    },
  });

  const adicionarItem = useMutation({
    mutationFn: async ({
      orcamentoId,
      item,
    }: {
      orcamentoId: string;
      item: NovoItemInput;
    }): Promise<OrcamentoItem> => {
      const { data, error } = await supabase
        .from("orcamento_itens")
        .insert({ ...item, orcamento_id: orcamentoId })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as OrcamentoItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const removerItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("orcamento_itens").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const duplicar = useMutation({
    mutationFn: async (id: string): Promise<Orcamento> => {
      // Buscar orçamento original com itens
      const { data: original, error: fetchErr } = await supabase
        .from("orcamentos")
        .select("*, orcamento_itens(*)")
        .eq("id", id)
        .single();
      if (fetchErr) throw fetchErr;

      // Criar novo orçamento como rascunho
      const { paciente_id, dentista_id, desconto_tipo, desconto_valor,
              forma_pagamento, parcelas, total_bruto, total_liquido,
              observacoes, validade_dias } = original as Orcamento;

      const { data: novo, error: createErr } = await supabase
        .from("orcamentos")
        .insert({ paciente_id, dentista_id, desconto_tipo, desconto_valor,
                  forma_pagamento, parcelas, total_bruto, total_liquido,
                  observacoes, validade_dias, status: "rascunho" })
        .select()
        .single();
      if (createErr) throw createErr;

      // Copiar itens
      const itens = ((original as unknown as { orcamento_itens: OrcamentoItem[] }).orcamento_itens ?? []);
      if (itens.length > 0) {
        const { error: itemsErr } = await supabase.from("orcamento_itens").insert(
          itens.map(({ nome_procedimento, quantidade, preco_unitario, preco_total, observacao, procedimento_id }) => ({
            orcamento_id: (novo as Orcamento).id,
            procedimento_id, nome_procedimento, quantidade, preco_unitario, preco_total, observacao,
          }))
        );
        if (itemsErr) throw itemsErr;
      }

      return novo as Orcamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "Orçamento duplicado como rascunho" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao duplicar", description: err.message, variant: "destructive" });
    },
  });

  const atualizarItem = useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: Partial<OrcamentoItem> & { id: string }) => {
      const { error } = await supabase
        .from("orcamento_itens")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    orcamentos: lista.data ?? [],
    isLoading: lista.isLoading,
    isError: lista.isError,
    criar,
    atualizar,
    mudarStatus,
    deletar,
    adicionarItem,
    removerItem,
    atualizarItem,
    duplicar,
  };
}

export function useOrcamentosByPaciente(pacienteId: string | undefined) {
  return useQuery({
    queryKey: ["orcamentos", "by_paciente", pacienteId],
    enabled: !!pacienteId,
    queryFn: async (): Promise<Orcamento[]> => {
      if (!pacienteId) return [];
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Orcamento[];
    },
  });
}

export function useOrcamento(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    enabled: !!id,
    queryFn: async (): Promise<Orcamento | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("orcamentos")
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, email, cpf, rg, data_nascimento, rua, numero, bairro, cidade, estado, cep, responsavel, responsavel_cpf, numero_prontuario),
          dentista:dentistas(id, nome, cro),
          orcamento_itens(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as Orcamento;
    },
  });
}
