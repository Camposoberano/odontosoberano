import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEvolucoes } from '@/hooks/useEvolucoes';
import { useDentistas } from '@/hooks/useDentistas';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FORMAS_PAGAMENTO = ['Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Cheque', 'Outro'];

interface EvolucaoSectionProps {
  pacienteId: string;
  pacienteNome?: string;
}

export function EvolucaoSection({ pacienteId, pacienteNome }: EvolucaoSectionProps) {
  const { evolucoes, isLoading, queryError, createEvolucao, deleteEvolucao, isCreating } = useEvolucoes(pacienteId);
  const { dentistas } = useDentistas();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    texto: '',
    profissional_id: '' as string | null,
    assinatura: '',
    registrar_no_caixa: false,
    valor: '' as number | '',
    forma_pagamento: 'Dinheiro',
  });

  const resetForm = () => setForm({
    data: new Date().toISOString().split('T')[0],
    texto: '',
    profissional_id: '',
    assinatura: '',
    registrar_no_caixa: false,
    valor: '',
    forma_pagamento: 'Dinheiro',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.texto.trim()) return;
    setIsSaving(true);
    try {
      await createEvolucao({
        paciente_id: pacienteId,
        data: form.data,
        texto: form.texto.trim(),
        profissional_id: form.profissional_id || null,
        assinatura: form.assinatura || null,
      });

      if (form.registrar_no_caixa && form.valor && Number(form.valor) > 0 && user) {
        const descricao = `Atendimento — ${pacienteNome || 'Paciente'}`;
        const { error } = await supabase.from('fluxo_caixa').insert([{
          user_id: user.id,
          tipo: 'Entrada',
          descricao,
          categoria: 'Tratamento Odontológico',
          valor: Number(form.valor),
          data_movimentacao: form.data,
          forma_pagamento: form.forma_pagamento || null,
        }]);
        if (error) {
          toast({ title: 'Evolução salva, mas erro no caixa', description: error.message, variant: 'destructive' });
        } else {
          queryClient.invalidateQueries({ queryKey: ['fluxo_caixa'] });
          queryClient.invalidateQueries({ queryKey: ['fluxo_caixa_previsoes'] });
          toast({ title: 'Evolução e entrada no caixa registradas!' });
        }
      }

      resetForm();
      setShowForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (d: string) => {
    try {
      return format(new Date(d + 'T00:00:00'), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return d;
    }
  };

  const visibleEvolucoes = expanded ? evolucoes : evolucoes.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Evoluções</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              {evolucoes.length} registro{evolucoes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl font-bold gap-2"
          onClick={() => setShowForm(v => !v)}
        >
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="rounded-2xl border-2 border-violet-100 bg-violet-50/40">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Profissional</Label>
                  <Select
                    value={form.profissional_id || '_none'}
                    onValueChange={v => setForm(f => ({ ...f, profissional_id: v === '_none' ? null : v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">—</SelectItem>
                      {dentistas.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Evolução / Observação <span className="text-red-500">*</span></Label>
                <Textarea
                  rows={4}
                  placeholder="Descreva o atendimento, procedimento realizado, observações clínicas..."
                  value={form.texto}
                  onChange={e => setForm(f => ({ ...f, texto: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Assinatura (opcional)</Label>
                <Input
                  placeholder="Dr(a). Nome do profissional"
                  value={form.assinatura}
                  onChange={e => setForm(f => ({ ...f, assinatura: e.target.value }))}
                />
              </div>

              {/* Registrar no caixa */}
              <div className="rounded-xl border border-violet-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="registrar_caixa"
                    checked={form.registrar_no_caixa}
                    onCheckedChange={v => setForm(f => ({ ...f, registrar_no_caixa: !!v }))}
                  />
                  <Label htmlFor="registrar_caixa" className="cursor-pointer font-semibold text-violet-700">
                    Registrar pagamento no caixa
                  </Label>
                </div>
                {form.registrar_no_caixa && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label>Valor (R$)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={form.valor}
                        onChange={e => setForm(f => ({ ...f, valor: e.target.value === '' ? '' : Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Forma de pagamento</Label>
                      <Select
                        value={form.forma_pagamento || '_none'}
                        onValueChange={v => setForm(f => ({ ...f, forma_pagamento: v === '_none' ? '' : v }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">—</SelectItem>
                          {FORMAS_PAGAMENTO.map(fp => (
                            <SelectItem key={fp} value={fp}>{fp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => { resetForm(); setShowForm(false); }}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isSaving || !form.texto.trim()}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar Evolução
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de evoluções */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : evolucoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
          <ClipboardList className="w-10 h-10 text-slate-200" />
          <p className="text-sm font-bold">Nenhuma evolução registrada ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleEvolucoes.map(ev => (
            <div key={ev.id} className="rounded-2xl border-2 border-slate-100 p-5 bg-white hover:border-violet-200 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-bold">
                    {formatDate(ev.data)}
                  </Badge>
                  {ev.dentistas?.nome && (
                    <span className="text-xs font-bold text-violet-600">
                      Dr(a). {ev.dentistas.nome}
                    </span>
                  )}
                  {ev.assinatura && (
                    <span className="text-xs text-slate-400 italic">{ev.assinatura}</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-red-500 shrink-0"
                  onClick={() => setDeleteId(ev.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ev.texto}</p>
            </div>
          ))}

          {evolucoes.length > 3 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full font-bold text-xs gap-2 text-slate-500"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? (
                <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Ver todas ({evolucoes.length - 3} mais)</>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Confirm delete */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evolução?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteEvolucao(deleteId); setDeleteId(null); }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
