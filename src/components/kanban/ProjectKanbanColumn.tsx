import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn as KanbanColumnType, KanbanCard } from "@/hooks/useKanban";
import { ProjectKanbanCard } from "./ProjectKanbanCard";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface ProjectKanbanColumnProps {
  column: KanbanColumnType;
  cards: KanbanCard[];
  onCardClick: (card: KanbanCard) => void;
}

export function ProjectKanbanColumn({ column, cards, onCardClick }: ProjectKanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const columnColors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200",
    amber: "bg-amber-500/10 text-amber-600 border-amber-200",
    violet: "bg-violet-500/10 text-violet-600 border-violet-200",
    orange: "bg-orange-500/10 text-orange-600 border-orange-200",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    slate: "bg-slate-500/10 text-slate-600 border-slate-200",
  };

  return (
    <div className="flex flex-col w-72 h-full flex-shrink-0">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", `bg-${column.color}-500`)} />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
            {column.title}
          </h3>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black">
            {cards.length}
          </span>
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 min-h-[500px] p-2 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200/50 space-y-3 transition-colors hover:bg-slate-100/50"
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <ProjectKanbanCard 
              key={card.id} 
              card={card} 
              onClick={onCardClick}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
