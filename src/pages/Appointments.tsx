import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Plus, Phone, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Search, Filter, Clock, Info
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useAgendamentos } from "@/hooks/useAgendamentos";
import { usePacientes } from "@/hooks/usePacientes";
import { useDentistas } from "@/hooks/useDentistas";
import { AgendamentoForm } from "@/components/agenda/AgendamentoForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { AgendaDayView } from "@/components/agenda/AgendaDayView";
import { AgendaDetailPopover } from "@/components/agenda/AgendaDetailPopover";
import { AgendaWeekGridView } from "@/components/agenda/AgendaWeekGridView";
import { AgendaSidebarList } from "@/components/agenda/AgendaSidebarList";



const statusOptions = ["Todos", "Agendado", "Confirmado", "Realizado", "Cancelado", "Faltou"];

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  
  // Filtros
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [dentistaFilter, setDentistaFilter] = useState("Todos");
  const [pacienteFilter, setPacienteFilter] = useState("Todos");
  const [procedimentoFilter, setProcedimentoFilter] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditingAgendamento(null);
      setDialogOpen(true);
      
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);
  
  const { agendamentos, loading, fetchAgendamentos, createAgendamento, updateAgendamento, deleteAgendamento, confirmarAgendamento } = useAgendamentos();
  const { pacientes } = usePacientes();
  const { dentistas } = useDentistas();

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    fetchAgendamentos(start, end);
  }, [currentMonth]);

  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(appointment => {
      const matchStatus = statusFilter === "Todos" || appointment.status === statusFilter;
      const matchDentista = dentistaFilter === "Todos" || appointment.dentista_id === dentistaFilter;
      const matchPaciente = pacienteFilter === "Todos" || appointment.paciente_id === pacienteFilter;
      const matchProcedimento = !procedimentoFilter || 
        appointment.procedimento.toLowerCase().includes(procedimentoFilter.toLowerCase());
      
      return matchStatus && matchDentista && matchPaciente && matchProcedimento;
    });
  }, [agendamentos, statusFilter, dentistaFilter, pacienteFilter, procedimentoFilter]);

  const selectedDayAppointments = useMemo(() => {
    return filteredAgendamentos.filter(appointment => 
      isSameDay(new Date(appointment.data_agendamento), selectedDate)
    ).sort((a, b) => 
      new Date(a.data_agendamento).getTime() - new Date(b.data_agendamento).getTime()
    );
  }, [filteredAgendamentos, selectedDate]);

  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, typeof filteredAgendamentos>();
    filteredAgendamentos.forEach(appointment => {
      const dateKey = format(new Date(appointment.data_agendamento), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(appointment);
    });
    return grouped;
  }, [filteredAgendamentos]);

  const limparFiltros = () => {
    setStatusFilter("Todos");
    setDentistaFilter("Todos");
    setPacienteFilter("Todos");
    setProcedimentoFilter("");
  };

  const handleSubmit = async (data: any) => {
    if (editingAgendamento && (editingAgendamento as any).id) {
      await updateAgendamento((editingAgendamento as any).id, data);
    } else {
      await createAgendamento(data);
    }
  };

  const handleAddClick = (dateOrTime: string | Date, timeStr?: string) => {
    let dateWithTime: Date;
    
    if (typeof dateOrTime === 'string') {
      const [hours, minutes] = dateOrTime.split(':').map(Number);
      dateWithTime = new Date(selectedDate);
      dateWithTime.setHours(hours, minutes, 0, 0);
    } else {
      dateWithTime = new Date(dateOrTime);
      if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        dateWithTime.setHours(hours, minutes, 0, 0);
      } else {
        dateWithTime.setHours(9, 0, 0, 0);
      }
    }
    
    setEditingAgendamento({
      data_agendamento: dateWithTime.toISOString(),
      duracao: 30,
      status: "1-Agendado",
      paciente_id: "",
      procedimento: "",
      tipo_atendimento: "Consulta",
      confirmado: false,
      marcadores: []
    } as any);
    setDialogOpen(true);
  };

  const handleEdit = (agendamento: any) => {

    setEditingAgendamento(agendamento);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleShowDetail = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setDetailOpen(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateAgendamento(id, { status });
    if (selectedAgendamento?.id === id) {
      setSelectedAgendamento({ ...selectedAgendamento, status });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAgendamento(deleteId);
      setDeleteId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "1-Agendado": return "bg-slate-100 text-slate-600 border-slate-200";
      case "2-Confirmado": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "3-Em espera": return "bg-amber-50 text-amber-700 border-amber-200";
      case "4-Em atendimento": return "bg-blue-50 text-blue-700 border-blue-200";
      case "5-Atendido": return "bg-green-50 text-green-700 border-green-200";
      case "6-Atrasado": return "bg-red-50 text-red-700 border-red-200";
      case "7-Faltou": return "bg-slate-200 text-slate-800 border-slate-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const containerVariants: Variants = {

    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-4 sm:space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">Visualize e gerencie seus agendamentos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 sm:flex-initial" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" /> Filtros
            </Button>
            <Button variant="medical" className="flex-1 sm:flex-initial" onClick={() => { setEditingAgendamento(null); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Novo
            </Button>
          </div>
        </motion.div>

        {showFilters && (
          <motion.div variants={itemVariants} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <Filter className="w-5 h-5 mr-2 text-primary" /> Filtros
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={limparFiltros}>Limpar</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dentista</label>
                    <Select value={dentistaFilter} onValueChange={setDentistaFilter}>
                      <SelectTrigger><SelectValue placeholder="Selecione o dentista" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        {dentistas.map(dentista => (
                          <SelectItem key={dentista.id} value={dentista.id}>{dentista.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Paciente</label>
                    <Select value={pacienteFilter} onValueChange={setPacienteFilter}>
                      <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        {pacientes.map(paciente => (
                          <SelectItem key={paciente.id} value={paciente.id}>{paciente.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Procedimento</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar procedimento..." value={procedimentoFilter} onChange={(e) => setProcedimentoFilter(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full lg:w-3/4 space-y-6">
            <Tabs defaultValue="day" className="w-full">
              <div className="flex items-center justify-start mb-4 overflow-x-auto no-scrollbar">
                <TabsList className="bg-slate-100/50 p-1 rounded-xl">
                  <TabsTrigger value="day" className="font-bold">Dia</TabsTrigger>
                  <TabsTrigger value="week" className="font-bold">Semana</TabsTrigger>
                  <TabsTrigger value="month" className="font-bold">Mês</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="day" className="mt-0">
                 <motion.div variants={itemVariants}>
                    <AgendaDayView
                      selectedDate={selectedDate}
                      appointments={selectedDayAppointments}
                      onAppointmentClick={handleShowDetail}
                      onAddClick={handleAddClick}
                    />
                 </motion.div>
              </TabsContent>

              <TabsContent value="week" className="mt-0">
                 <motion.div variants={itemVariants}>
                    <AgendaWeekGridView 
                      selectedDate={selectedDate}
                      appointments={filteredAgendamentos}
                      onAppointmentClick={handleShowDetail}
                      onAddClick={(date, time) => handleAddClick(date, time)}
                    />
                 </motion.div>
              </TabsContent>

              <TabsContent value="month" className="mt-0">
                <motion.div variants={itemVariants}>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Calendário de Agendamentos</CardTitle>
                      <CardDescription>{filteredAgendamentos.length} agendamento(s) este mês</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <Calendar
                        mode="single" selected={selectedDate} 
                        onSelect={(date) => {
                          if (date) {
                            if (isSameDay(date, selectedDate)) {
                              handleAddClick(date);
                            }
                            setSelectedDate(date);
                          }
                        }}
                        onMonthChange={setCurrentMonth} month={currentMonth} locale={ptBR}
                        className="rounded-md border pointer-events-auto"
                        modifiers={{ hasAppointments: (day) => appointmentsByDay.has(format(day, 'yyyy-MM-dd')) }}
                        modifiersClassNames={{ hasAppointments: "has-appointments" }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="w-full lg:w-1/4 h-full sticky top-6">
            <motion.div variants={itemVariants} className="h-[calc(100vh-180px)]">
              <AgendaSidebarList 
                selectedDate={selectedDate}
                appointments={selectedDayAppointments}
                loading={loading}
                onAppointmentClick={handleShowDetail}
                getInitials={getInitials}
                getStatusColor={getStatusColor}
              />
            </motion.div>
          </aside>
        </div>


        {/* Modal de Detalhes */}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[320px]">
            {selectedAgendamento && (
              <AgendaDetailPopover 
                agendamento={selectedAgendamento}
                onClose={() => setDetailOpen(false)}
                onEdit={handleEdit}
                onDelete={(id) => { setDeleteId(id); setDetailOpen(false); }}
                onStatusChange={handleStatusChange}
              />
            )}
          </DialogContent>
        </Dialog>

        <AgendamentoForm open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} agendamento={editingAgendamento} />


        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </DashboardLayout>
  );
}
