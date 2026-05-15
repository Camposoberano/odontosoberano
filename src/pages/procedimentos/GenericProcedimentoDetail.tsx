import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle2, 
  Circle, 
  Clock, 
  History,
  Info,
  DollarSign,
  Printer,
  ChevronRight,
  ClipboardList,
  Save, 
  Check, 
  X as CloseIcon 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProcedimentoById, useUpdateEtapaGenerica, ETAPAS_POR_TIPO, useHistoricoProcedimento, NOME_POR_TIPO, useUpdateProcedimentoGenerico } from '@/hooks/useProcedimentoGenerico';
import { StatusEtapa, TipoExecutor } from '@/types/procedimentos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModalFinalizarMoldagem } from '@/components/procedimentos/ModalFinalizarMoldagem';
import { ModalSelecaoProfissional } from '@/components/procedimentos/ModalSelecaoProfissional';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label as UILabel } from '@/components/ui/label';

export default function GenericProcedimentoDetail() {
  const navigate = useNavigate();
  const { tipo: tipoParam, id } = useParams();
  
  const tipo = (tipoParam?.toLowerCase() || '') as string;
  const nomeExibicao = NOME_POR_TIPO[tipo] || 'Procedimento';
  
  const { data: proc, isLoading } = useProcedimentoById(tipo as any, id!);
  const { mutate: updateEtapa, isPending: isUpdatingEtapa } = useUpdateEtapaGenerica(tipo as any);
  const { mutate: updateCampos } = useUpdateProcedimentoGenerico(tipo as any);
  const { data: historico } = useHistoricoProcedimento(proc?.ordem_servico);

  const [showMoldagemModal, setShowMoldagemModal] = useState(false);
  const [showProfissionalModal, setShowProfissionalModal] = useState(false);
  const [selectedEtapaKey, setSelectedEtapaKey] = useState<string | null>(null);
  const [selectedTipoExecutor, setSelectedTipoExecutor] = useState<TipoExecutor>('SECRETARIA');
  const [pendingEtapaKey, setPendingEtapaKey] = useState<string | null>(null);
  const [isEditingTech, setIsEditingTech] = useState(false);

  // Estados locais para campos técnicos
  const [corDente, setCorDente] = useState('');
  const [corGengiva, setCorGengiva] = useState('');
  const [registroMordida, setRegistroMordida] = useState(false);
  const [arcadaSelected, setArcadaSelected] = useState<string>('SUP/INF');

  // Sincronizar estados locais quando os dados carregarem
  useEffect(() => {
    if (proc) {
      setCorDente(proc.cor_dente || '');
      setCorGengiva(proc.cor_gengiva || '');
      setRegistroMordida(!!proc.registro_mordida);
      setArcadaSelected(proc.arcada || 'SUP/INF');
    }
  }, [proc]);
  
  const etapas = useMemo(() => {
    if (!tipo) return [];
    return ETAPAS_POR_TIPO[tipo] || [];
  }, [tipo]);

  if (isLoading) return <Skeleton className="h-screen w-full" />;
  if (!proc) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <span className="text-xl font-bold text-muted-foreground">Procedimento não encontrado</span>
    <Button onClick={() => navigate('/procedimentos')}>Voltar para Lista</Button>
  </div>;

  const handleUpdateStatus = (etapaKey: string, currentStatus: StatusEtapa, responsavel: TipoExecutor) => {
    if (currentStatus === 'Finalizado' || currentStatus === 'Concluido') {
      // Se já estiver finalizado, permite apenas voltar para pendente (opcional ou bloqueado)
      updateEtapa({
        procedimentoId: proc.id,
        etapaKey,
        status: 'Pendente'
      });
      return;
    }
    
    // Simplificação solicitada: Moldagem agora usa seleção de profissional direta
    // Dados técnicos são preenchidos no card fixo
    
    // Fluxo de Aprovação: Abrir modal de seleção de profissional
    setSelectedEtapaKey(etapaKey);
    setSelectedTipoExecutor(responsavel);
    setShowProfissionalModal(true);
  };

  const handleConfirmProfissional = (professional: { id: string | number, nome: string }) => {
    if (!selectedEtapaKey || !proc) return;

    updateEtapa({
      procedimentoId: proc.id,
      etapaKey: selectedEtapaKey,
      status: 'Finalizado',
      executorId: professional.id,
      executorNome: professional.nome,
      tipoExecutor: selectedTipoExecutor
    });

    setShowProfissionalModal(false);
  };

  const handleSaveCamposTecnicos = () => {
    if (!proc) return;
    updateCampos({
      id: proc.id,
      data: {
        cor_dente: corDente,
        cor_gengiva: corGengiva,
        registro_mordida: registroMordida,
        arcada: arcadaSelected
      }
    });
    setIsEditingTech(false);
    toast({
       title: "Dados atualizados",
       description: "Controle técnico salvo com sucesso"
    });
  };

  const handleConfirmMoldagem = (data: any) => {
    if (!pendingEtapaKey || !proc) return;

    updateEtapa({
      procedimentoId: proc.id,
      etapaKey: pendingEtapaKey,
      status: 'Finalizado',
      executorNome: 'Sistema',
      tipoExecutor: 'SECRETARIA',
      extraData: data
    });

    setShowMoldagemModal(false);
    setPendingEtapaKey(null);
  };

  // Funções de formatação segura
  const safeFormatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return format(date, "dd/MM/yy", { locale: ptBR });
    } catch (e) {
      return '-';
    }
  };

  const safeFormatOS = (os?: number | string | null) => {
    if (os === undefined || os === null) return '000000';
    try {
      return os.toString().padStart(6, '0');
    } catch (e) {
      return '000000';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 bg-gradient-to-br from-primary/10 via-white to-transparent rounded-3xl border shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-primary/10" />
        <div className="z-10">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2 hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-4">
             <div className="p-4 bg-primary shadow-xl rounded-2xl rotate-3">
                <ClipboardList className="w-8 h-8 text-white" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">{proc.nome_paciente || 'Paciente Sem Nome'}</h1>
                <div className="flex items-center gap-3 mt-2">
                   <Badge variant="outline" className="font-bold border-primary text-primary px-3 py-1">OS #{safeFormatOS(proc.ordem_servico)}</Badge>
                   <Badge className="bg-primary hover:bg-primary/90 font-bold px-3 py-1">{nomeExibicao}</Badge>
                </div>
             </div>
          </div>
        </div>
        <div className="flex gap-3 z-10">
          <Button variant="outline" className="gap-2 border-2 hover:bg-primary/5 shadow-sm font-bold h-12" onClick={() => window.print()}>
            <Printer className="w-5 h-5" /> Imprimir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="workflow" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 h-14 rounded-2xl border-2 border-primary/10 shadow-sm mb-6">
          <TabsTrigger value="workflow" className="h-full px-8 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Fluxo de Trabalho</TabsTrigger>
          <TabsTrigger value="detalhes" className="h-full px-8 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Detalhes do Caso</TabsTrigger>
          <TabsTrigger value="historico" className="h-full px-8 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Histórico Completo</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline Vertical de Etapas */}
            <Card className="rounded-3xl border-2 shadow-2xl overflow-hidden bg-white/50 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" /> Progressão do Tratamento
                </CardTitle>
                <CardDescription className="font-medium text-muted-foreground italic">Controle visual de todas as fases do laboratório e clínica</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="relative space-y-8 before:absolute before:left-[17px] before:top-4 before:h-[calc(100%-32px)] before:w-1 before:bg-muted-foreground/10 before:rounded-full">
                  {etapas.length > 0 ? etapas.map((etapa, idx) => {
                    const statusRaw = proc[`${etapa.key}_status`] as string;
                    const status = statusRaw?.toLowerCase()?.trim() || 'pendente';
                    const isDone = status === 'finalizado' || status === 'concluido' || status === 'procedimento ok';
                    const isInProgress = status === 'em andamento';
                    
                    console.info(`Timeline [${etapa.label}]:`, { statusRaw, status, isDone, isInProgress });
                    const executadoEm = proc[`${etapa.key}_executado_em`];

                    return (
                      <div key={idx} className="relative pl-12 group">
                        <div className={`absolute left-0 top-1 p-1.5 rounded-full z-10 transition-all border-4 
                          ${isDone ? 'bg-green-600 border-green-600 shadow-[0_0_20px_rgba(22,163,74,0.6)] animate-in fade-in zoom-in duration-500' : 
                            isInProgress ? 'bg-amber-500 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse' : 
                            'bg-white border-slate-200 shadow-inner'}`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : isInProgress ? <Clock className="w-5 h-5 text-white" /> : <div className="w-5 h-5 rounded-full" />}
                        </div>
                        {/* O preenchimento de cor agora é forçado no container externo da etapa para visibilidade total */}
                        <div className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group/card
                          ${isDone ? '!bg-green-600 border-green-700 shadow-lg translate-x-1 text-white' : 
                            isInProgress ? '!bg-amber-400 border-amber-500 shadow-2xl -translate-y-1 scale-[1.02] text-amber-950 animate-pulse' : 
                            'bg-white hover:bg-slate-50 border-slate-100 text-foreground'}`}
                         onClick={() => handleUpdateStatus(etapa.key, statusRaw as StatusEtapa, etapa.responsavel)}
                        >
                          <div className={`absolute right-0 top-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10 
                            ${isDone ? 'bg-white' : isInProgress ? 'bg-black' : 'bg-primary'}`} />
                          
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex flex-col">
                              <h4 className={`font-black text-xl ${isDone ? 'text-white' : isInProgress ? 'text-amber-950' : 'group-hover:text-primary'} transition-colors uppercase tracking-tight`}>
                                 {etapa.label}
                              </h4>
                              {isInProgress && (
                                <span className="text-[10px] font-black bg-black/10 px-2 py-0.5 rounded-full w-fit mt-1 animate-pulse">
                                  🔥 PRÓXIMA AÇÃO
                                </span>
                              )}
                            </div>
                            <Badge className={`${isDone ? 'bg-white/20 text-white' : isInProgress ? 'bg-black/20 text-amber-950' : etapa.responsavel === 'DENTISTA' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'} border-none font-black ml-4`}>
                               {etapa.responsavel}
                            </Badge>
                          </div>
                           {executadoEm && (
                            <p className="text-[10px] font-black mt-2 italic flex items-center gap-1.5 opacity-80 uppercase tracking-tighter">
                               <Check className="w-3 h-3" /> Realizado por {proc[`${etapa.key}_executado_por`]} em {safeFormatDate(executadoEm)}
                            </p>
                          )}
                          {!isDone && !isInProgress && (
                             <p className="text-[10px] font-bold mt-2 opacity-40 uppercase">Clique para iniciar esta etapa</p>
                          )}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-10 italic text-muted-foreground">Nenhum fluxo definido para este tipo.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controle Técnico e Resumo */}
            <div className="space-y-6">
                <Card className="rounded-3xl border-2 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-md border-primary/10">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b flex flex-row items-center justify-between py-4">
                        <div>
                           <CardTitle className="flex items-center gap-2 text-primary font-black"><ClipboardList className="w-6 h-6" /> Controle Técnico</CardTitle>
                           <CardDescription className="font-bold text-muted-foreground italic">Dados essenciais para moldagem e laboratório</CardDescription>
                        </div>
                        <Button 
                           variant={isEditingTech ? "ghost" : "outline"} 
                           size="sm"
                           onClick={() => setIsEditingTech(!isEditingTech)}
                           className="font-black gap-2 border-2"
                        >
                           {isEditingTech ? <><CloseIcon className="w-4 h-4" /> Cancelar</> : <><Save className="w-4 h-4" /> Editar Dados</>}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {!isEditingTech ? (
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200 shadow-sm">
                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">Dente</span>
                                <span className="text-2xl font-black text-orange-800">{corDente || 'N/I'}</span>
                             </div>
                             <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200 shadow-sm">
                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">Gengiva</span>
                                <span className="text-2xl font-black text-orange-800">{corGengiva || 'N/I'}</span>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-sm col-span-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Arcada Planejada</span>
                                <span className="text-2xl font-black text-slate-800 uppercase">{arcadaSelected === 'SUP/INF' ? 'SUP/INF' : arcadaSelected}</span>
                             </div>
                             <div className={`p-4 rounded-2xl border-2 shadow-sm col-span-2 flex items-center justify-between ${registroMordida ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registro Mordida</span>
                                   <span className={`text-xl font-black ${registroMordida ? 'text-green-700' : 'text-slate-500'}`}>{registroMordida ? 'REALIZADO ✅' : 'PENDENTE ❌'}</span>
                                </div>
                             </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                   <UILabel className="text-[10px] uppercase font-black tracking-widest opacity-80 text-orange-600">Cor do Dente</UILabel>
                                   <Input 
                                     value={corDente}
                                     onChange={(e) => setCorDente(e.target.value)}
                                     placeholder="A1, A2..."
                                     className="h-12 text-lg font-black border-2 border-orange-400/50 bg-white"
                                   />
                                </div>
                                <div className="space-y-2">
                                   <UILabel className="text-[10px] uppercase font-black tracking-widest opacity-80 text-orange-600">Cor da Gengiva</UILabel>
                                   <Input 
                                     value={corGengiva}
                                     onChange={(e) => setCorGengiva(e.target.value)}
                                     placeholder="Média..."
                                     className="h-12 text-lg font-black border-2 border-orange-400/50 bg-white"
                                   />
                                </div>
                             </div>
                             
                             <div className="space-y-2">
                                <UILabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Arcada Alvo</UILabel>
                                <div className="grid grid-cols-3 gap-2">
                                   {['SUP', 'INF', 'SUP/INF'].map(a => (
                                      <Button 
                                        key={a}
                                        variant={arcadaSelected === a ? 'default' : 'outline'}
                                        onClick={() => setArcadaSelected(a)}
                                        className="font-black text-[10px] h-10 border-2"
                                      >
                                         {a === 'SUP/INF' ? 'AMBAS' : a}
                                      </Button>
                                   ))}
                                </div>
                             </div>

                             <div className="flex items-center justify-between p-4 bg-slate-50 border-2 rounded-2xl">
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-700">Registro de Mordida</span>
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Realizou o registro?</span>
                                </div>
                                <Switch 
                                  checked={registroMordida}
                                  onCheckedChange={setRegistroMordida}
                                  className="data-[state=checked]:bg-green-500 scale-125"
                                />
                             </div>

                             <Button 
                               onClick={handleSaveCamposTecnicos}
                               className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-lg transform active:scale-95 transition-all"
                             >
                               <Save className="w-5 h-5" /> Confirmar Alterações
                             </Button>
                          </div>
                        )}
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="detalhes">
            <Card className="rounded-3xl p-8 border-2 shadow-lg space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1 border-l-4 border-primary">Informações Técnicas</label>
                        <div className="p-6 bg-slate-50 rounded-2xl border flex flex-col gap-4 text-lg font-bold">
                           <p className="flex justify-between">Arcada: <span className="text-primary">{proc.arcada || 'N/A'}</span></p>
                           <p className="flex justify-between">Dente: <span className="text-primary">{proc.dente || 'N/A'}</span></p>
                           <p className="flex justify-between">Marca do Dente: <Badge className="bg-orange-600 font-black">{proc.marca_dente || 'NÃO INFORMADO'}</Badge></p>
                           <p className="flex justify-between">Data Inicial: <span className="text-primary">{safeFormatDate(proc.data_inicial)}</span></p>
                           
                           {/* Campos da Moldagem (Tópico 04) */}
                           {proc.cor_dente && (
                             <div className="mt-4 pt-4 border-t-2 border-dashed border-primary/20 space-y-3">
                                <p className="flex justify-between text-sm text-muted-foreground font-black uppercase">Dados de Moldagem</p>
                                <p className="flex justify-between">Cor Dente: <Badge className="bg-primary text-white font-black">{proc.cor_dente}</Badge></p>
                                <p className="flex justify-between">Cor Gengiva: <Badge variant="outline" className="border-primary text-primary font-black">{proc.cor_gengiva}</Badge></p>
                                <p className="flex justify-between">Reg. Mordida: <span className={proc.registro_mordida ? "text-emerald-600" : "text-red-500"}>{proc.registro_mordida ? '✅ SIM' : '❌ NÃO'}</span></p>
                                <p className="flex justify-between">
                                  Arcadas: 
                                  <span className="flex gap-2">
                                    {proc.moldagem_superior && <Badge className="bg-blue-500 font-bold">SUP</Badge>}
                                    {proc.moldagem_inferior && <Badge className="bg-indigo-500 font-bold">INF</Badge>}
                                  </span>
                                </p>
                             </div>
                           )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1 border-l-4 border-primary">Observações do Caso</label>
                        <div className="p-8 bg-amber-50/30 border-2 border-amber-100 italic font-medium text-lg text-amber-900 rounded-3xl min-h-[150px]">
                            {proc.observacoes || 'Nenhuma observação cadastrada.'}
                        </div>
                    </div>
                </div>
            </Card>
        </TabsContent>

        <TabsContent value="historico">
            <Card className="rounded-3xl border-2 shadow-xl p-8 bg-white">
                 {historico && historico.length > 0 ? (
                   <div className="space-y-4">
                      {historico.map((h: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border group hover:border-primary/50 transition-all">
                             <div className="flex items-center gap-4">
                                 <div className="p-3 bg-white rounded-xl shadow-sm border group-hover:rotate-6 transition-transform"><History className="w-5 h-5 text-primary" /></div>
                                 <div>
                                     <p className="font-black text-slate-800">{h.etapa_label || 'Etapa'} <span className="text-xs text-slate-500 ml-2">({h.acao || 'Ação'})</span></p>
                                     <p className="text-sm font-bold text-slate-500 italic">Por: {h.executor_nome || 'Sistema'}</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-sm font-black text-slate-800">{safeFormatDate(h.executado_em)}</p>
                             </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="text-center py-20 italic text-muted-foreground text-xl font-bold">Nenhum histórico registrado ainda.</div>
                 )}
            </Card>
        </TabsContent>
      </Tabs>
      <ModalFinalizarMoldagem 
        isOpen={showMoldagemModal} 
        onClose={() => setShowMoldagemModal(false)}
        onConfirm={handleConfirmMoldagem}
      />
      <ModalSelecaoProfissional 
        isOpen={showProfissionalModal}
        onClose={() => setShowProfissionalModal(false)}
        tipoExecutor={selectedTipoExecutor}
        onConfirm={handleConfirmProfissional}
        isSubmitting={isUpdatingEtapa}
      />
    </div>
  );
}
