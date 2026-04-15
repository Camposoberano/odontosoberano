import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Paciente } from '@/hooks/usePacientes';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { CPFInput, TelefoneInput } from '@/components/ui/masked-input';

// Função para validar CPF
const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false; // Rejeita CPFs com todos dígitos iguais

  let sum = 0;
  let remainder;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  // Valida segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

// Schema de validação Zod
const pacienteSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .toLowerCase()
    .trim(),
  telefone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone inválido')
    .regex(/^[\d\s()+-]+$/, 'Telefone deve conter apenas números e caracteres válidos'),
  cpf: z.string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || isValidCPF(val),
      'CPF inválido'
    ),
  data_nascimento: z.string().nullable().optional(),
  endereco: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').nullable().optional(),
  rua: z.string().max(100).nullable().optional(),
  numero: z.string().max(20).nullable().optional(),
  bairro: z.string().max(100).nullable().optional(),
  cidade: z.string().max(100).nullable().optional(),
  observacao_endereco: z.string().max(200).nullable().optional(),
  cep: z.string().max(10).nullable().optional(),
  status: z.enum(['Ativo', 'Inativo']),
});

export interface CreatePacienteData {
  nome: string;
  email: string;
  telefone: string;
  data_nascimento?: string | null;
  status: 'Ativo' | 'Inativo';
  endereco?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
  observacao_endereco?: string | null;
  cpf?: string | null;
}

interface PacienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePacienteData) => Promise<void>;
  paciente?: Paciente | null;
  title: string;
}

export function PacienteForm({ isOpen, onClose, onSubmit, paciente, title }: PacienteFormProps) {
  const [formData, setFormData] = useState<CreatePacienteData>({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    status: 'Ativo',
    endereco: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: '',
    observacao_endereco: '',
    cpf: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Update form data when paciente prop changes
  useEffect(() => {
    if (paciente) {
      setFormData({
        nome: paciente.nome || '',
        email: paciente.email || '',
        telefone: paciente.telefone || '',
        data_nascimento: paciente.data_nascimento || '',
        status: paciente.status || 'Ativo',
        endereco: paciente.endereco || '',
        rua: paciente.rua || '',
        numero: paciente.numero || '',
        bairro: paciente.bairro || '',
        cidade: paciente.cidade || '',
        cep: paciente.cep || '',
        observacao_endereco: paciente.observacao_endereco || '',
        cpf: paciente.cpf || '',
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        status: 'Ativo',
        endereco: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        cep: '',
        observacao_endereco: '',
        cpf: '',
      });
    }
    setErrors({});
  }, [paciente, isOpen]);

  const handleCEPBlur = async () => {
    const cep = formData.cep?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    try {
      setLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: 'CEP não encontrado',
          description: 'Verifique o número digitado.',
          variant: 'destructive',
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
      }));

      toast({
        title: 'Endereço atualizado!',
        description: 'Dados preenchidos através do CEP.',
      });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoading(false);
    }
  };

  const sanitizeInput = (value: string): string => {
    // Remove caracteres potencialmente perigosos
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Sanitizar dados antes de validar, transformando strings vazias em null para campos opcionais
      const sanitizedData = {
        ...formData,
        nome: sanitizeInput(formData.nome),
        email: sanitizeInput(formData.email).toLowerCase(),
        telefone: sanitizeInput(formData.telefone),
        data_nascimento: formData.data_nascimento || null,
        endereco: formData.endereco ? sanitizeInput(formData.endereco) : null,
        rua: formData.rua ? sanitizeInput(formData.rua) : null,
        numero: formData.numero ? sanitizeInput(formData.numero) : null,
        bairro: formData.bairro ? sanitizeInput(formData.bairro) : null,
        cidade: formData.cidade ? sanitizeInput(formData.cidade) : null,
        cep: formData.cep ? sanitizeInput(formData.cep).replace(/\D/g, '') || null : null,
        observacao_endereco: formData.observacao_endereco ? sanitizeInput(formData.observacao_endereco) : null,
        cpf: formData.cpf ? sanitizeInput(formData.cpf).replace(/\D/g, '') || null : null,
      };

      // Validar com Zod
      const validatedData = pacienteSchema.parse(sanitizedData);

      await onSubmit(validatedData as CreatePacienteData);
      toast({
        title: 'Sucesso!',
        description: 'Paciente salvo com sucesso.',
      });
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Processar erros de validação do Zod
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);

        toast({
          title: 'Erro de validação',
          description: 'Por favor, corrija os campos destacados.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao salvar paciente. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePacienteData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? 'nome-error' : undefined}
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && (
                <p id="nome-error" className="text-sm text-red-500">
                  {errors.nome}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <CPFInput
                id="cpf"
                value={formData.cpf}
                onChange={(value) => handleInputChange('cpf', value)}
                aria-invalid={!!errors.cpf}
                aria-describedby={errors.cpf ? 'cpf-error' : undefined}
                className={errors.cpf ? 'border-red-500' : ''}
              />
              {errors.cpf && (
                <p id="cpf-error" className="text-sm text-red-500">
                  {errors.cpf}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">
                Telefone <span className="text-red-500">*</span>
              </Label>
              <TelefoneInput
                id="telefone"
                value={formData.telefone}
                onChange={(value) => handleInputChange('telefone', value)}
                aria-invalid={!!errors.telefone}
                aria-describedby={errors.telefone ? 'telefone-error' : undefined}
                className={errors.telefone ? 'border-red-500' : ''}
              />
              {errors.telefone && (
                <p id="telefone-error" className="text-sm text-red-500">
                  {errors.telefone}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento || ''}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Ativo' | 'Inativo') => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t">
            <h3 className="text-sm font-semibold text-gray-700">Endereço</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep || ''}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    onBlur={handleCEPBlur}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="rua">Rua/Avenida</Label>
                <Input
                  id="rua"
                  value={formData.rua || formData.endereco || ''}
                  onChange={(e) => handleInputChange('rua', e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero || ''}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro || ''}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade || ''}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao_endereco">Observação de Entrega / Referência</Label>
              <Textarea
                id="observacao_endereco"
                value={formData.observacao_endereco || ''}
                onChange={(e) => handleInputChange('observacao_endereco', e.target.value)}
                rows={2}
                placeholder="Ex: Deixar na portaria, campainha quebrada..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
