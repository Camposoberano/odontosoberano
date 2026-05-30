import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Send, AlertTriangle, Download, Printer, MessageCircle, Link2, Copy, CheckCircle2, Clock } from "lucide-react";
import { useGenerateAnamneseToken, useActiveTokens, buildAnamneseUrl } from "@/hooks/useAnamneseToken";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AnamnesePDFTemplate } from "@/components/documentos/AnamnesePDFTemplate";
import { buildVars, exportarDocumentoPDF } from "@/utils/documentoUtils";
import { useInformacoesClinica } from "@/hooks/useInformacoesClinica";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnamnese } from "@/hooks/useAnamnese";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Estrutura das Perguntas (fiel ao soberano.pro) ────────────────────────

interface Pergunta {
  id: string;
  texto: string;
  tipo: "input" | "text" | "radio" | "radio_text";
  icone?: string;
  alerta?: string;
  detalheLabel?: string;
  detalhePlaceholder?: string;
}

interface Secao {
  titulo: string;
  perguntas: Pergunta[];
}

const SECOES: Secao[] = [
  {
    titulo: "Dados Pessoais e Emergência",
    perguntas: [
      { id: "data_nascimento", texto: "Data de Nascimento (DD/MM/AAAA)", tipo: "input" },
      { id: "cpf", texto: "CPF", tipo: "input" },
      { id: "telefone", texto: "Telefone / WhatsApp", tipo: "input" },
      { id: "contato_emergencia", texto: "Contato de Emergência (Nome e Telefone)", tipo: "input" },
    ],
  },
  {
    titulo: "Motivo da Consulta",
    perguntas: [
      { id: "queixa_principal", texto: "Qual a sua queixa principal?", tipo: "text" },
      { id: "ultima_visita", texto: "Quando foi sua última vez no dentista? Como foi o atendimento?", tipo: "text" },
    ],
  },
  {
    titulo: "Histórico Odontológico",
    perguntas: [
      { id: "freq_escovacao", texto: "Quantas vezes por dia escova os dentes?", tipo: "input" },
      { id: "fio_dental", texto: "Usa fio dental?", tipo: "radio_text" },
      { id: "sangramento", texto: "Apresenta sangramento na escovação?", tipo: "radio" },
      { id: "doces", texto: "Come muitos doces ou balas?", tipo: "radio_text" },
      { id: "bruxismo", texto: "Range ou aperta os dentes (Bruxismo)?", tipo: "radio", alerta: "Bruxismo/Apertamento" },
      { id: "dor_atm", texto: "Sente dor de cabeça frequente ou ao abrir/fechar a boca?", tipo: "radio", alerta: "Possível DTM" },
    ],
  },
  {
    titulo: "Procedimentos Anteriores",
    perguntas: [
      { id: "internado", texto: "Já esteve internado(a)?", tipo: "radio_text" },
      { id: "cirurgia", texto: "Já fez alguma cirurgia médica geral?", tipo: "radio_text" },
      { id: "cirurgia_oral", texto: "Já fez Cirurgia Oral (extração, etc.)?", tipo: "radio_text" },
      { id: "reacao_anestesia", texto: "Já teve reação alérgica à anestesia?", tipo: "radio_text", alerta: "Alérgico ao anestésico" },
      {
        id: "sedacao", texto: "Já passou por sedação?", tipo: "radio_text", alerta: "Já foi sedado",
        detalheLabel: "Qual tipo: geral, medicação ou inalatória (com óxido nitroso)?",
        detalhePlaceholder: "Ex: Medicação...",
      },
    ],
  },
  {
    titulo: "Medicação e Alergias",
    perguntas: [
      {
        id: "medico", texto: "Faz acompanhamento médico regular?", tipo: "radio_text",
        detalheLabel: "Qual a especialidade e telefone do médico?",
        detalhePlaceholder: "Ex: Cardiologista, Dr. Silva (11) 9999-9999",
      },
      { id: "medicacao", texto: "Está usando alguma medicação?", tipo: "radio_text", alerta: "Toma medicação" },
      { id: "alergia", texto: "Possui alguma alergia? (Penicilina, AAS, etc.)", tipo: "radio_text", alerta: "Alérgico a" },
    ],
  },
  {
    titulo: "Cardiovascular e Sangue",
    perguntas: [
      { id: "hemorragia", texto: "Já teve hemorragia diagnosticada?", tipo: "radio", alerta: "Risco de hemorragia" },
      { id: "cicatrizacao", texto: "Tem dificuldades de cicatrização?", tipo: "radio", alerta: "Problema de cicatrização" },
      { id: "alt_sanguinea", texto: "Possui alguma alteração sanguínea?", tipo: "radio_text", alerta: "Alteração sanguínea" },
      { id: "anemia", texto: "Possui anemia?", tipo: "radio", alerta: "Anêmico" },
      { id: "cardiovascular", texto: "Possui alteração cardiovascular?", tipo: "radio_text", alerta: "Alteração cardíaca" },
      { id: "pressao_alta", texto: "Tem pressão alta?", tipo: "radio_text", alerta: "Hipertenso" },
      { id: "media_pressao", texto: "Qual a média da sua pressão? (Ex: 12/8, sempre baixa, sempre alta)", tipo: "input" },
    ],
  },
  {
    titulo: "Condições Sistêmicas",
    perguntas: [
      {
        id: "diabetes", texto: "Possui diabetes?", tipo: "radio_text", alerta: "Diabético",
        detalheLabel: "Está controlada? Quais medicações faz uso?",
        detalhePlaceholder: "Ex: Controlada. Uso Metformina...",
      },
      { id: "asma", texto: "Possui asma?", tipo: "radio", alerta: "Asmático" },
      { id: "respiratoria", texto: "Possui disfunção respiratória?", tipo: "radio_text", alerta: "Problema respiratório" },
      { id: "hepatica", texto: "Possui disfunção hepática?", tipo: "radio_text", alerta: "Disfunção hepática" },
      { id: "renal", texto: "Apresenta disfunção renal?", tipo: "radio_text", alerta: "Problema renal" },
      { id: "gastro", texto: "Possui gastrite, úlcera ou refluxo?", tipo: "radio_text", alerta: "Problema gástrico" },
    ],
  },
  {
    titulo: "Outras Condições",
    perguntas: [
      { id: "neurologico", texto: "Tem histórico de desmaios, convulsões ou epilepsia?", tipo: "radio_text", alerta: "Neurológico/Convulsão" },
      { id: "ossea", texto: "Possui alteração óssea?", tipo: "radio_text", alerta: "Alteração óssea" },
      { id: "transmissivel", texto: "Possui doença transmissível? (HIV, Hepatite)", tipo: "radio_text", alerta: "Doença transmissível" },
      { id: "febre", texto: "Teve febre nos últimos 14 dias?", tipo: "radio" },
      { id: "outra_doenca", texto: "Outra doença ou síndrome não mencionada?", tipo: "radio_text", alerta: "Outra doença" },
    ],
  },
  {
    titulo: "Saúde Mental e Hábitos",
    perguntas: [
      { id: "depressao", texto: "Possui depressão?", tipo: "radio" },
      { id: "psicologico", texto: "Está em tratamento psicológico?", tipo: "radio" },
      { id: "fumante", texto: "É Fumante?", tipo: "radio_text", alerta: "Fumante" },
      { id: "drogas", texto: "Consome álcool ou usa drogas?", tipo: "radio_text" },
    ],
  },
  {
    titulo: "Condição Feminina (Se aplicável)",
    perguntas: [
      { id: "gravida", texto: "Está grávida?", tipo: "radio_text", alerta: "Grávida" },
      { id: "amamentando", texto: "Está amamentando?", tipo: "radio" },
    ],
  },
  {
    titulo: "Triagem Clínica",
    perguntas: [
      { id: "pressao_arterial", texto: "Pressão arterial (opcional)", tipo: "input" },
      { id: "freq_respiratoria", texto: "Frequência respiratória (opcional)", tipo: "input" },
      { id: "freq_cardiaca", texto: "Frequência cardíaca bpm (opcional)", tipo: "input" },
      { id: "oximetria", texto: "Oximetria (opcional)", tipo: "input" },
    ],
  },
];

const TOTAL_STEPS = SECOES.length + 1; // 0=hero, 1..N=secoes, N+1=conclusão

// ─── Sub-componentes ───────────────────────────────────────────────────────

function RadioCard({ valor, selecionado, onSelect, icone, cor }: {
  valor: string; selecionado: boolean; onSelect: () => void;
  icone: React.ReactNode; cor: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-2 p-4 min-h-[100px] font-bold text-lg transition-all duration-200 ${
        selecionado
          ? "border-sky-500 bg-sky-50 text-sky-700 shadow-lg shadow-sky-500/15 -translate-y-1"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      <span className={`text-3xl ${selecionado ? cor : "opacity-50"}`}>{icone}</span>
      {valor}
    </button>
  );
}

interface PerguntaItemProps {
  pergunta: Pergunta;
  resposta: string;
  detalhe: string;
  onChange: (id: string, valor: string) => void;
  onDetalhe: (id: string, valor: string) => void;
  erro: boolean;
}

function PerguntaItem({ pergunta, resposta, detalhe, onChange, onDetalhe, erro }: PerguntaItemProps) {
  const { id, texto, tipo, alerta, detalheLabel, detalhePlaceholder } = pergunta;
  const mostrarDetalhe = tipo === "radio_text" && resposta === "Sim";

  return (
    <div className="space-y-3">
      <p className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug">{texto}</p>

      {tipo === "input" && (
        <Input
          value={resposta}
          onChange={e => onChange(id, e.target.value)}
          placeholder="Sua resposta..."
          className={`h-14 text-xl rounded-2xl border-2 bg-slate-50 focus:bg-white px-5 ${erro ? "border-red-400" : "border-slate-200 focus:border-sky-500"}`}
        />
      )}

      {tipo === "text" && (
        <Textarea
          value={resposta}
          onChange={e => onChange(id, e.target.value)}
          placeholder="Sua resposta..."
          rows={2}
          className={`text-xl rounded-2xl border-2 bg-slate-50 focus:bg-white px-5 py-4 resize-none ${erro ? "border-red-400" : "border-slate-200 focus:border-sky-500"}`}
        />
      )}

      {(tipo === "radio" || tipo === "radio_text") && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { valor: "Sim", icone: "✓", cor: "text-green-500" },
            { valor: "Não", icone: "✗", cor: "text-red-500" },
            { valor: "Não sei", icone: "?", cor: "text-slate-400" },
          ].map(op => (
            <RadioCard
              key={op.valor}
              valor={op.valor}
              selecionado={resposta === op.valor}
              onSelect={() => onChange(id, op.valor)}
              icone={op.icone}
              cor={op.cor}
            />
          ))}
        </div>
      )}

      {erro && (
        <p className="text-sm text-red-500 font-medium">
          ⚠ {tipo === "radio" || tipo === "radio_text" ? "Selecione uma opção." : "Campo obrigatório."}
        </p>
      )}

      {mostrarDetalhe && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <p className="text-sm font-bold text-slate-600">{detalheLabel || "Poderia especificar?"}</p>
          <Input
            value={detalhe}
            onChange={e => onDetalhe(id, e.target.value)}
            placeholder={detalhePlaceholder || "Digite os detalhes..."}
            className="h-12 rounded-2xl border-2 border-sky-200 bg-sky-50/50 focus:border-sky-500 text-lg px-5"
          />
        </motion.div>
      )}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

interface Props {
  pacienteId: string;
  nomePaciente?: string;
}

export function AnamneseFormulario({ pacienteId, nomePaciente, paciente }: Props & { paciente?: any }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: anamneseExistente, isLoading: loadingAnamnese } = useAnamnese(pacienteId);
  const { informacoes: clinica } = useInformacoesClinica();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  const [step, setStep] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [detalhes, setDetalhes] = useState<Record<string, string>>({});
  const [erros, setErros] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const generateToken = useGenerateAnamneseToken(pacienteId, nomePaciente ?? "");
  const { data: tokens } = useActiveTokens(pacienteId);

  const handleGenerateLink = async () => {
    const url = await generateToken.mutateAsync();
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success("Link gerado e copiado!");
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success("Link copiado!");
  };

  const handleWhatsAppLink = (url: string) => {
    const nome = nomePaciente?.split(" ")[0] ?? "";
    const msg = encodeURIComponent(
      `Olá${nome ? `, ${nome}` : ""}! Por favor, preencha sua ficha médica antes da consulta:\n${url}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  // Pré-preencher respostas quando anamnese existente carrega
  useEffect(() => {
    if (!anamneseExistente?.dados_completos) return;
    const dc = anamneseExistente.dados_completos as Record<string, string>;
    const novasRespostas: Record<string, string> = {};
    const novosDetalhes: Record<string, string> = {};
    Object.entries(dc).forEach(([k, v]) => {
      if (k.endsWith("_detalhe")) {
        novosDetalhes[k.replace("_detalhe", "")] = v;
      } else {
        novasRespostas[k] = v;
      }
    });
    setRespostas(novasRespostas);
    setDetalhes(novosDetalhes);
  }, [anamneseExistente]);

  const setResposta = useCallback((id: string, valor: string) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));
    setErros(prev => ({ ...prev, [id]: false }));
  }, []);

  const setDetalhe = useCallback((id: string, valor: string) => {
    setDetalhes(prev => ({ ...prev, [id]: valor }));
  }, []);

  const validarStep = (): boolean => {
    if (step === 0) {
      // hero não tem campos obrigatórios aqui
      return true;
    }
    const secaoIdx = step - 1;
    if (secaoIdx >= SECOES.length) return true; // conclusão

    const secao = SECOES[secaoIdx];
    const novosErros: Record<string, boolean> = {};
    let valido = true;

    // Triagem é opcional (último passo)
    const ehTriagem = secaoIdx === SECOES.length - 1;
    if (ehTriagem) return true;

    secao.perguntas.forEach(p => {
      const resp = respostas[p.id] ?? "";
      if (!resp.trim()) {
        novosErros[p.id] = true;
        valido = false;
      }
    });

    setErros(novosErros);
    return valido;
  };

  const avancar = () => {
    if (!validarStep()) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const voltar = () => {
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gerarAlertas = (): string[] => {
    const alertas: string[] = [];
    SECOES.forEach(sec => {
      sec.perguntas.forEach(p => {
        if (p.alerta && respostas[p.id] === "Sim") {
          let texto = p.alerta;
          const det = detalhes[p.id];
          if (det?.trim()) texto += `: ${det}`;
          alertas.push(texto);
        }
      });
    });
    return alertas;
  };

  const submeter = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const dadosCompletos: Record<string, string> = {};
      SECOES.forEach(sec => {
        sec.perguntas.forEach(p => {
          if (respostas[p.id]) dadosCompletos[p.id] = respostas[p.id];
          if (detalhes[p.id]) dadosCompletos[`${p.id}_detalhe`] = detalhes[p.id];
        });
      });

      const alertasMedicos = gerarAlertas();

      // Mapear campos para colunas existentes
      const payload: Record<string, any> = {
        paciente_id: pacienteId,
        user_id: user.id,
        queixa_principal: respostas.queixa_principal ?? null,
        alergias: respostas.alergia === "Sim" ? (detalhes.alergia || "Sim") : respostas.alergia ?? null,
        medicamentos_uso: respostas.medicacao === "Sim" ? (detalhes.medicacao || "Sim") : null,
        gestante: respostas.gravida === "Sim",
        fumante: respostas.fumante === "Sim",
        alcool: respostas.drogas === "Sim",
        pressao_arterial: respostas.media_pressao ?? respostas.pressao_arterial ?? null,
        historico_cirurgias: respostas.cirurgia === "Sim" ? (detalhes.cirurgia || "Sim") : null,
        observacoes: [
          respostas.ultima_visita && `Última visita: ${respostas.ultima_visita}`,
          respostas.contato_emergencia && `Emergência: ${respostas.contato_emergencia}`,
          respostas.bruxismo === "Sim" && "Bruxismo",
          respostas.dor_atm === "Sim" && "Dor ATM",
          alertasMedicos.length > 0 && `ALERTAS: ${alertasMedicos.join(" | ")}`,
        ].filter(Boolean).join("\n") || null,
        dados_completos: dadosCompletos,
        alertas_medicos: alertasMedicos,
      };

      // Upsert (atualiza se já existe para este paciente)
      const { error } = await supabase
        .from("anamneses")
        .upsert(payload, { onConflict: "user_id,paciente_id" });

      if (error) throw error;
      // Invalida cache para que o hook busque dados atualizados
      queryClient.invalidateQueries({ queryKey: ["anamnese", pacienteId] });
      setStep(TOTAL_STEPS + 1);
    } catch (err: any) {
      toast.error("Erro ao salvar anamnese: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const vars = buildVars(paciente, clinica ? {
    nome: clinica.nome_clinica, cnpj: clinica.cnpj,
    cidade: clinica.cidade, estado: clinica.estado,
    endereco: [clinica.endereco, clinica.numero, clinica.bairro].filter(Boolean).join(', '),
    telefone: clinica.telefone || clinica.celular,
    logo_url: clinica.logo_base64,
  } : undefined);

  const anamneseParaPDF = {
    queixa_principal: respostas.queixa_principal,
    alergias: respostas.alergia === 'Sim' ? (detalhes.alergia || 'Sim') : undefined,
    medicamentos_uso: respostas.medicacao === 'Sim' ? (detalhes.medicacao || 'Sim') : undefined,
    gestante: respostas.gravida === 'Sim',
    fumante: respostas.fumante === 'Sim',
    alcool: respostas.drogas === 'Sim',
    pressao_arterial: respostas.media_pressao || respostas.pressao_arterial,
    historico_cirurgias: respostas.cirurgia === 'Sim' ? (detalhes.cirurgia || 'Sim') : undefined,
    frequencia_respiratoria: respostas.freq_respiratoria ? Number(respostas.freq_respiratoria) : undefined,
    fc_bpm: respostas.freq_cardiaca ? Number(respostas.freq_cardiaca) : undefined,
  };

  const handleBaixarPDF = async () => {
    setGerandoPDF(true);
    try {
      await exportarDocumentoPDF('anamnese-pdf-export', `Anamnese — ${nomePaciente ?? 'Paciente'}.pdf`);
    } catch { toast.error('Erro ao gerar PDF'); }
    finally { setGerandoPDF(false); }
  };

  const handleImprimir = () => {
    const el = document.getElementById('anamnese-pdf-export');
    if (!el) return;
    const w = window.open('', '_blank')!;
    w.document.write(`<html><head><title>Anamnese</title></head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const handleWhatsApp = () => {
    if (!paciente?.telefone) { toast.error('Paciente sem telefone cadastrado'); return; }
    const tel = paciente.telefone.replace(/\D/g, '');
    if (!/^\d{10,11}$/.test(tel)) { toast.error('Telefone inválido para WhatsApp'); return; }
    // Mensagem sem alertas clínicos por WhatsApp (LGPD — dados de saúde via canal 3º)
    const msg = encodeURIComponent(
      `Olá ${nomePaciente ?? 'Paciente'}! 🦷\n\n` +
      `Sua *Ficha de Anamnese* foi registrada com sucesso no Instituto Belém de Odontologia.\n\n` +
      `Agradecemos sua colaboração. Qualquer dúvida, estamos à disposição!\n\n` +
      `*Instituto Belém de Odontologia*`
    );
    window.open(`https://wa.me/55${tel}?text=${msg}`, '_blank');
  };

  const progresso = step === 0 ? 0 : Math.round((step / TOTAL_STEPS) * 100);
  const secaoAtual = step >= 1 && step <= SECOES.length ? SECOES[step - 1] : null;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden relative">

        {/* Barra de progresso */}
        {step > 0 && step <= TOTAL_STEPS && (
          <div className="w-full bg-slate-100 h-2.5 absolute top-0 left-0 z-10">
            <motion.div
              className="bg-sky-500 h-2.5 rounded-r-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
              initial={false}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}

        <div className="p-6 sm:p-10 pt-10">
          <AnimatePresence mode="wait">

            {/* HERO */}
            {step === 0 && (
              <motion.div key="hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="text-center py-6 space-y-6">
                <div className="w-24 h-24 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto border border-sky-100 text-5xl">
                  🦷
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
                    Sua saúde em<br />primeiro lugar.
                  </h1>
                  <p className="text-slate-500 text-lg mt-3 max-w-sm mx-auto">
                    Preencha esta ficha médica com atenção. Informações essenciais para a sua segurança clínica.
                  </p>
                </div>
                {nomePaciente && (
                  <div className="bg-sky-50 rounded-2xl px-6 py-4 border border-sky-100 inline-block">
                    <p className="font-black text-sky-700 text-lg">👤 {nomePaciente}</p>
                  </div>
                )}

                {/* Alertas médicos já salvos */}
                {anamneseExistente?.alertas_medicos && anamneseExistente.alertas_medicos.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 max-w-sm mx-auto text-left space-y-2">
                    <p className="font-black text-red-700 text-xs uppercase tracking-widest flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Alertas da Ficha Anterior
                    </p>
                    {anamneseExistente.alertas_medicos.map((a, i) => (
                      <Badge key={i} className="bg-red-100 text-red-800 text-xs block w-fit">⚠ {a}</Badge>
                    ))}
                  </div>
                )}

                <Button
                  onClick={avancar}
                  disabled={loadingAnamnese}
                  className="w-full max-w-sm mx-auto rounded-2xl h-14 text-lg font-black shadow-xl shadow-sky-500/30 gap-2"
                >
                  {anamneseExistente ? "Atualizar Ficha" : "Iniciar Ficha"} <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {/* SEÇÃO DE PERGUNTAS */}
            {secaoAtual && (
              <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                className="space-y-8">
                <div className="flex items-center gap-4 bg-sky-50 p-5 rounded-3xl border border-sky-100">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl border border-sky-100 shadow-sm shrink-0">
                    🦷
                  </div>
                  <div>
                    <p className="text-sky-600 font-bold text-xs tracking-widest uppercase">Passo {step} de {SECOES.length}</p>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">{secaoAtual.titulo}</h2>
                  </div>
                </div>

                <div className="space-y-8">
                  {secaoAtual.perguntas.map(p => (
                    <PerguntaItem
                      key={p.id}
                      pergunta={p}
                      resposta={respostas[p.id] ?? ""}
                      detalhe={detalhes[p.id] ?? ""}
                      onChange={setResposta}
                      onDetalhe={setDetalhe}
                      erro={!!erros[p.id]}
                    />
                  ))}
                </div>

                {/* Navegação */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 gap-4">
                  <Button variant="outline" onClick={voltar} className="rounded-2xl h-12 px-6 font-bold gap-2 border-2">
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button onClick={avancar} className="rounded-2xl h-12 px-8 font-black gap-2 flex-1 sm:flex-none shadow-lg">
                    Avançar <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* CONCLUSÃO */}
            {step === TOTAL_STEPS && (
              <motion.div key="conclusao" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center py-6 space-y-6">
                <div className="w-24 h-24 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mx-auto text-5xl border-4 border-white shadow-xl">
                  📋
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-800">Tudo pronto!</h2>
                  <p className="text-slate-500 text-lg mt-2">Você respondeu todas as perguntas.</p>
                </div>

                {/* Alertas médicos gerados */}
                {gerarAlertas().length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left space-y-1">
                    <p className="font-black text-red-700 text-sm uppercase tracking-widest">⚠ Alertas Clínicos</p>
                    {gerarAlertas().map((a, i) => (
                      <p key={i} className="text-red-600 text-sm font-medium">• {a}</p>
                    ))}
                  </div>
                )}

                <div className="bg-amber-50 text-amber-900 p-5 rounded-2xl border border-amber-200 text-left flex gap-4">
                  <span className="text-2xl shrink-0">⚖️</span>
                  <p className="font-medium text-base">Declaro, sob as penas da lei, que as informações acima são a expressão da verdade. Autorizo a realização dos procedimentos odontológicos com base nestas informações.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={voltar} className="rounded-2xl h-12 font-bold gap-2 border-2">
                    <ChevronLeft className="w-4 h-4" /> Revisar
                  </Button>
                  <Button
                    onClick={submeter}
                    disabled={submitting}
                    className="flex-1 rounded-2xl h-14 text-lg font-black gap-2 shadow-xl shadow-teal-500/30 bg-teal-500 hover:bg-teal-600"
                  >
                    {submitting ? "Salvando..." : <><Send className="w-5 h-5" /> Assinar e Enviar</>}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* SUCESSO */}
            {step > TOTAL_STEPS && (
              <motion.div key="sucesso" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-6xl shadow-xl">
                  ✓
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-800">Ficha enviada!</h2>
                  <p className="text-slate-500 text-lg mt-2">
                    Agradecemos sua colaboração.<br />Por favor, aguarde na recepção.
                  </p>
                </div>

                {/* Alertas registrados */}
                {gerarAlertas().length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left space-y-1 max-w-sm mx-auto">
                    <p className="font-black text-red-700 text-xs uppercase tracking-widest">⚠ Alertas registrados</p>
                    {gerarAlertas().map((a, i) => (
                      <p key={i} className="text-red-600 text-sm">• {a}</p>
                    ))}
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <Button
                    onClick={handleBaixarPDF}
                    disabled={gerandoPDF}
                    className="flex-1 rounded-2xl h-12 font-black gap-2"
                  >
                    {gerandoPDF ? '...' : <><Download className="w-4 h-4" /> Baixar PDF</>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImprimir}
                    className="flex-1 rounded-2xl h-12 font-bold gap-2 border-2"
                  >
                    <Printer className="w-4 h-4" /> Imprimir
                  </Button>
                  {paciente?.telefone && (
                    <Button
                      variant="outline"
                      onClick={handleWhatsApp}
                      className="flex-1 rounded-2xl h-12 font-bold gap-2 border-2 text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Link de Anamnese — compacto */}
      <div className="mt-4 border-2 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-50">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <Link2 className="w-3.5 h-3.5" />
            <span className="font-black text-xs uppercase tracking-widest">Link de Anamnese</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateLink}
            disabled={generateToken.isPending}
            className="h-7 text-xs font-bold px-2 gap-1"
          >
            {generateToken.isPending
              ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <><Link2 className="w-3 h-3" />Gerar</>}
          </Button>
        </div>
        {tokens && tokens.length > 0 && (() => {
          const t = tokens[0];
          const url = buildAnamneseUrl(t.token);
          const isUsed = !!t.used_at;
          const isExpired = !isUsed && new Date(t.expires_at) <= new Date();
          const isActive = !isUsed && !isExpired;
          return (
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-xs font-mono text-slate-500 flex-1 truncate">{url}</span>
              {isUsed && <span className="flex items-center gap-1 text-xs text-green-600 font-bold"><CheckCircle2 className="w-3 h-3" />Preenchido</span>}
              {isExpired && <span className="flex items-center gap-1 text-xs text-amber-500 font-bold"><Clock className="w-3 h-3" />Expirado</span>}
              {isActive && (
                <div className="flex gap-1">
                  <button type="button" onClick={() => handleCopyLink(url)} title="Copiar" className="p-1 rounded hover:bg-slate-100 transition-colors">
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button type="button" onClick={() => handleWhatsAppLink(url)} title="WhatsApp" className="p-1 rounded hover:bg-green-50 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Template oculto para captura PDF da anamnese */}
      {step > TOTAL_STEPS && (
        <div
          id="anamnese-pdf-export"
          style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', visibility: 'hidden' }}
        >
          <AnamnesePDFTemplate
            ref={pdfRef}
            vars={vars}
            tipo="anamnese_padrao"
            anamnese={anamneseParaPDF as any}
          />
        </div>
      )}
    </div>
  );
}
