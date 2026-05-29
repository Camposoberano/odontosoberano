import { useState, useRef, useCallback } from 'react';
import { useState as useGrupoState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Save, FileText } from 'lucide-react';
import { Paciente } from '@/hooks/usePacientes';
import { Dentista } from '@/hooks/useDentistas';
import { useDocumentos } from '@/hooks/useDocumentos';
import { buildVars, exportarDocumentoPDF, TIPOS_DOCUMENTO, TipoDocumento } from '@/utils/documentoUtils';
import { InformacoesClinica } from '@/hooks/useInformacoesClinica';
import { ContratoTemplate } from '@/components/documentos/ContratoTemplate';
import { TCLETemplate } from '@/components/documentos/TCLETemplate';
import { AtestadoTemplate } from '@/components/documentos/AtestadoTemplate';
import { ReceituarioPDFTemplate } from '@/components/documentos/ReceituarioPDFTemplate';
import { AnamnesePDFTemplate, TipoAnamnese } from '@/components/documentos/AnamnesePDFTemplate';
import { useAnamnese } from '@/hooks/useAnamnese';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  paciente: Paciente;
  dentistas: Dentista[];
  clinica?: InformacoesClinica | null;
  orcamento?: Record<string, any> | null;
  tipoInicial?: TipoDocumento;
}

const GRUPOS = ['Contrato', 'TCLE', 'Clínico', 'Anamnese'] as const;

export function GerarDocumentoModal({ open, onClose, paciente, dentistas, clinica, orcamento, tipoInicial }: Props) {
  const [tipo, setTipo] = useState<TipoDocumento | ''>(tipoInicial ?? '');
  const [grupoAtivo, setGrupoAtivo] = useGrupoState<string>(
    tipoInicial ? (TIPOS_DOCUMENTO.find(t => t.value === tipoInicial)?.grupo ?? 'Contrato') : 'Contrato'
  );
  const [dentistaId, setDentistaId] = useState<string>('');
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  const { createDocumento } = useDocumentos(paciente.id);
  const { data: anamneseData } = useAnamnese(paciente.id);

  const dentistaSelecionado = dentistas.find(d => d.id === dentistaId) ?? dentistas[0];

  const vars = buildVars(
    paciente,
    clinica ? {
      nome: clinica.nome_clinica,
      cnpj: clinica.cnpj,
      cidade: clinica.cidade,
      estado: clinica.estado,
      endereco: [clinica.endereco, clinica.numero, clinica.bairro].filter(Boolean).join(', '),
      telefone: clinica.telefone || clinica.celular,
      cro_responsavel: clinica.cro_clinica,
      dentista_responsavel: dentistaSelecionado?.nome,
      logo_url: clinica.logo_base64,
    } : undefined,
    orcamento ?? undefined,
    dentistaSelecionado,
  );

  const tipoLabel = TIPOS_DOCUMENTO.find(t => t.value === tipo)?.label ?? tipo;

  const handleDownload = useCallback(async () => {
    if (!tipo) return;
    setGerandoPDF(true);
    try {
      await exportarDocumentoPDF('documento-pdf', `${tipoLabel} — ${paciente.nome} — ${vars.DATA_HOJE}.pdf`);
    } catch (err) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setGerandoPDF(false);
    }
  }, [tipo, tipoLabel, paciente.nome, vars.DATA_HOJE]);

  const handleSalvar = useCallback(async () => {
    if (!tipo) return;
    setSalvando(true);
    try {
      await createDocumento({
        paciente_id: paciente.id,
        dentista_id: dentistaSelecionado?.id,
        tipo,
        titulo: `${tipoLabel} — ${vars.DATA_HOJE}`,
        conteudo_json: { vars, extras, dentistaId },
      });
      onClose();
    } catch {
      // toast inside hook
    } finally {
      setSalvando(false);
    }
  }, [tipo, tipoLabel, paciente.id, dentistaSelecionado?.id, vars, extras, dentistaId, createDocumento, onClose]);

  const setExtra = (k: string, v: string) => setExtras(prev => ({ ...prev, [k]: v }));

  const renderExtras = () => {
    if (!tipo) return null;

    if (tipo === 'tcle_cirurgia') return (
      <div className="space-y-3">
        <div>
          <Label>Tipo de cirurgia</Label>
          <Select value={extras.tipo_cirurgia} onValueChange={v => setExtra('tipo_cirurgia', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
            <SelectContent>
              {['Extração simples', 'Extração cirúrgica', 'Siso impactado', 'Semiimpactado'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Afastamento estimado (ex: 24 horas)</Label>
          <Input value={extras.afastamento ?? ''} onChange={e => setExtra('afastamento', e.target.value)} />
        </div>
      </div>
    );

    if (tipo === 'tcle_implante') return (
      <div className="space-y-3">
        {[
          ['enxerto', 'Enxerto ósseo indicado?'],
          ['seio', 'Levantamento de seio maxilar?'],
          ['carga_imediata', 'Protocolo de carga imediata?'],
        ].map(([k, label]) => (
          <div key={k} className="flex items-center gap-3">
            <Label className="flex-1">{label}</Label>
            <Select value={extras[k] ?? ''} onValueChange={v => setExtra(k, v)}>
              <SelectTrigger className="w-24"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    );

    if (tipo === 'tcle_ortodontia') return (
      <div className="space-y-3">
        <div>
          <Label>Tipo de aparelho</Label>
          <Select value={extras.aparelho} onValueChange={v => setExtra('aparelho', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
            <SelectContent>
              {['Braquete metálico', 'Braquete estético', 'Lingual', 'Alinhador'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duração estimada (ex: 18 meses)</Label>
          <Input value={extras.duracao ?? ''} onChange={e => setExtra('duracao', e.target.value)} />
        </div>
        <div>
          <Label>Contenção (ex: 2 anos / indefinidamente)</Label>
          <Input value={extras.contencao ?? ''} onChange={e => setExtra('contencao', e.target.value)} />
        </div>
      </div>
    );

    if (tipo === 'tcle_clareamento') return (
      <div className="space-y-3">
        <div>
          <Label>Técnica</Label>
          <Select value={extras.tecnica} onValueChange={v => setExtra('tecnica', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
            <SelectContent>
              {['Consultório (H₂O₂ 35–38%)', 'Caseiro (carbamida 10–16%)', 'Técnica combinada'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Número de sessões</Label>
          <Input type="number" value={extras.sessoes ?? ''} onChange={e => setExtra('sessoes', e.target.value)} />
        </div>
      </div>
    );

    if (tipo === 'tcle_protese') return (
      <div>
        <Label>Tipo de prótese</Label>
        <Select value={extras.tipo_protese} onValueChange={v => setExtra('tipo_protese', v)}>
          <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
          <SelectContent>
            {['Parcial removível (grampo)', 'Total superior', 'Total inferior', 'Flexível'].map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );

    if (tipo === 'atestado') return (
      <div className="space-y-3">
        <div>
          <Label>Procedimento realizado</Label>
          <Input
            value={extras.procedimento ?? ''}
            onChange={e => setExtra('procedimento', e.target.value)}
            placeholder="Ex: Extração do elemento 38 sob anestesia local"
          />
        </div>
        <div>
          <Label>Período de repouso</Label>
          <Input
            value={extras.horas ?? ''}
            onChange={e => setExtra('horas', e.target.value)}
            placeholder="Ex: 24 horas / 2 dias"
          />
        </div>
        <div>
          <Label>Tipo de afastamento</Label>
          <Select value={extras.tipo_afastamento ?? 'integral'} onValueChange={v => setExtra('tipo_afastamento', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="integral">Integral</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {extras.tipo_afastamento === 'parcial' && (
          <div>
            <Label>Horário de afastamento</Label>
            <Input
              value={extras.horario_afastamento ?? ''}
              onChange={e => setExtra('horario_afastamento', e.target.value)}
              placeholder="Ex: das 08h às 12h"
            />
          </div>
        )}
        <div>
          <Label>CID-10 (opcional)</Label>
          <Input
            value={extras.cid10 ?? ''}
            onChange={e => setExtra('cid10', e.target.value)}
            placeholder="Ex: K04.1"
          />
        </div>
      </div>
    );

    return null;
  };

  const renderTemplate = () => {
    if (!tipo) return null;
    const isTCLE = tipo.startsWith('tcle_');

    const isAnamnese = tipo.startsWith('anamnese_');
    if (tipo === 'contrato') return <ContratoTemplate ref={templateRef} vars={vars} />;
    if (isTCLE) return <TCLETemplate ref={templateRef} vars={vars} tipo={tipo} extras={extras} />;
    if (tipo === 'atestado') return (
      <AtestadoTemplate
        ref={templateRef}
        vars={vars}
        procedimentoRealizado={extras.procedimento}
        horas={extras.horas}
        tipoAfastamento={(extras.tipo_afastamento as 'integral' | 'parcial') ?? 'integral'}
        horarioAfastamento={extras.horario_afastamento}
        cid10={extras.cid10}
      />
    );
    if (tipo === 'receituario_pdf') return <ReceituarioPDFTemplate ref={templateRef} vars={vars} medicamentos={[]} />;
    if (isAnamnese) return (
      <AnamnesePDFTemplate
        ref={templateRef}
        vars={vars}
        tipo={tipo as TipoAnamnese}
        anamnese={anamneseData ?? undefined}
      />
    );
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-tight">
            Gerar Documento — {paciente.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Tipo de documento */}
          <div>
            <Label className="font-bold text-xs uppercase tracking-widest mb-2 block">Tipo de Documento</Label>

            {/* Abas de grupo */}
            <div className="flex gap-1 mb-2 flex-wrap">
              {GRUPOS.map(g => (
                <button
                  key={g}
                  onClick={() => setGrupoAtivo(g)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                    grupoAtivo === g
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {g}
                  <span className="ml-1 text-[9px] opacity-60">
                    ({TIPOS_DOCUMENTO.filter(t => t.grupo === g).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Itens do grupo ativo */}
            <div className="grid grid-cols-1 gap-1 max-h-52 overflow-y-auto pr-1">
              {TIPOS_DOCUMENTO.filter(t => t.grupo === grupoAtivo).map(t => (
                <button
                  key={t.value}
                  onClick={() => { setTipo(t.value); setExtras({}); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                    tipo === t.value
                      ? 'bg-primary text-white border-primary shadow-lg'
                      : 'bg-white border-slate-100 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dentista */}
          {dentistas.length > 0 && (
            <div>
              <Label className="font-bold text-xs uppercase tracking-widest mb-2 block">Dentista Responsável</Label>
              <Select value={dentistaId} onValueChange={setDentistaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dentista…" />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.filter(d => d.status === 'Ativo').map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.nome} — CRO {d.cro}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Extras por tipo */}
          {renderExtras() && (
            <div>
              <Label className="font-bold text-xs uppercase tracking-widest mb-2 block">Detalhes do Documento</Label>
              {renderExtras()}
            </div>
          )}

          {/* Aviso de dados */}
          {tipo && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <p className="font-bold mb-1">Dados do paciente preenchidos automaticamente:</p>
              <p>{paciente.nome} · CPF: {paciente.cpf || 'não cadastrado'} · {paciente.telefone || ''}</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!tipo || gerandoPDF}
            className="rounded-xl flex-1"
          >
            {gerandoPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Baixar PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleSalvar}
            disabled={!tipo || salvando}
            className="rounded-xl"
          >
            {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar no Prontuário
          </Button>
        </div>

        {/* Template oculto para captura */}
        <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
          {renderTemplate()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
