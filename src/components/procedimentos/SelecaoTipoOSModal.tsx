import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  Smile, 
  FlaskConical, 
  Stethoscope, 
  Sparkles, 
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface SelecaoTipoOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SelecaoTipoOSModal({ isOpen, onClose }: SelecaoTipoOSModalProps) {
  const navigate = useNavigate();

  const handleNovoProcedimento = (type: string) => {
    navigate(`/procedimentos/${type}/novo`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] rounded-[40px] p-0 overflow-hidden border-0 shadow-2xl bg-white focus:outline-none">
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-10 text-white relative">
          <DialogTitle className="text-4xl font-black tracking-tighter italic">Nova Ordem de Serviço</DialogTitle>
          <DialogDescription className="text-white/80 font-bold uppercase tracking-widest text-xs mt-2">
            Selecione a categoria do procedimento para iniciar
          </DialogDescription>
          <Layers className="absolute right-10 top-10 w-24 h-24 text-white/10" />
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* REMOVIVEIS */}
              <CardGroup 
                  title="Removíveis" 
                  icon={<Smile className="text-purple-600" />} 
                  items={[
                      { label: 'PPR', type: 'ppr' },
                      { label: 'Prótese Total', type: 'pt' },
                      { label: 'Ponte Móvel', type: 'pm' }
                  ]} 
                  onAction={handleNovoProcedimento}
                  variant="purple"
              />

              {/* PROTOCOLOS */}
              <CardGroup 
                  title="Protocolos" 
                  icon={<FlaskConical className="text-blue-600" />} 
                  items={[
                      { label: 'Prot. Provisório', type: 'protocolo-provisorio' },
                      { label: 'Prot. Definitivo', type: 'protocolo-definitivo' }
                  ]} 
                  onAction={handleNovoProcedimento}
                  variant="blue"
              />

              {/* FIXAS */}
              <CardGroup 
                  title="Prótese Fixa" 
                  icon={<Stethoscope className="text-emerald-600" />} 
                  items={[
                      { label: 'Fixa Provisória', type: 'fixa' },
                      { label: 'Coroa Sob Implante', type: 'coroa-implante' },
                      { label: 'Fixa de Zircônia', type: 'fixa-zirconia' },
                      { label: 'Fixa de Cerâmica', type: 'fixa-ceramica' },
                      { label: 'Fixa Impressa', type: 'fixa-impressa' },
                      { label: 'Adesiva', type: 'adesiva' },
                      { label: 'Restauração Indir.', type: 'restauracao-indireta' }
                  ]} 
                  onAction={handleNovoProcedimento}
                  variant="emerald"
              />

              {/* ESTETICA / PLACAS */}
              <CardGroup 
                  title="Estética & Placas" 
                  icon={<Sparkles className="text-pink-600" />} 
                  items={[
                      { label: 'Clareamento', type: 'clareamento' },
                      { label: 'Placa de Bruxismo', type: 'bruxismo' }
                  ]} 
                  onAction={handleNovoProcedimento}
                  variant="pink"
              />

              {/* LAB EXTERNO */}
              <CardGroup 
                  title="Laboratório" 
                  icon={<FlaskConical className="text-slate-600" />} 
                  items={[
                      { label: 'Laboratório Externo', type: 'lab-externo' }
                  ]} 
                  onAction={handleNovoProcedimento}
                  variant="slate"
              />
           </div>
        </div>
        <div className="p-6 bg-slate-50 border-t flex justify-end">
          <Button 
            variant="ghost" 
            className="font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors" 
            onClick={onClose}
          >
            Fechar Janela
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Subcomponente para organizar os cards no Modal
function CardGroup({ title, icon, items, onAction, variant }: any) {
    return (
        <Card className="border-2 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-slate-50/50 border-b p-4 flex flex-row items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
                <CardTitle className=" text-base font-black italic tracking-tight text-slate-800">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
                {items.map((item: any) => (
                    <button 
                        key={item.type}
                        onClick={() => onAction(item.type)}
                        className="w-full text-left px-4 py-3 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group flex justify-between items-center"
                    >
                        <span className="font-bold text-sm text-slate-700 group-hover:text-primary transition-colors">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </CardContent>
        </Card>
    );
}
