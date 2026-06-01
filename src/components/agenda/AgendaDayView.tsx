import { format, isSameDay, startOfDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Plus, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

import { Agendamento } from "@/hooks/useAgendamentos";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AgendaDayViewProps {
  selectedDate: Date;
  appointments: Agendamento[];
  onAppointmentClick: (appointment: Agendamento) => void;
  onAddClick: (time: string) => void;
  dentistaColors?: Record<string, string>;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onGoToToday?: () => void;
  dentistaLabel?: string; // se undefined = visão geral
}


const statusColors: Record<string, string> = {
  "1-Agendado": "bg-slate-100 border-slate-200 text-slate-600",
  "2-Confirmado": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "3-Em espera": "bg-amber-50 border-amber-200 text-amber-700",
  "4-Em atendimento": "bg-blue-50 border-blue-200 text-blue-700",
  "5-Atendido": "bg-green-50 border-green-200 text-green-700",
  "6-Atrasado": "bg-red-50 border-red-200 text-red-700",
  "7-Faltou": "bg-slate-200 border-slate-300 text-slate-800",
};

export function AgendaDayView({ selectedDate, appointments, onAppointmentClick, onAddClick, dentistaColors = {}, onPrevDay, onNextDay, onGoToToday, dentistaLabel }: AgendaDayViewProps) {
  const hoje = isToday(selectedDate);
  const diaNome = format(selectedDate, "EEEE", { locale: ptBR });
  const diaData = format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Gerar slots de 30 minutos das 08:00 às 19:00
  const timeSlots = [];
  for (let hour = 8; hour <= 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const appointmentsByTime = appointments.reduce((acc, apt) => {
    const time = format(new Date(apt.data_agendamento), "HH:mm");
    if (!acc[time]) acc[time] = [];
    acc[time].push(apt);
    return acc;
  }, {} as Record<string, Agendamento[]>);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
      {/* Header de navegação */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <Button variant="ghost" size="icon" onClick={onPrevDay} className="rounded-xl hover:bg-primary/10 hover:text-primary" disabled={!onPrevDay}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2">
            <p className={cn("text-base font-black capitalize tracking-tight", hoje && "text-primary")}>
              {hoje ? "Hoje — " : ""}{diaNome}, {diaData}
            </p>
            {hoje && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">hoje</span>}
          </div>
          {dentistaLabel && (
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">{dentistaLabel}</p>
          )}
          <p className="text-[11px] font-bold text-slate-400 mt-0.5">{appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-1">
          {!hoje && onGoToToday && (
            <Button variant="ghost" size="sm" onClick={onGoToToday} className="text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10 h-8 px-2 rounded-lg">
              <CalendarDays className="w-3.5 h-3.5 mr-1" />Hoje
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onNextDay} className="rounded-xl hover:bg-primary/10 hover:text-primary" disabled={!onNextDay}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {timeSlots.map((time) => {
          const slotAppointments = appointmentsByTime[time] || [];
          
          return (
            <div key={time} className="flex group min-h-[80px]">
              {/* Coluna de Horário */}
              <div className="w-20 sm:w-24 p-4 bg-slate-50/50 flex flex-col items-center justify-center border-r border-slate-100 shrink-0">
                <span className="text-sm font-black text-slate-500">{time}</span>
                <div className="w-1 h-1 bg-slate-200 rounded-full mt-1 group-hover:bg-primary transition-colors" />
              </div>

              {/* Coluna de Conteúdo */}
              <div 
                className="flex-1 p-2 flex gap-2 overflow-x-auto cursor-pointer"
                onClick={(e) => {
                  if (slotAppointments.length === 0) {
                     onAddClick(time);
                  }
                }}
              >
                {slotAppointments.length > 0 ? (
                  slotAppointments.map((apt) => {
                    const dentistaCor = apt.dentista_id ? dentistaColors[apt.dentista_id] : undefined;
                    return (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                      style={dentistaCor ? { borderLeftColor: dentistaCor, borderLeftWidth: 4 } : {}}
                      className={cn(
                        "flex-1 min-w-[200px] max-w-[400px] p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-95 flex flex-col justify-between",
                        statusColors[apt.status] || "bg-slate-50 border-slate-200"
                      )}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-black text-base uppercase truncate leading-none text-slate-900 tracking-tight">
                            {apt.pacientes?.nome || "Paciente"}
                          </p>

                          <Badge variant="outline" className="text-[9px] font-black h-4 px-1 border-current opacity-70">
                            {apt.duracao}M
                          </Badge>
                        </div>
                        <p className="text-[11px] font-bold opacity-80 flex items-center gap-1">
                           <Clock className="w-3 h-3" /> {apt.procedimento}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 opacity-60" />
                          <span className="text-[10px] font-black truncate max-w-[100px]">
                            {apt.dentistas?.nome || "PROFISSIONAL"}
                          </span>
                        </div>
                        
                        <div className="flex gap-0.5">
                          {Array.isArray(apt.marcadores) && apt.marcadores.slice(0, 2).map((m: any, i) => (
                             <div key={i} className={cn("w-2 h-2 rounded-full", m.cor)} title={m.nome} />
                          ))}
                        </div>
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[10px] font-black text-primary/40 uppercase flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Adicionar horário
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
