import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard } from "@/hooks/useKanban";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ImageIcon, MessageSquare, MoreVertical, GripVertical } from "lucide-react";

interface ProjectKanbanCardProps {
  card: KanbanCard;
  onClick: (card: KanbanCard) => void;
}

export function ProjectKanbanCard({ card, onClick }: ProjectKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const departments: Record<string, string> = {
    Financeiro: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Marketing: "bg-pink-100 text-pink-700 border-pink-200",
    Clínica: "bg-blue-100 text-blue-700 border-blue-200",
    Atendimento: "bg-amber-100 text-amber-700 border-amber-200",
    TI: "bg-slate-700 text-white border-slate-800",
    Segurança: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="outline-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={!isDragging ? { y: -2 } : {}}
      >
        <Card 
          className={cn(
            "group relative glass-card border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden",
            isDragging && "ring-2 ring-primary bg-white/80"
          )}
          onClick={() => onClick(card)}
        >
          {card.image_url && (
            <div className="w-full h-24 overflow-hidden border-b">
              <img 
                src={card.image_url} 
                alt={card.title} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}

          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div 
                {...attributes} 
                {...listeners} 
                className="p-1 -ml-1 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate leading-tight">
                  {card.title}
                </p>
              </div>
              <MoreVertical className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {card.description && (
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {card.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/50">
              <div className="flex gap-1.5 items-center">
                {card.department && (
                  <Badge className={cn("text-[9px] font-black uppercase px-1.5 py-0 border italic", departments[card.department] || "bg-slate-100 text-slate-600")}>
                    {card.department}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 opacity-60">
                {card.image_url && <ImageIcon className="w-3 h-3 text-slate-400" />}
                <MessageSquare className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
