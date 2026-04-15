import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProcedimento, NOME_POR_TIPO, useAllProcedimentos } from '@/hooks/useProcedimentoGenerico';
import { TipoArcada } from '@/types/procedimentos';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormularioProcedimentoLayout } from '@/components/procedimentos/FormularioProcedimentoLayout';
import { ClipboardList } from 'lucide-react';
import { addDays } from 'date-fns';

export default function GenericNovoProcedimento() {
  const navigate = useNavigate();
  const { tipo: tipoParam } = useParams();
  const tipo = (tipoParam?.toLowerCase() || '') as string;
  const nomeExibicao = NOME_POR_TIPO[tipo] || 'Procedimento';
  
  const { mutate: createProcedimento, isPending } = useCreateProcedimento(tipo as any);
  const { data: todosProcedimentos } = useAllProcedimentos();

  const [formData, setFormData] = useState({
    ordem_servico: '',
    nome_paciente: '',
    paciente_id: '',
    dentista_id: '',
    protetico_id: '',
    data_inicial: format(new Date(), 'yyyy-MM-dd'),
    data_entrega: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    valor_lab: '',
    arcada: 'SUP/INF' as TipoArcada,
    dente: '',
    marca_dente: '',
    observacoes: '',
  });

  // Geração automática de número inicial baseada no tipo para o input manual
  useEffect(() => {
    if (todosProcedimentos && todosProcedimentos.length > 0 && !formData.ordem_servico) {
      const maxNum = todosProcedimentos.reduce((max, proc) => {
        const numStr = proc.ordem_servico?.toString() || '';
        const match = numStr.match(/^(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          return num > max ? num : max;
        }
        return max;
      }, 0);

      const nextNum = (maxNum + 1).toString().padStart(2, '0');
      const suffix = tipo.toUpperCase().substring(0, 3);
      setFormData(prev => ({ 
        ...prev, 
        ordem_servico: `${nextNum}/${suffix}`
      }));
    }
  }, [todosProcedimentos, tipo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitização final antes de enviar
    const payload = {
      ...formData,
      ordem_servico: formData.ordem_servico, // Mantém como string para suportar prefixos
      valor_lab: formData.valor_lab ? parseFloat(formData.valor_lab) : null,
      status_geral: 'Pendente'
    };

    createProcedimento(payload, {
      onSuccess: () => navigate(`/procedimentos/${tipoParam}`)
    });
  };

  return (
    <FormularioProcedimentoLayout
      title={`Novo ${nomeExibicao}`}
      basePath={`/procedimentos/${tipoParam}`}
      baseName={nomeExibicao}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      isPending={isPending}
      tipoProcedimento={tipo}
      hideTechnicalSections={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-black">
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-widest opacity-60">Arcada</Label>
          <Select 
            value={formData.arcada}
            onValueChange={val => setFormData(prev => ({ ...prev, arcada: val as TipoArcada }))}
          >
            <SelectTrigger className="h-14 rounded-2xl border-2">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUP">Superior</SelectItem>
              <SelectItem value="INF">Inferior</SelectItem>
              <SelectItem value="SUP/INF">SUP/INF (Ambas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-widest opacity-60">Dente / Elementos</Label>
          <Input 
            placeholder="Ex: 14, 15, 26"
            value={formData.dente}
            onChange={e => setFormData(prev => ({ ...prev, dente: e.target.value }))}
            className="h-14 rounded-2xl border-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm uppercase tracking-widest opacity-60 font-black flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" /> Marca do Dente / Fabricante
        </Label>
        <Input 
          placeholder="Ex: Kulzer, Ivoclar, Trilux..."
          value={formData.marca_dente}
          onChange={e => setFormData(prev => ({ ...prev, marca_dente: e.target.value }))}
          className="h-14 rounded-2xl border-2 focus:border-primary bg-primary/5 font-black text-lg"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm uppercase tracking-widest opacity-60">Observações Clínicas / Planejamento</Label>
        <Textarea 
          placeholder="Descreva detalhes específicos do tratamento ou orientações para o laboratório..."
          value={formData.observacoes}
          onChange={e => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
          className="min-h-[150px] rounded-3xl border-2 p-6 font-bold text-lg focus:ring-4 focus:ring-primary/20 bg-slate-50/30"
        />
      </div>
    </FormularioProcedimentoLayout>
  );
}
