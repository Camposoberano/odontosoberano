import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Calendar, Plus, ExternalLink, User, Activity } from 'lucide-react';
import { useAllProcedimentos } from '@/hooks/useProcedimentoGenerico';
import { usePacientes } from '@/hooks/usePacientes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProcedimentosPacienteProps {
  pacienteId: string;
}

export function ProcedimentosPaciente({ pacienteId }: ProcedimentosPacienteProps) {
  const navigate = useNavigate();
  const { data: todosProcedimentos, isLoading } = useAllProcedimentos();
  const { pacientes } = usePacientes();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Filtrar procedimentos do paciente selecionado por ID ou Nome
  const procedimentosFiltrados = useMemo(() => {
    return todosProcedimentos?.filter(p => {
        const matchPaciente = p.paciente_id === pacienteId || 
          (pacientes.find(pac => pac.id === pacienteId)?.nome.toLowerCase() === p.nome_paciente.toLowerCase());

        const matchStatus = filtroStatus === 'todos' || p.status_geral === filtroStatus;

        const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo;

        return matchPaciente && matchStatus && matchTipo;
    }) || [];
  }, [todosProcedimentos, pacienteId, filtroStatus, filtroTipo, pacientes]);

  const getCorResponsavelCard = (responsavel: string): string => {
    const norm = responsavel?.toUpperCase();
    switch (norm) {
      case 'DENTISTA':
      case 'DOUTOR':
        return 'bg-blue-50 border-blue-400 text-blue-800';
      case 'PROTETICO':
      case 'LABORATORIO':
        return 'bg-orange-50 border-orange-400 text-orange-800';
      case 'SECRETARIA':
        return 'bg-purple-50 border-purple-400 text-purple-800';
      default:
        return 'bg-slate-100 border-slate-400 text-slate-800';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Concluído':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          card: 'border-slate-100 hover:border-emerald-300 shadow-emerald-900/5',
          icon: 'text-emerald-500',
          bar: 'bg-emerald-500'
        };
      case 'Em andamento':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          card: 'border-slate-100 hover:border-blue-300 shadow-blue-900/5',
          icon: 'text-blue-500',
          bar: 'bg-blue-500'
        };
      case 'Pendente':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          card: 'border-slate-100 hover:border-amber-300 shadow-amber-900/5',
          icon: 'text-amber-500',
          bar: 'bg-amber-500'
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          card: 'border-slate-100 hover:border-slate-300 shadow-slate-900/5',
          icon: 'text-slate-500',
          bar: 'bg-slate-500'
        };
    }
  };

  const handleVerEtapas = (proc: any) => {
    const slug = proc.tipo.toLowerCase().replace(/\s/g, '-');
    navigate(`/procedimentos/${slug}/${proc.id}`);
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
                <ClipboardList className="w-8 h-8 text-primary animate-pulse" />
                <p className="text-gray-500 font-black uppercase text-xs tracking-widest leading-loose text-center">CARREGANDO HISTÓRICO DE ATENDIMENTOS...</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-black italic tracking-tighter">
                <ClipboardList className="w-7 h-7 text-primary" />
                Prontuário de Atendimentos
              </CardTitle>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Visualização consolidada de todos os procedimentos
              </p>
            </div>
            <Button onClick={() => navigate('/procedimentos')} className="rounded-xl font-black uppercase text-xs tracking-widest h-11 px-6 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Novo Atendimento
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Procedimento</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="h-11 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="todos">Todos os Tipos (15)</SelectItem>
                  <SelectItem value="PPR">PPR</SelectItem>
                  <SelectItem value="PT">Prótese Total</SelectItem>
                  <SelectItem value="PM">Ponte Móvel</SelectItem>
                  <SelectItem value="PROTOCOLO DEFINITIVO">Protocolo Definitivo</SelectItem>
                  <SelectItem value="PROTOCOLO PROVISORIO">Protocolo Provisório</SelectItem>
                  <SelectItem value="FIXA DE CERÂMICA">Fixa de Cerâmica</SelectItem>
                  <SelectItem value="FIXA IMPRESSA">Fixa Impressa</SelectItem>
                  <SelectItem value="ADESIVA">Adesiva</SelectItem>
                  <SelectItem value="COROA SOBRE IMPLANTE">Coroa Sob Implante</SelectItem>
                  <SelectItem value="FIXA DE ZIRCÔNIA">Fixa de Zircônia</SelectItem>
                  <SelectItem value="RESTAURAÇÃO INDIRETA">Restauração Indireta</SelectItem>
                  <SelectItem value="CLAREAMENTO">Clareamento</SelectItem>
                  <SelectItem value="PLACA DE BRUXISMO">Placa de Bruxismo</SelectItem>
                  <SelectItem value="LAB EXTERNO">Laboratório Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Geral</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="h-11 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="todos text-slate-500">Todos os Status</SelectItem>
                  <SelectItem value="Pendente" className="text-yellow-600">Pendente</SelectItem>
                  <SelectItem value="Em andamento" className="text-blue-600">Em andamento</SelectItem>
                  <SelectItem value="Concluído" className="text-green-600">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Localizado</label>
              <div className="flex items-center justify-center h-11 bg-slate-100 rounded-xl border-2 border-slate-200">
                <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                  {procedimentosFiltrados.length} Registros
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Procedimentos */}
      {procedimentosFiltrados.length === 0 ? (
        <div className="py-20 text-center space-y-6 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-200">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
            <ClipboardList className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-400 italic">Histórico Vazio</h3>
            <p className="text-slate-400 font-bold max-w-xs mx-auto text-xs uppercase tracking-widest leading-relaxed">
               Nenhum atendimento registrado para este paciente até o momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedimentosFiltrados.map((proc) => {
            const styles = getStatusStyles(proc.status_geral);
            return (
              <Card 
                key={proc.id} 
                className={cn(
                  "group relative border-2 transition-all rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-white h-full flex flex-col pt-2",
                  styles.card
                )}
                onClick={() => handleVerEtapas(proc)}
              >
                {/* Visual Accent (opcional, mantendo sutileza) */}
                <div className={cn("absolute top-0 left-0 w-full h-1 opacity-20", styles.bar)} />

                <CardHeader className="pb-3 pt-4 px-6">
                  {/* Linha 1: OS Badge Laranja e Tipo */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-orange-600 text-white text-[12px] font-black px-4 py-1.5 rounded-[12px] uppercase tracking-wider shadow-md shadow-orange-500/20">
                      #{proc.ordem_servico || 'S/N'}
                    </span>
                    <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-slate-100">
                      {proc.tipo}
                    </span>
                  </div>

                  {/* Linha 2: Paciente */}
                  <CardTitle className="text-xl font-black text-gray-900 leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {proc.nome_paciente}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-0 px-6 flex-1 flex flex-col pb-6">
                  {/* Box de Próxima Etapa - Estilo Dashboard Pontilhado */}
                  {proc.proxima_etapa && proc.status_geral !== 'Concluído' ? (
                    <div className={cn(
                      "p-4 rounded-[24px] border-2 border-dashed flex flex-col gap-1 transition-all",
                      getCorResponsavelCard(proc.proxima_etapa_responsavel || 'SECRETARIA')
                    )}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Próxima Etapa</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Ação necessária</span>
                        </div>
                      </div>
                      <p className="font-black text-[15px] uppercase leading-tight tracking-tight">{proc.proxima_etapa}</p>
                      <p className="text-[10px] font-extrabold opacity-70 uppercase italic tracking-tighter">
                        Responsável: {proc.proxima_etapa_responsavel}
                      </p>
                    </div>
                  ) : (
                    <div className="h-[80px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[24px] opacity-40">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procedimento Concluído</span>
                    </div>
                  )}

                  {/* Rodapé: Datas e Status */}
                  <div className="flex justify-between items-end pt-4 border-t border-slate-50 mt-auto">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Previsão / Entrega</span>
                      <p className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {proc.data_entrega 
                          ? format(new Date(proc.data_entrega), 'dd/MM/yyyy', { locale: ptBR }) 
                          : proc.data_inicial ? format(new Date(proc.data_inicial), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Situação</span>
                       <Badge className={cn("rounded-lg font-black text-[10px] uppercase tracking-tighter px-3 h-7 border-none shadow-sm", styles.badge)}>
                        {proc.status_geral}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
