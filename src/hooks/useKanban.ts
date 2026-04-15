import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface KanbanBoard {
  id: string;
  title: string;
  description: string;
  color: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  position: number;
  color: string;
  board_id: string;
}

export interface KanbanCard {
  id: string;
  column_id: string;
  title: string;
  description: string;
  department?: string;
  image_url?: string;
  position: number;
  tags: any[];
  user_id: string;
  created_at: string;
}

export function useKanban(boardId?: string) {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBoards = async () => {
    const { data, error } = await supabase.from("kanban_boards").select("*").order("created_at");
    if (error) throw error;
    setBoards(data || []);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchBoards();

      if (boardId) {
        const [columnsRes, cardsRes] = await Promise.all([
          supabase.from("kanban_columns").select("*").eq("board_id", boardId).order("position"),
          supabase.from("kanban_cards")
            .select("*, kanban_columns!inner(board_id)")
            .eq("kanban_columns.board_id", boardId)
            .order("position")
        ]);

        if (columnsRes.error) throw columnsRes.error;
        if (cardsRes.error) throw cardsRes.error;

        setColumns(columnsRes.data || []);
        // Remove virtual column data from inner join
        const cleanCards = (cardsRes.data || []).map(({ kanban_columns, ...card }) => card) as KanbanCard[];
        setCards(cleanCards);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("kanban_realtime_v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "kanban_boards" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "kanban_columns" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "kanban_cards" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  // Board CRUD
  const createBoard = async (title: string, description?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("kanban_boards")
      .insert([{ title, description, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const deleteBoard = async (id: string) => {
    const { error } = await supabase.from("kanban_boards").delete().eq("id", id);
    if (error) throw error;
  };

  // Card CRUD
  const moveCard = async (cardId: string, targetColumnId: string, newPosition: number) => {
    // Optimistic Update
    const oldCards = [...cards];
    setCards(cards => cards.map(c => 
      c.id === cardId ? { ...c, column_id: targetColumnId, position: newPosition } : c
    ));

    try {
      const { error } = await supabase
        .from("kanban_cards")
        .update({ column_id: targetColumnId, position: newPosition })
        .eq("id", cardId);
      if (error) throw error;
    } catch (error: any) {
      setCards(oldCards);
      toast({ title: "Erro ao mover", description: error.message, variant: "destructive" });
    }
  };

  const createCard = async (card: Partial<KanbanCard>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("kanban_cards")
      .insert([{ ...card, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  // Column CRUD
  const addColumn = async (title: string) => {
    if (!boardId) return;
    const { data, error } = await supabase
      .from("kanban_columns")
      .insert([{ title, board_id: boardId, position: columns.length + 1 }])
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const deleteColumn = async (id: string) => {
    const { error } = await supabase.from("kanban_columns").delete().eq("id", id);
    if (error) throw error;
  };

  return {
    boards,
    columns,
    cards,
    loading,
    createBoard,
    deleteBoard,
    moveCard,
    createCard,
    updateCard: async (id: string, updates: Partial<KanbanCard>) => {
      const { error } = await supabase.from("kanban_cards").update(updates).eq("id", id);
      if (error) throw error;
    },
    deleteCard: async (id: string) => {
      const { error } = await supabase.from("kanban_cards").delete().eq("id", id);
      if (error) throw error;
    },
    addColumn,
    deleteColumn,
    refetch: fetchData
  };
}
