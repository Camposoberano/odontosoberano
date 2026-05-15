import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, Clock, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface Props {
  stats: {
    totalProduzido: number;
    totalEntregue: number;
    emProducao: number;
    totalPago: number;
  };
  isLoading?: boolean;
}

export function CardsResumo({ stats, isLoading }: Props) {
  const safeStats = stats || { totalProduzido: 0, totalEntregue: 0, emProducao: 0, totalPago: 0 };
  const cards = [
    {
      title: "Total Produzido",
      value: safeStats.totalProduzido,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Total de casos no período"
    },
    {
      title: "Total Entregue",
      value: safeStats.totalEntregue,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      description: "Finalizados e entregues"
    },
    {
      title: "Em Produção",
      value: safeStats.emProducao,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
      description: "Trabalhos em andamento"
    },
    {
      title: "Total Pago",
      value: (safeStats.totalPago || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "Valor pago ao laboratório"
    }
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span>+12%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</h3>
              <p className="text-[10px] text-gray-400 mt-2 uppercase font-semibold letter-spacing-wider">{card.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
