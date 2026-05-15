import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Plus, 
  Calendar, 
  Search, 
  FileText, 
  Smile, 
  Sparkles, 
  Home, 
  ArrowLeft,
  Activity,
  Layers,
  FlaskConical,
  Stethoscope,
  Scissors,
  LayoutGrid,
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAllProcedimentos, NOME_POR_TIPO } from '@/hooks/useProcedimentoGenerico';
import { StatusProcedimento } from '@/types/procedimentos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TodosProcedimentos() {
  const navigate = useNavigate();
  const { data: todosProcedimentosRaw, isLoading } = useAllProcedimentos();

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [tabAtiva, setTabAtiva] = useState<string>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Mapeamento amigável para exibição
  const formatTipo = (tipo: string) => {
      return NOME_POR_TIPO[tipo] || tipo;
  };

  const getSlug = (tipo: string) => {
      // Já recebemos o slug agora
      return tipo;
  };

  // Categorias baseadas na Sidebar
  const categorias = {
    removiveis: ['ppr', 'pt', 'pm'],
    protocolos: ['protocolo-definitivo', 'protocolo-provisorio'],
    fixas: ['fixa', 'fixa-zirconia', 'fixa-ceramica', 'fixa-impressa', 'adesiva', 'restauracao-indireta', 'coroa-implante'],
    estetica: ['clareamento', 'bruxismo'],
    externo: ['lab-externo']
  };

  // Filtrar procedimentos
  const procedimentosFiltrados = useMemo(() => {
    let list = todosProcedimentosRaw || [];

    // Filtro por Tab/Categoria
    if (tabAtiva !== 'todos') {
        const catKeys = tabAtiva as keyof typeof categorias;
        const typesInCat = categorias[catKeys] || [];
        list = list.filter(p => typesInCat.includes(p.tipo));
    }

    // Filtro por Texto
    if (filtroTexto) {
        const search = filtroTexto.toLowerCase();
        list = list.filter(p => 
            (p.nome_paciente?.toLowerCase().includes(search) || 
             p.ordem_servico?.toString().includes(search))
        );
    }

    // Filtro por Status
    if (filtroStatus !== 'todos') {
        list = list.filter(p => p.status_geral === filtroStatus);
    }

    return [...list].sort((a, b) => Number(b.ordem_servico) - Number(a.ordem_servico));
  }, [todosProcedimentosRaw, tabAtiva, filtroTexto, filtroStatus]);

  const contadores = useMemo(() => {
     const list = todosProcedimentosRaw || [];
     return {
         todos: list.length,
         removiveis: list.filter(p => categorias.removiveis.includes(p.tipo)).length,
         protocolos: list.filter(p => categorias.protocolos.includes(p.tipo)).length,
         fixas: list.filter(p => categorias.fixas.includes(p.tipo)).length,
         estetica: list.filter(p => categorias.estetica.includes(p.tipo)).length,
         externo: list.filter(p => categorias.externo.includes(p.tipo)).length,
     };
  }, [todosProcedimentosRaw]);

  const getStatusColor = (status: StatusProcedimento) => {
    switch (status) {
      case 'Concluído': return 'bg-green-100 text-green-800 border-green-300';
      case 'Em andamento': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getBadgeStyle = (tipo: string) => {
      if (categorias.removiveis.includes(tipo)) return "bg-purple-100 text-purple-800 border-purple-200";
      if (categorias.protocolos.includes(tipo)) return "bg-blue-100 text-blue-800 border-blue-200";
      if (categorias.fixas.includes(tipo)) return "bg-emerald-100 text-emerald-800 border-emerald-200";
      if (categorias.estetica.includes(tipo)) return "bg-pink-100 text-pink-800 border-pink-200";
      return "bg-slate-100 text-slate-800 border-slate-200";
  };

  const handleNovoProcedimento = (tipoStr: string) => {
    setModalAberto(false);
    navigate(`/procedimentos/${getSlug(tipoStr)}/novo`);
  };

  const handleVerDetalhes = (proc: any) => {
    if (!proc || !proc.tipo || !proc.id) return;
    navigate(`/procedimentos/${getSlug(proc.tipo)}/${proc.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
            <Activity className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-muted-foreground font-black tracking-widest animate-bounce">SINCRONIZANDO ATENDIMENTOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="w-8 h-8 text-primary" />
             </div>
             <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">Prótese Geral</h1>
          </div>
          <p className="text-slate-500 font-bold ml-12 uppercase text-xs tracking-widest bg-slate-100 px-2 py-0.5 rounded w-fit">
            Gestão Centralizada de todas as Ordens de Serviço
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1 md:flex-none h-12 gap-2 border-2 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary/5 hover:border-primary transition-all"
          >
            <Home className="w-4 h-4" /> Painel
          </Button>
        </div>
      </div>

      {/* Abas Estilizadas */}
      <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="w-full space-y-6">
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl h-auto flex flex-nowrap w-fit md:w-full md:grid md:grid-cols-6 gap-2">
            <TabsTrigger value="todos" className="rounded-xl py-3 font-black text-[10px] sm:text-xs">
                TODOS ({contadores.todos})
            </TabsTrigger>
            <TabsTrigger value="removiveis" className="rounded-xl py-3 font-black text-[10px] sm:text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                REMOVÍVEIS ({contadores.removiveis})
            </TabsTrigger>
            <TabsTrigger value="protocolos" className="rounded-xl py-3 font-black text-[10px] sm:text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                PROTOCOLOS ({contadores.protocolos})
            </TabsTrigger>
            <TabsTrigger value="fixas" className="rounded-xl py-3 font-black text-[10px] sm:text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                FIXAS ({contadores.fixas})
            </TabsTrigger>
            <TabsTrigger value="estetica" className="rounded-xl py-3 font-black text-[10px] sm:text-xs data-[state=active]:bg-pink-600 data-[state=active]:text-white">
                ESTÉTICA ({contadores.estetica})
            </TabsTrigger>
            <TabsTrigger value="externo" className="rounded-xl py-3 font-black text-[10px] sm:text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                EXTERNO ({contadores.externo})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filtros Inteligentes */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative group flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Pesquisar por Paciente ou Número da OS..." 
                    className="h-14 pl-12 rounded-2xl border-2 focus:ring-0 shadow-sm text-lg font-bold w-full"
                    value={filtroTexto}
                    onChange={e => setFiltroTexto(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 font-bold text-lg min-w-[180px]">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-primary" />
                            <SelectValue placeholder="Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 shadow-2xl">
                        <SelectItem value="todos" className="font-bold py-3">Todos os Status</SelectItem>
                        <SelectItem value="Pendente" className="font-bold py-3 text-yellow-600">Pendente</SelectItem>
                        <SelectItem value="Em andamento" className="font-bold py-3 text-blue-600">Em andamento</SelectItem>
                        <SelectItem value="Concluído" className="font-bold py-3 text-green-600">Concluído</SelectItem>
                    </SelectContent>
                </Select>

                {/* Toggle de Visualização */}
                <div className="bg-slate-100 p-1 rounded-2xl border-2 flex">
                    <Button 
                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('cards')}
                        className={`rounded-xl h-11 w-11 ${viewMode === 'cards' ? 'shadow-md' : 'text-slate-400'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </Button>
                    <Button 
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('table')}
                        className={`rounded-xl h-11 w-11 ${viewMode === 'table' ? 'shadow-md' : 'text-slate-400'}`}
                    >
                        <List className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>

        {/* Lista de Cards ou Tabela */}
        <div className="grid gap-6">
            {viewMode === 'cards' ? (
                procedimentosFiltrados.map(proc => (
                    <Card 
                        key={`${proc.tipo}-${proc.id}`} 
                        className="group border-2 hover:border-primary/30 transition-all rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-white"
                        onClick={() => handleVerDetalhes(proc)}
                    >
                        <CardContent className="p-0">
                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Barra Lateral de Status */}
                                <div className={`w-full lg:w-3 p-2 ${getStatusColor(proc.status_geral as any).split(' ')[0]}`}></div>
                                
                                <div className="flex-1 p-6 sm:p-8 space-y-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-black text-slate-900 italic tracking-tighter">OS #{proc.ordem_servico}</span>
                                                <Badge className={`rounded-lg font-black text-[10px] uppercase tracking-widest px-3 py-1 border-2 ${getBadgeStyle(proc.tipo)}`}>
                                                    {formatTipo(proc.tipo)}
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-700">{proc.nome_paciente}</h3>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 text-right">
                                            <Badge variant="outline" className={`rounded-xl py-1.5 px-4 font-black border-2 text-sm ${getStatusColor(proc.status_geral as any)}`}>
                                                {proc.status_geral}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {proc.data_inicial ? (
                                                  format(new Date(proc.data_inicial), "dd 'de' MMMM", { locale: ptBR })
                                                ) : 'Data não informada'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t-2 border-slate-50">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável</span>
                                            <p className="font-bold text-slate-700 leading-tight">Dr. {proc.dentista?.nome || proc.dentista_nome || '—'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local</span>
                                            <p className="font-bold text-slate-700 leading-tight">{proc.arcada || '—'} {proc.dente ? `(${proc.dente})` : ''}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Laboratório</span>
                                            <p className="font-bold text-slate-700 leading-tight">{proc.protetico?.nome || proc.protetico_nome || 'Não vinculado'}</p>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Button 
                                                variant="ghost" 
                                                className="group/btn h-12 w-12 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-inner"
                                                onClick={(e) => { e.stopPropagation(); handleVerDetalhes(proc); }}
                                            >
                                                <ArrowLeft className="w-5 h-5 rotate-180 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                /* Modo Tabela Inteira */
                <Card className="border-2 rounded-[32px] overflow-hidden bg-white shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b-2">
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400">OS</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Paciente</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Tipo</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Dentista</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Local</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Lab</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {procedimentosFiltrados.map(proc => (
                                    <tr key={`${proc.tipo}-${proc.id}`} className="hover:bg-primary/5 transition-colors group">
                                        <td className="p-5 font-black text-slate-900">#{proc.ordem_servico}</td>
                                        <td className="p-5 font-bold text-slate-700">{proc.nome_paciente}</td>
                                        <td className="p-5">
                                            <Badge className={`rounded-lg font-black text-[10px] uppercase tracking-widest px-2 py-0.5 border-2 ${getBadgeStyle(proc.tipo)}`}>
                                                {formatTipo(proc.tipo)}
                                            </Badge>
                                        </td>
                                        <td className="p-5 font-bold text-slate-600 text-sm">Dr. {proc.dentista?.nome || proc.dentista_nome || '—'}</td>
                                        <td className="p-5 font-bold text-slate-600 text-sm whitespace-nowrap">{proc.arcada || '—'} {proc.dente ? `(${proc.dente})` : ''}</td>
                                        <td className="p-5 font-bold text-slate-600 text-sm">{proc.protetico?.nome || proc.protetico_nome || '—'}</td>
                                        <td className="p-5 text-center">
                                            <Badge variant="outline" className={`rounded-lg py-1 px-3 font-black text-[9px] uppercase border-2 ${getStatusColor(proc.status_geral as any)}`}>
                                                {proc.status_geral}
                                            </Badge>
                                        </td>
                                        <td className="p-5 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="rounded-xl font-black text-[10px] uppercase group-hover:bg-primary group-hover:text-white"
                                                onClick={() => handleVerDetalhes(proc)}
                                            >
                                                Detalhes
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {procedimentosFiltrados.length === 0 && (
                <div className="py-20 text-center space-y-6 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-200">
                    <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-400 italic">Nada por aqui no momento</h3>
                        <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm uppercase tracking-widest leading-relaxed">
                            Ajuste os filtros ou crie um novo atendimento para começar.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </Tabs>
    </div>
  );
}

