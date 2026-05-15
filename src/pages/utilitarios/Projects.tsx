import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectKanbanBoard } from "@/components/kanban/ProjectKanbanBoard";
import { ProjectModal } from "@/components/kanban/ProjectModal";
import { useKanban, KanbanCard } from "@/hooks/useKanban";
import { ProjectBoardsGrid } from "@/components/kanban/ProjectBoardsGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Filter, Loader2, ArrowLeft, Columns } from "lucide-react";
import { motion } from "framer-motion";


export default function Projects() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const { 
    boards, 
    columns, 
    cards, 
    loading, 
    moveCard, 
    createCard, 
    updateCard, 
    deleteCard,
    createBoard,
    deleteBoard,
    addColumn 
  } = useKanban(selectedBoardId || undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [search, setSearch] = useState("");
  const [newBoardModalOpen, setNewBoardModalOpen] = useState(false);
  const [newBoardData, setNewBoardData] = useState({ title: "", description: "" });

  const activeBoard = boards.find(b => b.id === selectedBoardId);

  const filteredCards = cards.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateBoard = async () => {
    if (!newBoardData.title) return;
    const board = await createBoard(newBoardData.title, newBoardData.description);
    setSelectedBoardId(board.id);
    setNewBoardModalOpen(false);
    setNewBoardData({ title: "", description: "" });
  };

  const handleAddColumn = async () => {
    const title = window.prompt("Nome da nova coluna:");
    if (title) await addColumn(title);
  };



  const handleCreate = async (data: Partial<KanbanCard>) => {

    await createCard(data);
  };

  const handleUpdate = async (data: Partial<KanbanCard>) => {
    if (selectedCard) {
      await updateCard(selectedCard.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
      await deleteCard(id);
      setModalOpen(false);
    }
  };

  const openNewModal = () => {
    setSelectedCard(null);
    setModalOpen(true);
  };

  const openEditModal = (card: KanbanCard) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {selectedBoardId && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 -ml-2"
                  onClick={() => setSelectedBoardId(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                {selectedBoardId ? activeBoard?.title : "Projetos & Ideias"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium italic">
              {selectedBoardId ? activeBoard?.description : "Ambiente colaborativo para melhorias na clínica"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!selectedBoardId ? (
              <Button onClick={() => setNewBoardModalOpen(true)} className="gradient-hero shadow-medical font-black uppercase text-[10px] px-6">
                <Plus className="w-4 h-4 mr-2" /> Novo Setor
              </Button>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar..." 
                    className="pl-9 w-48 bg-white border-slate-100 shadow-sm"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleAddColumn} className="font-black text-[10px] uppercase border-slate-200">
                  <Columns className="w-4 h-4 mr-2" /> Coluna
                </Button>
                <Button onClick={openNewModal} className="gradient-hero shadow-medical font-black uppercase text-[10px] px-6">
                  <Plus className="w-4 h-4 mr-2" /> Nova Ideia
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sincronizando...</p>
            </div>
          ) : !selectedBoardId ? (
            <ProjectBoardsGrid 
              boards={boards} 
              onSelectBoard={setSelectedBoardId}
              onCreateBoard={() => setNewBoardModalOpen(true)}
              onDeleteBoard={deleteBoard}
            />

          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <ProjectKanbanBoard 
                columns={columns}
                cards={filteredCards}
                onMoveCard={moveCard}
                onCardClick={openEditModal}
              />
            </motion.div>
          )}
        </div>

        {/* New Board Modal */}
        <Dialog open={newBoardModalOpen} onOpenChange={setNewBoardModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-black uppercase tracking-tight">Criar Novo Setor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Setor / Área</Label>
                <Input 
                  value={newBoardData.title}
                  onChange={(e) => setNewBoardData({...newBoardData, title: e.target.value})}
                  placeholder="Ex: Marketing Digital" 
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (Opcional)</Label>
                <Textarea 
                  value={newBoardData.description}
                  onChange={(e) => setNewBoardData({...newBoardData, description: e.target.value})}
                  placeholder="Objetivos deste Kanban..." 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateBoard} className="font-black uppercase text-xs">Criar Kanban</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modals */}
        <ProjectModal 
          open={modalOpen}
          onOpenChange={setModalOpen}
          card={selectedCard}
          onSubmit={selectedCard ? handleUpdate : handleCreate}
          onDelete={selectedCard ? handleDelete : undefined}
          defaultColumnId={columns[0]?.id}
        />
      </div>
    </DashboardLayout>
  );
}
