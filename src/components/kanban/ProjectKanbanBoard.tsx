import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { 
  arrayMove, 
  sortableKeyboardCoordinates 
} from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { KanbanColumn as KanbanColumnType, KanbanCard } from "@/hooks/useKanban";
import { ProjectKanbanColumn } from "./ProjectKanbanColumn";
import { ProjectKanbanCard } from "./ProjectKanbanCard";
import { createPortal } from "react-dom";

interface ProjectKanbanBoardProps {
  columns: KanbanColumnType[];
  cards: KanbanCard[];
  onMoveCard: (cardId: string, targetColumnId: string, newPosition: number) => void;
  onCardClick: (card: KanbanCard) => void;
}

export function ProjectKanbanBoard({ columns, cards: initialCards, onMoveCard, onCardClick }: ProjectKanbanBoardProps) {
  const [cards, setCards] = useState<KanbanCard[]>(initialCards);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  // Sincronizar com o pai, mas ignorar se estiver no meio de um arraste
  useEffect(() => {
    if (!activeCard) {
      setCards(initialCards);
    }
  }, [initialCards, activeCard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Equilíbrio entre clique e arraste
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper para achar em qual coluna um item (ou a própria coluna) está
  function findColumn(id: string) {
    if (columns.some(col => col.id === id)) return id;
    const card = cards.find(c => c.id === id);
    return card ? card.column_id : null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) setActiveCard(card);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setCards((prev) => {
      const activeIndex = prev.findIndex((c) => c.id === activeId);
      const overIndex = prev.findIndex((c) => c.id === overId);

      // Mudar a coluna do card no estado local otimista
      const newItems = [...prev];
      newItems[activeIndex] = { ...newItems[activeIndex], column_id: overColumn };

      // Se o over for um card, movemos para aquela posição. Se for a coluna, vai pro final.
      const isOverACard = prev.some(c => c.id === overId);
      const updatedIndex = isOverACard ? overIndex : prev.length;

      return arrayMove(newItems, activeIndex, updatedIndex);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id as string;
    const activeCardData = cards.find(c => c.id === activeId);
    
    if (!activeCardData) {
      setActiveCard(null);
      return;
    }

    const columnId = activeCardData.column_id;
    const columnCards = cards.filter(c => c.column_id === columnId);
    const newPosition = columnCards.findIndex(c => c.id === activeId) + 1;

    // Persistir no banco
    onMoveCard(activeId, columnId, newPosition);
    setActiveCard(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar h-full min-h-[600px] items-start p-2">
        {columns.map((column) => (
          <ProjectKanbanColumn
            key={column.id}
            column={column}
            cards={cards.filter((c) => c.column_id === column.id)}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay dropAnimation={defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })}>
            {activeCard ? (
              <div className="w-72 shadow-2xl relative z-[999] opacity-90 scale-105 pointer-events-none">
                <ProjectKanbanCard card={activeCard} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
