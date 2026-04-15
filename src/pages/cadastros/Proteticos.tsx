import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Wrench, Plus, Search, Edit, Trash2, Phone, Mail, Building, Loader2 } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useProteticos } from "@/hooks/useProteticos";
import { ProteticoForm } from "@/components/proteticos/ProteticoForm";

interface Protetico {
  id: number;
  nome: string;
  especialidade?: string | null;
  telefone?: string | null;
  email?: string | null;
  laboratorio?: string | null;
  ativo: boolean;
}

export function Proteticos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProtetico, setEditingProtetico] = useState<Protetico | undefined>();
  const { data: proteticos, isLoading: loading, deleteProtetico } = useProteticos();

  const filteredProteticos = (proteticos || []).filter(protetico =>
    protetico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (protetico.laboratorio && protetico.laboratorio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (protetico: Protetico) => {
    setEditingProtetico(protetico);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProtetico(undefined);
  };

  const columns = [
    { key: 'nome' as const, header: 'Nome', className: 'font-medium' },
    { key: 'laboratorio' as const, header: 'Laboratório', className: 'hidden sm:table-cell' },
    { key: 'especialidade' as const, header: 'Especialidade', className: 'hidden md:table-cell' },
    { key: 'telefone' as const, header: 'Telefone', className: 'hidden lg:table-cell' },
    {
      key: 'ativo' as const,
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Ativo" : "Inativo"}
        </Badge>
      )
    }
  ];

  const mobileCardRender = (protetico: Protetico) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{protetico.nome}</h3>
          <p className="text-sm text-muted-foreground">{protetico.laboratorio || 'Sem laboratório'}</p>
        </div>
        <Badge variant={protetico.ativo ? "default" : "secondary"}>
          {protetico.ativo ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="space-y-2">
        {protetico.especialidade && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Wrench className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{protetico.especialidade}</span>
          </div>
        )}
        {protetico.telefone && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{protetico.telefone}</span>
          </div>
        )}
        {protetico.email && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{protetico.email}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderActions = (protetico: Protetico) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => handleEdit(protetico)}
      >
        <Edit className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-destructive h-8 px-2">
            <Trash2 className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Excluir</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o protético <strong>{protetico.nome}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteProtetico(protetico.id)}
            >
              Excluir
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Protéticos</h1>
            <p className="text-muted-foreground">Gerencie os profissionais protéticos</p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Protético
          </Button>
        </div>

        <Card className="medical-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-orange-600" />
                Lista de Protéticos
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar protético ou laboratório..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredProteticos.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Nenhum protético encontrado" : "Nenhum protético cadastrado"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setFormOpen(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Protético
                  </Button>
                )}
              </div>
            ) : (
              <MobileTable
                data={filteredProteticos}
                columns={columns}
                renderMobileCard={mobileCardRender}
                renderActions={renderActions}
              />
            )}
          </CardContent>
        </Card>

        <ProteticoForm
          open={formOpen}
          onClose={handleFormClose}
          protetico={editingProtetico}
        />
      </div>
    </DashboardLayout>
  );
}
