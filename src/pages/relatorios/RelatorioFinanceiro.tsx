import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileTable } from "@/components/ui/mobile-table";
import { DollarSign, Download, Calendar, TrendingUp, TrendingDown, ArrowUp, AlertCircle, Wallet, Activity } from "lucide-react";
import { useRelatorioFinanceiro } from "@/hooks/useRelatorioFinanceiro";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from "framer-motion";
import { downloadCSV } from "@/utils/exportUtils";

export default function RelatorioFinanceiro() {
  const [dataInicio, setDataInicio] = useState<Date>(new Date(new Date().setDate(1)));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [showCalendarInicio, setShowCalendarInicio] = useState(false);
  const [showCalendarFim, setShowCalendarFim] = useState(false);
  
  const { dadosFinanceiros, loading } = useRelatorioFinanceiro(dataInicio, dataFim);

  const handleExportPDF = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
        return;
      }

      const margemLucro = dadosFinanceiros.receitas_total > 0 
        ? ((dadosFinanceiros.saldo / dadosFinanceiros.receitas_total) * 100).toFixed(1) 
        : '0.0';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #666; padding-bottom: 10px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
            .summary-card .value { font-size: 24px; font-weight: bold; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            .neutral { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .section-title { margin-top: 30px; font-size: 18px; font-weight: bold; }
            .category-list { margin: 20px 0; }
            .category-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório Financeiro</h1>
          <p>Período: ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} - ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}</p>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Receitas Totais</h3>
              <div class="value positive">R$ ${dadosFinanceiros.receitas_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Despesas Totais</h3>
              <div class="value negative">R$ ${dadosFinanceiros.despesas_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Saldo</h3>
              <div class="value neutral">R$ ${dadosFinanceiros.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Margem</h3>
              <div class="value">${margemLucro}%</div>
            </div>
          </div>

          <h2 class="section-title">Pendências Financeiras</h2>
          <div class="summary">
            <div class="summary-card">
              <h3>Contas a Receber</h3>
              <div class="value">R$ ${dadosFinanceiros.contas_receber_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Contas a Pagar</h3>
              <div class="value">R$ ${dadosFinanceiros.contas_pagar_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Cheques a Compensar</h3>
              <div class="value">R$ ${dadosFinanceiros.cheques_compensar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <h2 class="section-title">Receitas por Categoria</h2>
          <div class="category-list">
            ${dadosFinanceiros.receitas_por_categoria.map(r => `
              <div class="category-item">
                <span>${r.categoria}</span>
                <span class="positive">R$ ${r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
          </div>

          <h2 class="section-title">Despesas por Categoria</h2>
          <div class="category-list">
            ${dadosFinanceiros.despesas_por_categoria.map(d => `
              <div class="category-item">
                <span>${d.categoria}</span>
                <span class="negative">R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
          </div>

          <div class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Imprimir / Salvar como PDF
            </button>
            <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Fechar
            </button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      toast.success('Documento preparado para impressão/exportação!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const margemLucro = dadosFinanceiros.receitas_total > 0 
    ? ((dadosFinanceiros.saldo / dadosFinanceiros.receitas_total) * 100).toFixed(1) 
    : '0.0';

  const handleExportCSV = () => {
    try {
      // Exportar Resumo por Categoria (Receitas)
      const csvReceitas = dadosFinanceiros.receitas_por_categoria.map(r => ({
        Tipo: 'RECEITA',
        Categoria: r.categoria,
        Valor: r.valor
      }));

      // Exportar Resumo por Categoria (Despesas)
      const csvDespesas = dadosFinanceiros.despesas_por_categoria.map(d => ({
        Tipo: 'DESPESA',
        Categoria: d.categoria,
        Valor: d.valor
      }));

      // Exportar Fluxo Mensal
      const csvFluxo = dadosFinanceiros.fluxo_mensal.map(f => ({
        Tipo: 'FLUXO_MENSAL',
        Mes: f.mes,
        Receitas: f.receitas,
        Despesas: f.despesas,
        Saldo: f.receitas - f.despesas
      }));

      const allData = [...csvReceitas, ...csvDespesas, ...csvFluxo];
      downloadCSV(allData, 'Relatorio_Financeiro');
      toast.success('CSV exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const fluxoColumns = [
    { key: 'mes', header: 'Mês' },
    { 
      key: 'receitas', 
      header: 'Receitas',
      render: (item: any) => `R$ ${(item.receitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
    { 
      key: 'despesas', 
      header: 'Despesas',
      render: (item: any) => `R$ ${(item.despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
  ];

  const renderFluxoMobileCard = (item: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{item.mes}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Receitas:</span>
          <span className="font-medium text-green-600">
            R$ {(item.receitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Despesas:</span>
          <span className="font-medium text-red-600">
            R$ {(item.despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatório Financeiro</h1>
            <p className="text-muted-foreground">Análise completa da situação financeira da clínica</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover open={showCalendarInicio} onOpenChange={setShowCalendarInicio}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4" />
                  Início: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataInicio}
                  onSelect={(date) => {
                    if (date) {
                      setDataInicio(date);
                      setShowCalendarInicio(false);
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover open={showCalendarFim} onOpenChange={setShowCalendarFim}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4" />
                  Fim: {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataFim}
                  onSelect={(date) => {
                    if (date) {
                      setDataFim(date);
                      setShowCalendarFim(false);
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none border-2 hover:bg-emerald-50 hover:border-emerald-200 gap-2 transition-all"
                onClick={handleExportCSV}
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Exportar CSV
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none border-2 hover:bg-primary/5 gap-2 transition-all"
                onClick={handleExportPDF}
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo do Período - Cards Premium */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="medical-card">
                <CardHeader className="space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="medical-card border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">RECEITAS</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-gray-800">
                      R$ {dadosFinanceiros.receitas_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1 text-emerald-500" /> Total realizado no período
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="medical-card border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-rose-50 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-rose-600" />
                    </div>
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100 font-bold">DESPESAS</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-gray-800">
                      R$ {dadosFinanceiros.despesas_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Total de saídas pagas</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={`medical-card border-l-4 shadow-sm hover:shadow-md transition-all ${dadosFinanceiros.saldo >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${dadosFinanceiros.saldo >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                      <DollarSign className={`h-5 w-5 ${dadosFinanceiros.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <Badge variant="outline" className={`${dadosFinanceiros.saldo >= 0 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'} font-bold`}>
                      SALDO REAL
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className={`text-3xl font-black ${dadosFinanceiros.saldo >= 0 ? 'text-gray-800' : 'text-rose-600'}`}>
                      R$ {dadosFinanceiros.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Lucro líquido operacional</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="medical-card border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 font-bold">MARGEM</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-gray-800">{margemLucro}%</div>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Rentabilidade sobre receita</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Gráfico de Fluxo de Caixa */}
        <Card className="medical-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Fluxo de Caixa Mensal
            </CardTitle>
            <CardDescription className="font-medium">
              Comparativo de receitas e despesas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[350px] w-full">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosFinanceiros.fluxo_mensal} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mes" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Pendências Financeiras */}
        <Card className="medical-card border-2 border-primary/10 shadow-sm">
          <CardHeader className="bg-primary/5 border-b-2 border-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl font-black text-primary">
              <AlertCircle className="w-5 h-5" />
              Projetado (Não realizado)
            </CardTitle>
            <CardDescription className="font-bold text-primary/70">
              Valores pendentes de recebimento ou pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border-2 border-orange-100 rounded-xl bg-orange-50/30 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Wallet className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-black text-orange-800 uppercase tracking-tight">A Receber</span>
                  </div>
                  <div className="text-3xl font-black text-orange-600">
                    R$ {dadosFinanceiros.contas_receber_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] font-bold text-orange-600/70 mt-1 uppercase">Entradas pendentes</p>
                </div>

                <div className="p-4 border-2 border-rose-100 rounded-xl bg-rose-50/30 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-sm font-black text-rose-800 uppercase tracking-tight">A Pagar</span>
                  </div>
                  <div className="text-3xl font-black text-rose-600">
                    R$ {dadosFinanceiros.contas_pagar_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] font-bold text-rose-600/70 mt-1 uppercase">Saídas pendentes</p>
                </div>

                <div className="p-4 border-2 border-blue-100 rounded-xl bg-blue-50/30 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-black text-blue-800 uppercase tracking-tight">Em Carteira</span>
                  </div>
                  <div className="text-3xl font-black text-blue-600">
                    R$ {dadosFinanceiros.cheques_compensar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] font-bold text-blue-600/70 mt-1 uppercase">Cheques a compensar</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receitas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Receitas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : dadosFinanceiros.receitas_por_categoria.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma receita encontrada no período
                </p>
              ) : (
                <div className="space-y-4">
                  {dadosFinanceiros.receitas_por_categoria.map((item, index) => {
                    const percentual = dadosFinanceiros.receitas_total > 0 
                      ? (item.valor / dadosFinanceiros.receitas_total) * 100 
                      : 0;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.categoria}</span>
                            <span className="text-sm text-muted-foreground">{percentual.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(percentual, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="text-sm font-medium text-green-600">
                            R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Despesas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : dadosFinanceiros.despesas_por_categoria.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma despesa encontrada no período
                </p>
              ) : (
                <div className="space-y-4">
                  {dadosFinanceiros.despesas_por_categoria.map((item, index) => {
                    const percentual = dadosFinanceiros.despesas_total > 0 
                      ? (item.valor / dadosFinanceiros.despesas_total) * 100 
                      : 0;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.categoria}</span>
                            <span className="text-sm text-muted-foreground">{percentual.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(percentual, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="text-sm font-medium text-red-600">
                            R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
