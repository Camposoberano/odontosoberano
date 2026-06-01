import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paciente } from '@/hooks/usePacientes';
import { useConvenios } from '@/hooks/useConvenios';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { CPFInput, TelefoneInput } from '@/components/ui/masked-input';
import { AlertCircle, X, Plus } from 'lucide-react';

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
  whatsapp: z.string().max(20).nullable().optional(),
  cpf: z.string().nullable().optional().refine(v => !v || v.length === 0 || isValidCPF(v), 'CPF inválido'),
  data_nascimento: z.string().nullable().optional(),
  genero: z.string().nullable().optional(),
  area_tratamento: z.string().nullable().optional(),
  profissao: z.string().max(100).nullable().optional(),
  como_conheceu: z.string().nullable().optional(),
  status: z.enum(['Ativo', 'Inativo']),
  paciente_estrangeiro: z.boolean().optional(),
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
  parentesco_responsavel: z.string().max(50).nullable().optional(),
  nome_responsavel: z.string().max(100).nullable().optional(),
  cpf_responsavel: z.string().nullable().optional().refine(v => !v || v.length === 0 || isValidCPF(v), 'CPF inválido'),
  telefone_responsavel: z.string().nullable().optional(),
  data_nasc_responsavel: z.string().nullable().optional(),
  email_responsavel: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  // informações adicionais
  numero_prontuario: z.string().max(50).nullable().optional(),
  rede_social: z.string().max(255).nullable().optional(),
  // plano
  plano_id: z.string().uuid().nullable().optional(),
  numero_carteirinha: z.string().max(100).nullable().optional(),
  titular_plano: z.string().max(255).nullable().optional(),
});

export interface CreatePacienteData {
  nome: string;
  apelido?: string | null;
  email: string;
  telefone: string;
  whatsapp?: string | null;
  cpf?: string | null;
  data_nascimento?: string | null;
  genero?: string | null;
  area_tratamento?: string | null;
  profissao?: string | null;
  como_conheceu?: string | null;
  status: 'Ativo' | 'Inativo';
  paciente_estrangeiro?: boolean | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacao_endereco?: string | null;
  endereco?: string | null;
  parentesco_responsavel?: string | null;
  nome_responsavel?: string | null;
  cpf_responsavel?: string | null;
  telefone_responsavel?: string | null;
  data_nasc_responsavel?: string | null;
  email_responsavel?: string | null;
  etiquetas?: string[] | null;
  numero_prontuario?: string | null;
  rede_social?: string | null;
  plano_id?: string | null;
  numero_carteirinha?: string | null;
  titular_plano?: string | null;
}

interface PacienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePacienteData) => Promise<void>;
  paciente?: Paciente | null;
  title: string;
}

const emptyForm = (): CreatePacienteData => ({
  nome: '', apelido: '', email: '', telefone: '', whatsapp: '', cpf: '',
  data_nascimento: '', genero: '', area_tratamento: '', profissao: '',
  como_conheceu: '', status: 'Ativo', paciente_estrangeiro: false,
  cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '',
  estado: '', observacao_endereco: '', endereco: '',
  parentesco_responsavel: '', nome_responsavel: '', cpf_responsavel: '',
  telefone_responsavel: '', data_nasc_responsavel: '', email_responsavel: '',
  etiquetas: [], numero_prontuario: '', rede_social: '',
  plano_id: null, numero_carteirinha: '', titular_plano: '',
});

export function PacienteForm({ isOpen, onClose, onSubmit, paciente, title }: PacienteFormProps) {
  const [formData, setFormData] = useState<CreatePacienteData>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [novaEtiqueta, setNovaEtiqueta] = useState('');
  const [activeTab, setActiveTab] = useState('dados');
  const { toast } = useToast();
  const { convenios } = useConvenios();

  const eMenor = formData.data_nascimento
    ? calcularIdade(formData.data_nascimento) < 18
    : false;

  // Auto-abre aba responsável quando detecta menor de idade
  React.useEffect(() => {
    if (eMenor) setActiveTab('responsavel');
  }, [eMenor]);

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
        whatsapp: (paciente as any).whatsapp || '',
        cpf: paciente.cpf || '',
        data_nascimento: paciente.data_nascimento || '',
        genero: paciente.genero || '',
        area_tratamento: paciente.area_tratamento || '',
        profissao: paciente.profissao || '',
        como_conheceu: paciente.como_conheceu || '',
        status: paciente.status || 'Ativo',
        paciente_estrangeiro: paciente.paciente_estrangeiro || false,
        cep: paciente.cep || '',
        rua: paciente.rua || '',
        numero: paciente.numero || '',
        complemento: paciente.complemento || '',
        bairro: paciente.bairro || '',
        cidade: paciente.cidade || '',
        estado: paciente.estado || '',
        observacao_endereco: paciente.observacao_endereco || '',
        endereco: paciente.endereco || '',
        parentesco_responsavel: (paciente as any).parentesco_responsavel || '',
        nome_responsavel: paciente.nome_responsavel || '',
        cpf_responsavel: paciente.cpf_responsavel || '',
        telefone_responsavel: paciente.telefone_responsavel || '',
        data_nasc_responsavel: paciente.data_nasc_responsavel || '',
        email_responsavel: paciente.email_responsavel || '',
        etiquetas: paciente.etiquetas || [],
        numero_prontuario: paciente.numero_prontuario || '',
        rede_social: paciente.rede_social || '',
        plano_id: paciente.plano_id || null,
        numero_carteirinha: paciente.numero_carteirinha || '',
        titular_plano: paciente.titular_plano || '',
      });
    } else {
      setFormData(emptyForm());
    }
    setErrors({});
    setNovaEtiqueta('');
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
        data_nasc_responsavel: formData.data_nasc_responsavel || null,
        email_responsavel: formData.email_responsavel || null,
        paciente_estrangeiro: formData.paciente_estrangeiro || false,
        etiquetas: formData.etiquetas || [],
        numero_prontuario: formData.numero_prontuario || null,
        rede_social: formData.rede_social || null,
        plano_id: formData.plano_id || null,
        numero_carteirinha: formData.numero_carteirinha || null,
        titular_plano: formData.titular_plano || null,
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

  const set = (field: keyof CreatePacienteData, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => { const e = { ...prev }; delete e[field as string]; return e; });
  };

  const addEtiqueta = () => {
    const tag = novaEtiqueta.trim();
    if (!tag) return;
    const current = formData.etiquetas || [];
    if (!current.includes(tag)) {
      setFormData(prev => ({ ...prev, etiquetas: [...current, tag] }));
    }
    setNovaEtiqueta('');
  };

  const removeEtiqueta = (tag: string) => {
    setFormData(prev => ({ ...prev, etiquetas: (prev.etiquetas || []).filter(t => t !== tag) }));
  };

  const err = (field: string) => errors[field] ? (
    <p className="text-xs text-red-500 mt-0.5">{errors[field]}</p>
  ) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[660px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="responsavel">Responsável</TabsTrigger>
              <TabsTrigger value="adicionais">Adicionais</TabsTrigger>
              <TabsTrigger value="plano">Plano</TabsTrigger>
            </TabsList>

            {/* ─── ABA DADOS ─────────────────────────────── */}
            <TabsContent value="dados" className="space-y-5">
              {/* Identificação */}
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
                <div className="flex items-center gap-3">
                  <Switch
                    id="paciente_estrangeiro"
                    checked={formData.paciente_estrangeiro || false}
                    onCheckedChange={v => set('paciente_estrangeiro', v)}
                  />
                  <Label htmlFor="paciente_estrangeiro" className="cursor-pointer">Paciente estrangeiro</Label>
                </div>
              </section>

              {/* Contato */}
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
                <div className="space-y-1">
                  <Label htmlFor="whatsapp">WhatsApp <span className="text-xs text-muted-foreground">(se diferente do telefone)</span></Label>
                  <TelefoneInput id="whatsapp" value={formData.whatsapp || ''}
                    onChange={v => set('whatsapp', v)} />
                </div>
              </section>

              {/* Nascimento */}
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

              {/* Tratamento */}
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

              {/* Etiquetas */}
              <section className="space-y-3 pt-2 border-t">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Etiquetas</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nova etiqueta..."
                    value={novaEtiqueta}
                    onChange={e => setNovaEtiqueta(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEtiqueta(); } }}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addEtiqueta}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {(formData.etiquetas || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(formData.etiquetas || []).map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <button type="button" onClick={() => removeEtiqueta(tag)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </section>

              {/* Endereço */}
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
            </TabsContent>

            {/* ─── ABA RESPONSÁVEL ───────────────────────── */}
            <TabsContent value="responsavel" className="space-y-4">
              {eMenor && (
                <div className="flex items-center gap-2 text-blue-700 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Paciente menor de idade — responsável obrigatório</span>
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="parentesco_responsavel">Parentesco / Vínculo {eMenor && <span className="text-red-500">*</span>}</Label>
                  <select
                    id="parentesco_responsavel"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.parentesco_responsavel || ''}
                    onChange={e => set('parentesco_responsavel', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Pai">Pai</option>
                    <option value="Mãe">Mãe</option>
                    <option value="Avô">Avô</option>
                    <option value="Avó">Avó</option>
                    <option value="Tio">Tio</option>
                    <option value="Tia">Tia</option>
                    <option value="Irmão">Irmão</option>
                    <option value="Irmã">Irmã</option>
                    <option value="Cônjuge">Cônjuge</option>
                    <option value="Tutor Legal">Tutor Legal</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nome_responsavel">
                    Nome do Responsável {eMenor && <span className="text-red-500">*</span>}
                  </Label>
                  <Input id="nome_responsavel" value={formData.nome_responsavel || ''}
                    onChange={e => set('nome_responsavel', e.target.value)}
                    className={errors.nome_responsavel ? 'border-red-500' : ''} />
                  {err('nome_responsavel')}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="cpf_responsavel">CPF do Responsável</Label>
                    <CPFInput id="cpf_responsavel" value={formData.cpf_responsavel}
                      onChange={v => set('cpf_responsavel', v)}
                      className={errors.cpf_responsavel ? 'border-red-500' : ''} />
                    {err('cpf_responsavel')}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="data_nasc_responsavel">Data Nascimento</Label>
                    <Input id="data_nasc_responsavel" type="date"
                      value={formData.data_nasc_responsavel || ''}
                      onChange={e => set('data_nasc_responsavel', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="telefone_responsavel">Celular do Responsável</Label>
                    <TelefoneInput id="telefone_responsavel" value={formData.telefone_responsavel || ''}
                      onChange={v => set('telefone_responsavel', v)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email_responsavel">Email do Responsável</Label>
                    <Input id="email_responsavel" type="email"
                      value={formData.email_responsavel || ''}
                      onChange={e => set('email_responsavel', e.target.value)}
                      className={errors.email_responsavel ? 'border-red-500' : ''} />
                    {err('email_responsavel')}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ─── ABA ADICIONAIS ────────────────────────── */}
            <TabsContent value="adicionais" className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="numero_prontuario">Número de Prontuário</Label>
                    <Input id="numero_prontuario" placeholder="Código interno..."
                      value={formData.numero_prontuario || ''}
                      onChange={e => set('numero_prontuario', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rede_social">Rede Social / Perfil</Label>
                    <Input id="rede_social" placeholder="@usuario ou URL..."
                      value={formData.rede_social || ''}
                      onChange={e => set('rede_social', e.target.value)} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ─── ABA PLANO ─────────────────────────────── */}
            <TabsContent value="plano" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Plano / Convênio</Label>
                  <Select
                    value={formData.plano_id || '_none'}
                    onValueChange={v => set('plano_id', v === '_none' ? null : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecionar plano..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Particular (sem plano)</SelectItem>
                      {convenios.filter(c => c.status === 'ativo' || c.status === 'Ativo').map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="numero_carteirinha">Número da Carteirinha</Label>
                    <Input id="numero_carteirinha"
                      value={formData.numero_carteirinha || ''}
                      onChange={e => set('numero_carteirinha', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="titular_plano">Titular do Plano</Label>
                    <Input id="titular_plano" placeholder="Nome do titular..."
                      value={formData.titular_plano || ''}
                      onChange={e => set('titular_plano', e.target.value)} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* ── Ações ──────────────────────────────────────────── */}
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
