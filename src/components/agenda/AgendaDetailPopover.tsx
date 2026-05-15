import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { 
  X, Info, Phone, Calendar, User, Clock, CheckCircle2, 
  Trash2, Edit, ClipboardList 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Agendamento } from "@/hooks/useAgendamentos";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";

interface AgendaDetailPopoverProps {
  agendamento: Agendamento;
  onClose: () => void;
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

const statusLevels = [
  { id: "1-Agendado", label: "Agendado", color: "bg-slate-400" },
  { id: "2-Confirmado", label: "Confirmado", color: "bg-emerald-500" },
  { id: "3-Em espera", label: "Em espera", color: "bg-amber-400" },
  { id: "4-Em atendimento", label: "Em atendimento", color: "bg-blue-500" },
  { id: "5-Atendido", label: "Atendido", color: "bg-green-600" },
  { id: "6-Atrasado", label: "Atrasado", color: "bg-red-500" },
  { id: "7-Faltou", label: "Faltou", color: "bg-slate-700" },
];

export function AgendaDetailPopover({ 
  agendamento, 
  onClose, 
  onEdit, 
  onDelete,
  onStatusChange 
}: AgendaDetailPopoverProps) {
  const data = new Date(agendamento.data_agendamento);
  const navigate = useNavigate();
  
  return (
    <div className="w-[320px] bg-white rounded-xl shadow-2xl border-2 border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Header com Status */}
      <div className="bg-slate-50 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</Label>
          <Select 
            value={agendamento.status} 
            onValueChange={(val) => onStatusChange(agendamento.id, val)}
          >
            <SelectTrigger className="h-8 w-auto px-2 border-none bg-white shadow-sm ring-0 focus:ring-0">
               <div className="flex items-center gap-2">
                 <div className={cn(
                    "w-3 h-3 rounded-full",
                    statusLevels.find(s => s.id === agendamento.status || s.label === agendamento.status)?.color || "bg-slate-300"
                 )} />
                 <span className="text-sm font-bold">{agendamento.status}</span>
               </div>
            </SelectTrigger>
            <SelectContent>
              {statusLevels.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", s.color)} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Info className="w-4 h-4 text-slate-400 cursor-help" />
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={onClose}>
          <X className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Agendado Para */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Agenda</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-slate-800">
              {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Profissional */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Profissional</p>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <p className="text-sm font-bold text-slate-800">
              {agendamento.dentistas?.nome || "Não atribuído"}
            </p>
          </div>
        </div>

        {/* Paciente */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Prontuário / Paciente</p>
          <p className="text-base font-black text-primary leading-tight">
            {agendamento.pacientes?.nome || "PACIENTE NÃO IDENTIFICADO"}
          </p>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
            <Phone className="w-3 h-3" />
            <span className="text-xs font-medium">{agendamento.pacientes?.telefone || "Sem telefone"}</span>
          </div>
        </div>

        {/* Horário */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-black text-slate-700">
              {format(data, "HH:mm")} - {format(new Date(data.getTime() + agendamento.duracao * 60000), "HH:mm")}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400">{agendamento.duracao} min</p>
        </div>

        {/* Check-in */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Check-in</p>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 p-2 rounded-md border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <p className="text-[11px] font-bold">
              {agendamento.checkin_responsavel || "Aguardando confirmação"}
            </p>
          </div>
        </div>

        {/* Procedimentos/Marcadores */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Procedimento / Marcadores</p>
          <p className="text-xs font-bold text-slate-700">{agendamento.procedimento}</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {Array.isArray(agendamento.marcadores) && agendamento.marcadores.map((m: any, idx: number) => (
              <Badge key={idx} variant="outline" className={cn("text-[10px] font-black px-2 py-0 border-none", m.cor)}>
                {m.nome.toUpperCase()}
              </Badge>
            ))}
            {!agendamento.marcadores?.length && (
              <span className="text-[10px] text-slate-400 italic">Sem marcadores atribuídos</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer com Ações */}
      <div className="p-3 bg-slate-50 border-t space-y-2">
        <Button 
          variant="medical" 
          className="w-full h-10 font-extrabold text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20"
          onClick={() => {
            navigate(`/patients?id=${agendamento.paciente_id}&tab=procedimentos`);
            onClose();
          }}
        >
          <ClipboardList className="w-4 h-4 mr-2" /> Ver Prontuário / OS
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs font-bold" onClick={() => onEdit(agendamento)}>
            <Edit className="w-3 h-3 mr-1" /> Editar
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-12 text-red-500 hover:bg-red-50" onClick={() => onDelete(agendamento.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
