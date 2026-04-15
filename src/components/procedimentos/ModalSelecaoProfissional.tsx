import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDentistas } from "@/hooks/useDentistas";
import { useProteticos } from "@/hooks/useProteticos";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { User, Stethoscope, Hammer, ClipboardCheck, Loader2 } from "lucide-react";

interface ModalSelecaoProfissionalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoExecutor: 'DENTISTA' | 'PROTETICO' | 'SECRETARIA';
  onConfirm: (professional: { id: string | number; nome: string }) => void;
  isSubmitting?: boolean;
}

export function ModalSelecaoProfissional({
  isOpen,
  onClose,
  tipoExecutor,
  onConfirm,
  isSubmitting = false
}: ModalSelecaoProfissionalProps) {
  const { dentistas, loading: loadingDentistas } = useDentistas();
  const { data: proteticos, isLoading: loadingProteticos } = useProteticos();
  const { funcionarios, loading: loadingFuncionarios } = useFuncionarios();

  const professionals = React.useMemo(() => {
    if (tipoExecutor === 'DENTISTA') return dentistas;
    if (tipoExecutor === 'PROTETICO') return proteticos || [];
    if (tipoExecutor === 'SECRETARIA') return funcionarios || [];
    return [];
  }, [tipoExecutor, dentistas, proteticos, funcionarios]);

  const isLoading = loadingDentistas || loadingProteticos || loadingFuncionarios;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            {tipoExecutor === 'DENTISTA' && <Stethoscope className="w-6 h-6 text-blue-600" />}
            {tipoExecutor === 'PROTETICO' && <Hammer className="w-6 h-6 text-orange-600" />}
            {tipoExecutor === 'SECRETARIA' && <ClipboardCheck className="w-6 h-6 text-green-600" />}
            Quem está finalizando?
          </DialogTitle>
          <DialogDescription className="font-bold text-slate-500 italic">
            Selecione o seu nome na lista abaixo para registrar a finalização desta etapa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-bold text-xs uppercase tracking-widest">Carregando Profissionais...</p>
            </div>
          ) : professionals.length > 0 ? (
            professionals.map((prof) => (
              <Button
                key={prof.id}
                type="button"
                variant="outline"
                className="h-16 justify-start text-lg font-bold gap-4 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 group transition-all"
                onClick={() => onConfirm({ id: prof.id, nome: prof.nome })}
                disabled={isSubmitting}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                </div>
                <div className="flex flex-col items-start translate-y-[-1px]">
                  <span className="leading-tight">{prof.nome}</span>
                  <span className="text-[10px] uppercase font-black opacity-40 tracking-tighter">
                    {tipoExecutor} • {
                      tipoExecutor === 'PROTETICO' 
                        ? (prof as any).laboratorio || 'Laboratório' 
                        : (prof as any).especialidade || (prof as any).cargo || 'Equipe'
                    }
                  </span>
                </div>
              </Button>
            ))
          ) : (
            <div className="text-center py-10 opacity-50 italic font-bold">
              Nenhum profissional deste tipo encontrado.
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="ghost" onClick={onClose} className="font-bold uppercase tracking-widest text-xs">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
