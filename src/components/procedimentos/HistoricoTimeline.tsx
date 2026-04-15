import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export interface HistoricoItem {
  id: string;
  data: string;
  usuario_nome: string;
  acao: string;
  detalhes?: string;
  tipo: 'STATUS' | 'TECNICA' | 'FINANCEIRO' | 'SISTEMA';
}

interface HistoricoTimelineProps {
  itens: HistoricoItem[];
  isLoading?: boolean;
}

export function HistoricoTimeline({ itens, isLoading }: HistoricoTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted mt-1" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
        <Clock className="w-10 h-10 mx-auto text-muted-foreground opacity-20 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nenhuma atividade registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-primary/5 before:to-transparent">
      {itens.map((item, index) => (
        <div key={item.id} className="relative flex items-start gap-4 group">
          {/* Icon Pillar */}
          <div className="relative flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-primary/20 shadow-sm z-10 group-hover:border-primary transition-colors">
            {item.tipo === 'STATUS' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {item.tipo === 'TECNICA' && <ArrowRight className="w-4 h-4 text-blue-500" />}
            {item.tipo === 'FINANCEIRO' && <AlertCircle className="w-4 h-4 text-orange-500" />}
            {item.tipo === 'SISTEMA' && <User className="w-4 h-4 text-gray-500" />}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <time className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {format(new Date(item.data), "dd 'de' MMM, HH:mm", { locale: ptBR })}
              </time>
              <span className="text-[10px] font-black text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full uppercase truncate max-w-[120px]">
                {item.usuario_nome}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-800 leading-snug">
              {item.acao}
            </p>
            {item.detalhes && (
              <p className="mt-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50 italic">
                {item.detalhes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
