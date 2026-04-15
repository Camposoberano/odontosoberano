import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, CheckCircle, Clock, ClipboardList, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllProcedimentos } from '@/hooks/useProcedimentoGenerico';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConsultaOSUniversal() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Buscar todos os tipos de procedimentos de forma otimizada (Novo Padrão)
  const { data: todosProcedimentos, isLoading } = useAllProcedimentos();

  // Filtragem local inteligente
  const procedimentosFiltrados = useMemo(() => {
    let filtrados = todosProcedimentos || [];

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(p => p.tipo === filtroTipo);
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(p => p.status_geral?.toLowerCase() === filtroStatus.toLowerCase());
    }

    // Filtro de texto (OS ou Paciente)
    if (busca.trim() !== '') {
      const termo = busca.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nome_paciente?.toLowerCase().includes(termo) || 
        p.ordem_servico?.toString().includes(termo)
      );
    }

    return filtrados;
  }, [todosProcedimentos, busca, filtroStatus, filtroTipo]);

  const obterRotaOS = (tipo: string, id: string) => {
    const slug = tipo.toLowerCase().replace(/\s/g, '-');
    return `/procedimentos/${slug}/${id}`;
  };

  const getCorTipo = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t === 'ppr') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (t === 'pt') return 'bg-purple-100 text-purple-800 border-purple-300';
    if (t === 'pm') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (t.includes('protocolo')) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (t.includes('fixa')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (t === 'bruxismo') return 'bg-teal-100 text-teal-800 border-teal-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all shadow-sm font-semibold"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Voltar</span>
          </Button>
        </div>

        <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border-l-4 border-l-primary shadow-sm flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg text-white">
                <Search className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              Consulta Universal de OS
            </h1>
            <p className="text-muted-foreground mt-2 ml-0 sm:ml-12">
              Pesquise qualquer Ordem de Serviço ou paciente em todos os setores
            </p>
          </div>
          <div className="mt-4 md:mt-0 ml-0 sm:ml-12 border-l-0 md:border-l-2 pl-0 md:pl-6 border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Geral</h3>
            <p className="text-3xl font-black text-primary">{todosProcedimentos?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Caixa de Busca e Filtros */}
      <Card className="mb-6 shadow-md border-0 bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Busque pelo Nome do Paciente ou Número da OS..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 h-14 text-lg border-2 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full lg:w-[180px] h-14 border-2">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full lg:w-[220px] h-14 border-2">
                  <SelectValue placeholder="Tipo OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos (15)</SelectItem>
                  <SelectItem value="ppr">PPR</SelectItem>
                  <SelectItem value="pt">Prótese Total</SelectItem>
                  <SelectItem value="pm">Ponte Móvel</SelectItem>
                  <SelectItem value="protocolo-definitivo">Protocolo Definitivo</SelectItem>
                  <SelectItem value="protocolo-provisorio">Protocolo Provisório</SelectItem>
                  <SelectItem value="fixa">Fixa Provisória</SelectItem>
                  <SelectItem value="fixa-ceramica">Fixa de Cerâmica</SelectItem>
                  <SelectItem value="fixa-impressa">Fixa Impressa</SelectItem>
                  <SelectItem value="adesiva">Adesiva</SelectItem>
                  <SelectItem value="coroa-implante">Coroa Sob Implante</SelectItem>
                  <SelectItem value="fixa-zirconia">Fixa de Zircônia</SelectItem>
                  <SelectItem value="restauracao-indireta">Restauração Indireta</SelectItem>
                  <SelectItem value="clareamento">Clareamento</SelectItem>
                  <SelectItem value="bruxismo">Placa de Bruxismo</SelectItem>
                  <SelectItem value="lab-externo">Laboratório Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Resultados encontrados: <b>{procedimentosFiltrados.length}</b></span>
            </div>
            { (busca || filtroStatus !== 'todos' || filtroTipo !== 'todos') && (
              <Button variant="link" size="sm" onClick={() => { setBusca(''); setFiltroStatus('todos'); setFiltroTipo('todos'); }} className="h-auto p-0 px-2 text-primary">
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados - Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
           ))}
        </div>
      ) : procedimentosFiltrados.length === 0 ? (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300">
          <CardContent>
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhuma OS encontrada</h3>
            <p className="text-muted-foreground">
              Ajuste seus filtros ou pesquise por outro termo
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {procedimentosFiltrados.map((proc) => (
            <Card 
              key={proc.id} 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 group flex flex-col h-full bg-white"
              onClick={() => navigate(obterRotaOS(proc.tipo, proc.id))}
            >
              <CardHeader className="pb-2 pt-4 px-4 flex-row justify-between items-start space-y-0">
                <div>
                  <Badge variant="outline" className={`mb-2 text-xs font-semibold ${getCorTipo(proc.tipo)}`}>
                    {proc.tipo}
                  </Badge>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {proc.nome_paciente}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3 mt-1">
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-gray-500 font-medium">OS Número</span>
                    <span className="font-bold">#{proc.ordem_servico.toString().padStart(6, '0')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Entrada</span>
                    <span className="font-semibold text-gray-700">
                      {proc.data_inicial 
                        ? format(new Date(proc.data_inicial), 'dd/MM/yyyy', { locale: ptBR }) 
                        : '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Status Geral</span>
                    <Badge variant="outline" className={
                      proc.status_geral === 'Concluído' ? 'bg-green-50 text-green-700 border-green-300' :
                      proc.status_geral === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                      'bg-blue-50 text-blue-700 border-blue-300'
                    }>
                      {proc.status_geral}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t">
                  <Button variant="ghost" className="w-full text-primary hover:bg-primary/5 hover:text-primary text-sm font-semibold h-8">
                    Ver Detalhes »
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
