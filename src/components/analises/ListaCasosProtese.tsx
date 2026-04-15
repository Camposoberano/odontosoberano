import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProteseAnalyticItem } from "@/hooks/useProteseAnalytics";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, ExternalLink, DollarSign, CheckCircle2, Clock4, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Props {
  items: ProteseAnalyticItem[];
}

export function ListaCasosProtese({ items }: Props) {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluído': return <CheckCircle2 className="h-4 w-4 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />;
      case 'Em andamento': return <Clock4 className="h-4 w-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />;
      default: return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getFinanceStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pendente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Não Pago': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const navigateToDetail = (item: ProteseAnalyticItem) => {
    const routeMap: Record<string, string> = {
      'PPR': 'ppr',
      'Prótese Total': 'pt',
      'Ponte Móvel': 'pm',
      'Fixa Provisória': 'fixa',
      'Protocolo Definitivo': 'protocolo-definitivo',
      'Protocolo Provisório': 'protocolo-provisorio',
      'Protocolo': 'protocolo-definitivo', 
      'Fixa de Cerâmica': 'fixa-ceramica',
      'Fixa Impressa': 'fixa-impressa',
      'Adesiva': 'adesiva',
      'Restauração Indireta': 'restauracao-indireta',
      'Placa de Bruxismo': 'bruxismo',
      'Clareamento': 'clareamento',
      'Coroa Sobre Implante': 'coroa-implante',
      'Fixa de Zircônia': 'fixa-zirconia',
      'Laboratório Externo': 'lab-externo',
      'Lab Externo': 'lab-externo'
    };
    const path = routeMap[item.tipo] || 'ppr';
    navigate(`/procedimentos/${path}/${item.id || item.ordem_servico}`);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Lista Geral de Casos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="w-[80px] font-bold text-gray-600">OS</TableHead>
                <TableHead className="font-bold text-gray-600">Paciente</TableHead>
                <TableHead className="font-bold text-gray-600">Prótese</TableHead>
                <TableHead className="font-bold text-gray-600">Status Geral</TableHead>
                <TableHead className="font-bold text-gray-600">Dentista / Protético</TableHead>
                <TableHead className="font-bold text-gray-600">Financeiro</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                    Nenhum caso encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors border-gray-100">
                    <TableCell className="font-mono text-xs text-blue-600 font-bold">
                      #{item.ordem_servico.toString().padStart(6, '0')}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{item.nome_paciente}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold text-[10px] bg-blue-50 text-blue-700 border-blue-100">
                        {item.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          item.status_geral === 'Concluído' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : item.status_geral === 'Em andamento'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {getStatusIcon(item.status_geral)}
                          {item.status_geral.toUpperCase()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                          <span className="font-medium">{item.dentista_nome}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                          <span>{item.protetico_nome}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={`w-fit text-[10px] h-5 ${getFinanceStatusColor(item.pagamento_lab_status || 'Pendente')}`}>
                          {item.pagamento_lab_status || 'Pendente'}
                        </Badge>
                        {item.valor_lab && item.valor_lab > 0 && (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            {item.valor_lab.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateToDetail(item)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
