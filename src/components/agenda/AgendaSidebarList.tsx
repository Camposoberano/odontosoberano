import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Info, User } from "lucide-react";
import { Agendamento } from "@/hooks/useAgendamentos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AgendaSidebarListProps {
  selectedDate: Date;
  appointments: Agendamento[];
  loading: boolean;
  onAppointmentClick: (appointment: Agendamento) => void;
  getInitials: (name?: string) => string;
  getStatusColor: (status: string) => string;
}

export function AgendaSidebarList({ 
  selectedDate, 
  appointments, 
  loading, 
  onAppointmentClick,
  getInitials,
  getStatusColor
}: AgendaSidebarListProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b bg-slate-50/50">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Agenda do Dia</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {loading ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400">Carregando...</div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="w-8 h-8 mx-auto text-slate-200 mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase">Nenhum agendamento</p>
          </div>
        ) : (
          appointments.map((apt) => {
            const data = new Date(apt.data_agendamento);
            return (
              <div 
                key={apt.id} 
                onClick={() => onAppointmentClick(apt)}
                className="group relative p-3 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-slate-50">
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-black">
                      {getInitials(apt.pacientes?.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black text-slate-800 uppercase leading-snug group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                      {apt.pacientes?.nome || "Paciente"}
                    </p>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(data, "HH:mm")}
                      </span>
                      <Badge className={cn("text-[9px] font-black px-1.5 py-0 border-none", getStatusColor(apt.status))}>
                        {apt.status.split('-')[1] || apt.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-4 h-4 text-primary" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-3 bg-slate-50 border-t">
        <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest">
          {appointments.length} REGISTROS HOJE
        </p>
      </div>
    </div>
  );
}
