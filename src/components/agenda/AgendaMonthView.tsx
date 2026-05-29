import { useMemo } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameDay, isSameMonth, isToday, isBefore, startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Agendamento } from "@/hooks/useAgendamentos";

interface Props {
  selectedDate: Date;
  currentMonth: Date;
  appointments: Agendamento[];
  dentistaColors: Record<string, string>;
  dentistas: Array<{ id: string; nome: string; cor?: string | null }>;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onAddClick: (date: Date) => void;
}

const STATUS_DOT: Record<string, string> = {
  "1-Agendado": "bg-slate-400",
  "2-Confirmado": "bg-emerald-500",
  "3-Em espera": "bg-amber-500",
  "4-Em atendimento": "bg-blue-500",
  "5-Atendido": "bg-green-600",
  "6-Atrasado": "bg-red-500",
  "7-Faltou": "bg-slate-600",
};

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function AgendaMonthView({
  selectedDate, currentMonth, appointments, dentistaColors, dentistas,
  onSelectDate, onMonthChange, onAddClick,
}: Props) {
  // Gerar grade de semanas
  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) { days.push(d); d = addDays(d, 1); }
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
  }, [currentMonth]);

  // Agendamentos por dia
  const byDay = useMemo(() => {
    const m = new Map<string, Agendamento[]>();
    appointments.forEach(apt => {
      const key = format(new Date(apt.data_agendamento), "yyyy-MM-dd");
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(apt);
    });
    return m;
  }, [appointments]);

  const prevMonth = () => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="bg-white rounded-[28px] border-2 border-slate-100 shadow-xl overflow-hidden">
      {/* Header do calendário */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl hover:bg-primary/10 hover:text-primary">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <p className="text-xl font-black text-slate-800 capitalize tracking-tight">
            {format(currentMonth, "MMMM", { locale: ptBR })}
          </p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {format(currentMonth, "yyyy")} · {appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl hover:bg-primary/10 hover:text-primary">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Legenda dentistas */}
      {dentistas.filter(d => dentistaColors[d.id]).length > 0 && (
        <div className="px-6 py-2 border-b border-slate-50 flex items-center gap-4 flex-wrap">
          {dentistas.map(d => (
            <div key={d.id} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: dentistaColors[d.id] ?? '#6366f1' }} />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {d.nome.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cabeçalho dias da semana */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DIAS_SEMANA.map(dia => (
          <div key={dia} className="py-2.5 text-center">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              dia === "Dom" ? "text-red-400" : "text-slate-400"
            )}>{dia}</span>
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="divide-y divide-slate-50">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-slate-50">
            {week.map((day, di) => {
              const key = format(day, "yyyy-MM-dd");
              const dayApts = byDay.get(key) ?? [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = isSameDay(day, selectedDate);
              const past = isBefore(startOfDay(day), startOfDay(new Date())) && !today;

              return (
                <div
                  key={key}
                  onClick={() => { onSelectDate(day); }}
                  className={cn(
                    "min-h-[100px] p-2 cursor-pointer transition-all duration-150 relative group",
                    !inMonth && "bg-slate-50/40",
                    today && "bg-primary/5",
                    selected && !today && "bg-indigo-50/60",
                    !today && !selected && inMonth && "hover:bg-slate-50",
                  )}
                >
                  {/* Número do dia */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-full text-xs font-black transition-all",
                      today && "bg-primary text-white shadow-md shadow-primary/30",
                      selected && !today && "bg-indigo-500 text-white",
                      !today && !selected && !inMonth && "text-slate-300",
                      !today && !selected && inMonth && past && "text-slate-400",
                      !today && !selected && inMonth && !past && "text-slate-700",
                    )}>
                      {format(day, "d")}
                    </span>
                    {/* Botão + ao hover */}
                    {inMonth && (
                      <button
                        onClick={e => { e.stopPropagation(); onAddClick(day); }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-opacity hover:bg-primary hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Agendamentos do dia */}
                  <div className="space-y-0.5">
                    {dayApts.slice(0, 3).map((apt, ai) => {
                      const color = dentistaColors[apt.dentista_id ?? ''] ?? '#6366f1';
                      const hora = format(new Date(apt.data_agendamento), "HH:mm");
                      const nome = apt.paciente?.nome?.split(' ')[0] ?? '?';
                      return (
                        <div
                          key={apt.id}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-white text-[10px] font-bold truncate cursor-pointer hover:brightness-90 transition-all"
                          style={{ backgroundColor: color }}
                          title={`${hora} — ${apt.paciente?.nome ?? '?'} — ${apt.procedimento}`}
                        >
                          <span className="shrink-0">{hora}</span>
                          <span className="truncate">{nome}</span>
                        </div>
                      );
                    })}
                    {dayApts.length > 3 && (
                      <div className="text-[10px] font-bold text-slate-400 pl-1">
                        +{dayApts.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
