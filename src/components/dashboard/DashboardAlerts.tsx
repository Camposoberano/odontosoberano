import React from 'react';
import { AlertCircle, Package, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface DashboardAlertsProps {
  stats: {
    osAtrasadas: number;
    produtosFalta: number;
    agendamentosHoje: { total: number; pendentes: number };
  };
  isLoading: boolean;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  variant: 'destructive' | 'warning' | 'medical';
  action: () => void;
  actionLabel: string;
}

export function DashboardAlerts({ stats, isLoading }: DashboardAlertsProps) {
  const navigate = useNavigate();

  if (isLoading) return null;

  const alerts: AlertItem[] = [];

  // Alerta de OS Atrasadas
  if (stats.osAtrasadas > 0) {
    alerts.push({
      id: 'os-atrasadas',
      title: 'Atenção: Ordens de Serviço Atrasadas',
      description: `Existem ${stats.osAtrasadas} ordens de serviço com data de entrega vencida.`,
      icon: Clock,
      variant: 'destructive',
      action: () => navigate('/procedimentos'),
      actionLabel: 'Ver Procedimentos'
    });
  }

  // Alerta de Estoque
  if (stats.produtosFalta > 0) {
    alerts.push({
      id: 'estoque-baixo',
      title: 'Reposição Necessária',
      description: `${stats.produtosFalta} itens do estoque estão abaixo do nível mínimo recomendado.`,
      icon: Package,
      variant: 'warning',
      action: () => navigate('/estoque'),
      actionLabel: 'Gerenciar Estoque'
    });
  }

  // Alerta de Agendamentos Pendentes (se for começo do dia ou houver muitos)
  if (stats.agendamentosHoje.pendentes > 0) {
    alerts.push({
      id: 'agendamentos-pendentes',
      title: 'Confirmações Pendentes',
      description: `Ainda existem ${stats.agendamentosHoje.pendentes} pacientes que não confirmaram consulta hoje.`,
      icon: Calendar,
      variant: 'medical',
      action: () => navigate('/appointments'),
      actionLabel: 'Ver Agenda'
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
        <div className="p-2 bg-green-500 rounded-full">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-green-800">Tudo em dia!</h3>
          <p className="text-sm text-green-600">Não existem alertas críticos ou urgências no momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id} 
          className={`border-2 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
            alert.variant === 'destructive' ? 'border-red-200 bg-red-50' : 
            alert.variant === 'warning' ? 'border-orange-200 bg-orange-50' : 
            'border-blue-200 bg-blue-50'
          }`}
        >
          <alert.icon className={`h-5 w-5 ${
            alert.variant === 'destructive' ? 'text-red-600' : 
            alert.variant === 'warning' ? 'text-orange-600' : 
            'text-blue-600'
          }`} />
          <div className="ml-2 flex-1">
            <AlertTitle className={`font-bold ${
              alert.variant === 'destructive' ? 'text-red-800' : 
              alert.variant === 'warning' ? 'text-orange-800' : 
              'text-blue-800'
            }`}>
              {alert.title}
            </AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
              <span className="text-gray-700">{alert.description}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={alert.action}
                className="h-8 border-current hover:bg-current hover:text-white transition-all font-semibold"
              >
                {alert.actionLabel}
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      ))}
    </div>
  );
}
