import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Save, Loader2, CheckCircle2, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useContasPagar } from "@/hooks/useContasPagar";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  procedimento: any;
  tabela: string;
  onUpdate: () => void;
}

export function FinanceiroProteseCard({ procedimento, tabela, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const { createConta } = useContasPagar();
  
  const [formData, setFormData] = useState({
    valor_lab: procedimento.valor_lab || 0,
    pagamento_lab_status: procedimento.pagamento_lab_status || 'Pendente',
    pagamento_lab_data: procedimento.pagamento_lab_data || '',
  });

  // Sincronizar se o procedimento mudar externamente
  useEffect(() => {
    setFormData({
      valor_lab: procedimento.valor_lab || 0,
      pagamento_lab_status: procedimento.pagamento_lab_status || 'Pendente',
      pagamento_lab_data: procedimento.pagamento_lab_data ? format(new Date(procedimento.pagamento_lab_data), 'yyyy-MM-dd') : '',
    });
  }, [procedimento.id, procedimento.valor_lab, procedimento.pagamento_lab_status]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const updateData: any = {
        valor_lab: formData.valor_lab,
        pagamento_lab_status: formData.pagamento_lab_status,
        pagamento_lab_data: formData.pagamento_lab_data || null,
      };

      // 1. Atualizar o procedimento na tabela correspondente
      const { error: updateError } = await supabase
        .from(tabela as any)
        .update(updateData)
        .eq('id', procedimento.id);

      if (updateError) throw updateError;

      // 2. Automação: Se status mudou para 'Pago' E não era pago antes
      if (formData.pagamento_lab_status === 'Pago' && procedimento.pagamento_lab_status !== 'Pago') {
        await createConta({
          descricao: `Pgto Lab - OS #${procedimento.ordem_servico.toString().padStart(6, '0')} - ${procedimento.nome_paciente}`,
          categoria: 'Laboratório de Prótese',
          valor: formData.valor_lab,
          data_vencimento: formData.pagamento_lab_data || new Date().toISOString().split('T')[0],
          data_pagamento: formData.pagamento_lab_data || new Date().toISOString().split('T')[0],
          status: 'Paga',
          forma_pagamento: 'Transferência/Pix',
          observacoes: `Gerado automaticamente via Painel de Prótese (${tabela})`
        });
        toast.success("Lançamento financeiro criado no Contas a Pagar!");
      }

      toast.success("Dados financeiros atualizados!");
      onUpdate();
    } catch (error: any) {
      console.error("Erro ao salvar financeiro:", error);
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-emerald-100 shadow-lg bg-gradient-to-br from-white to-emerald-50/20">
      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
        <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
          <DollarSign className="w-5 h-5" />
          Financeiro do Laboratório
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Valor do Laboratório (R$)</Label>
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                type="number" 
                step="0.01"
                className="pl-9 h-11 border-2 focus:border-emerald-500 transition-all font-bold text-emerald-700" 
                value={formData.valor_lab}
                onChange={(e) => setFormData({ ...formData, valor_lab: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Status Pagamento</Label>
            <Select 
              value={formData.pagamento_lab_status} 
              onValueChange={(v) => setFormData({ ...formData, pagamento_lab_status: v })}
            >
              <SelectTrigger className="h-11 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">⏳ Pendente</SelectItem>
                <SelectItem value="Pago">✅ Pago</SelectItem>
                <SelectItem value="Não Pago">❌ Não Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Data do Pagamento</Label>
            <Input 
              type="date" 
              className="h-11 border-2" 
              value={formData.pagamento_lab_data}
              onChange={(e) => setFormData({ ...formData, pagamento_lab_data: e.target.value })}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Salvar Dados Financeiros
        </Button>

        {procedimento.pagamento_lab_status === 'Pago' && (
          <div className="mt-2 p-3 bg-emerald-100 flex items-center gap-2 rounded-lg text-emerald-800 text-xs font-medium border border-emerald-200 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-4 h-4" />
            Este caso já foi processado financeiramente e consta como pago.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
