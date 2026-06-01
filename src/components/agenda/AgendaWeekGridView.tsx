import { addDays, format, startOfWeek, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Agendamento } from "@/hooks/useAgendamentos";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AgendaWeekGridViewProps {
  selectedDate: Date;
  appointments: Agendamento[];
  onAppointmentClick: (appointment: Agendamento) => void;
  onAddClick: (date: Date, time: string) => void;
  dentistaColors?: Record<string, string>;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onGoToToday?: () => void;
}

export function AgendaWeekGridView({ selectedDate, appointments, onAppointmentClick, onAddClick, dentistaColors = {}, onPrevWeek, onNextWeek, onGoToToday }: AgendaWeekGridViewProps) {
  const startOfSelectedWeek = startOfWeek(selectedDate, { locale: ptBR });
  const days = Array.from({ length: 6 }).map((_, i) => addDays(startOfSelectedWeek, i));
  const semanaLabel = `${format(days[0], "dd/MM")} – ${format(days[5], "dd/MM/yyyy")}`;

  const timeSlots = [];
  for (let hour = 8; hour <= 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const getAppointmentsForDayAndTime = (day: Date, time: string) => {
    return appointments.filter(apt => {
        const aptDate = new Date(apt.data_agendamento);
        return format(aptDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd") && format(aptDate, "HH:mm") === time;
    });
  };

  const hojeNaSemana = days.some(d => isToday(d));

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
      {/* Header de navegação da semana */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <Button variant="ghost" size="icon" onClick={onPrevWeek} className="rounded-xl hover:bg-primary/10 hover:text-primary" disabled={!onPrevWeek}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <p className="text-base font-black text-slate-800 tracking-tight">Semana de {semanaLabel}</p>
          <p className="text-[11px] font-bold text-slate-400">{appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} na semana</p>
        </div>
        <div className="flex gap-1">
          {!hojeNaSemana && onGoToToday && (
            <Button variant="ghost" size="sm" onClick={onGoToToday} className="text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10 h-8 px-2 rounded-lg">
              <CalendarDays className="w-3.5 h-3.5 mr-1" />Hoje
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onNextWeek} className="rounded-xl hover:bg-primary/10 hover:text-primary" disabled={!onNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="p-3 w-20 border-r text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
            {days.map(day => (
              <th key={day.toString()} className={cn("p-3 border-r min-w-[120px]", isToday(day) && "bg-primary/5")}>
                <p className="text-[10px] font-black text-slate-400 uppercase">{format(day, "EEEE", { locale: ptBR })}</p>
                <p className={cn("text-sm font-black", isToday(day) ? "text-primary" : "text-slate-800")}>{format(day, "dd/MM")}</p>
                {isToday(day) && <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-black">HOJE</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time} className="border-b last:border-0 hover:bg-slate-50/30 transition-colors h-16">
              <td className="p-2 border-r text-center text-[11px] font-black text-slate-500 bg-slate-50/20">{time}</td>
              {days.map(day => {
                const dayApts = getAppointmentsForDayAndTime(day, time);
                return (
                  <td 
                    key={day.toString()} 
                    className="p-1 border-r relative align-top cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      if (dayApts.length === 0) {
                        onAddClick(day, time);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      {dayApts.map(apt => {
                        const cor = apt.dentista_id ? dentistaColors[apt.dentista_id] : undefined;
                        return (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(apt);
                          }}
                          style={cor ? { borderLeftColor: cor, borderLeftWidth: 3, backgroundColor: `${cor}18` } : {}}
                          className="p-1 rounded border border-primary/20 cursor-pointer hover:opacity-80 transition-all"
                        >
                          <p className="text-[9px] font-black truncate uppercase" style={cor ? { color: cor } : { color: "var(--primary)" }}>
                            {apt.pacientes?.nome?.split(' ')[0]}
                          </p>
                          <p className="text-[8px] opacity-70 truncate">{apt.procedimento}</p>
                        </div>
                        );
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
