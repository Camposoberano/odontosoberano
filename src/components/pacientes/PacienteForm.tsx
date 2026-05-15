import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Paciente } from '@/hooks/usePacientes';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { CPFInput, TelefoneInput } from '@/components/ui/masked-input';
import { AlertCircle } from 'lucide-react';

// ── Validação CPF ──────────────────────────────────────────────────────────
const isValidCPF = (cpf: string): boolean => {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let sum = 0;
  for (let i = 1; i <= 9; i++) sum += parseInt(clean[i - 1]) * (11 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== parseInt(clean[9])) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(clean[i - 1]) * (12 - i);
  rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  return rem === parseInt(clean[10]);
};

const calcularIdade = (dataNascimento: string): number => {
  const hoje = new Date();
  const nasc = new Date(dataNascimento + 'T00:00:00');
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
};

// ── Constantes ────────────────────────────────────────────────────────────
const AREAS_TRATAMENTO = [
  'Clínico Geral', 'Ortodontia', 'Implantodontia', 'Periodontia',
  'Endodontia', 'Cirurgia', 'HOF', 'Prótese', 'Pediatria',
];

const COMO_CONHECEU = [
  'Indicação', 'Google', 'Instagram', 'Facebook',
  'Passando na rua', 'Propaganda', 'Outro',
];

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

// ── Schema base (campos que não mudam com idade) ──────────────────────────
const baseSchema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres').max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apenas letras'),
  apelido: z.string().max(50).nullable().optional(),
  email: z.string().email('Email inválido').max(100).toLowerCase().trim().optional().or(z.literal('')),
  telefone: z.string().min(10, 'Mínimo 10 dígitos').max(15).regex(/^[\d\s()+-]+$/),
  cpf: z.string().nullable().optional().refine(v => !v || v.length === 0 || isValidCPF(v), 'CPF inválido'),
  data_nascimento: z.string().nullable().optional(),
  genero: z.string().nullable().optional(),
  area_tratamento: z.string().nullable().optional(),
  profissao: z.string().max(100).nullable().optional(),
  como_conheceu: z.string().nullable().optional(),
  status: z.enum(['Ativo', 'Inativo']),
  // endereço
  cep: z.string().max(10).nullable().optional(),
  rua: z.string().max(100).nullable().optional(),
  numero: z.string().max(20).nullable().optional(),
  complemento: z.string().max(100).nullable().optional(),
  bairro: z.string().max(100).nullable().optional(),
  cidade: z.string().max(100).nullable().optional(),
  estado: z.string().max(2).nullable().optional(),
  observacao_endereco: z.string().max(200).nullable().optional(),
  endereco: z.string().max(200).nullable().optional(),
  // responsável
  nome_responsavel: z.string().max(100).nullable().optional(),
  cpf_responsavel: z.string().nullable().optional().refine(v => !v || v.length === 0 || isValidCPF(v), 'CPF inválido'),
  telefone_responsavel: z.string().nullable().optional(),
});

export interface CreatePacienteData {
  nome: string;
  apelido?: string | null;
  email: string;
  telefone: string;
  cpf?: string | null;
  data_nascimento?: string | null;
  genero?: string | null;
  area_tratamento?: string | null;
  profissao?: string | null;
  como_conheceu?: string | null;
  status: 'Ativo' | 'Inativo';
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacao_endereco?: string | null;
  endereco?: string | null;
  nome_responsavel?: string | null;
  cpf_responsavel?: string | null;
  telefone_responsavel?: string | null;
}

interface PacienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePacienteData) => Promise<void>;
  paciente?: Paciente | null;
  title: string;
}

const emptyForm = (): CreatePacienteData => ({
  nome: '', apelido: '', email: '', telefone: '', cpf: '',
  data_nascimento: '', genero: '', area_tratamento: '', profissao: '',
  como_conheceu: '', status: 'Ativo', cep: '', rua: '', numero: '',
  complemento: '', bairro: '', cidade: '', estado: '',
  observacao_endereco: '', endereco: '', nome_responsavel: '',
  cpf_responsavel: '', telefone_responsavel: '',
});

export function PacienteForm({ isOpen, onClose, onSubmit, paciente, title }: PacienteFormProps) {
  const [formData, setFormData] = useState<CreatePacienteData>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const eMenor = formData.data_nascimento
    ? calcularIdade(formData.data_nascimento) < 18
    : false;

  const idade = formData.data_nascimento
    ? calcularIdade(formData.data_nascimento)
    : null;

  useEffect(() => {
    if (paciente) {
      setFormData({
        nome: paciente.nome || '',
        apelido: paciente.apelido || '',
        email: paciente.email || '',
        telefone: paciente.telefone || '',
        cpf: paciente.cpf || '',
        data_nascimento: paciente.data_nascimento || '',
        genero: paciente.genero || '',
        area_tratamento: paciente.area_tratamento || '',
        profissao: paciente.profissao || '',
        como_conheceu: paciente.como_conheceu || '',
        status: paciente.status || 'Ativo',
        cep: paciente.cep || '',
        rua: paciente.rua || '',
        numero: paciente.numero || '',
        complemento: paciente.complemento || '',
        bairro: paciente.bairro || '',
        cidade: paciente.cidade || '',
        estado: paciente.estado || '',
        observacao_endereco: paciente.observacao_endereco || '',
        endereco: paciente.endereco || '',
        nome_responsavel: paciente.nome_responsavel || '',
        cpf_responsavel: paciente.cpf_responsavel || '',
        telefone_responsavel: paciente.telefone_responsavel || '',
      });
    } else {
      setFormData(emptyForm());
    }
    setErrors({});
  }, [paciente, isOpen]);

  const handleCEPBlur = async () => {
    const cep = formData.cep?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;
    try {
      setLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast({ title: 'CEP não encontrado', variant: 'destructive' });
        return;
      }
      setFormData(prev => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));
      toast({ title: 'Endereço preenchido pelo CEP!' });
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  const sanitize = (v: string) =>
    v.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '').trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const sanitized = {
        ...formData,
        nome: sanitize(formData.nome),
        email: sanitize(formData.email).toLowerCase(),
        telefone: sanitize(formData.telefone),
        apelido: formData.apelido ? sanitize(formData.apelido) : null,
        profissao: formData.profissao ? sanitize(formData.profissao) : null,
        data_nascimento: formData.data_nascimento || null,
        cep: formData.cep ? formData.cep.replace(/\D/g, '') || null : null,
        cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') || null : null,
        cpf_responsavel: formData.cpf_responsavel ? formData.cpf_responsavel.replace(/\D/g, '') || null : null,
        rua: formData.rua || null,
        numero: formData.numero || null,
        complemento: formData.complemento || null,
        bairro: formData.bairro || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        observacao_endereco: formData.observacao_endereco || null,
        endereco: formData.endereco || null,
        genero: formData.genero || null,
        area_tratamento: formData.area_tratamento || null,
        como_conheceu: formData.como_conheceu || null,
        nome_responsavel: formData.nome_responsavel || null,
        telefone_responsavel: formData.telefone_responsavel || null,
      };

      // Validação Zod
      const validated = baseSchema.parse(sanitized);

      // Validações extras contextuais
      const extraErrors: Record<string, string> = {};
      if (!eMenor && !sanitized.email) {
        extraErrors.email = 'Email é obrigatório para pacientes maiores de idade';
      }
      if (eMenor && !sanitized.nome_responsavel) {
        extraErrors.nome_responsavel = 'Nome do responsável é obrigatório para menores de 18 anos';
      }

      if (Object.keys(extraErrors).length > 0) {
        setErrors(extraErrors);
        toast({ title: 'Corrija os campos obrigatórios', variant: 'destructive' });
        return;
      }

      await onSubmit(validated as CreatePacienteData);
      toast({ title: 'Paciente salvo com sucesso!' });
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        toast({ title: 'Corrija os campos destacados', variant: 'destructive' });
      } else {
        toast({ title: 'Erro ao salvar paciente', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof CreatePacienteData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const err = (field: string) => errors[field] ? (
    <p className="text-xs text-red-500 mt-0.5">{errors[field]}</p>
  ) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Identificação ──────────────────────────────────── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Identificação</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome completo <span className="text-red-500">*</span></Label>
                <Input id="nome" value={formData.nome} onChange={e => set('nome', e.target.value)}
                  className={errors.nome ? 'border-red-500' : ''} />
                {err('nome')}
              </div>
              <div className="space-y-1">
                <Label htmlFor="apelido">Como gosta de ser chamado</Label>
                <Input id="apelido" placeholder="Apelido (opcional)"
                  value={formData.apelido || ''} onChange={e => set('apelido', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cpf">CPF</Label>
                <CPFInput id="cpf" value={formData.cpf}
                  onChange={v => set('cpf', v)}
                  className={errors.cpf ? 'border-red-500' : ''} />
                {err('cpf')}
              </div>
              <div className="space-y-1">
                <Label htmlFor="genero">Gênero</Label>
                <Select value={formData.genero || '_none'} onValueChange={v => set('genero', v === '_none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                    <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={v => set('status', v as 'Ativo' | 'Inativo')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* ── Contato ────────────────────────────────────────── */}
          <section className="space-y-3 pt-2 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contato</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="email">
                  Email {eMenor ? <span className="text-muted-foreground text-xs">(opcional)</span> : <span className="text-red-500">*</span>}
                </Label>
                <Input id="email" type="email" value={formData.email}
                  onChange={e => set('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''} />
                {err('email')}
              </div>
              <div className="space-y-1">
                <Label htmlFor="telefone">Telefone <span className="text-red-500">*</span></Label>
                <TelefoneInput id="telefone" value={formData.telefone}
                  onChange={v => set('telefone', v)}
                  className={errors.telefone ? 'border-red-500' : ''} />
                {err('telefone')}
              </div>
            </div>
          </section>

          {/* ── Nascimento ─────────────────────────────────────── */}
          <section className="space-y-3 pt-2 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nascimento</h3>

            <div className="flex items-end gap-3">
              <div className="space-y-1 flex-1">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input id="data_nascimento" type="date"
                  value={formData.data_nascimento || ''}
                  onChange={e => set('data_nascimento', e.target.value)}
                  max={new Date().toISOString().split('T')[0]} />
              </div>
              {idade !== null && (
                <Badge variant={eMenor ? 'destructive' : 'secondary'} className="mb-0.5 h-8 px-3">
                  {idade} anos{eMenor ? ' — Menor' : ''}
                </Badge>
              )}
            </div>
          </section>

          {/* ── Menor de Idade — Responsável ───────────────────── */}
          {eMenor && (
            <section className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <h3 className="text-sm font-semibold">Paciente menor de idade — dados do responsável</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="nome_responsavel">Nome do Responsável <span className="text-red-500">*</span></Label>
                  <Input id="nome_responsavel" value={formData.nome_responsavel || ''}
                    onChange={e => set('nome_responsavel', e.target.value)}
                    className={errors.nome_responsavel ? 'border-red-500' : ''} />
                  {err('nome_responsavel')}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpf_responsavel">CPF do Responsável</Label>
                  <CPFInput id="cpf_responsavel" value={formData.cpf_responsavel}
                    onChange={v => set('cpf_responsavel', v)}
                    className={errors.cpf_responsavel ? 'border-red-500' : ''} />
                  {err('cpf_responsavel')}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telefone_responsavel">Telefone do Responsável</Label>
                  <TelefoneInput id="telefone_responsavel" value={formData.telefone_responsavel || ''}
                    onChange={v => set('telefone_responsavel', v)} />
                </div>
              </div>
            </section>
          )}

          {/* ── Tratamento ─────────────────────────────────────── */}
          <section className="space-y-3 pt-2 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tratamento</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Área de Tratamento</Label>
                <Select value={formData.area_tratamento || '_none'}
                  onValueChange={v => set('area_tratamento', v === '_none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {AREAS_TRATAMENTO.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Como nos conheceu?</Label>
                <Select value={formData.como_conheceu || '_none'}
                  onValueChange={v => set('como_conheceu', v === '_none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {COMO_CONHECEU.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="profissao">Profissão</Label>
              <Input id="profissao" placeholder="Ex: Professor, Engenheiro..."
                value={formData.profissao || ''} onChange={e => set('profissao', e.target.value)} />
            </div>
          </section>

          {/* ── Endereço ───────────────────────────────────────── */}
          <section className="space-y-3 pt-2 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Endereço</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="00000-000"
                  value={formData.cep || ''} onChange={e => set('cep', e.target.value)}
                  onBlur={handleCEPBlur} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="space-y-1 col-span-6">
                <Label htmlFor="rua">Rua / Avenida</Label>
                <Input id="rua" value={formData.rua || formData.endereco || ''}
                  onChange={e => set('rua', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" value={formData.numero || ''}
                  onChange={e => set('numero', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-4">
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" placeholder="Apto, Bloco..."
                  value={formData.complemento || ''} onChange={e => set('complemento', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="space-y-1 col-span-4">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" value={formData.bairro || ''}
                  onChange={e => set('bairro', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-5">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" value={formData.cidade || ''}
                  onChange={e => set('cidade', e.target.value)} />
              </div>
              <div className="space-y-1 col-span-3">
                <Label>UF</Label>
                <Select value={formData.estado || '_none'}
                  onValueChange={v => set('estado', v === '_none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="observacao_endereco">Referência / Observação</Label>
              <Textarea id="observacao_endereco" rows={2}
                placeholder="Portaria, campainha..."
                value={formData.observacao_endereco || ''}
                onChange={e => set('observacao_endereco', e.target.value)} />
            </div>
          </section>

          {/* ── Ações ──────────────────────────────────────────── */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
