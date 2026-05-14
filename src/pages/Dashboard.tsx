import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  DollarSign,
  Package,
  Clock,
  ClipboardList,
  Search,
  Copy,
  TrendingUp,
  AlertTriangle,
  Activity,
  PlusCircle
} from "lucide-react";
import { SelecaoTipoOSModal } from "@/components/procedimentos/SelecaoTipoOSModal";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { toast } from "@/hooks/use-toast";
import { TipoExecutor } from "@/types/procedimentos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAllProcedimentos } from '@/hooks/useProcedimentoGenerico';
import { usePerformanceStats } from "@/hooks/usePerformanceStats";

interface Procedimento {
  id: string;
  ordem_servico: number;
  tipo: string;
  nome_paciente: string;
  data_entrega?: string | null;
  data_inicial?: string | null;
  status_geral: StatusProcedimento;
  dentista?: { nome: string } | null;
  dentista_nome?: string;
  protetico?: { nome: string } | null;
  protetico_nome?: string;
  arcada?: string;
  dente?: string;
  [key: string]: any; // Allow for dynamic stage keys (_executado_em etc)
}

// Função genérica para obter a última modificação de um procedimento (qualquer tipo)
function getUltimaModificacao(proc: Procedimento): {
  etapaLabel: string;
  responsavel: string;
  executadoPor: string;
  executadoEm: string | null;
} | null {
  let ultimaData: Date | null = null;
  let ultimaChave: string | null = null;
  let executadoPor = '';
  let executadoEm: string | null = null;

  // Procurar em todas as chaves do objeto por campos de execução
  Object.keys(proc).forEach(key => {
      if (key.endsWith('_executado_em') && proc[key]) {
          const data = new Date(proc[key]);
          if (!ultimaData || data > ultimaData) {
              ultimaData = data;
              ultimaChave = key.replace('_executado_em', '');
              executadoEm = proc[key];
              executadoPor = proc[`${ultimaChave}_executado_por`] || 'Sistema';
          }
      }
  });

  if (ultimaChave) {
    const label = (ultimaChave as string).replace(/_/g, ' ').toUpperCase();
    return {
      etapaLabel: label,
      responsavel: 'EXECUTOR',
      executadoPor,
      executadoEm,
    };
  }

  return null;
}

// Função para obter a cor baseada no responsável (Ajustado conforme solicitação do usuário)
function getCorResponsavelCard(responsavel: string): string {
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
}

// Função auxiliar para cor de texto/ícone baseada no responsável
function getCorTextoResponsavel(responsavel: string): string {
  const norm = responsavel?.toUpperCase();
  if (norm === 'DENTISTA' || norm === 'DOUTOR') return 'text-blue-600';
  if (norm === 'PROTETICO' || norm === 'LABORATORIO') return 'text-orange-600';
  if (norm === 'SECRETARIA') return 'text-purple-600';
  return 'text-slate-600';
}

// Função para obter a rota correta baseada no tipo (Novo Padrão Genérico)
function getRotaProcedimento(tipo: string, id: string): string {
  const slug = tipo.toLowerCase().replace(/\s/g, '-');
  return `/procedimentos/${slug}/${id}`;
}

// Sub-componente para listas de OS no Dashboard
function OSList({ procs, onNavigate, emptyLabel, isAtrasadaList }: { 
  procs: Procedimento[], 
  onNavigate: (proc: Procedimento) => void, 
  emptyLabel: string,
  isAtrasadaList?: boolean 
}) {
  if (procs.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/10 rounded-xl border-2 border-dashed">
        <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground opacity-20 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {procs.slice(0, 10).map(proc => {
        const responsavelPagina = proc.protetico_nome ? 'PROTETICO' : 'DENTISTA';
        
        return (
          <div 
            key={proc.id} 
            onClick={() => onNavigate(proc)}
            className={`flex flex-col p-5 border-2 rounded-[24px] bg-white hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group ${isAtrasadaList ? 'border-red-200 hover:border-red-400' : 'border-slate-100 hover:border-primary/40'}`}
          >
            {/* Header: ID em Destaque e Tipo */}
            <div className="flex justify-between items-center mb-4">
              <span className={`text-[12px] font-black px-3 py-1 rounded-[10px] uppercase tracking-wider shadow-sm ${isAtrasadaList ? 'bg-red-600 text-white' : 'bg-primary text-white'}`}>
                 #{proc.ordem_servico || 'S/N'}
              </span>
              <Badge variant="secondary" className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border-none">
                {proc.tipo}
              </Badge>
            </div>

            {/* Corpo: Paciente e Profissional */}
            <div className="space-y-1 mb-4 flex-1">
              <h3 className="font-black text-gray-900 group-hover:text-primary transition-colors truncate text-lg tracking-tight">
                {proc.nome_paciente}
              </h3>
              
              {/* Exibição do Profissional Responsável (Apenas se existir) */}
              {(proc.dentista_nome || proc.protetico_nome) && (
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${getCorTextoResponsavel(responsavelPagina).replace('text-', 'bg-')}`} />
                  <span className={`text-[11px] font-extrabold uppercase tracking-tight ${getCorTextoResponsavel(responsavelPagina)}`}>
                    {proc.dentista_nome || proc.protetico_nome}
                  </span>
                </div>
              )}
            </div>

            {/* Próxima Etapa - Seção em Destaque (Oculta se Concluído) */}
            {proc.proxima_etapa && proc.status_geral !== 'Concluído' && (
              <div className={`mb-4 p-3 rounded-2xl border-2 border-dashed flex flex-col gap-1 ${getCorResponsavelCard(proc.proxima_etapa_responsavel || 'SECRETARIA')}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Próxima Etapa</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span className="text-[9px] font-black uppercase">Ação necessária</span>
                  </div>
                </div>
                <p className="font-black text-sm uppercase leading-tight">{proc.proxima_etapa}</p>
                <p className="text-[9px] font-bold opacity-80 uppercase italic">Responsável: {proc.proxima_etapa_responsavel}</p>
              </div>
            )}

            {/* Footer: Datas e Status Global */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entrega</span>
                <span className={`text-xs font-black flex items-center gap-1 ${isAtrasadaList ? 'text-red-600' : 'text-slate-700'}`}>
                  <Calendar className="w-3 h-3" />
                  {proc.data_entrega && !isNaN(new Date(proc.data_entrega).getTime()) 
                    ? format(new Date(proc.data_entrega), 'dd/MM/yyyy', { locale: ptBR }) 
                    : 'A DEFINIR'}
                </span>
              </div>

              <Badge className={`text-[10px] font-black rounded-lg px-2 h-6 border-none ${
                proc.status_geral === 'Pendente' ? 'bg-amber-100 text-amber-700' : 
                proc.status_geral === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {(proc.status_geral || 'Pendente').toUpperCase()}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, proximosAgendamentos, isLoading: loadingStats } = useDashboardStats();
  const { data: performance, isLoading: loadingPerformance } = usePerformanceStats();
  const [subTabAtiva, setSubTabAtiva] = useState<string>('dentistas');
  const [modoVisao, setModoVisao] = useState<'PRODUCAO' | 'GESTAO'>('PRODUCAO');
  const [buscaRapida, setBuscaRapida] = useState<string>('');
  const [isOSModalOpen, setIsOSModalOpen] = useState(false);

  const { data: todosProcedimentos, isLoading: loadingProcs } = useAllProcedimentos();
  const isLoading = loadingStats || loadingProcs;

  const procedimentosFiltradosPorBusca = useMemo(() => {
    const list = (todosProcedimentos || []) as Procedimento[];
    if (!buscaRapida.trim()) return list;
    const termoBusca = buscaRapida.toLowerCase();
    return list.filter((p) =>
      p.nome_paciente?.toLowerCase().includes(termoBusca) ||
      p.ordem_servico?.toString().includes(termoBusca)
    );
  }, [todosProcedimentos, buscaRapida]);

  const ultimasOSModificadas = useMemo(() => {
    const comAtualizacao = (procedimentosFiltradosPorBusca || [])
        .map(p => ({ ...p, ultimaMod: getUltimaModificacao(p) }))
        .filter(p => p.ultimaMod !== null);
    return comAtualizacao.sort((a, b) => {
      return new Date(b.ultimaMod!.executadoEm!).getTime() - new Date(a.ultimaMod!.executadoEm!).getTime();
    }).slice(0, 10);
  }, [procedimentosFiltradosPorBusca]);

  const ultimasOSAbertas = useMemo(() => {
    return [...(procedimentosFiltradosPorBusca || [])]
      .filter(p => p.status_geral !== 'Concluído')
      .sort((a, b) => Number(b.ordem_servico) - Number(a.ordem_servico))
      .slice(0, 10);
  }, [procedimentosFiltradosPorBusca]);

  const osEmAndamentoFiltro = useMemo(() => {
    return (procedimentosFiltradosPorBusca || []).filter(p => p.status_geral === 'Em andamento' || p.status_geral === 'Pendente');
  }, [procedimentosFiltradosPorBusca]);

  const osAtrasadasFiltro = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return (procedimentosFiltradosPorBusca || []).filter(p => {
      if (p.status_geral === 'Concluído') return false;
      if (!p.data_entrega) return false;
      return new Date(p.data_entrega) < hoje;
    });
  }, [procedimentosFiltradosPorBusca]);

  const osDentistaFiltro = useMemo(() => {
    return (procedimentosFiltradosPorBusca || []).filter(p => 
      p.status_geral !== 'Concluído' && 
      (p.proxima_etapa_responsavel === 'DENTISTA' || p.proxima_etapa_responsavel === 'DOUTOR')
    );
  }, [procedimentosFiltradosPorBusca]);

  const osLaboratorioFiltro = useMemo(() => {
    return (procedimentosFiltradosPorBusca || []).filter(p => 
      p.status_geral !== 'Concluído' && 
      (p.proxima_etapa_responsavel === 'PROTETICO' || p.proxima_etapa_responsavel === 'LABORATORIO')
    );
  }, [procedimentosFiltradosPorBusca]);

  const statsCards = [
    {
      title: "Pacientes Ativos",
      value: stats?.totalPacientes?.toString() || '0',
      change: "Cadastrados e ativos",
      icon: Users,
      color: "text-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-100",
      route: "/patients",
    },
    {
      title: "Agendamentos Hoje",
      value: stats?.agendamentosHoje?.total?.toString() || '0',
      change: `${stats?.agendamentosHoje?.confirmados || 0} confirmados, ${stats?.agendamentosHoje?.pendentes || 0} pendentes`,
      icon: Calendar,
      color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-100",
      route: "/appointments",
    },
    {
      title: "OS Atrasadas",
      value: (todosProcedimentos?.filter(p => {
          const hoje = new Date(); hoje.setHours(0,0,0,0);
          return p.status_geral !== 'Concluído' && p.data_entrega && new Date(p.data_entrega) < hoje;
      }).length || 0).toString(),
      change: "Ação necessária",
      icon: AlertTriangle,
      color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-100",
      route: "/procedimentos",
    },
    {
      title: "Faturamento Mensal",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats?.faturamentoMensal || 0),
      change: `Previsto: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats?.faturamentoPrevisto || 0)}`,
      icon: TrendingUp,
      color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-100",
      route: "/financeiro/contas-receber",
    },
  ];

  const handleNavigateProc = (proc: Procedimento) => {
      navigate(getRotaProcedimento(proc.tipo, proc.id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Gestão clínica e laboratorial em tempo real</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
                onClick={() => navigate("/patients?action=new")}
                className="btn-orange-premium h-14"
            >
              <Users className="w-5 h-5" /> Novo Cadastro
            </Button>
            
            <Button 
                onClick={() => setIsOSModalOpen(true)}
                className="btn-orange-premium h-14 shadow-orange-500/40"
            >
              <PlusCircle className="w-5 h-5 underline-offset-4" /> Nova OS
            </Button>

            <Button 
                onClick={() => navigate("/appointments?action=new")}
                className="btn-orange-premium h-14"
            >
              <Calendar className="w-5 h-5" /> Novo Agendamento
            </Button>
          </div>
        </div>

        <SelecaoTipoOSModal 
            isOpen={isOSModalOpen} 
            onClose={() => setIsOSModalOpen(false)} 
        />

        <DashboardAlerts stats={stats} isLoading={isLoading} />

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Card key={i} className="medical-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-32" /></CardContent>
              </Card>
            ))
          ) : (
            statsCards.map((stat) => (
              <Card
                key={stat.title}
                className={`medical-card border-2 ${stat.borderColor} cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all`}
                onClick={() => navigate(stat.route)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-600">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-gray-800">{stat.value}</div>
                  <p className="text-xs font-medium text-muted-foreground mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:sticky lg:top-24 max-h-[calc(100vh-140px)]">
            <Card className="medical-card h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2 text-primary" /> Agenda de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto px-4 pb-4">
                {isLoading ? (
                  <div className="space-y-4">{[1, 2, 3].map((i) => (<Skeleton key={i} className="h-20 w-full rounded-xl" />))}</div>
                ) : (proximosAgendamentos || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="text-sm font-medium">Agenda livre hoje</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proximosAgendamentos.map((appointment) => (
                      <div key={appointment.id} className="p-3 border-2 border-border/50 rounded-xl bg-white hover:border-primary/30 transition-all group cursor-pointer" onClick={() => navigate('/appointments')}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{appointment.time.split(':')[0]}</div>
                            <span className="font-bold text-sm text-gray-700">{appointment.time}</span>
                          </div>
                          <Badge variant={appointment.status === "Confirmado" ? "default" : "secondary"} className="text-[10px] font-bold">{appointment.status.toUpperCase()}</Badge>
                        </div>
                        <p className="font-black text-gray-900 group-hover:text-primary transition-colors text-sm uppercase line-clamp-1 leading-snug">{appointment.patient}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight line-clamp-1">{appointment.procedure}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="medical-card border-l-4 border-l-primary shadow-lg overflow-hidden">
              <CardHeader className="pb-0 border-b-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="flex items-center text-xl font-black text-gray-800">
                      <Activity className="w-6 h-6 mr-2 text-primary" /> Ordens de Serviço
                    </CardTitle>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                      Visualização: <span className="text-primary">{modoVisao}</span>
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-3">
                     <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Filtrar paciente ou OS..." className="pl-10 h-10 rounded-xl" value={buscaRapida} onChange={(e) => setBuscaRapida(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Seletor de Modo de Visão */}
                <div className="flex p-1 bg-slate-100 rounded-2xl w-full max-w-md mx-auto md:mx-0">
                  <button 
                    onClick={() => { setModoVisao('PRODUCAO'); setSubTabAtiva('dentistas'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-black text-xs transition-all ${modoVisao === 'PRODUCAO' ? 'bg-white shadow-md text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Activity className="w-3 h-3" /> FLUXO DE PRODUÇÃO
                  </button>
                  <button 
                    onClick={() => { setModoVisao('GESTAO'); setSubTabAtiva('recentes'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-black text-xs transition-all ${modoVisao === 'GESTAO' ? 'bg-white shadow-md text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <ClipboardList className="w-3 h-3" /> GESTÃO GERAL
                  </button>
                </div>

                <Tabs value={subTabAtiva} onValueChange={setSubTabAtiva} className="w-full">
                  <TabsList className="flex flex-wrap h-auto p-1 bg-muted/40 rounded-xl overflow-x-auto no-scrollbar">
                    {modoVisao === 'PRODUCAO' ? (
                      <>
                        <TabsTrigger value="dentistas" className="flex-1 py-3 font-black rounded-lg text-xs gap-2 min-w-[120px] transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                          <Users className="w-3 h-3" /> NA VEZ DO DENTISTA
                        </TabsTrigger>
                        <TabsTrigger value="laboratorio" className="flex-1 py-3 font-black rounded-lg text-xs gap-2 min-w-[120px] transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                          <Package className="w-3 h-3" /> NA VEZ DO LABORATÓRIO
                        </TabsTrigger>
                      </>
                    ) : (
                      <>
                        <TabsTrigger value="recentes" className="flex-1 py-3 font-black rounded-lg text-xs min-w-[100px]">RECENTES</TabsTrigger>
                        <TabsTrigger value="andamento" className="flex-1 py-3 font-black rounded-lg text-xs min-w-[100px]">EM PRODUÇÃO</TabsTrigger>
                        <TabsTrigger value="atrasadas" className="flex-1 py-3 font-black rounded-lg text-xs border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:text-red-700 min-w-[100px]">ATRASADAS</TabsTrigger>
                        <TabsTrigger value="movimentacoes" className="flex-1 py-3 font-black rounded-lg text-xs min-w-[100px]">UPDATES</TabsTrigger>
                      </>
                    )}
                  </TabsList>
                  <div className="min-h-[400px] mt-6">
                    {/* Renderização condicional dos conteúdos conforme o modo */}
                    {modoVisao === 'PRODUCAO' ? (
                      <>
                        <TabsContent value="dentistas"><OSList procs={osDentistaFiltro} onNavigate={handleNavigateProc} emptyLabel="Nenhum trabalho aguardando clínica." /></TabsContent>
                        <TabsContent value="laboratorio"><OSList procs={osLaboratorioFiltro} onNavigate={handleNavigateProc} emptyLabel="Nenhum trabalho na bancada do laboratório." /></TabsContent>
                      </>
                    ) : (
                      <>
                        <TabsContent value="recentes"><OSList procs={ultimasOSAbertas} onNavigate={handleNavigateProc} emptyLabel="Nenhuma OS aberta recentemente." /></TabsContent>
                        <TabsContent value="andamento"><OSList procs={osEmAndamentoFiltro} onNavigate={handleNavigateProc} emptyLabel="Nenhuma OS em produção." /></TabsContent>
                        <TabsContent value="atrasadas"><OSList procs={osAtrasadasFiltro} onNavigate={handleNavigateProc} emptyLabel="Tudo no prazo!" isAtrasadaList={true} /></TabsContent>
                        <TabsContent value="movimentacoes">
                          <div className="space-y-3">
                            {ultimasOSModificadas.map((proc) => {
                              const ultimaMod = (proc as any).ultimaMod;
                              return (
                                <div key={proc.id} className="p-4 border-2 border-slate-100 rounded-[20px] bg-white hover:border-blue-300 cursor-pointer transition-all shadow-sm hover:shadow-md" onClick={() => handleNavigateProc(proc)}>
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">#{proc.ordem_servico || 'S/N'}</span>
                                      <p className="font-bold text-gray-900 text-base mt-1">{proc.nome_paciente}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase">{proc.tipo}</Badge>
                                  </div>
                                  {ultimaMod && (
                                    <div className={`p-3 rounded-2xl border-2 ${getCorResponsavelCard(ultimaMod.responsavel)}`}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                          <p className="font-black text-[11px] uppercase tracking-tighter leading-none">{ultimaMod.etapaLabel}</p>
                                          <p className="text-[10px] opacity-70 font-bold italic">Por: {ultimaMod.executadoPor}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[9px] font-black opacity-60">HORÁRIO</p>
                                          <p className="text-[11px] font-black">{ultimaMod.executadoEm ? format(new Date(ultimaMod.executadoEm), "dd/MM HH:mm", { locale: ptBR }) : '-'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                      </>
                    )}
                  </div>
                </Tabs>
              </CardHeader>
            </Card>

            <Card className="border-2 shadow-lg rounded-2xl overflow-hidden mt-6">
               <CardHeader className="bg-slate-50/50 border-b"><CardTitle className="text-lg">Performance Mensal</CardTitle></CardHeader>
               <CardContent className="pt-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-[10px] uppercase font-black text-blue-600 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Dentistas</h5>
                      <div className="space-y-2">
                        {(performance?.dentistas || []).slice(0, 3).map((d: {id: string, nome: string, totalConcluido: number}, i: number) => (
                           <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                             <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs">{i+1}º</div><span className="font-bold text-sm">{d.nome}</span></div>
                             <Badge variant="secondary" className="font-black text-blue-700">{d.totalConcluido} OS</Badge>
                           </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[10px] uppercase font-black text-orange-600 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Laboratório</h5>
                      <div className="space-y-2">
                        {(performance?.proteticos || []).slice(0, 3).map((p: {id: string, nome: string, totalConcluido: number}, i: number) => (
                           <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                             <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xs">{i+1}º</div><span className="font-bold text-sm">{p.nome}</span></div>
                             <Badge variant="secondary" className="font-black text-orange-700">{p.totalConcluido} OS</Badge>
                           </div>
                        ))}
                      </div>
                    </div>
                 </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}