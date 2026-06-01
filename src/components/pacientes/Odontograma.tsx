import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save, RotateCcw } from "lucide-react";
import { useOdontograma } from "@/hooks/useOdontograma";
import { useState, useEffect } from "react";
import {
  OdontogramaCompleto,
  OdontogramaDados,
  adaptarDadosLegados,
} from "@/components/odontograma/OdontogramaCompleto";

interface OdontogramaProps {
  pacienteId: string;
}

export function Odontograma({ pacienteId }: OdontogramaProps) {
  const { odontograma, loading, createOdontograma, updateOdontograma } = useOdontograma(pacienteId);
  const [dados, setDados] = useState<OdontogramaDados>({});
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (odontograma) {
      const raw = odontograma.dados_dentes as Record<string, any>;
      // Detectar se é formato legado (tem campo 'procedimentos': string[])
      const isLegado = raw && Object.values(raw).some(
        (v: any) => Array.isArray(v?.procedimentos)
      );
      setDados(isLegado ? adaptarDadosLegados(raw) : (raw as OdontogramaDados) ?? {});
      setObservacoes(odontograma.observacoes || "");
    } else {
      setDados({});
      setObservacoes("");
    }
  }, [odontograma]);

  const handleSave = async () => {
    if (!pacienteId) return;
    try {
      if (odontograma) {
        await updateOdontograma(odontograma.id, { dados_dentes: dados as any, observacoes });
      } else {
        await createOdontograma({ paciente_id: pacienteId, dados_dentes: dados as any, observacoes });
      }
    } catch (e) {
      console.error("Erro ao salvar odontograma:", e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Odontograma</h2>
          <p className="text-sm text-muted-foreground">
            Clique no dente para alterar status · Clique nas superfícies para marcar tratamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setDados({}); setObservacoes(""); }}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Novo odontograma FDI */}
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <OdontogramaCompleto
            dados={dados}
            onChange={setDados}
            interactive
            showLegenda
          />
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações gerais sobre o odontograma..."
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
}
