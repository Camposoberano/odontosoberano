import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agendamento } from "@/hooks/useAgendamentos";
import { cn } from "@/lib/utils";

interface AgendaWeekGridViewProps {
  selectedDate: Date;
  appointments: Agendamento[];
  onAppointmentClick: (appointment: Agendamento) => void;
  onAddClick: (date: Date, time: string) => void;
}

export function AgendaWeekGridView({ selectedDate, appointments, onAppointmentClick, onAddClick }: AgendaWeekGridViewProps) {
  const startOfSelectedWeek = startOfWeek(selectedDate, { locale: ptBR });
  const days = Array.from({ length: 6 }).map((_, i) => addDays(startOfSelectedWeek, i)); // Segunda a Sábado

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

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="p-3 w-20 border-r text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
            {days.map(day => (
              <th key={day.toString()} className="p-3 border-r min-w-[120px]">
                <p className="text-[10px] font-black text-slate-400 uppercase">{format(day, "EEEE", { locale: ptBR })}</p>
                <p className="text-sm font-black text-slate-800">{format(day, "dd/MM")}</p>
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
                      {dayApts.map(apt => (
                        <div 
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(apt);
                          }}
                          className="p-1 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-all"
                        >
                          <p className="text-[9px] font-black text-primary truncate uppercase">{apt.pacientes?.nome?.split(' ')[0]}</p>
                          <p className="text-[8px] opacity-70 truncate">{apt.procedimento}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
