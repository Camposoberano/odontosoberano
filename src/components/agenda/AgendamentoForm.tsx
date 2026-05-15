import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Agendamento, useAgendamentos } from "@/hooks/useAgendamentos";
import { usePacientes } from "@/hooks/usePacientes";
import { useDentistas } from "@/hooks/useDentistas";
import { useConvenios } from "@/hooks/useConvenios";
import { MarcadoresSelector } from "./MarcadoresSelector";
import { Badge } from "@/components/ui/badge";

interface AgendamentoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  agendamento?: Agendamento | null;
}

export function AgendamentoForm({ open, onOpenChange, onSubmit, agendamento }: AgendamentoFormProps) {
  const { pacientes, refetch: refetchPacientes } = usePacientes();
  const { dentistas, refetch: refetchDentistas } = useDentistas();
  const { convenios, refetch: refetchConvenios } = useConvenios();
  const { fetchAgendamentos } = useAgendamentos();

  const [formData, setFormData] = useState({
    paciente_id: "",
    dentista_id: "",
    data_agendamento: new Date(),
    hora: "09:00",
    duracao: 30,
    procedimento: "",
    tipo_atendimento: "Consulta",
    status: "Agendado",
    convenio_id: "particular",
    observacoes: "",
    confirmado: false,
    marcadores: [] as any[],
    checkin_responsavel: "",
  });

  useEffect(() => {
    if (open) {
      refetchPacientes();
      refetchDentistas();
      refetchConvenios();
    }
  }, [open]);

  // Buscar agendamentos quando a data mudar
  useEffect(() => {
    if (formData.data_agendamento) {
      const startOfDay = new Date(formData.data_agendamento);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(formData.data_agendamento);
      endOfDay.setHours(23, 59, 59, 999);
      fetchAgendamentos(startOfDay, endOfDay);
    }
  }, [formData.data_agendamento, formData.dentista_id]);

  useEffect(() => {
    if (agendamento) {
      const dataAgendamento = new Date(agendamento.data_agendamento);
      setFormData({
        paciente_id: agendamento.paciente_id,
        dentista_id: agendamento.dentista_id || "",
        data_agendamento: dataAgendamento,
        hora: format(dataAgendamento, "HH:mm"),
        duracao: agendamento.duracao,
        procedimento: agendamento.procedimento,
        tipo_atendimento: agendamento.tipo_atendimento,
        status: agendamento.status,
        convenio_id: agendamento.convenio_id || "particular",
        observacoes: agendamento.observacoes || "",
        confirmado: agendamento.confirmado,
        marcadores: Array.isArray(agendamento.marcadores) ? agendamento.marcadores : [],
        checkin_responsavel: agendamento.checkin_responsavel || "",
      });
    } else {
      setFormData({
        paciente_id: "",
        dentista_id: "",
        data_agendamento: new Date(),
        hora: "09:00",
        duracao: 30,
        procedimento: "",
        tipo_atendimento: "Consulta",
        status: "Agendado",
        convenio_id: "particular",
        observacoes: "",
        confirmado: false,
        marcadores: [],
        checkin_responsavel: "",
      });
    }
  }, [agendamento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const [hour, minute] = formData.hora.split(':');
    const dataAgendamento = new Date(formData.data_agendamento);
    dataAgendamento.setHours(parseInt(hour), parseInt(minute), 0, 0);

    const { hora, ...dataToSubmit } = formData;

    const submitData = {
      ...dataToSubmit,
      dentista_id: formData.dentista_id || null,
      paciente_id: formData.paciente_id || null,
      convenio_id: (formData.convenio_id === "particular" || !formData.convenio_id) ? null : formData.convenio_id,
      data_agendamento: dataAgendamento.toISOString(),
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter">
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Preencha os dados abaixo para confirmar a reserva de horário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="paciente_id">Paciente *</Label>
              <Select value={formData.paciente_id} onValueChange={(value) => setFormData({ ...formData, paciente_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="dentista_id">Dentista *</Label>
              <Select value={formData.dentista_id} onValueChange={(value) => setFormData({ ...formData, dentista_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.map((dentista) => (
                    <SelectItem key={dentista.id} value={dentista.id}>
                      {dentista.nome} - {dentista.especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_agendamento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {formData.data_agendamento ? format(formData.data_agendamento, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_agendamento}
                    onSelect={(date) => date && setFormData({ ...formData, data_agendamento: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Horário *</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao">Duração (min) *</Label>
              <Input
                id="duracao"
                type="number"
                min="15"
                step="15"
                value={formData.duracao}
                onChange={(e) => setFormData({ ...formData, duracao: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_atendimento">Tipo de Atendimento *</Label>
              <Select value={formData.tipo_atendimento} onValueChange={(value) => setFormData({ ...formData, tipo_atendimento: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                  <SelectItem value="Emergência">Emergência</SelectItem>
                  <SelectItem value="Procedimento">Procedimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="procedimento">Procedimento *</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {["PPR", "PT", "Protocolo Definitivo", "Protocolo Provisório", "Bruxismo", "Limpeza"].map((proc) => (
                  <Badge 
                    key={proc} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors border-primary/20 text-[10px] font-black uppercase tracking-tighter"
                    onClick={() => setFormData({ ...formData, procedimento: proc })}
                  >
                    {proc}
                  </Badge>
                ))}
              </div>
              <Input
                id="procedimento"
                value={formData.procedimento}
                onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                placeholder="Ex: Limpeza, Obturação, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-Agendado">1-Agendado</SelectItem>
                  <SelectItem value="2-Confirmado">2-Confirmado</SelectItem>
                  <SelectItem value="3-Em espera">3-Em espera</SelectItem>
                  <SelectItem value="4-Em atendimento">4-Em atendimento</SelectItem>
                  <SelectItem value="5-Atendido">5-Atendido</SelectItem>
                  <SelectItem value="6-Atrasado">6-Atrasado</SelectItem>
                  <SelectItem value="7-Faltou">7-Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="convenio_id">Convênio</Label>
              <Select value={formData.convenio_id} onValueChange={(value) => setFormData({ ...formData, convenio_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Particular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  {convenios.map((convenio) => (
                    <SelectItem key={convenio.id} value={convenio.id}>
                      {convenio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Marcadores / Etiquetas</Label>
              <MarcadoresSelector 
                selectedMarcadores={formData.marcadores}
                onChange={(marcadores) => setFormData({ ...formData, marcadores })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {agendamento ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
