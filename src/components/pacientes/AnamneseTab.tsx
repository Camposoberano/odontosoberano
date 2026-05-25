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
import { toast } from "sonner";
import { Loader2, Save, ClipboardList } from "lucide-react";

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
}

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
};

interface AnamneseTabProps {
  pacienteId: string;
}

export function AnamneseTab({ pacienteId }: AnamneseTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AnamneseData>(DEFAULT);

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
      setForm({
        id: data.id,
        alergias: data.alergias ?? "",
        medicamentos_uso: data.medicamentos_uso ?? "",
        doencas_sistemicas: (data.doencas_sistemicas as string[]) ?? [],
        historico_cirurgias: data.historico_cirurgias ?? "",
        gestante: data.gestante ?? false,
        fumante: data.fumante ?? false,
        alcool: data.alcool ?? false,
        pressao_arterial: data.pressao_arterial ?? "",
        observacoes: data.observacoes ?? "",
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
    </div>
  );
}
