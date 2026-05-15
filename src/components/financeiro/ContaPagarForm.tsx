import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ContaPagar } from "@/hooks/useContasPagar";
import { useFornecedores } from "@/hooks/useFornecedores";

interface ContaPagarFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  conta?: ContaPagar | null;
}

const categorias = [
  "Aluguel",
  "Água",
  "Luz",
  "Internet",
  "Telefone",
  "Material Odontológico",
  "Laboratório - Materiais (Gesso, Acrílico)",
  "Laboratório - Dentes de Resina/Porcelana",
  "Laboratório - Componentes de Implante",
  "Laboratório - Serviços Terceirizados",
  "Laboratório - Geral",
  "Salários",
  "Impostos",
  "Manutenção",
  "Limpeza",
  "Marketing",
  "Outros"
];

const formasPagamento = [
  "Dinheiro",
  "PIX",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Boleto",
  "Transferência"
];

export function ContaPagarForm({ open, onOpenChange, onSubmit, conta }: ContaPagarFormProps) {
  const { fornecedores } = useFornecedores();

  const [formData, setFormData] = useState({
    fornecedor_id: "",
    descricao: "",
    categoria: "",
    valor: 0,
    data_vencimento: new Date(),
    data_pagamento: undefined as Date | undefined,
    status: "Pendente" as "Pendente" | "Paga" | "Vencida" | "Cancelada",
    forma_pagamento: "",
    observacoes: "",
    os_relacionada: "",
  });

  useEffect(() => {
    if (conta) {
      setFormData({
        fornecedor_id: conta.fornecedor_id || "",
        descricao: conta.descricao,
        categoria: conta.categoria,
        valor: conta.valor,
        data_vencimento: new Date(conta.data_vencimento),
        data_pagamento: conta.data_pagamento ? new Date(conta.data_pagamento) : undefined,
        status: conta.status,
        forma_pagamento: conta.forma_pagamento || "",
        observacoes: conta.observacoes || "",
        os_relacionada: "", // Extracting from observacoes is complex, keep blank for edit unless structured
      });
    } else {
      setFormData({
        fornecedor_id: "",
        descricao: "",
        categoria: "",
        valor: 0,
        data_vencimento: new Date(),
        data_pagamento: undefined,
        status: "Pendente",
        forma_pagamento: "",
        observacoes: "",
        os_relacionada: "",
      });
    }
  }, [conta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      fornecedor_id: formData.fornecedor_id || undefined,
      data_vencimento: format(formData.data_vencimento, 'yyyy-MM-dd'),
      data_pagamento: formData.data_pagamento ? format(formData.data_pagamento, 'yyyy-MM-dd') : undefined,
      forma_pagamento: formData.forma_pagamento || undefined,
      observacoes: formData.os_relacionada ? `[OS Vinculada: #${formData.os_relacionada}] ${formData.observacoes || ''}` : (formData.observacoes || undefined),
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {conta ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="fornecedor_id">Fornecedor (opcional)</Label>
              <Select value={formData.fornecedor_id || undefined} onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Pagamento de aluguel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.categoria.includes("Laboratório") && (
               <div className="space-y-2 col-span-2 sm:col-span-1 border-l-2 border-emerald-400 pl-3">
                 <Label htmlFor="os_relacionada" className="text-emerald-700">OS Relacionada (Opcional)</Label>
                 <Input
                   id="os_relacionada"
                   value={formData.os_relacionada}
                   onChange={(e) => setFormData({ ...formData, os_relacionada: e.target.value.replace(/\D/g, '') })}
                   placeholder="Ex: 1234"
                   className="border-emerald-200 focus-visible:ring-emerald-500"
                 />
                 <p className="text-[10px] text-muted-foreground">Vincule este custo a uma OS específica.</p>
               </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_vencimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_vencimento ? format(formData.data_vencimento, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_vencimento}
                    onSelect={(date) => date && setFormData({ ...formData, data_vencimento: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Paga">Paga</SelectItem>
                  <SelectItem value="Vencida">Vencida</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.status === "Paga" || formData.data_pagamento) && (
              <>
                <div className="space-y-2">
                  <Label>Data de Pagamento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.data_pagamento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.data_pagamento ? format(formData.data_pagamento, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.data_pagamento}
                        onSelect={(date) => setFormData({ ...formData, data_pagamento: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Select value={formData.forma_pagamento} onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {forma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {conta ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
