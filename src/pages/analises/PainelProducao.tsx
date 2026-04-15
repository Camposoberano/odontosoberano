import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FiltrosPainel } from "@/components/analises/FiltrosPainel";
import { CardsResumo } from "@/components/analises/CardsResumo";
import { RankingProducao } from "@/components/analises/RankingProducao";
import { ListaCasosProtese } from "@/components/analises/ListaCasosProtese";
import { useProteseAnalytics, FiltrosProtese } from "@/hooks/useProteseAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ListOrdered, Calculator, TrendingUp, Package, CheckCircle, Clock, Download, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/utils/exportUtils";
import { format } from "date-fns";

import { DetalhesProfissionalDialog } from "@/components/analises/DetalhesProfissionalDialog";

export default function PainelProducao() {
  const [filtros, setFiltros] = useState<FiltrosProtese>({
    periodo: 'mes'
  });

  const [profissionalSelecionado, setProfissionalSelecionado] = useState<any>(null);

  const { data: analytics, isLoading } = useProteseAnalytics(filtros);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
        
        <header className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl shadow-xl border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 blur-[80px] -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/20 shadow-inner">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold tracking-wider px-2.5 py-0.5 text-[10px] uppercase">
                Em Tempo Real
              </Badge>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Painel de Produção <span className="text-sm font-bold text-blue-400 border-l-2 border-blue-500/30 pl-4 uppercase tracking-tighter">Analytics Gold</span>
            </h1>
            <p className="text-blue-100/60 mt-2 max-w-xl font-medium">
              Gestão inteligente de procedimentos protéticos, performance profissional e automação financeira centralizada.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-4">
             <div className="flex gap-2 mr-4 hide-print">
               <Button 
                 variant="outline" 
                 size="sm" 
                 disabled={!analytics || analytics.items.length === 0}
                 onClick={() => {
                   if (analytics) exportToCSV(analytics.items, `Producao_Protese_${format(new Date(), 'dd_MM_yyyy')}.csv`);
                 }}
                 className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all font-bold group"
               >
                 <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                 Planilha
               </Button>
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => window.print()}
                 className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all font-bold group"
               >
                 <Printer className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                 Imprimir
               </Button>
             </div>
             
             <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-blue-300/60 mb-1 tracking-widest">Procedimentos</span>
                <span className="text-2xl font-black text-white">{analytics?.items.length || 0}</span>
             </div>
             <div className="p-4 bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-emerald-400/60 mb-1 tracking-widest">Faturamento Lab</span>
                <span className="text-xl font-black text-emerald-400">
                  {analytics?.financeiro.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </span>
             </div>
          </div>
        </header>

        <style>
          {`
            @media print {
              .hide-print, 
              aside, 
              button, 
              .AppSidebar,
              .command-menu,
              [role="tablist"] { display: none !important; }
              main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
              header { background: #0f172a !important; color: white !important; border-radius: 0 !important; padding: 2rem !important; }
              .grid { display: block !important; }
              .card { border: 1px solid #e2e8f0 !important; break-inside: avoid; margin-bottom: 2rem; }
              .TabsContent { display: block !important; }
            }
          `}
        </style>

        <FiltrosPainel filtros={filtros} setFiltros={setFiltros} />

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[400px] w-full rounded-xl" />
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        ) : !analytics ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <h3 className="text-lg font-semibold text-gray-400">Nenhum dado encontrado para os filtros selecionados</h3>
          </div>
        ) : (
          <>
            <CardsResumo stats={analytics.stats} />

            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="flex h-auto w-fit p-1.5 bg-gray-100/50 backdrop-blur-sm rounded-2xl gap-1 mb-8">
                <TabsTrigger value="geral" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-xl px-6 py-2.5 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-gray-500">
                  <TrendingUp className="h-4 w-4" /> Produção & Pódio
                </TabsTrigger>
                <TabsTrigger value="financeiro" className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md rounded-xl px-6 py-2.5 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-gray-500">
                  <Calculator className="h-4 w-4" /> Fluxo Financeiro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-6 outline-none transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <RankingProducao 
                      rankingDoc={analytics.rankingDoc} 
                      rankingLab={analytics.rankingLab} 
                      onShowDetails={(prof) => setProfissionalSelecionado(prof)}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <Card className="border-none shadow-sm h-full">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Produção por Prótese</CardTitle>
                        <Package className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6 mt-4">
                          {Object.entries(analytics.porTipo).map(([tipo, counts]) => (
                            <div key={tipo} className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-700">{tipo}</span>
                                <div className="flex gap-3">
                                  <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {counts.produzido} PROD.
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> {counts.entregue} ENT.
                                  </span>
                                </div>
                              </div>
                              <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-100">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-500" 
                                  style={{ width: `${(counts.produzido / (analytics.items.length || 1)) * 100}%` }}
                                ></div>
                                <div 
                                  className="h-full bg-emerald-500 transition-all duration-500" 
                                  style={{ width: `${(counts.entregue / (analytics.items.length || 1)) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <ListaCasosProtese items={analytics.items} />
              </TabsContent>

              <TabsContent value="financeiro" className="space-y-6 outline-none transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                      <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-100">Performance Financeira</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-sm">
                                 <span className="text-emerald-100/80 font-medium">Casos Liquidados:</span>
                                 <Badge className="bg-white/20 text-white border-none hover:bg-white/30 font-bold">{analytics.financeiro.pago}</Badge>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                 <span className="text-emerald-100/80 font-medium">Pendentes de Pgto:</span>
                                 <Badge className="bg-red-400/20 text-red-100 border-none hover:bg-red-400/30 font-bold">{analytics.financeiro.pendente}</Badge>
                              </div>
                              <div className="h-[1px] w-full bg-white/10 my-1"></div>
                              <div className="pt-2">
                                 <p className="text-[10px] uppercase font-bold text-emerald-200 mb-1">Média por Caso</p>
                                 <span className="text-3xl font-black">
                                    {(analytics.financeiro.valorTotal / (analytics.items.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                 </span>
                              </div>
                           </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm h-full">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Controle por Tipo</CardTitle>
                          <Calculator className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 mt-2">
                            {Object.entries(analytics.financeiro.porTipo).map(([tipo, values]: [string, any]) => (
                               <div key={tipo} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl">
                                  <span className="text-xs font-bold text-gray-700">{tipo}</span>
                                  <div className="flex justify-between items-center">
                                     <span className="text-[10px] font-medium text-gray-500">Total: {values.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                     <div className="flex gap-2">
                                        <Badge className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-100">{((values.pago / (values.total || 1)) * 100).toFixed(0)}% Pago</Badge>
                                     </div>
                                  </div>
                               </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-none shadow-sm bg-white border border-gray-100">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> 
                            Automação Ativa
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-gray-500 leading-relaxed font-medium">
                           Todos os lançamentos marcados como <span className="text-emerald-600 font-bold italic">"Pago"</span> são migrados instantaneamente para a categoria <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">Laboratório de Prótese</span> no seu financeiro geral.
                        </CardContent>
                      </Card>
                  </div>
                  <div className="lg:col-span-2">
                    <ListaCasosProtese items={analytics.items.filter(i => !!i.pagamento_lab_status)} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DetalhesProfissionalDialog 
              profissional={profissionalSelecionado}
              items={analytics.items}
              isOpen={!!profissionalSelecionado}
              onOpenChange={(open) => !open && setProfissionalSelecionado(null)}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
