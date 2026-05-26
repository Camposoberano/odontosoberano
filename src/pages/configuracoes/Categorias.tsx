import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useCategoriasDespesa } from "@/hooks/useCategoriasDespesa";
import { Tag, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Categorias() {
  const { categorias, isLoading, createCategoria, updateCategoria, deleteCategoria, isCreating } =
    useCategoriasDespesa();
  const [novoNome, setNovoNome] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    const nome = novoNome.trim();
    if (!nome) return;
    await createCategoria(nome);
    setNovoNome("");
  };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">
              CATEGORIAS DE DESPESA
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Organize as contas a pagar por categoria
            </p>
          </div>
          <Badge variant="secondary" className="h-9 px-4 text-base font-black">
            <Tag className="w-4 h-4 mr-2" />
            {categorias.length} categoria{categorias.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Add new */}
        <Card className="rounded-2xl border-2">
          <CardContent className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Nova Categoria
                </label>
                <Input
                  placeholder="Ex: Materiais odontológicos"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <Button onClick={handleCreate} disabled={!novoNome.trim() || isCreating} className="gap-2">
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> Categorias Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : categorias.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma categoria cadastrada. Adicione a primeira acima.
              </div>
            ) : (
              <div className="divide-y">
                {categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className={`font-semibold ${!cat.ativo ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {cat.nome}
                      </span>
                      {!cat.ativo && (
                        <Badge variant="outline" className="text-xs text-slate-400">Inativa</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{cat.ativo ? "Ativa" : "Inativa"}</span>
                        <Switch
                          checked={cat.ativo}
                          onCheckedChange={(v) => updateCategoria({ id: cat.id, ativo: v })}
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8"
                        onClick={() => setDeletingId(cat.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Contas vinculadas a essa categoria perderão a associação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={async () => {
                if (deletingId) await deleteCategoria(deletingId);
                setDeletingId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
