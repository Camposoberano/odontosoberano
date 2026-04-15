import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ModalFinalizarMoldagemProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    cor_dente: string;
    cor_gengiva: string;
    registro_mordida: boolean;
    moldagem_superior: boolean;
    moldagem_inferior: boolean;
  }) => void;
}

const CORES_DENTE = [
  "A1", "A2", "A3", "A3.5", "A4",
  "B1", "B2", "B3", "B4",
  "C1", "C2", "C3", "C4",
  "D2", "D3", "D4",
  "BL1", "BL2", "BL3", "BL4"
];

const CORES_GENGIVA = [
  { value: "ST1", label: "ST1 (Clara)" },
  { value: "ST2", label: "ST2 (Média)" },
  { value: "ST3", label: "ST3 (Escura)" },
  { value: "ST4", label: "ST4 (Preta)" },
  { value: "Nenhuma", label: "Não se aplica" }
];

export function ModalFinalizarMoldagem({ isOpen, onClose, onConfirm }: ModalFinalizarMoldagemProps) {
  const [corDente, setCorDente] = useState("");
  const [corGengiva, setCorGengiva] = useState("");
  const [registroMordida, setRegistroMordida] = useState("true");
  const [superior, setSuperior] = useState(false);
  const [inferior, setInferior] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!superior && !inferior) {
      setError("Selecione ao menos uma arcada (Superior ou Inferior).");
      return;
    }

    setError("");
    onConfirm({
      cor_dente: "", // Não obrigatório aqui
      cor_gengiva: "", // Não obrigatório aqui
      registro_mordida: false, // Gerenciado pelo card
      moldagem_superior: superior,
      moldagem_inferior: inferior,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-2 shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="bg-primary/5 p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3 text-primary">
              <span className="p-2 bg-primary text-white rounded-xl rotate-3">🦷</span>
              Finalizar Moldagem
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground mt-2">
                Preencha os dados técnicos obrigatórios para o laboratório.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          {error && (
            <Alert variant="destructive" className="border-2 animate-in fade-in zoom-in duration-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-black">Atenção!</AlertTitle>
              <AlertDescription className="font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border-2 border-dashed">
            <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground block mb-2">Moldagem Realizada *</Label>
            <div className="flex gap-8 items-center justify-center">
              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border shadow-sm px-6">
                <Checkbox id="sup" checked={superior} onCheckedChange={(v) => setSuperior(!!v)} className="w-5 h-5" />
                <Label htmlFor="sup" className="font-black text-slate-700 cursor-pointer">SUPERIOR</Label>
              </div>
              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border shadow-sm px-6">
                <Checkbox id="inf" checked={inferior} onCheckedChange={(v) => setInferior(!!v)} className="w-5 h-5" />
                <Label htmlFor="inf" className="font-black text-slate-700 cursor-pointer">INFERIOR</Label>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-800 flex items-start gap-2 italic">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>As informações de Cor do Dente e Gengiva agora são gerenciadas no painel de "Controle Técnico" na tela principal.</span>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 p-6 sm:justify-center border-t">
          <Button onClick={handleConfirm} className="w-full sm:w-64 h-14 bg-primary text-lg font-black rounded-2xl shadow-xl hover:shadow-primary/20 hover:scale-[1.02] transition-all">
            <CheckCircle2 className="w-6 h-6 mr-2" /> FINALIZAR ETAPA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
