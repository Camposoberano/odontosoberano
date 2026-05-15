import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProteseAnalyticItem } from "@/hooks/useProteseAnalytics";
import { ListaCasosProtese } from "./ListaCasosProtese";
import { Badge } from "@/components/ui/badge";
import { User, Award, TrendingUp } from "lucide-react";

interface Props {
  profissional: {
    nome: string;
    total: number;
    etapas: Record<string, number>;
  } | null;
  items: ProteseAnalyticItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetalhesProfissionalDialog({ profissional, items, isOpen, onOpenChange }: Props) {
  if (!profissional) return null;

  // Filtrar itens apenas deste profissional
  // Nota: o item pode ter o profissional como dentista ou protético
  const profissionalItems = items.filter(item => 
    item.dentista_nome === profissional.nome || 
    item.protetico_nome === profissional.nome
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-gray-900">{profissional.nome}</DialogTitle>
              <DialogDescription className="font-medium text-blue-600 flex items-center gap-1">
                <Award className="h-4 w-4" /> Detalhamento de Performance no Período
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total de Etapas</span>
            <span className="text-2xl font-black text-gray-900">{profissional.total}</span>
          </div>
          <div className="md:col-span-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4 overflow-x-auto">
             <div className="flex gap-2">
               {Object.entries(profissional.etapas).map(([label, count]) => (
                 <div key={label} className="bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm whitespace-nowrap">
                   <span className="text-[10px] font-bold text-gray-400 block uppercase">{label}</span>
                   <span className="text-sm font-black text-blue-600">{count}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Lista de Casos Atuados
          </h4>
          <ListaCasosProtese items={profissionalItems} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
