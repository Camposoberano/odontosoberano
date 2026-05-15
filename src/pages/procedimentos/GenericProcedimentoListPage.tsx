import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Filter, Plus, ClipboardList, Calendar, User, Home, ArrowLeft, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProcedimentosByType, ETAPAS_POR_TIPO, NOME_POR_TIPO } from '@/hooks/useProcedimentoGenerico';
import { StatusProcedimento, TipoExecutor } from '@/types/procedimentos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  tipoOverride?: string;
}

export default function GenericProcedimentoListPage({ tipoOverride }: Props) {
  const navigate = useNavigate();
  const { tipo: tipoParam } = useParams();
  
  // Determinar o tipo do procedimento (pela URL ou prop)
  const tipo = (tipoOverride || tipoParam?.toLowerCase() || '') as string;
  const nomeExibicao = NOME_POR_TIPO[tipo] || 'Procedimentos';
  
  const { data: procedimentos, isLoading } = useProcedimentosByType(tipo as any);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const etapas = ETAPAS_POR_TIPO[tipo] || [];

  // Função para obter a última modificação
  const getUltimaModificacao = (proc: any) => {
    let ultimaData: Date | null = null;
    let ultimaEtapa: any = null;
    let executadoPor = '';
    let executadoEm: string | null = null;

    for (const etapa of etapas) {
      const dataExecucao = proc[`${etapa.key}_executado_em`];
      if (dataExecucao) {
        const data = new Date(dataExecucao);
        if (!ultimaData || data > ultimaData) {
          ultimaData = data;
          ultimaEtapa = etapa;
          executadoPor = proc[`${etapa.key}_executado_por`] || '';
          executadoEm = dataExecucao;
        }
      }
    }

    return ultimaEtapa ? { label: ultimaEtapa.label, responsavel: ultimaEtapa.responsavel, executadoPor, executadoEm } : null;
  };

  const procedimentosFiltrados = useMemo(() => {
    const filtered = filtroStatus === 'todos'
      ? procedimentos
      : procedimentos?.filter((p) => p.status_geral === filtroStatus);

    if (!filtered) return [];

    return [...filtered].sort((a, b) => {
      const ultimaA = getUltimaModificacao(a);
      const ultimaB = getUltimaModificacao(b);
      if (!ultimaA?.executadoEm && !ultimaB?.executadoEm) return Number(b.ordem_servico) - Number(a.ordem_servico);
      if (!ultimaA?.executadoEm) return 1;
      if (!ultimaB?.executadoEm) return -1;
      return new Date(ultimaB.executadoEm).getTime() - new Date(ultimaA.executadoEm).getTime();
    });
  }, [procedimentos, filtroStatus, tipo]);

  const getCorResponsavelCard = (responsavel: TipoExecutor) => {
    switch (responsavel) {
      case 'DENTISTA': return 'bg-blue-50 border-blue-300 text-blue-800';
      case 'PROTETICO': return 'bg-orange-50 border-orange-300 text-orange-800';
      case 'SECRETARIA': return 'bg-green-50 border-green-300 text-green-800';
      default: return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const slug = tipo.toLowerCase().replace(/ /g, '-');

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2 border-2">
            <Home className="w-4 h-4" />
            <span>Início</span>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border-l-8 border-primary shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-primary rounded-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              {nomeExibicao}
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              📊 {procedimentos?.length || 0} procedimento(s) encontrados
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-primary" />
          <span className="font-bold">Filtrar:</span>
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-[250px] border-2">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">📋 Todos</SelectItem>
            <SelectItem value="Pendente">⏳ Pendentes</SelectItem>
            <SelectItem value="Em andamento">🔄 Em andamento</SelectItem>
            <SelectItem value="Concluído">✅ Concluídos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {procedimentosFiltrados.length === 0 ? (
          <Card className="col-span-full p-20 text-center border-4 border-dashed border-muted bg-muted/20 rounded-3xl">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-muted-foreground">Nenhum procedimento encontrado</h3>
          </Card>
        ) : (
          procedimentosFiltrados.map((proc) => {
            const ultima = getUltimaModificacao(proc);
            return (
              <Card 
                key={proc.id} 
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 hover:border-primary rounded-2xl cursor-pointer"
                onClick={() => navigate(`/procedimentos/${slug}/${proc.id}`)}
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="font-black text-primary border-primary/30">
                      OS #{proc.ordem_servico.toString().padStart(5, '0')}
                    </Badge>
                    <Badge className={proc.status_geral === 'Concluído' ? 'bg-green-500' : 'bg-blue-500'}>
                      {proc.status_geral}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold line-clamp-1">{proc.nome_paciente}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ultima ? (
                    <div className={`p-4 rounded-xl border-2 ${getCorResponsavelCard(ultima.responsavel)}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Última Etapa</span>
                      <p className="font-bold text-lg leading-tight mt-1">{ultima.label}</p>
                      <p className="text-xs mt-2 font-medium">Por: {ultima.executadoPor}</p>
                      <p className="text-[10px] opacity-70 italic">{format(new Date(ultima.executadoEm!), 'dd/MM/yy HH:mm')}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200 flex items-center justify-center h-24">
                      <p className="text-sm font-bold text-muted-foreground italic">Aguardando Início...</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-dashed">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(proc.data_inicial), 'dd/MM/yyyy')}</span>
                    </div>
                    {proc.dentista && (
                      <Badge variant="secondary" className="max-w-[120px] truncate">{proc.dentista.nome}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
