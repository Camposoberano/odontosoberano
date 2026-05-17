import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BookOpen, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useCatalogoCRUD, ProcedimentoCatalogo, CatalogoProcedimentoForm, CATEGORIAS_PROCEDIMENTOS } from "@/hooks/useProcedimentosCatalogo";
import { CatalogoProcedimentoForm as FormDialog } from "@/components/catalogo/CatalogoProcedimentoForm";

const TODAS = "Todas";

export function CatalogoProcedimentos() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<string>(TODAS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProcedimentoCatalogo | undefined>();

  const { todos, isLoading, criar, editar, toggleAtivo, remover } = useCatalogoCRUD();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return todos.filter(p => {
      const matchCat = categoria === TODAS || p.categoria === categoria;
      const matchSearch =
        !term ||
        p.nome.toLowerCase().includes(term) ||
        (p.codigo_tuss ?? "").toLowerCase().includes(term) ||
        (p.codigo_vrpo ?? "").toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [todos, search, categoria]);

  const handleCreate = async (data: CatalogoProcedimentoForm) => {
    await criar.mutateAsync(data);
  };

  const handleEdit = async (data: CatalogoProcedimentoForm) => {
    if (!editing) return;
    await editar.mutateAsync({ id: editing.id, form: data });
    setEditing(undefined);
  };

  const openEdit = (p: ProcedimentoCatalogo) => {
    setEditing(p);
    setFormOpen(true);
  };

  const fmt = (v: number) =>
    v > 0
      ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "—";

  const columns = [
    { key: "nome" as const, header: "Nome", className: "font-medium" },
    {
      key: "categoria" as const,
      header: "Categoria",
      className: "hidden sm:table-cell",
      render: (v: string) => <Badge variant="outline" className="text-xs">{v}</Badge>,
    },
    { key: "codigo_tuss" as const, header: "TUSS", className: "hidden md:table-cell text-muted-foreground text-sm" },
    {
      key: "preco_sugerido" as const,
      header: "Preço",
      className: "hidden md:table-cell",
      render: (v: number) => <span className="font-mono text-sm">{fmt(v)}</span>,
    },
    {
      key: "ativo" as const,
      header: "Ativo",
      render: (v: boolean, row: ProcedimentoCatalogo) => (
        <Switch
          checked={v}
          onCheckedChange={(checked) => toggleAtivo.mutate({ id: row.id, ativo: checked })}
          aria-label="Ativar/desativar"
        />
      ),
    },
  ];

  const mobileCard = (p: ProcedimentoCatalogo) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{p.nome}</p>
          <p className="text-xs text-muted-foreground">{p.categoria}</p>
        </div>
        <Switch
          checked={p.ativo}
          onCheckedChange={(checked) => toggleAtivo.mutate({ id: p.id, ativo: checked })}
          aria-label="Ativar/desativar"
        />
      </div>
      <div className="flex gap-4 text-sm text-muted-foreground">
        {p.codigo_tuss && <span>TUSS: {p.codigo_tuss}</span>}
        <span className="font-mono">{fmt(p.preco_sugerido)}</span>
      </div>
    </div>
  );

  const renderActions = (p: ProcedimentoCatalogo) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => openEdit(p)}>
        <Edit className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-destructive h-8 px-2">
            <Trash2 className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Remover</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover procedimento?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{p.nome}</strong> será removido do catálogo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => remover.mutate(p.id)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Catálogo de Procedimentos</h1>
            <p className="text-muted-foreground">Gerencie os procedimentos TUSS disponíveis na clínica</p>
          </div>
          <Button
            className="gap-2 w-full sm:w-auto"
            onClick={() => { setEditing(undefined); setFormOpen(true); }}
          >
            <Plus className="w-4 h-4" />
            Novo Procedimento
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5" />
              Procedimentos ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou código TUSS..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODAS}>Todas as categorias</SelectItem>
                  {CATEGORIAS_PROCEDIMENTOS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Carregando catálogo...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {search || categoria !== TODAS
                    ? "Nenhum procedimento encontrado com os filtros aplicados."
                    : "Nenhum procedimento no catálogo ainda."}
                </p>
                {!search && categoria === TODAS && (
                  <Button className="mt-4" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar primeiro procedimento
                  </Button>
                )}
              </div>
            ) : (
              <MobileTable
                data={filtered}
                columns={columns}
                mobileCardRender={mobileCard}
                actions={renderActions}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <FormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditing(undefined); }}
        onSubmit={editing ? handleEdit : handleCreate}
        procedimento={editing}
        title={editing ? "Editar Procedimento" : "Novo Procedimento"}
      />
    </DashboardLayout>
  );
}
