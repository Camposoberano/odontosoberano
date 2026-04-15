import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KanbanCard } from "@/hooks/useKanban";
import { Trash2, ImageIcon, Save, X, ClipboardPaste } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<KanbanCard>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  card?: KanbanCard | null;
  defaultColumnId?: string;
}

export function ProjectModal({ open, onOpenChange, onSubmit, onDelete, card, defaultColumnId }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "Clínica",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        description: card.description || "",
        department: card.department || "Clínica",
        image_url: card.image_url || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        department: "Clínica",
        image_url: "",
      });
    }
  }, [card, open]);

  // Lógica para colar imagem (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64String = event.target?.result as string;
                    setFormData(prev => ({ ...prev, image_url: base64String }));
                    toast({
                      title: "Imagem capturada!",
                      description: "O print foi anexado ao projeto.",
                    });
                };
                reader.readAsDataURL(blob);
            }
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        column_id: card?.column_id || defaultColumnId,
        position: card?.position || 1,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const departments = ["Financeiro", "Marketing", "Clínica", "Atendimento", "TI", "Segurança"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] glass-card border-none p-0 overflow-hidden"
        onPaste={handlePaste} // Listener de paste no container do modal
      >
        <div className="gradient-hero h-2 px-6" />
        
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              {card ? "Editar Projeto" : "Novo Projeto / Ideia"}
              {!card && <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full lowercase font-medium">Aceita Ctrl+V para imagens</div>}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Título do Projeto</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Novo fluxo de confirmação WhatsApp"
                className="bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Área / Departamento</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(v) => setFormData({...formData, department: v})}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-100 font-bold">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                   Imagem 
                   <span className="text-[8px] opacity-60 lowercase font-normal">Aceita Ctrl+V</span>
                </Label>
                <div className="relative">
                  <Input 
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="Cole o link ou cole com Ctrl+V"
                    className="bg-slate-50 border-slate-100 pl-8 text-xs truncate"
                  />
                  <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Descrição da Ideia</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva sua sugestão... (Dica: você pode tirar um print e colar direto aqui!)"
                className="min-h-[120px] bg-slate-50 border-slate-100 resize-none leading-relaxed"
              />
            </div>

            {formData.image_url && (
              <div className="relative group rounded-xl overflow-hidden border-2 border-slate-100 h-40 bg-slate-50 shadow-inner">
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain bg-white" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 font-black uppercase text-[10px]"
                    onClick={() => setFormData({...formData, image_url: ""})}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Remover imagem
                  </Button>
                </div>
              </div>
            )}
            
            {!formData.image_url && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-slate-50/50 grayscale opacity-40">
                <ClipboardPaste className="w-8 h-8 text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pressione Ctrl+V para anexar um print</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-0 flex items-center justify-between border-t border-slate-100/50 bg-slate-50/50 mt-2">
            <div>
              {card && onDelete && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 font-black text-[10px] uppercase"
                  onClick={() => onDelete(card.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-black text-[10px] uppercase">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="font-black text-[10px] uppercase px-6">
                {loading ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> Salvar Projeto</>}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
