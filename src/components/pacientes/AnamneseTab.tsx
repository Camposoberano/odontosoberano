import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, ClipboardList, ChevronDown, ChevronRight, Link2, Copy, MessageCircle, CheckCircle2, Clock } from "lucide-react";
import { useGenerateAnamneseToken, useActiveTokens, buildAnamneseUrl } from "@/hooks/useAnamneseToken";

const DOENCAS_OPTIONS = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hipertensao", label: "Hipertensão" },
  { id: "cardiopatia", label: "Cardiopatia" },
  { id: "cancer", label: "Câncer" },
  { id: "hiv", label: "HIV/AIDS" },
  { id: "hepatite", label: "Hepatite" },
  { id: "artrite", label: "Artrite/Reumatismo" },
  { id: "asma", label: "Asma/Bronquite" },
  { id: "epilepsia", label: "Epilepsia" },
  { id: "osteoporose", label: "Osteoporose" },
  { id: "coagulacao", label: "Problema de coagulação" },
  { id: "renal", label: "Doença renal" },
];

interface HabitosOrtodontia {
  roer_unhas: boolean;
  bruxismo: boolean;
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

interface AnamneseData {
  id?: string;
  alergias: string;
  medicamentos_uso: string;
  doencas_sistemicas: string[];
  historico_cirurgias: string;
  gestante: boolean;
  fumante: boolean;
  alcool: boolean;
  pressao_arterial: string;
  observacoes: string;
  // Ortodontia
  queixa_principal: string;
  habitos: HabitosOrtodontia;
  historico_dental: HistoricoDental;
  perfil_facial: string;
  sobremordida: string;
  trespasse_horizontal: string;
  mordida_cruzada: boolean;
  desvio_linha_media: string;
  classe_canino_d: string;
  classe_canino_e: string;
  classe_paciente: string;
  frequencia_respiratoria: string;
  fc_bpm: string;
  alteracao_ganglionar: boolean;
  aleitamento: string;
}

const DEFAULT_HABITOS: HabitosOrtodontia = { roer_unhas: false, bruxismo: false, chupeta: false, succao_dedo: false };
const DEFAULT_HISTORICO_DENTAL: HistoricoDental = { periodontia: false, cirurgias: false, endodontia: false, profilaxia: false, ortodontia_previa: false };

const DEFAULT: AnamneseData = {
  alergias: "",
  medicamentos_uso: "",
  doencas_sistemicas: [],
  historico_cirurgias: "",
  gestante: false,
  fumante: false,
  alcool: false,
  pressao_arterial: "",
  observacoes: "",
  queixa_principal: "",
  habitos: { ...DEFAULT_HABITOS },
  historico_dental: { ...DEFAULT_HISTORICO_DENTAL },
  perfil_facial: "",
  sobremordida: "",
  trespasse_horizontal: "",
  mordida_cruzada: false,
  desvio_linha_media: "",
  classe_canino_d: "",
  classe_canino_e: "",
  classe_paciente: "",
  frequencia_respiratoria: "",
  fc_bpm: "",
  alteracao_ganglionar: false,
  aleitamento: "",
};

interface AnamneseTabProps {
  pacienteId: string;
  pacienteNome?: string;
}

export function AnamneseTab({ pacienteId, pacienteNome = "" }: AnamneseTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AnamneseData>(DEFAULT);
  const [isOrtodontiaOpen, setIsOrtodontiaOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState("");

  const generateToken = useGenerateAnamneseToken(pacienteId, pacienteNome);
  const { data: tokens } = useActiveTokens(pacienteId);

  const handleGenerateLink = async () => {
    const url = await generateToken.mutateAsync();
    setCopiedUrl(url);
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success("Link gerado e copiado!");
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(url);
    toast.success("Link copiado!");
  };

  const handleWhatsApp = (url: string) => {
    const msg = encodeURIComponent(
      `Olá${pacienteNome ? `, ${pacienteNome.split(" ")[0]}` : ""}! Por favor, preencha sua ficha médica antes da consulta:\n${url}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const { data, isLoading } = useQuery({
    queryKey: ["anamnese", pacienteId],
    enabled: !!pacienteId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anamneses")
        .select("*")
        .eq("paciente_id", pacienteId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) {
      const d = data as any;
      setForm({
        id: d.id,
        alergias: d.alergias ?? "",
        medicamentos_uso: d.medicamentos_uso ?? "",
        doencas_sistemicas: (d.doencas_sistemicas as string[]) ?? [],
        historico_cirurgias: d.historico_cirurgias ?? "",
        gestante: d.gestante ?? false,
        fumante: d.fumante ?? false,
        alcool: d.alcool ?? false,
        pressao_arterial: d.pressao_arterial ?? "",
        observacoes: d.observacoes ?? "",
        queixa_principal: d.queixa_principal ?? "",
        habitos: { ...DEFAULT_HABITOS, ...(d.habitos ?? {}) },
        historico_dental: { ...DEFAULT_HISTORICO_DENTAL, ...(d.historico_dental ?? {}) },
        perfil_facial: d.perfil_facial ?? "",
        sobremordida: d.sobremordida ?? "",
        trespasse_horizontal: d.trespasse_horizontal ?? "",
        mordida_cruzada: d.mordida_cruzada ?? false,
        desvio_linha_media: d.desvio_linha_media ?? "",
        classe_canino_d: d.classe_canino_d ?? "",
        classe_canino_e: d.classe_canino_e ?? "",
        classe_paciente: d.classe_paciente ?? "",
        frequencia_respiratoria: d.frequencia_respiratoria != null ? String(d.frequencia_respiratoria) : "",
        fc_bpm: d.fc_bpm != null ? String(d.fc_bpm) : "",
        alteracao_ganglionar: d.alteracao_ganglionar ?? false,
        aleitamento: d.aleitamento ?? "",
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (values: AnamneseData) => {
      const payload = {
        user_id: user!.id,
        paciente_id: pacienteId,
        alergias: values.alergias || null,
        medicamentos_uso: values.medicamentos_uso || null,
        doencas_sistemicas: values.doencas_sistemicas,
        historico_cirurgias: values.historico_cirurgias || null,
        gestante: values.gestante,
        fumante: values.fumante,
        alcool: values.alcool,
        pressao_arterial: values.pressao_arterial || null,
        observacoes: values.observacoes || null,
        queixa_principal: values.queixa_principal || null,
        habitos: values.habitos,
        historico_dental: values.historico_dental,
        perfil_facial: values.perfil_facial || null,
        sobremordida: values.sobremordida || null,
        trespasse_horizontal: values.trespasse_horizontal || null,
        mordida_cruzada: values.mordida_cruzada,
        desvio_linha_media: values.desvio_linha_media || null,
        classe_canino_d: values.classe_canino_d || null,
        classe_canino_e: values.classe_canino_e || null,
        classe_paciente: values.classe_paciente || null,
        frequencia_respiratoria: values.frequencia_respiratoria ? Number(values.frequencia_respiratoria) : null,
        fc_bpm: values.fc_bpm ? Number(values.fc_bpm) : null,
        alteracao_ganglionar: values.alteracao_ganglionar,
        aleitamento: values.aleitamento || null,
      };

      if (values.id) {
        const { error } = await supabase
          .from("anamneses")
          .update(payload)
          .eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from("anamneses")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        setForm((f) => ({ ...f, id: inserted.id }));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anamnese", pacienteId] });
      toast.success("Anamnese salva com sucesso!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao salvar anamnese: " + err.message);
    },
  });

  const toggleDoenca = (id: string, checked: boolean) => {
    setForm((f) => ({
      ...f,
      doencas_sistemicas: checked
        ? [...f.doencas_sistemicas, id]
        : f.doencas_sistemicas.filter((d) => d !== id),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-violet-500" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Anamnese</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            Histórico clínico e saúde geral
          </p>
        </div>
      </div>

      {/* Alergias */}
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
          Alergias
        </Label>
        <Textarea
          placeholder="Ex: Penicilina, látex, anti-inflamatórios..."
          value={form.alergias}
          onChange={(e) => setForm((f) => ({ ...f, alergias: e.target.value }))}
          className="rounded-xl"
          rows={2}
        />
      </div>

      {/* Medicamentos em uso */}
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
          Medicamentos em uso
        </Label>
        <Textarea
          placeholder="Ex: Atenolol 25mg, Metformina 500mg..."
          value={form.medicamentos_uso}
          onChange={(e) => setForm((f) => ({ ...f, medicamentos_uso: e.target.value }))}
          className="rounded-xl"
          rows={2}
        />
      </div>

      {/* Doenças sistêmicas */}
      <div className="space-y-3">
        <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
          Doenças sistêmicas
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DOENCAS_OPTIONS.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <Checkbox
                id={`doenca-${d.id}`}
                checked={form.doencas_sistemicas.includes(d.id)}
                onCheckedChange={(checked) => toggleDoenca(d.id, !!checked)}
              />
              <label
                htmlFor={`doenca-${d.id}`}
                className="text-sm font-medium cursor-pointer"
              >
                {d.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de cirurgias */}
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
          Histórico de cirurgias
        </Label>
        <Textarea
          placeholder="Descreva cirurgias anteriores relevantes..."
          value={form.historico_cirurgias}
          onChange={(e) => setForm((f) => ({ ...f, historico_cirurgias: e.target.value }))}
          className="rounded-xl"
          rows={2}
        />
      </div>

      {/* Pressão arterial */}
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
          Pressão arterial
        </Label>
        <Input
          placeholder="Ex: 120/80"
          value={form.pressao_arterial}
          onChange={(e) => setForm((f) => ({ ...f, pressao_arterial: e.target.value }))}
          className="rounded-xl max-w-[200px]"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-slate-50">
          <Label htmlFor="gestante" className="font-bold text-sm">Gestante</Label>
          <Switch
            id="gestante"
            checked={form.gestante}
            onCheckedChange={(v) => setForm((f) => ({ ...f, gestante: v }))}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-slate-50">
          <Label htmlFor="fumante" className="font-bold text-sm">Fumante</Label>
          <Switch
            id="fumante"
            checked={form.fumante}
            onCheckedChange={(v) => setForm((f) => ({ ...f, fumante: v }))}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-slate-50">
          <Label htmlFor="alcool" className="font-bold text-sm">Consome álcool</Label>
          <Switch
            id="alcool"
            checked={form.alcool}
            onCheckedChange={(v) => setForm((f) => ({ ...f, alcool: v }))}
          />
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">
          Observações gerais
        </Label>
        <Textarea
          placeholder="Informações adicionais relevantes..."
          value={form.observacoes}
          onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
          className="rounded-xl"
          rows={3}
        />
      </div>

      {/* Seção Ortodontia (colapsável) */}
      <div className="border-2 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOrtodontiaOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-violet-600" />
            <span className="font-black text-xs uppercase tracking-widest text-violet-700">
              Ortodontia / Dados Complementares
            </span>
          </div>
          {isOrtodontiaOpen ? (
            <ChevronDown className="w-4 h-4 text-violet-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-violet-500" />
          )}
        </button>

        {isOrtodontiaOpen && (
          <div className="p-4 space-y-6">
            {/* Queixa principal */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Queixa Principal</Label>
              <Textarea
                placeholder="Motivo da consulta ortodôntica..."
                value={form.queixa_principal}
                onChange={(e) => setForm((f) => ({ ...f, queixa_principal: e.target.value }))}
                className="rounded-xl"
                rows={2}
              />
            </div>

            {/* Hábitos */}
            <div className="space-y-3">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Hábitos</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["roer_unhas", "bruxismo", "chupeta", "succao_dedo"] as const).map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <Checkbox
                      id={`habito-${h}`}
                      checked={form.habitos[h]}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, habitos: { ...f.habitos, [h]: !!v } }))}
                    />
                    <label htmlFor={`habito-${h}`} className="text-sm font-medium cursor-pointer capitalize">
                      {h.replace("_", " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico dental */}
            <div className="space-y-3">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Histórico Dental</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(["periodontia", "cirurgias", "endodontia", "profilaxia", "ortodontia_previa"] as const).map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <Checkbox
                      id={`hd-${h}`}
                      checked={form.historico_dental[h]}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, historico_dental: { ...f.historico_dental, [h]: !!v } }))}
                    />
                    <label htmlFor={`hd-${h}`} className="text-sm font-medium cursor-pointer capitalize">
                      {h === "ortodontia_previa" ? "Ortodontia prévia" : h}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Avaliação facial e oclusal */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Perfil Facial</Label>
                <Select value={form.perfil_facial} onValueChange={(v) => setForm((f) => ({ ...f, perfil_facial: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reto">Reto</SelectItem>
                    <SelectItem value="convexo">Convexo</SelectItem>
                    <SelectItem value="concavo">Côncavo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Classe Paciente</Label>
                <Select value={form.classe_paciente} onValueChange={(v) => setForm((f) => ({ ...f, classe_paciente: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Classe I</SelectItem>
                    <SelectItem value="II">Classe II</SelectItem>
                    <SelectItem value="III">Classe III</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Aleitamento</Label>
                <Select value={form.aleitamento} onValueChange={(v) => setForm((f) => ({ ...f, aleitamento: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materno">Materno</SelectItem>
                    <SelectItem value="artificial">Artificial</SelectItem>
                    <SelectItem value="misto">Misto</SelectItem>
                    <SelectItem value="nao_informado">Não informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Classe Canino D.</Label>
                <Select value={form.classe_canino_d} onValueChange={(v) => setForm((f) => ({ ...f, classe_canino_d: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Classe I</SelectItem>
                    <SelectItem value="II">Classe II</SelectItem>
                    <SelectItem value="III">Classe III</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Classe Canino E.</Label>
                <Select value={form.classe_canino_e} onValueChange={(v) => setForm((f) => ({ ...f, classe_canino_e: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Classe I</SelectItem>
                    <SelectItem value="II">Classe II</SelectItem>
                    <SelectItem value="III">Classe III</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Sobremordida</Label>
                <Input placeholder="Ex: 3mm" value={form.sobremordida} onChange={(e) => setForm((f) => ({ ...f, sobremordida: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Trespasse Horiz.</Label>
                <Input placeholder="Ex: 4mm" value={form.trespasse_horizontal} onChange={(e) => setForm((f) => ({ ...f, trespasse_horizontal: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Desvio L. Média</Label>
                <Input placeholder="Ex: 2mm direita" value={form.desvio_linha_media} onChange={(e) => setForm((f) => ({ ...f, desvio_linha_media: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">Freq. Resp. (rpm)</Label>
                <Input type="number" placeholder="Ex: 18" value={form.frequencia_respiratoria} onChange={(e) => setForm((f) => ({ ...f, frequencia_respiratoria: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-600">FC (bpm)</Label>
                <Input type="number" placeholder="Ex: 72" value={form.fc_bpm} onChange={(e) => setForm((f) => ({ ...f, fc_bpm: e.target.value }))} className="rounded-xl" />
              </div>
            </div>

            {/* Toggles ortod. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-slate-50">
                <Label className="font-bold text-sm">Mordida Cruzada</Label>
                <Switch checked={form.mordida_cruzada} onCheckedChange={(v) => setForm((f) => ({ ...f, mordida_cruzada: v }))} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-slate-50">
                <Label className="font-bold text-sm">Alteração Ganglionar</Label>
                <Switch checked={form.alteracao_ganglionar} onCheckedChange={(v) => setForm((f) => ({ ...f, alteracao_ganglionar: v }))} />
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={() => saveMutation.mutate(form)}
        disabled={saveMutation.isPending}
        className="rounded-xl font-black text-xs uppercase tracking-widest px-6 h-11"
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Salvar Anamnese
      </Button>

      {/* Seção: Enviar link ao paciente */}
      <div className="border-2 rounded-2xl overflow-hidden mt-2">
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50">
          <Link2 className="w-4 h-4 text-emerald-600" />
          <span className="font-black text-xs uppercase tracking-widest text-emerald-700">
            Enviar link de anamnese ao paciente
          </span>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Gere um link único para o paciente preencher a anamnese no celular — sem precisar de login.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateLink}
            disabled={generateToken.isPending}
            className="rounded-xl font-bold text-xs uppercase tracking-widest h-10"
          >
            {generateToken.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4 mr-2" />
            )}
            Gerar novo link
          </Button>

          {/* Links gerados recentemente */}
          {tokens && tokens.length > 0 && (
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">
                Links recentes
              </Label>
              {tokens.map((t) => {
                const url = buildAnamneseUrl(t.token);
                const isUsed = !!t.used_at;
                const isExpired = !isUsed && new Date(t.expires_at) <= new Date();
                const isActive = !isUsed && !isExpired;
                return (
                  <div
                    key={t.token}
                    className="flex items-center gap-2 p-3 rounded-xl border bg-slate-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-slate-600 truncate">{url}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {isUsed && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Preenchido
                          </span>
                        )}
                        {isExpired && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                            <Clock className="w-3 h-3" /> Expirado
                          </span>
                        )}
                        {isActive && (
                          <span className="flex items-center gap-1 text-xs text-blue-600 font-bold">
                            <Link2 className="w-3 h-3" /> Ativo
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(url)}
                          title="Copiar link"
                          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <Copy className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(url)}
                          title="Compartilhar no WhatsApp"
                          className="p-1.5 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
