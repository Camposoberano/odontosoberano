import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ProcedimentoCatalogo, CatalogoProcedimentoForm, CATEGORIAS_PROCEDIMENTOS } from "@/hooks/useProcedimentosCatalogo";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: CatalogoProcedimentoForm) => Promise<void>;
  procedimento?: ProcedimentoCatalogo;
  title: string;
}

const EMPTY: CatalogoProcedimentoForm = {
  nome: "",
  categoria: CATEGORIAS_PROCEDIMENTOS[0],
  codigo_tuss: "",
  codigo_vrpo: "",
  preco_sugerido: 0,
  ativo: true,
};

export function CatalogoProcedimentoForm({ open, onOpenChange, onSubmit, procedimento, title }: Props) {
  const [form, setForm] = useState<CatalogoProcedimentoForm>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (procedimento) {
      setForm({
        nome: procedimento.nome,
        categoria: procedimento.categoria,
        codigo_tuss: procedimento.codigo_tuss ?? "",
        codigo_vrpo: procedimento.codigo_vrpo ?? "",
        preco_sugerido: procedimento.preco_sugerido,
        ativo: procedimento.ativo,
      });
    } else {
      setForm(EMPTY);
    }
  }, [procedimento, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.categoria) return;
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        codigo_tuss: form.codigo_tuss?.trim() || null,
        codigo_vrpo: form.codigo_vrpo?.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Consulta Inicial"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={form.categoria} onValueChange={(v) => setForm(f => ({ ...f, categoria: v }))}>
              <SelectTrigger id="categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_PROCEDIMENTOS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço Sugerido (R$)</Label>
            <Input
              id="preco"
              type="number"
              min={0}
              step={0.01}
              value={form.preco_sugerido}
              onChange={(e) => setForm(f => ({ ...f, preco_sugerido: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="ativo"
              checked={form.ativo}
              onCheckedChange={(v) => setForm(f => ({ ...f, ativo: v }))}
            />
            <Label htmlFor="ativo">Procedimento ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {procedimento ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
