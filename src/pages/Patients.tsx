import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { FichaClinica } from "@/components/pacientes/FichaClinica";
import { Odontograma } from "@/components/pacientes/Odontograma";
import { Ortodontia } from "@/components/pacientes/Ortodontia";
import { Fotos } from "@/components/pacientes/Fotos";
import { Radiografias } from "@/components/pacientes/Radiografias";
import { Receituario } from "@/components/pacientes/Receituario";
import { ProcedimentosPaciente } from "@/components/pacientes/ProcedimentosPaciente";
import { PatientSearch } from "@/components/pacientes/PatientSearch";
import { usePacientes, Paciente } from "@/hooks/usePacientes";
import { useAuth } from "@/contexts/AuthContext";
import { MobileTable } from "@/components/ui/mobile-table";
import { 
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Mail,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Camera,
  Activity,
  Image as FileImage,
  Pill,
  Users,
  ClipboardList,
  Download,
  AlignVerticalJustifyCenter,
  Menu,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AnimatePresence } from "framer-motion";
import { downloadCSV } from "@/utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { motion, Variants } from "framer-motion";

export default function Patients() {
  const { user } = useAuth();
  const { pacientes, loading, createPaciente, updatePaciente, deletePaciente } = usePacientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState<Paciente | null>(null);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("ficha");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPaciente = pacientes.find(p => p.id === selectedPacienteId);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleAddPaciente();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
    
    // Se vier um ID via URL (ex: de outra página), seleciona o paciente
    const idParam = searchParams.get('id');
    if (idParam && idParam !== selectedPacienteId) {
      setSelectedPacienteId(idParam);
    }

    // Se vier uma aba via URL, seleciona a aba
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const sidebarItems = [
    { id: "ficha", label: "Ficha Clínica", icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { id: "procedimentos", label: "Procedimentos", icon: ClipboardList, color: "text-green-500", bgColor: "bg-green-500/10" },
    { id: "odontograma", label: "Odontograma", icon: Activity, color: "text-red-500", bgColor: "bg-red-500/10" },
    { id: "ortodontia", label: "Ortodontia", icon: AlignVerticalJustifyCenter, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { id: "fotos", label: "Fotos", icon: Camera, color: "text-pink-500", bgColor: "bg-pink-500/10" },
    { id: "radiografias", label: "Radiografias", icon: FileImage, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { id: "receituario", label: "Receituário", icon: Pill, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  ];

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Faça login para gerenciar os pacientes</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredPatients = pacientes.filter(patient => {
    const searchLower = (searchTerm || '').toLowerCase();
    const matchesSearch = (patient.nome || '').toLowerCase().includes(searchLower) ||
                         (patient.apelido || '').toLowerCase().includes(searchLower) ||
                         (patient.email || '').toLowerCase().includes(searchLower) ||
                         (patient.telefone || '').includes(searchTerm);
    
    const matchesStatus = selectedStatus === "all" || 
                         (patient.status === "Ativo" && selectedStatus === "active") ||
                         (patient.status === "Inativo" && selectedStatus === "inactive");
    
    return matchesSearch && matchesStatus;
  });

  const handleAddPaciente = () => {
    setEditingPaciente(null);
    setIsFormOpen(true);
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingPaciente) {
      await updatePaciente(editingPaciente.id, data);
    } else {
      await createPaciente(data);
    }
  };

  const handleDeleteClick = (paciente: Paciente) => {
    setPacienteToDelete(paciente);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (pacienteToDelete) {
      await deletePaciente(pacienteToDelete.id);
      setDeleteDialogOpen(false);
      setPacienteToDelete(null);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Definir colunas da tabela
  const columns = [
    {
      key: 'nome' as keyof Paciente,
      header: 'Nome',
      render: (value: any, paciente: Paciente) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{paciente.nome}{paciente.apelido ? <span className="text-muted-foreground font-normal"> ({paciente.apelido})</span> : null}</p>
            {paciente.area_tratamento && <p className="text-xs text-muted-foreground">{paciente.area_tratamento}</p>}
          </div>
        </div>
      )
    },
    { 
      key: 'email' as keyof Paciente, 
      header: 'Email',
      className: 'text-sm text-muted-foreground'
    },
    { 
      key: 'telefone' as keyof Paciente, 
      header: 'Telefone',
      className: 'text-sm text-muted-foreground'
    },
    { 
      key: 'data_nascimento' as keyof Paciente, 
      header: 'Idade',
      render: (value: any, paciente: Paciente) => (
        <span className="text-sm text-muted-foreground">
          {paciente.data_nascimento ? `${calculateAge(paciente.data_nascimento)} anos` : '-'}
        </span>
      )
    },
    { 
      key: 'ultima_consulta' as keyof Paciente, 
      header: 'Última Consulta',
      render: (value: any, paciente: Paciente) => (
        <span className="text-sm text-muted-foreground">
          {paciente.ultima_consulta && !isNaN(new Date(paciente.ultima_consulta).getTime()) ? new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR') : '-'}
        </span>
      )
    },
    { 
      key: 'status' as keyof Paciente, 
      header: 'Status',
      render: (value: any, paciente: Paciente) => (
        <Badge className={paciente.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {paciente.status}
        </Badge>
      )
    }
  ];

  // Renderização para mobile (card)
  const mobileCardRender = (paciente: Paciente) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{paciente.nome}{paciente.apelido ? <span className="text-muted-foreground font-normal text-sm"> ({paciente.apelido})</span> : null}</p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <Badge className={paciente.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {paciente.status}
              </Badge>
              {paciente.area_tratamento && <span className="text-xs text-muted-foreground">{paciente.area_tratamento}</span>}
            </div>
          </div>
        </div>
        {renderActions(paciente)}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{paciente.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{paciente.telefone}</span>
        </div>
        {paciente.data_nascimento && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{calculateAge(paciente.data_nascimento)} anos</span>
          </div>
        )}
        {paciente.ultima_consulta && !isNaN(new Date(paciente.ultima_consulta).getTime()) && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Última consulta: {new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Renderização das ações (dropdown menu)
  const renderActions = (paciente: Paciente) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEditPaciente(paciente)}>
          <Edit className="w-4 h-4 mr-2" />
          Editar Dados
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDeleteClick(paciente)}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* TOP SELECTOR & SEARCH */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">CADASTROS DE PACIENTES</h1>
              <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest leading-loose">Gestão de prontuários e histórico clínico individual</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedPacienteId && (
                <Button 
                   variant="outline" 
                   size="sm" 
                   className="rounded-xl font-black text-[10px] uppercase tracking-widest border-2 gap-2 h-10"
                   onClick={() => setSelectedPacienteId("")}
                >
                   <ArrowLeft className="w-3 h-3" /> Ver Todos
                </Button>
              )}
              <Button 
                className="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 shadow-lg shadow-primary/20 h-11"
                onClick={handleAddPaciente}
              >
                <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
              </Button>
            </div>
          </div>

          <Card className={`border-2 transition-all duration-500 bg-white/50 backdrop-blur-xl ${!selectedPacienteId ? 'py-12 px-6 sm:px-12 shadow-2xl' : 'p-2 shadow-sm rounded-2xl border-slate-100'}`}>
            <div className="max-w-4xl mx-auto w-full">
               {!selectedPacienteId && (
                 <div className="text-center mb-8 space-y-2 animate-in fade-in slide-in-from-top duration-700">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                       <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Busque o Paciente</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Inicie a gestão pesquisando por nome, cpf ou telefone abaixo</p>
                 </div>
               )}
               <PatientSearch 
                 selectedPacienteId={selectedPacienteId} 
                 onSelect={(id) => {
                   setSelectedPacienteId(id);
                   setActiveTab("ficha");
                 }} 
                 placeholder="Digite o nome do paciente..."
                 className="shadow-xl rounded-2xl"
               />
            </div>
          </Card>
        </motion.div>

        {!selectedPacienteId ? (
          /* EMPTY STATE / LANDING */
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8"
          >
             <Card className="p-6 border-2 border-dashed rounded-[32px] bg-slate-50/50 flex flex-col items-center text-center gap-4 opacity-60">
                <FileText className="w-10 h-10 text-slate-300" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Fichas Clínicas</span>
             </Card>
             <Card className="p-6 border-2 border-dashed rounded-[32px] bg-slate-50/50 flex flex-col items-center text-center gap-4 opacity-60">
                <ClipboardList className="w-10 h-10 text-slate-300" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Histórico de Atendimentos</span>
             </Card>
             <Card className="p-6 border-2 border-dashed rounded-[32px] bg-slate-50/50 flex flex-col items-center text-center gap-4 opacity-60">
                <Pill className="w-10 h-10 text-slate-300" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Receituários e Documentos</span>
             </Card>
          </motion.div>
        ) : (
          /* SINGLE PATIENT VIEW WITH SIDEBAR */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             {/* DESKTOP SIDEBAR */}
             <motion.div 
                variants={itemVariants} 
                className="hidden lg:flex lg:col-span-3 flex-col gap-2 p-2 bg-white rounded-[32px] border-2 shadow-xl sticky top-24"
             >
                <div className="p-6 pb-2 border-b border-slate-100 mb-2">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                         <User className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                         <h3 className="font-extrabold text-slate-800 truncate text-sm uppercase leading-none">{selectedPaciente?.nome}</h3>
                         <span className="text-[10px] font-black text-primary uppercase mt-1">Navegação Clínica</span>
                      </div>
                   </div>
                </div>

                 {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all group w-full ${
                        activeTab === item.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 -translate-y-1' 
                        : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                         <div className={`p-2 rounded-xl shrink-0 transition-colors ${activeTab === item.id ? 'bg-white/20' : item.bgColor}`}>
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : item.color}`} />
                         </div>
                         <span className={`font-bold text-sm tracking-tight truncate ${activeTab === item.id ? 'text-white' : 'text-slate-700'}`}>
                           {item.label}
                         </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform opacity-40 ${activeTab === item.id ? 'text-white translate-x-1' : 'text-slate-400'}`} />
                    </button>
                 ))}
                
                <div className="mt-4 pt-4 border-t border-slate-100 p-4">
                   <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-xl font-black text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10"
                      onClick={() => handleEditPaciente(selectedPaciente!)}
                   >
                      <Edit className="w-3.5 h-3.5 mr-2" /> Alterar Dados Cadastrais
                   </Button>
                </div>
             </motion.div>

             {/* MOBILE MENU TRIGGER */}
             <div className="lg:hidden flex items-center justify-between p-4 bg-white rounded-2xl border-2 shadow-sm">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                      <User className="w-4 h-4" />
                   </div>
                   <span className="font-bold text-sm text-slate-800">{selectedPaciente?.nome}</span>
                </div>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                   <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2">
                         <Menu className="w-4 h-4" /> Menu
                      </Button>
                   </SheetTrigger>
                   <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 rounded-r-3xl">
                      <div className="p-8 pb-4">
                         <h2 className="text-xl font-black italic tracking-tighter text-primary">OPÇÕES CLÍNICAS</h2>
                      </div>
                      <div className="flex flex-col gap-2 p-4">
                         {sidebarItems.map((item) => (
                            <button
                               key={item.id}
                               onClick={() => {
                                  setActiveTab(item.id);
                                  setMobileMenuOpen(false);
                               }}
                               className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                  activeTab === item.id 
                                  ? 'bg-primary text-white shadow-lg' 
                                  : 'bg-slate-50 text-slate-600'
                               }`}
                            >
                               <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-white/20' : 'bg-white'}`}>
                                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : item.color}`} />
                               </div>
                               <span className="font-bold">{item.label}</span>
                            </button>
                         ))}
                      </div>
                   </SheetContent>
                </Sheet>
             </div>

             {/* CONTENT AREA */}
             <motion.div 
                className="lg:col-span-9"
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
             >
                <Card className="p-4 sm:p-8 rounded-[40px] border-2 shadow-2xl bg-white/80 backdrop-blur-md">
                   <AnimatePresence mode="wait">
                      {activeTab === "ficha" && (
                         <motion.div key="ficha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <FichaClinica pacienteId={selectedPacienteId} />
                         </motion.div>
                      )}
                      {activeTab === "procedimentos" && (
                         <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <ProcedimentosPaciente pacienteId={selectedPacienteId} />
                         </motion.div>
                      )}
                      {activeTab === "odontograma" && (
                         <motion.div key="odont" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Odontograma pacienteId={selectedPacienteId} />
                         </motion.div>
                      )}
                      {activeTab === "ortodontia" && (
                         <motion.div key="orto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Ortodontia pacienteId={selectedPacienteId} />
                         </motion.div>
                      )}
                      {activeTab === "fotos" && (
                         <motion.div key="fotos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Fotos pacienteId={selectedPacienteId} />
                         </motion.div>
                      )}
                      {activeTab === "radiografias" && (
                         <motion.div key="radio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Radiografias pacienteId={selectedPacienteId} />
                         </motion.div>
                      )}
                      {activeTab === "receituario" && (
                         <motion.div key="receit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Receituario pacienteId={selectedPacienteId} />
                         </motion.div>
                      )}
                   </AnimatePresence>
                </Card>
             </motion.div>
          </div>
        )}

        <PacienteForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          paciente={editingPaciente}
          title={editingPaciente ? "Editar Paciente" : "Cadastro"}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o paciente "{pacienteToDelete?.nome}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </DashboardLayout>
  );
}