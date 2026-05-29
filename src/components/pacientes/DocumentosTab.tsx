import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, FilePlus, FileText, Download, Trash2 } from 'lucide-react';
import { useDocumentos, Documento } from '@/hooks/useDocumentos';
import { useDentistas } from '@/hooks/useDentistas';
import { useInformacoesClinica } from '@/hooks/useInformacoesClinica';
import { Paciente } from '@/hooks/usePacientes';
import { TIPOS_DOCUMENTO, TipoDocumento, exportarDocumentoPDF, buildVars } from '@/utils/documentoUtils';
import { GerarDocumentoModal } from './GerarDocumentoModal';
import { ContratoTemplate } from '@/components/documentos/ContratoTemplate';
import { TCLETemplate } from '@/components/documentos/TCLETemplate';
import { AtestadoTemplate } from '@/components/documentos/AtestadoTemplate';
import { ReceituarioPDFTemplate } from '@/components/documentos/ReceituarioPDFTemplate';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  pacienteId: string;
  paciente: Paciente;
}

const TIPO_CORES: Record<string, string> = {
  contrato: 'bg-blue-100 text-blue-800',
  tcle_cirurgia: 'bg-red-100 text-red-800',
  tcle_implante: 'bg-purple-100 text-purple-800',
  tcle_ortodontia: 'bg-violet-100 text-violet-800',
  tcle_clareamento: 'bg-yellow-100 text-yellow-800',
  tcle_endodontia: 'bg-orange-100 text-orange-800',
  tcle_protese: 'bg-pink-100 text-pink-800',
  tcle_faceta: 'bg-rose-100 text-rose-800',
  tcle_enxerto: 'bg-amber-100 text-amber-800',
  tcle_periodontal: 'bg-lime-100 text-lime-800',
  tcle_imagem: 'bg-sky-100 text-sky-800',
  atestado: 'bg-emerald-100 text-emerald-800',
  receituario_pdf: 'bg-teal-100 text-teal-800',
};

function tipoLabel(tipo: TipoDocumento) {
  return TIPOS_DOCUMENTO.find(t => t.value === tipo)?.label ?? tipo;
}

export function DocumentosTab({ pacienteId, paciente }: Props) {
  const { documentos, loading, deleteDocumento } = useDocumentos(pacienteId);
  const { dentistas } = useDentistas();
  const { informacoes: clinica } = useInformacoesClinica();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Documento | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (doc: Documento) => {
    const { vars, extras, dentistaId } = doc.conteudo_json as any;
    if (!vars) { toast.error('Dados do documento inválidos'); return; }

    setDownloadingId(doc.id);
    try {
      const dentista = dentistas.find((d: any) => d.id === dentistaId);
      const fullVars = buildVars(paciente, clinica ? {
        nome: clinica.nome_clinica,
        cnpj: clinica.cnpj,
        cidade: clinica.cidade,
        estado: clinica.estado,
        endereco: [clinica.endereco, clinica.numero, clinica.bairro].filter(Boolean).join(', '),
        telefone: clinica.telefone || clinica.celular,
        cro_responsavel: clinica.cro_clinica,
        dentista_responsavel: dentista?.nome,
        logo_url: clinica.logo_base64,
      } : undefined, undefined, dentista);

      // Render no div oculto já montado
      await exportarDocumentoPDF('documento-pdf-download', `${doc.titulo}.pdf`);
    } catch {
      toast.error('Erro ao baixar PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Documentos</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
            {documentos.length} {documentos.length === 1 ? 'documento gerado' : 'documentos gerados'}
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-xl font-black text-[11px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
        >
          <FilePlus className="w-4 h-4" />
          Gerar Documento
        </Button>
      </div>

      {/* Lista */}
      {documentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary/40" />
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Nenhum documento gerado ainda
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Gere contratos, termos de consentimento, atestados e receituários diretamente pelo prontuário.
          </p>
          <Button variant="outline" onClick={() => setModalOpen(true)} className="rounded-xl gap-2">
            <FilePlus className="w-4 h-4" /> Gerar primeiro documento
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documentos.map(doc => (
            <Card key={doc.id} className="p-4 rounded-2xl border-2 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{doc.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-[10px] ${TIPO_CORES[doc.tipo] ?? 'bg-gray-100 text-gray-800'}`}>
                        {tipoLabel(doc.tipo as TipoDocumento)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {doc.assinado_em && (
                        <Badge className="bg-green-100 text-green-800 text-[10px]">Assinado</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-xl"
                    disabled={downloadingId === doc.id}
                    onClick={() => handleDownload(doc)}
                  >
                    {downloadingId === doc.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Download className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de geração */}
      <GerarDocumentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        paciente={paciente}
        dentistas={dentistas}
        clinica={clinica}
      />

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.titulo}" será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteTarget) deleteDocumento(deleteTarget.id); setDeleteTarget(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
