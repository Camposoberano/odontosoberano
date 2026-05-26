import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Gift,
  UserPlus,
  Activity,
  FileText,
  CheckCircle2,
  XCircle,
  Hourglass,
  Phone,
  Stethoscope,
  BarChart2,
  ListChecks,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`rounded-2xl border-2 ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-2xl font-black text-slate-800">{value}</p>
          {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" />}
      </CardContent>
    </Card>
  );
}

function PacientesBlock({
  totalPacientes,
  aniversariantesCount,
  pacientesAtendidos6M,
  pacientesNovos,
  tratamentosAbertosCount,
  debitosAtraso,
  navigate,
}: any) {
  const items = [
    {
      label: "Total Cadastrados",
      value: totalPacientes,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
      route: "/patients",
    },
    {
      label: "Aniversariantes (30 dias)",
      value: aniversariantesCount,
      icon: Gift,
      color: "text-pink-600",
      bg: "bg-pink-50",
      route: "/relatorios/aniversariantes",
    },
    {
      label: "Atendidos (6 meses)",
      value: pacientesAtendidos6M,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      route: "/patients",
    },
    {
      label: "Novos no Mês",
      value: pacientesNovos,
      icon: UserPlus,
      color: "text-blue-600",
      bg: "bg-blue-50",
      route: "/patients",
    },
    {
      label: "Tratamento Aberto Sem Consulta",
      value: tratamentosAbertosCount,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      route: "/relatorios/pacientes-tratamentos-abertos",
    },
    {
      label: "Com Débitos em Atraso",
      value: debitosAtraso.count,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      route: "/financeiro/contas-receber",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
        <Users className="w-4 h-4" /> Pacientes
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="flex items-center gap-3 p-3 rounded-xl border-2 hover:border-primary/30 hover:bg-slate-50 transition-all text-left group"
          >
            <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black text-slate-800">{item.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-tight">{item.label}</p>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-300 ml-auto group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function OrcamentosBlock({ orcamentosStats, orcamentosMensais, navigate }: any) {
  const total = orcamentosStats.aprovados + orcamentosStats.reprovados + orcamentosStats.emAberto;
  const pct = (v: number) => (total > 0 ? ((v / total) * 100).toFixed(0) : "0");

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Orçamentos
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aprovados", value: orcamentosStats.aprovados, pct: pct(orcamentosStats.aprovados), color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2, route: "/orcamentos" },
          { label: "Reprovados", value: orcamentosStats.reprovados, pct: pct(orcamentosStats.reprovados), color: "text-red-600", bg: "bg-red-50", icon: XCircle, route: "/orcamentos" },
          { label: "Em Aberto", value: orcamentosStats.emAberto, pct: pct(orcamentosStats.emAberto), color: "text-amber-600", bg: "bg-amber-50", icon: Hourglass, route: "/orcamentos" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="flex flex-col items-center p-3 rounded-xl border-2 hover:border-primary/30 hover:bg-slate-50 transition-all text-center group"
          >
            <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center mb-1`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <p className="text-2xl font-black text-slate-800">{item.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{item.label}</p>
            <p className={`text-xs font-bold ${item.color}`}>{item.pct}%</p>
          </button>
        ))}
      </div>

      {orcamentosMensais.length > 0 && (
        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">
              Orçamentos — últimos 6 meses
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={orcamentosMensais} barSize={14}>
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v: any, name: string) => [v, name === "aprovados" ? "Aprovados" : name === "reprovados" ? "Reprovados" : "Em aberto"]}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
                <Bar dataKey="aprovados" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reprovados" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emAberto" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    stats,
    proximosAgendamentos,
    isLoading,
    debitosAtraso,
    orcamentosStats,
    orcamentosMensais,
    aniversariantesCount,
    pacientesNovos,
    pacientesAtendidos6M,
    tratamentosAbertosCount,
    cancelados,
    ortodontiaStats,
  } = useDashboardStats();

  const { totalPacientes, agendamentosHoje, faturamentoMensal, faturamentoPrevisto } = stats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">
              INSTITUTO BELÉM
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Gestão clínica em tempo real
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/patients?action=new")} className="btn-orange-premium h-11 gap-2">
              <Users className="w-4 h-4" /> Novo Paciente
            </Button>
            <Button onClick={() => navigate("/appointments?action=new")} variant="outline" className="h-11 gap-2">
              <Calendar className="w-4 h-4" /> Novo Agendamento
            </Button>
          </div>
        </div>

        <DashboardAlerts stats={stats} isLoading={isLoading} />

        <Tabs defaultValue="indicadores">
          <TabsList className="grid grid-cols-4 mb-2 h-11 rounded-2xl">
            <TabsTrigger value="indicadores" className="gap-1 text-xs font-bold rounded-xl">
              <BarChart2 className="w-3.5 h-3.5" /> Indicadores
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-1 text-xs font-bold rounded-xl">
              <FileText className="w-3.5 h-3.5" /> Relatórios
            </TabsTrigger>
            <TabsTrigger value="ortodontia" className="gap-1 text-xs font-bold rounded-xl">
              <Stethoscope className="w-3.5 h-3.5" /> Ortodontia
            </TabsTrigger>
            <TabsTrigger value="tarefas" className="gap-1 text-xs font-bold rounded-xl">
              <ListChecks className="w-3.5 h-3.5" /> Tarefas
            </TabsTrigger>
          </TabsList>

          {/* ── INDICADORES ── */}
          <TabsContent value="indicadores" className="space-y-6 mt-4">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
              ) : (
                <>
                  <KpiCard
                    label="Pacientes Ativos"
                    value={totalPacientes}
                    icon={Users}
                    color="text-violet-600"
                    bg="bg-violet-50"
                    onClick={() => navigate("/patients")}
                  />
                  <KpiCard
                    label="Agenda Hoje"
                    value={agendamentosHoje.total}
                    sub={`${agendamentosHoje.confirmados} confirmados · ${agendamentosHoje.pendentes} pendentes`}
                    icon={Calendar}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    onClick={() => navigate("/appointments")}
                  />
                  <KpiCard
                    label="Faturamento Mensal"
                    value={brl(faturamentoMensal)}
                    sub={`Previsto: ${brl(faturamentoPrevisto)}`}
                    icon={TrendingUp}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    onClick={() => navigate("/financeiro/contas-receber")}
                  />
                  <KpiCard
                    label="Débitos em Atraso"
                    value={brl(debitosAtraso.total)}
                    sub={`${debitosAtraso.count} lançamento${debitosAtraso.count !== 1 ? "s" : ""}`}
                    icon={AlertCircle}
                    color="text-red-600"
                    bg="bg-red-50"
                    onClick={() => navigate("/financeiro/contas-receber")}
                  />
                </>
              )}
            </div>

            {/* Pacientes + Orçamentos lado a lado em desktop */}
            {isLoading ? (
              <Skeleton className="h-64 rounded-2xl" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-2xl border-2 p-4">
                  <PacientesBlock
                    totalPacientes={totalPacientes}
                    aniversariantesCount={aniversariantesCount}
                    pacientesAtendidos6M={pacientesAtendidos6M}
                    pacientesNovos={pacientesNovos}
                    tratamentosAbertosCount={tratamentosAbertosCount}
                    debitosAtraso={debitosAtraso}
                    navigate={navigate}
                  />
                </Card>
                <Card className="rounded-2xl border-2 p-4">
                  <OrcamentosBlock
                    orcamentosStats={orcamentosStats}
                    orcamentosMensais={orcamentosMensais}
                    navigate={navigate}
                  />
                </Card>
              </div>
            )}

            {/* Agenda do Dia */}
            <Card className="rounded-2xl border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Agenda de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
                ) : proximosAgendamentos.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-medium">Agenda livre hoje</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {proximosAgendamentos.map((a: any) => (
                      <div
                        key={a.id}
                        className="p-3 border-2 border-border/50 rounded-xl bg-white hover:border-primary/30 transition-all cursor-pointer group"
                        onClick={() => navigate("/appointments")}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-gray-700">{a.time}</span>
                          <Badge variant={a.status === "Confirmado" ? "default" : "secondary"} className="text-[10px] font-bold">
                            {a.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="font-black text-gray-900 group-hover:text-primary transition-colors text-sm uppercase line-clamp-1 leading-snug">
                          {a.patient}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight line-clamp-1">
                          {a.procedure}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── RELATÓRIOS ── */}
          <TabsContent value="relatorios" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Financeiro", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", route: "/relatorios/financeiro" },
                { label: "Comissões", icon: Users, color: "text-violet-600", bg: "bg-violet-50", route: "/relatorios/comissao" },
                { label: "Ganho Dentista", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50", route: "/relatorios/ganho-dentista" },
                { label: "Orçamentos", icon: FileText, color: "text-teal-600", bg: "bg-teal-50", route: "/relatorios/orcamentos" },
                { label: "Vendas por Tratamento", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50", route: "/relatorios/vendas-por-tratamentos" },
                { label: "Vendas por Profissional", icon: Users, color: "text-amber-600", bg: "bg-amber-50", route: "/relatorios/vendas-por-profissional" },
                { label: "Vendas por Plano", icon: FileText, color: "text-cyan-600", bg: "bg-cyan-50", route: "/relatorios/vendas-por-planos" },
                { label: "Despesas por Categoria", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", route: "/relatorios/despesas-por-categoria" },
                { label: "Aniversariantes", icon: Gift, color: "text-pink-600", bg: "bg-pink-50", route: "/relatorios/aniversariantes" },
                { label: "Tratamentos Abertos", icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", route: "/relatorios/pacientes-tratamentos-abertos" },
                { label: "Pacientes Indicados", icon: UserPlus, color: "text-lime-600", bg: "bg-lime-50", route: "/relatorios/pacientes-indicados" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 hover:border-primary/30 hover:bg-slate-50 transition-all text-left group"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-primary transition-colors">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </TabsContent>

          {/* ── ORTODONTIA ── */}
          <TabsContent value="ortodontia" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KpiCard
                label="Pacientes com Tratamento Ativo"
                value={ortodontiaStats.ativos}
                icon={Stethoscope}
                color="text-violet-600"
                bg="bg-violet-50"
              />
              <KpiCard
                label="Novos Tratamentos no Mês"
                value={ortodontiaStats.novosMes}
                icon={UserPlus}
                color="text-emerald-600"
                bg="bg-emerald-50"
              />
            </div>

            <Card className="rounded-2xl border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" /> Pacientes Sem Consulta Agendada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border-2 border-orange-100">
                  <div>
                    <p className="text-3xl font-black text-orange-700">{tratamentosAbertosCount}</p>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">paciente{tratamentosAbertosCount !== 1 ? "s" : ""} sem agendamento futuro</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/relatorios/pacientes-tratamentos-abertos")} className="gap-2">
                    Ver lista <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAREFAS ── */}
          <TabsContent value="tarefas" className="mt-4 space-y-6">
            <Card className="rounded-2xl border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" /> Faltas (últimos 30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cancelados.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma falta registrada nos últimos 30 dias.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Paciente</th>
                          <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Data</th>
                          <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Procedimento</th>
                          <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Profissional</th>
                          <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Contato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancelados.map((c: any) => (
                          <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{c.paciente}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {format(new Date(c.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{c.procedimento}</td>
                            <td className="px-4 py-3 text-slate-600">{c.dentista}</td>
                            <td className="px-4 py-3">
                              {c.telefone ? (
                                <a
                                  href={`https://wa.me/55${c.telefone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-green-600 hover:underline font-medium"
                                >
                                  <Phone className="w-3 h-3" /> {c.telefone}
                                </a>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick action cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Tratamentos Abertos", value: tratamentosAbertosCount, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", route: "/relatorios/pacientes-tratamentos-abertos" },
                { label: "Aniversariantes", value: aniversariantesCount, icon: Gift, color: "text-pink-600", bg: "bg-pink-50", route: "/relatorios/aniversariantes" },
                { label: "Novos no Mês", value: pacientesNovos, icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50", route: "/patients" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className="flex flex-col items-center p-4 rounded-2xl border-2 hover:border-primary/30 hover:bg-slate-50 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-2`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{item.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center">{item.label}</p>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
