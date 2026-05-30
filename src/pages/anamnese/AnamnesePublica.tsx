import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTokenInfo } from "@/hooks/useAnamneseToken";
import { Loader2, CheckCircle2, XCircle, Clock, ChevronRight, ChevronLeft, Printer } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pergunta {
  id: string;
  texto: string;
  tipo: "input" | "text" | "radio" | "radio_text";
  alerta?: string;
  detalheLabel?: string;
  detalhePlaceholder?: string;
  opcional?: boolean;
}

interface Secao {
  titulo: string;
  perguntas: Pergunta[];
}

// ─── Mesmas seções do AnamneseFormulario (painel da clínica) ──────────────────

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
        detalheLabel: "Qual tipo: geral, medicação ou inalatória?",
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
      { id: "media_pressao", texto: "Qual a média da sua pressão? (Ex: 12/8, sempre baixa, sempre alta)", tipo: "input", opcional: true },
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
    titulo: "Condição Feminina",
    subtitulo: "Se aplicável — pule se não for o caso",
    perguntas: [
      { id: "gravida", texto: "Está grávida?", tipo: "radio_text", alerta: "Grávida", opcional: true },
      { id: "amamentando", texto: "Está amamentando?", tipo: "radio", opcional: true },
    ],
  },
];

const TOTAL_STEPS = SECOES.length; // 10 seções

// ─── Layout shell ─────────────────────────────────────────────────────────────

function Shell({ children, step }: { children: React.ReactNode; step?: number }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9f7f4" }}>
      <header className="flex items-center gap-3 px-5 py-4 sticky top-0 z-10 shadow-sm" style={{ background: "#010101" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "#f8cc72", color: "#010101" }}>IB</div>
        <span className="font-black text-white text-sm tracking-wider">Instituto Belém</span>
      </header>
      {step !== undefined && (
        <div className="h-1.5 w-full" style={{ background: "#e5e3df" }}>
          <div className="h-full transition-all duration-500" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%`, background: "#f8cc72" }} />
        </div>
      )}
      <main className="flex-1 px-5 py-8 max-w-lg mx-auto w-full">{children}</main>
      <footer className="py-4 text-center text-xs text-gray-400">Formulário seguro · Instituto Belém</footer>
    </div>
  );
}

// ─── State screens ─────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#f8cc72" }} />
        <p className="text-gray-500 font-medium">Verificando seu link...</p>
      </div>
    </Shell>
  );
}

function ErrorScreen({ title, message, icon }: { title: string; message: string; icon: React.ReactNode }) {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        {icon}
        <div>
          <h1 className="text-2xl font-black text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-2">{message}</p>
        </div>
      </div>
    </Shell>
  );
}

function SuccessScreen({ nome, alertas }: { nome: string; alertas: string[] }) {
  return (
    <Shell>
      <div className="flex flex-col gap-6 py-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#f8cc72" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: "#010101" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">Ficha enviada!</h1>
            <p className="text-gray-500 mt-1">Obrigado, {nome.split(" ")[0]}. Suas informações foram recebidas com sucesso.</p>
          </div>
        </div>

        {alertas.length > 0 && (
          <div className="border-2 rounded-2xl p-4" style={{ borderColor: "#f8cc72", background: "#fffbee" }}>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Informações registradas</p>
            {alertas.map((a, i) => (
              <p key={i} className="text-sm text-gray-700">• {a}</p>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base border-2 w-full"
          style={{ borderColor: "#e5e3df", background: "white", color: "#010101" }}
        >
          <Printer className="w-5 h-5" />
          Salvar / Imprimir uma cópia
        </button>

        <p className="text-gray-400 text-sm text-center">A clínica recebeu sua ficha. Pode fechar esta página.</p>
      </div>
    </Shell>
  );
}

// ─── Pergunta components ───────────────────────────────────────────────────────

function RadioCard({ valor, selecionado, onSelect }: { valor: string; selecionado: boolean; onSelect: () => void }) {
  const config: Record<string, { icon: string; activeColor: string; activeBg: string }> = {
    "Sim":    { icon: "✓", activeColor: "#16a34a", activeBg: "#f0fdf4" },
    "Não":    { icon: "✗", activeColor: "#dc2626", activeBg: "#fef2f2" },
    "Não sei": { icon: "?", activeColor: "#9ca3af", activeBg: "#f9fafb" },
  };
  const c = config[valor] ?? { icon: "·", activeColor: "#010101", activeBg: "#fffbee" };
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-5 font-bold text-base transition-all"
      style={{
        borderColor: selecionado ? c.activeColor : "#e5e3df",
        background: selecionado ? c.activeBg : "white",
        color: selecionado ? c.activeColor : "#9ca3af",
      }}
    >
      <span className="text-2xl font-black">{c.icon}</span>
      {valor}
    </button>
  );
}

function PerguntaMobile({
  pergunta, resposta, detalhe, onChange, onDetalhe,
}: {
  pergunta: Pergunta; resposta: string; detalhe: string;
  onChange: (id: string, v: string) => void; onDetalhe: (id: string, v: string) => void;
}) {
  const { id, texto, tipo, detalheLabel, detalhePlaceholder, opcional } = pergunta;
  const mostrarDetalhe = tipo === "radio_text" && resposta === "Sim";

  return (
    <div className="space-y-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <p className="text-lg font-bold text-gray-800 leading-snug">
        {texto}
        {opcional && <span className="ml-2 text-xs font-normal text-gray-400">(opcional)</span>}
      </p>

      {tipo === "input" && (
        <input
          type="text"
          value={resposta}
          onChange={e => onChange(id, e.target.value)}
          placeholder="Sua resposta..."
          className="w-full rounded-xl border-2 p-3.5 text-base text-gray-800 focus:outline-none transition-colors"
          style={{ borderColor: resposta ? "#f8cc72" : "#e5e3df" }}
        />
      )}

      {tipo === "text" && (
        <textarea
          value={resposta}
          onChange={e => onChange(id, e.target.value)}
          placeholder="Sua resposta..."
          rows={3}
          className="w-full rounded-xl border-2 p-3.5 text-base text-gray-800 resize-none focus:outline-none transition-colors"
          style={{ borderColor: resposta ? "#f8cc72" : "#e5e3df" }}
        />
      )}

      {(tipo === "radio" || tipo === "radio_text") && (
        <div className="grid grid-cols-3 gap-2">
          {["Sim", "Não", "Não sei"].map(op => (
            <RadioCard key={op} valor={op} selecionado={resposta === op} onSelect={() => onChange(id, op)} />
          ))}
        </div>
      )}

      {mostrarDetalhe && (
        <div className="space-y-1 pt-1">
          <p className="text-sm font-bold text-gray-600">{detalheLabel ?? "Poderia especificar?"}</p>
          <input
            type="text"
            value={detalhe}
            onChange={e => onDetalhe(id, e.target.value)}
            placeholder={detalhePlaceholder ?? "Digite os detalhes..."}
            className="w-full rounded-xl border-2 p-3 text-sm text-gray-800 focus:outline-none"
            style={{ borderColor: "#f8cc72", background: "#fffbee" }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Navigation buttons ────────────────────────────────────────────────────────

function NavButtons({
  step, onBack, onNext, nextLabel = "Continuar", loading = false,
}: {
  step: number; onBack: () => void; onNext: () => void;
  nextLabel?: string; loading?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-6">
      {step > 0 && (
        <button
          type="button" onClick={onBack}
          className="flex items-center gap-1 px-5 py-4 rounded-2xl border-2 font-bold text-gray-600 transition-colors hover:bg-gray-50"
          style={{ borderColor: "#e5e3df" }}
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
      )}
      <button
        type="button" onClick={onNext} disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-all disabled:opacity-50"
        style={{ background: "#010101", color: "#f8cc72" }}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{nextLabel} <ChevronRight className="w-5 h-5" /></>}
      </button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AnamnesePublica() {
  const { token } = useParams<{ token: string }>();
  const { data: tokenInfo, isLoading } = useTokenInfo(token);

  const [step, setStep] = useState(0); // 0=welcome, 1..N=secoes, N+1=success
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [detalhes, setDetalhes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alertasMedicos, setAlertasMedicos] = useState<string[]>([]);

  if (isLoading) return <LoadingScreen />;

  if (!tokenInfo || (!tokenInfo.valid && !tokenInfo.used && !tokenInfo.expired)) {
    return <ErrorScreen icon={<XCircle className="w-16 h-16 text-red-400" />} title="Link inválido" message="Este link não existe ou já foi removido. Solicite um novo link à clínica." />;
  }
  if (tokenInfo.used) {
    return <ErrorScreen icon={<CheckCircle2 className="w-16 h-16 text-green-500" />} title="Ficha já preenchida" message="Este link já foi utilizado. Sua ficha médica foi enviada com sucesso." />;
  }
  if (tokenInfo.expired) {
    return <ErrorScreen icon={<Clock className="w-16 h-16 text-amber-400" />} title="Link expirado" message="Este link expirou. Solicite um novo link à clínica." />;
  }

  const nome = tokenInfo.paciente_nome ?? "Paciente";

  if (submitted) return <SuccessScreen nome={nome} alertas={alertasMedicos} />;

  const setResposta = (id: string, v: string) => setRespostas(r => ({ ...r, [id]: v }));
  const setDetalhe = (id: string, v: string) => setDetalhes(d => ({ ...d, [id]: v }));

  const gerarAlertas = (): string[] => {
    const out: string[] = [];
    SECOES.forEach(sec => sec.perguntas.forEach(p => {
      if (p.alerta && respostas[p.id] === "Sim") {
        let txt = p.alerta;
        if (detalhes[p.id]?.trim()) txt += `: ${detalhes[p.id]}`;
        out.push(txt);
      }
    }));
    return out;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Build dados_completos (same format as AnamneseFormulario)
      const dadosCompletos: Record<string, string> = {};
      SECOES.forEach(sec => sec.perguntas.forEach(p => {
        if (respostas[p.id]) dadosCompletos[p.id] = respostas[p.id];
        if (detalhes[p.id]) dadosCompletos[`${p.id}_detalhe`] = detalhes[p.id];
      }));

      const alertas = gerarAlertas();
      setAlertasMedicos(alertas);

      // Map to individual columns (same as AnamneseFormulario.submeter)
      const pData = {
        dados_completos: dadosCompletos,
        alertas_medicos: alertas,
        queixa_principal: respostas.queixa_principal ?? null,
        alergias: respostas.alergia === "Sim" ? (detalhes.alergia || "Sim") : null,
        medicamentos_uso: respostas.medicacao === "Sim" ? (detalhes.medicacao || "Sim") : null,
        gestante: respostas.gravida === "Sim",
        fumante: respostas.fumante === "Sim",
        alcool: respostas.drogas === "Sim",
        pressao_arterial: respostas.media_pressao || respostas.pressao_arterial || null,
        historico_cirurgias: respostas.cirurgia === "Sim" ? (detalhes.cirurgia || "Sim") : null,
        observacoes: [
          respostas.ultima_visita && `Última visita: ${respostas.ultima_visita}`,
          respostas.contato_emergencia && `Emergência: ${respostas.contato_emergencia}`,
          respostas.bruxismo === "Sim" && "Bruxismo",
          respostas.dor_atm === "Sim" && "Dor ATM",
          alertas.length > 0 && `ALERTAS: ${alertas.join(" | ")}`,
        ].filter(Boolean).join("\n") || null,
        doencas_sistemicas: [],
        habitos: {},
        historico_dental: {},
      };

      const { data, error } = await supabase.rpc("submit_anamnese_publica", {
        p_token: token!,
        p_data: pData as any,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error ?? "Erro desconhecido");
      setSubmitted(true);
    } catch {
      alert("Erro ao enviar. Tente novamente ou contate a clínica.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 0: Welcome ──
  if (step === 0) {
    return (
      <Shell>
        <div className="flex flex-col gap-8 py-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black" style={{ background: "#f8cc72", color: "#010101" }}>IB</div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">
              Sua saúde em<br />primeiro lugar.
            </h1>
            <p className="text-gray-600 text-lg mt-3 leading-relaxed">
              Olá, {nome.split(" ")[0]}! Preencha sua ficha médica antes da consulta. Suas respostas são sigilosas.
            </p>
          </div>
          <div className="space-y-3">
            {["Informações confidenciais", "Ajuda o dentista a cuidar melhor de você", "Formulário seguro e sem cadastro"].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f8cc72" }}>
                  <span className="text-xs font-black" style={{ color: "#010101" }}>✓</span>
                </div>
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
          <button
            type="button" onClick={() => setStep(1)}
            className="flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-lg w-full mt-4"
            style={{ background: "#010101", color: "#f8cc72" }}
          >
            Iniciar Ficha <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </Shell>
    );
  }

  // ── Steps 1..N: Sections ──
  if (step >= 1 && step <= TOTAL_STEPS) {
    const secao = SECOES[step - 1];
    const isLast = step === TOTAL_STEPS;

    return (
      <Shell step={step - 1}>
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#f8cc72" }}>
            {step} de {TOTAL_STEPS}
          </p>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">{secao.titulo}</h2>
          {(secao as any).subtitulo && <p className="text-gray-400 text-sm mt-1">{(secao as any).subtitulo}</p>}
        </div>

        <div className="space-y-6">
          {secao.perguntas.map(pergunta => (
            <PerguntaMobile
              key={pergunta.id}
              pergunta={pergunta}
              resposta={respostas[pergunta.id] ?? ""}
              detalhe={detalhes[pergunta.id] ?? ""}
              onChange={setResposta}
              onDetalhe={setDetalhe}
            />
          ))}
        </div>

        <NavButtons
          step={step}
          onBack={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onNext={() => {
            if (isLast) {
              handleSubmit();
            } else {
              setStep(s => s + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          nextLabel={isLast ? "Enviar Ficha" : "Continuar"}
          loading={submitting && isLast}
        />
      </Shell>
    );
  }

  return null;
}
