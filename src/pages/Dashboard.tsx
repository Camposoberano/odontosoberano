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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, proximosAgendamentos, isLoading } = useDashboardStats();

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
      title: "Faturamento Mensal",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats?.faturamentoMensal || 0),
      change: `Previsto: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats?.faturamentoPrevisto || 0)}`,
      icon: TrendingUp,
      color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-100",
      route: "/financeiro/contas-receber",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Gestão clínica em tempo real</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/patients?action=new")}
              className="btn-orange-premium h-14"
            >
              <Users className="w-5 h-5" /> Novo Cadastro
            </Button>
            <Button
              onClick={() => navigate("/appointments?action=new")}
              className="btn-orange-premium h-14"
            >
              <Calendar className="w-5 h-5" /> Novo Agendamento
            </Button>
          </div>
        </div>

        <DashboardAlerts stats={stats} isLoading={isLoading} />

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
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

        {/* Agenda do Dia */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="w-5 h-5 mr-2 text-primary" /> Agenda de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => (<Skeleton key={i} className="h-20 w-full rounded-xl" />))}</div>
            ) : (proximosAgendamentos || []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Agenda livre hoje</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {proximosAgendamentos.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 border-2 border-border/50 rounded-xl bg-white hover:border-primary/30 transition-all group cursor-pointer"
                    onClick={() => navigate('/appointments')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {appointment.time.split(':')[0]}
                        </div>
                        <span className="font-bold text-sm text-gray-700">{appointment.time}</span>
                      </div>
                      <Badge
                        variant={appointment.status === "Confirmado" ? "default" : "secondary"}
                        className="text-[10px] font-bold"
                      >
                        {appointment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="font-black text-gray-900 group-hover:text-primary transition-colors text-sm uppercase line-clamp-1 leading-snug">
                      {appointment.patient}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight line-clamp-1">
                      {appointment.procedure}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
