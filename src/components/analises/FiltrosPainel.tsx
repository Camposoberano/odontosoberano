import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, FilterX } from "lucide-react";
import { FiltrosProtese, PeriodoFiltro } from "@/hooks/useProteseAnalytics";
import { useDentistas } from "@/hooks/useDentistas";
import { useProteticos } from "@/hooks/useProteticos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Props {
  filtros: FiltrosProtese;
  setFiltros: (f: FiltrosProtese) => void;
}

export function FiltrosPainel({ filtros, setFiltros }: Props) {
  const { dentistas } = useDentistas();
  const { data: proteticos } = useProteticos();

  const resetFilters = () => {
    setFiltros({ periodo: 'mes' });
  };

  const tipos = [
    'PPR', 'PT/PM', 'Prótese Fixa', 'Protocolo', 
    'Resina Impressa', 'Cerâmica', 'Placa', 'Provisório', 'Lab Externo'
  ];

  return (
    <Card className="mb-6 border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
          
          <div className="space-y-2 xl:col-span-1">
            <Label className="text-xs font-semibold uppercase text-gray-500 italic flex items-center gap-1">
              🔍 Busca Rápida
            </Label>
            <Input 
              placeholder="Paciente ou OS..." 
              value={filtros.busca || ""} 
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="h-10 border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">Período</Label>
            <Select 
              value={filtros.periodo} 
              onValueChange={(v) => setFiltros({ ...filtros, periodo: v as PeriodoFiltro })}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="mes">Mês Atual</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtros.periodo === 'personalizado' && (
            <div className="space-y-2 lg:col-span-1">
              <Label className="text-xs font-semibold uppercase text-gray-500">Início / Fim</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-10 px-2 text-xs border-gray-200">
                      {filtros.dataInicio ? format(filtros.dataInicio, "dd/MM") : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single" 
                      selected={filtros.dataInicio} 
                      onSelect={(d) => setFiltros({ ...filtros, dataInicio: d })} 
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-10 px-2 text-xs border-gray-200">
                      {filtros.dataFim ? format(filtros.dataFim, "dd/MM") : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single" 
                      selected={filtros.dataFim} 
                      onSelect={(d) => setFiltros({ ...filtros, dataFim: d })} 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">Tipo de Prótese</Label>
            <Select 
              value={filtros.tipoProtese || "todos"} 
              onValueChange={(v) => setFiltros({ ...filtros, tipoProtese: v === "todos" ? undefined : v })}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Próteses</SelectItem>
                {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">Dentista</Label>
            <Select 
              value={filtros.dentistaId || "todos"} 
              onValueChange={(v) => setFiltros({ ...filtros, dentistaId: v === "todos" ? undefined : v })}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Dentistas</SelectItem>
                {dentistas?.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">Protético / Lab</Label>
            <Select 
              value={filtros.proteticoId || "todos"} 
              onValueChange={(v) => setFiltros({ ...filtros, proteticoId: v === "todos" ? undefined : v })}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Protéticos</SelectItem>
                {(proteticos as any[])?.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">Financeiro</Label>
            <Select 
              value={filtros.statusFinanceiro || "todos"} 
              onValueChange={(v) => setFiltros({ ...filtros, statusFinanceiro: v === "todos" ? undefined : v as any })}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="Pago">Pago ✅</SelectItem>
                <SelectItem value="Pendente">Pendente ⏳</SelectItem>
                <SelectItem value="Não Pago">Não Pago ❌</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">Etapa</Label>
            <Select 
              value={filtros.etapa || "todos"} 
              onValueChange={(v) => setFiltros({ ...filtros, etapa: v === "todos" ? undefined : v })}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Etapas</SelectItem>
                <SelectItem value="moldagem">Moldagem</SelectItem>
                <SelectItem value="vazamento_gesso">Gesso / Vazamento</SelectItem>
                <SelectItem value="plano_cera">Plano de Cera</SelectItem>
                <SelectItem value="prova_cera">Prova de Cera</SelectItem>
                <SelectItem value="montagem_dente">Montagem</SelectItem>
                <SelectItem value="prova_dente">Prova de Dente</SelectItem>
                <SelectItem value="acrilizacao">Acrilização</SelectItem>
                <SelectItem value="entrega">Entrega</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetFilters} 
            className="h-10 w-10 text-gray-400 hover:text-red-500 transition-colors"
            title="Limpar Filtros"
          >
            <FilterX className="h-5 w-5" />
          </Button>

        </div>
      </CardContent>
    </Card>
  );
}
