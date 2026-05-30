import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTokenInfo } from "@/hooks/useAnamneseToken";
import { Loader2, CheckCircle2, XCircle, Clock, ChevronRight, ChevronLeft, Printer } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HabitosOrtodontia {
  bruxismo: boolean;
  roer_unhas: boolean;
  chupeta: boolean;
  succao_dedo: boolean;
}

interface HistoricoDental {
  periodontia: boolean;
  cirurgias: boolean;
  endodontia: boolean;
  profilaxia: boolean;
  ortodontia_previa: boolean;
}

interface FormData {
  queixa_principal: string;
  alergias: string;
  medicamentos_uso: string;
  historico_cirurgias: string;
  doencas_sistemicas: string[];
  gestante: boolean;
  fumante: boolean;
  alcool: boolean;
  pressao_arterial: string;
  habitos: HabitosOrtodontia;
  historico_dental: HistoricoDental;
  observacoes: string;
}

const EMPTY_FORM: FormData = {
  queixa_principal: "",
  alergias: "",
  medicamentos_uso: "",
  historico_cirurgias: "",
  doencas_sistemicas: [],
  gestante: false,
  fumante: false,
  alcool: false,
  pressao_arterial: "",
  habitos: { bruxismo: false, roer_unhas: false, chupeta: false, succao_dedo: false },
  historico_dental: { periodontia: false, cirurgias: false, endodontia: false, profilaxia: false, ortodontia_previa: false },
  observacoes: "",
};

const DOENCAS = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hipertensao", label: "Hipertensão" },
  { id: "cardiopatia", label: "Cardiopatia" },
  { id: "cancer", label: "Câncer" },
  { id: "hiv", label: "HIV/AIDS" },
  { id: "hepatite", label: "Hepatite" },
  { id: "artrite", label: "Artrite / Reumatismo" },
  { id: "asma", label: "Asma / Bronquite" },
  { id: "epilepsia", label: "Epilepsia" },
  { id: "osteoporose", label: "Osteoporose" },
  { id: "coagulacao", label: "Problema de coagulação" },
  { id: "renal", label: "Doença renal" },
];

const HISTORICO_DENTAL_OPTIONS = [
  { id: "periodontia", label: "Tratamento periodontal (gengiva)" },
  { id: "cirurgias", label: "Cirurgias dentárias" },
  { id: "endodontia", label: "Canal (endodontia)" },
  { id: "profilaxia", label: "Limpeza / Profilaxia" },
  { id: "ortodontia_previa", label: "Aparelho ortodôntico" },
];

const TOTAL_STEPS = 6;

// ─── Layout shell ─────────────────────────────────────────────────────────────

function Shell({ children, step }: { children: React.ReactNode; step?: number }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f9f7f4" }}>
      <header
        className="flex items-center gap-3 px-5 py-4 sticky top-0 z-10 shadow-sm"
        style={{ background: "#010101" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
          style={{ background: "#f8cc72", color: "#010101" }}
        >
          IB
        </div>
        <span className="font-black text-white text-sm tracking-wider">Instituto Belém</span>
      </header>

      {step !== undefined && (
        <div className="h-1.5 w-full" style={{ background: "#e5e3df" }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%`, background: "#f8cc72" }}
          />
        </div>
      )}

      <main className="flex-1 px-5 py-8 max-w-lg mx-auto w-full">{children}</main>

      <footer className="py-4 text-center text-xs text-gray-400">
        Formulário seguro · Instituto Belém
      </footer>
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

function SuccessScreen({ nome, form }: { nome: string; form: FormData }) {
  const doencasLabel = form.doencas_sistemicas.length > 0
    ? DOENCAS.filter(d => form.doencas_sistemicas.includes(d.id)).map(d => d.label).join(", ")
    : "Nenhuma";
  const habitosLabel = [
    form.fumante && "Fumante",
    form.alcool && "Álcool",
    form.gestante && "Gestante",
    form.habitos.bruxismo && "Bruxismo",
    form.habitos.roer_unhas && "Rói unhas",
    form.habitos.chupeta && "Chupeta",
    form.habitos.succao_dedo && "Sucção de dedo",
  ].filter(Boolean).join(", ") || "Nenhum";

  return (
    <Shell>
      <div className="flex flex-col gap-6 py-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#f8cc72" }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: "#010101" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">Ficha enviada!</h1>
            <p className="text-gray-500 mt-1">
              Obrigado, {nome.split(" ")[0]}. Suas informações foram recebidas com sucesso.
            </p>
          </div>
        </div>

        {/* Resumo para impressão */}
        <div className="border-2 rounded-2xl p-4 space-y-2.5" style={{ borderColor: "#e5e3df", background: "white" }}>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Resumo da ficha</p>
          <SummaryLine label="Paciente" value={nome} />
          <SummaryLine label="Motivo" value={form.queixa_principal} />
          <SummaryLine label="Alergias" value={form.alergias} />
          <SummaryLine label="Medicamentos" value={form.medicamentos_uso} />
          <SummaryLine label="Cirurgias" value={form.historico_cirurgias} />
          <SummaryLine label="Doenças" value={doencasLabel} />
          <SummaryLine label="Pressão" value={form.pressao_arterial} />
          <SummaryLine label="Hábitos" value={habitosLabel} />
          <SummaryLine label="Observações" value={form.observacoes} />
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base border-2 w-full"
          style={{ borderColor: "#e5e3df", background: "white", color: "#010101" }}
        >
          <Printer className="w-5 h-5" />
          Salvar / Imprimir PDF
        </button>

        <p className="text-gray-400 text-sm text-center">Pode fechar esta página após salvar.</p>
      </div>
    </Shell>
  );
}

// ─── Shared components ─────────────────────────────────────────────────────────

function ToggleCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full px-4 py-4 rounded-2xl border-2 transition-all text-left"
      style={{ borderColor: checked ? "#f8cc72" : "#e5e3df", background: checked ? "#fffbee" : "white" }}
    >
      <span className="text-base font-semibold text-gray-800">{label}</span>
      <div className="w-12 h-7 rounded-full flex items-center transition-all px-1" style={{ background: checked ? "#f8cc72" : "#d1d5db" }}>
        <div className="w-5 h-5 rounded-full bg-white transition-all shadow-sm" style={{ marginLeft: checked ? "auto" : undefined }} />
      </div>
    </button>
  );
}

function CheckCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border-2 transition-all text-left"
      style={{ borderColor: checked ? "#f8cc72" : "#e5e3df", background: checked ? "#fffbee" : "white" }}
    >
      <div
        className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-all"
        style={{ borderColor: checked ? "#f8cc72" : "#d1d5db", background: checked ? "#f8cc72" : "white" }}
      >
        {checked && <span className="text-black font-black text-xs">✓</span>}
      </div>
      <span className="text-base font-medium text-gray-800">{label}</span>
    </button>
  );
}

function NavButtons({
  step, onBack, onNext, nextLabel = "Continuar", nextDisabled = false, loading = false,
}: {
  step: number; onBack: () => void; onNext: () => void;
  nextLabel?: string; nextDisabled?: boolean; loading?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-4">
      {step > 0 && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-5 py-4 rounded-2xl border-2 font-bold text-gray-600 transition-colors hover:bg-gray-50"
          style={{ borderColor: "#e5e3df" }}
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-all disabled:opacity-50"
        style={{ background: "#010101", color: "#f8cc72" }}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{nextLabel}<ChevronRight className="w-5 h-5" /></>}
      </button>
    </div>
  );
}

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#f8cc72" }}>
        Passo {step} de {TOTAL_STEPS}
      </p>
      <h2 className="text-2xl font-black text-gray-900 leading-tight">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-1 text-base">{subtitle}</p>}
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-sm font-bold text-gray-500 min-w-[100px]">{label}:</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnamnesePublica() {
  const { token } = useParams<{ token: string }>();
  const { data: tokenInfo, isLoading } = useTokenInfo(token);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) return <LoadingScreen />;

  if (!tokenInfo || (!tokenInfo.valid && !tokenInfo.used && !tokenInfo.expired)) {
    return (
      <ErrorScreen
        icon={<XCircle className="w-16 h-16 text-red-400" />}
        title="Link inválido"
        message="Este link não existe ou já foi removido. Solicite um novo link à clínica."
      />
    );
  }

  if (tokenInfo.used) {
    return (
      <ErrorScreen
        icon={<CheckCircle2 className="w-16 h-16 text-green-500" />}
        title="Ficha já preenchida"
        message="Este link já foi utilizado. Sua ficha médica foi enviada com sucesso."
      />
    );
  }

  if (tokenInfo.expired) {
    return (
      <ErrorScreen
        icon={<Clock className="w-16 h-16 text-amber-400" />}
        title="Link expirado"
        message="Este link expirou. Solicite um novo link à clínica."
      />
    );
  }

  const nome = tokenInfo.paciente_nome ?? "Paciente";

  if (submitted) return <SuccessScreen nome={nome} form={form} />;

  const toggleDoenca = (id: string, checked: boolean) =>
    setForm(f => ({
      ...f,
      doencas_sistemicas: checked ? [...f.doencas_sistemicas, id] : f.doencas_sistemicas.filter(d => d !== id),
    }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("submit_anamnese_publica", {
        p_token: token!,
        p_data: form as any,
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black" style={{ background: "#f8cc72", color: "#010101" }}>
            IB
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">Olá, {nome.split(" ")[0]}!</h1>
            <p className="text-gray-600 text-lg mt-3 leading-relaxed">
              Preencha sua ficha médica antes da consulta. Leva poucos minutos.
            </p>
          </div>
          <div className="space-y-3">
            {["Suas informações são confidenciais", "Formulário simples e rápido", "Ajuda o dentista a cuidar melhor de você"].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f8cc72" }}>
                  <span className="text-xs font-black" style={{ color: "#010101" }}>✓</span>
                </div>
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-lg w-full mt-4"
            style={{ background: "#010101", color: "#f8cc72" }}
          >
            Iniciar Ficha <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </Shell>
    );
  }

  // ── Step 1: Motivo da consulta ──
  if (step === 1) {
    return (
      <Shell step={0}>
        <StepHeader step={1} title="Motivo da Consulta" subtitle="O que te trouxe ao dentista?" />
        <textarea
          value={form.queixa_principal}
          onChange={e => setForm(f => ({ ...f, queixa_principal: e.target.value }))}
          placeholder="Ex: Dor de dente, quero aparelho, consulta de rotina..."
          className="w-full min-h-[140px] rounded-2xl border-2 p-4 text-lg text-gray-800 resize-none focus:outline-none transition-colors"
          style={{ borderColor: form.queixa_principal ? "#f8cc72" : "#e5e3df" }}
        />
        <div className="mt-6">
          <NavButtons step={step} onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </div>
      </Shell>
    );
  }

  // ── Step 2: Alergias, Medicamentos, Histórico cirurgias ──
  if (step === 2) {
    return (
      <Shell step={1}>
        <StepHeader step={2} title="Saúde Geral" subtitle="Alergias, medicamentos e histórico" />
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-gray-500 mb-2">Tem alguma alergia?</label>
            <textarea
              value={form.alergias}
              onChange={e => setForm(f => ({ ...f, alergias: e.target.value }))}
              placeholder="Ex: Penicilina, dipirona, látex... (deixe em branco se não tiver)"
              className="w-full min-h-[90px] rounded-2xl border-2 p-4 text-base text-gray-800 resize-none focus:outline-none transition-colors"
              style={{ borderColor: form.alergias ? "#f8cc72" : "#e5e3df" }}
            />
          </div>
          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-gray-500 mb-2">Usa algum medicamento?</label>
            <textarea
              value={form.medicamentos_uso}
              onChange={e => setForm(f => ({ ...f, medicamentos_uso: e.target.value }))}
              placeholder="Ex: Losartana, Metformina, Rivotril... (deixe em branco se não usar)"
              className="w-full min-h-[90px] rounded-2xl border-2 p-4 text-base text-gray-800 resize-none focus:outline-none transition-colors"
              style={{ borderColor: form.medicamentos_uso ? "#f8cc72" : "#e5e3df" }}
            />
          </div>
          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-gray-500 mb-2">Já fez alguma cirurgia?</label>
            <textarea
              value={form.historico_cirurgias}
              onChange={e => setForm(f => ({ ...f, historico_cirurgias: e.target.value }))}
              placeholder="Ex: Apêndice, joelho, coração... (deixe em branco se não fez)"
              className="w-full min-h-[80px] rounded-2xl border-2 p-4 text-base text-gray-800 resize-none focus:outline-none transition-colors"
              style={{ borderColor: form.historico_cirurgias ? "#f8cc72" : "#e5e3df" }}
            />
          </div>
        </div>
        <div className="mt-6">
          <NavButtons step={step} onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </div>
      </Shell>
    );
  }

  // ── Step 3: Doenças sistêmicas ──
  if (step === 3) {
    return (
      <Shell step={2}>
        <StepHeader step={3} title="Histórico de Saúde" subtitle="Tem ou já teve alguma dessas condições?" />
        <div className="space-y-2.5">
          {DOENCAS.map(d => (
            <CheckCard
              key={d.id}
              label={d.label}
              checked={form.doencas_sistemicas.includes(d.id)}
              onChange={v => toggleDoenca(d.id, v)}
            />
          ))}
        </div>
        {form.doencas_sistemicas.length === 0 && (
          <p className="text-sm text-gray-400 mt-3 text-center">Nenhuma selecionada — tudo bem!</p>
        )}
        <div className="mt-6">
          <NavButtons step={step} onBack={() => setStep(2)} onNext={() => setStep(4)} />
        </div>
      </Shell>
    );
  }

  // ── Step 4: Condições pessoais + pressão ──
  if (step === 4) {
    return (
      <Shell step={3}>
        <StepHeader step={4} title="Condições Pessoais" subtitle="Responda com sinceridade — ajuda o tratamento!" />
        <div className="space-y-3">
          <ToggleCard label="Gestante" checked={form.gestante} onChange={v => setForm(f => ({ ...f, gestante: v }))} />
          <ToggleCard label="Fumante" checked={form.fumante} onChange={v => setForm(f => ({ ...f, fumante: v }))} />
          <ToggleCard label="Consome bebidas alcoólicas" checked={form.alcool} onChange={v => setForm(f => ({ ...f, alcool: v }))} />
        </div>
        <div className="mt-5">
          <label className="block text-sm font-black uppercase tracking-wider text-gray-500 mb-2">Pressão arterial (se souber)</label>
          <input
            type="text"
            value={form.pressao_arterial}
            onChange={e => setForm(f => ({ ...f, pressao_arterial: e.target.value }))}
            placeholder="Ex: 120/80"
            className="w-full rounded-2xl border-2 p-4 text-lg text-gray-800 focus:outline-none transition-colors"
            style={{ borderColor: form.pressao_arterial ? "#f8cc72" : "#e5e3df" }}
          />
        </div>
        <div className="mt-6">
          <NavButtons step={step} onBack={() => setStep(3)} onNext={() => setStep(5)} />
        </div>
      </Shell>
    );
  }

  // ── Step 5: Hábitos + Histórico dental ──
  if (step === 5) {
    return (
      <Shell step={4}>
        <StepHeader step={5} title="Hábitos e Histórico Dental" />
        <div className="space-y-4">
          <p className="text-sm font-black uppercase tracking-wider text-gray-500">Hábitos</p>
          <div className="space-y-2.5">
            <CheckCard label="Range os dentes (bruxismo)" checked={form.habitos.bruxismo} onChange={v => setForm(f => ({ ...f, habitos: { ...f.habitos, bruxismo: v } }))} />
            <CheckCard label="Rói as unhas" checked={form.habitos.roer_unhas} onChange={v => setForm(f => ({ ...f, habitos: { ...f.habitos, roer_unhas: v } }))} />
            <CheckCard label="Usa / usou chupeta" checked={form.habitos.chupeta} onChange={v => setForm(f => ({ ...f, habitos: { ...f.habitos, chupeta: v } }))} />
            <CheckCard label="Sucção de dedo" checked={form.habitos.succao_dedo} onChange={v => setForm(f => ({ ...f, habitos: { ...f.habitos, succao_dedo: v } }))} />
          </div>

          <p className="text-sm font-black uppercase tracking-wider text-gray-500 pt-2">Já fez algum tratamento dental?</p>
          <div className="space-y-2.5">
            {HISTORICO_DENTAL_OPTIONS.map(opt => (
              <CheckCard
                key={opt.id}
                label={opt.label}
                checked={form.historico_dental[opt.id as keyof HistoricoDental]}
                onChange={v => setForm(f => ({ ...f, historico_dental: { ...f.historico_dental, [opt.id]: v } }))}
              />
            ))}
          </div>
        </div>
        <div className="mt-6">
          <NavButtons step={step} onBack={() => setStep(4)} onNext={() => setStep(6)} />
        </div>
      </Shell>
    );
  }

  // ── Step 6: Observações + Confirmação ──
  if (step === 6) {
    const doencasLabel = form.doencas_sistemicas.length > 0
      ? DOENCAS.filter(d => form.doencas_sistemicas.includes(d.id)).map(d => d.label).join(", ")
      : "Nenhuma";

    return (
      <Shell step={5}>
        <StepHeader step={6} title="Observações" subtitle="Algo mais que o dentista precisa saber?" />
        <textarea
          value={form.observacoes}
          onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
          placeholder="Ex: Ansiedade no dentista, gravidez de risco, cirurgia recente... (opcional)"
          className="w-full min-h-[120px] rounded-2xl border-2 p-4 text-lg text-gray-800 resize-none focus:outline-none transition-colors"
          style={{ borderColor: form.observacoes ? "#f8cc72" : "#e5e3df" }}
        />

        <div className="mt-6 p-4 rounded-2xl border-2 space-y-2" style={{ borderColor: "#e5e3df", background: "white" }}>
          <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Resumo</p>
          <SummaryLine label="Motivo" value={form.queixa_principal} />
          <SummaryLine label="Alergias" value={form.alergias} />
          <SummaryLine label="Medicamentos" value={form.medicamentos_uso} />
          <SummaryLine label="Cirurgias" value={form.historico_cirurgias} />
          <SummaryLine label="Doenças" value={doencasLabel} />
          <SummaryLine label="Pressão" value={form.pressao_arterial} />
          <SummaryLine
            label="Hábitos"
            value={[
              form.fumante && "Fumante",
              form.alcool && "Álcool",
              form.gestante && "Gestante",
              form.habitos.bruxismo && "Bruxismo",
            ].filter(Boolean).join(", ") || "Nenhum"}
          />
        </div>

        <div className="mt-6">
          <NavButtons
            step={step}
            onBack={() => setStep(5)}
            onNext={handleSubmit}
            nextLabel="Enviar Ficha"
            loading={submitting}
          />
        </div>
      </Shell>
    );
  }

  return null;
}
