import { KanbanBoard } from "@/hooks/useKanban";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layout, ArrowRight, Settings2, Trash2 } from "lucide-react";

import { motion } from "framer-motion";

interface ProjectBoardsGridProps {
  boards: KanbanBoard[];
  onSelectBoard: (id: string) => void;
  onCreateBoard: () => void;
  onDeleteBoard: (id: string) => void;
}


export function ProjectBoardsGrid({ boards, onSelectBoard, onCreateBoard, onDeleteBoard }: ProjectBoardsGridProps) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
      {/* Botão Novo Quadro */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className="group h-48 border-2 border-dashed border-slate-200 bg-white/50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 shadow-none hover:shadow-lg"
          onClick={onCreateBoard}
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary" />
          </div>
          <p className="text-sm font-black text-slate-500 group-hover:text-primary uppercase tracking-widest">Novo Setor / Área</p>
        </Card>
      </motion.div>

      {/* Lista de Quadros */}
      {boards.map((board, index) => (
        <motion.div
          key={board.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card 
            className="group h-48 glass-card border-none shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col"
            onClick={() => onSelectBoard(board.id)}
          >
            <div className="h-2 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
            
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layout className="w-5 h-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-300 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Tem certeza que deseja excluir todo este setor? Tudo dentro dele será apagado.")) {
                        onDeleteBoard(board.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>


              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                  {board.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium italic line-clamp-2 mt-1">
                  {board.description || "Nenhuma descrição definida."}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary flex items-center gap-1 transition-colors">
                  Acessar Kanban <ArrowRight className="w-3 h-3" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">Total: Colaborativo</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
