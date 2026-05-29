export interface DocumentoVars {
  // Paciente
  PACIENTE_NOME?: string;
  PACIENTE_NASCIMENTO?: string;
  PACIENTE_CPF?: string;
  PACIENTE_RG?: string;
  PACIENTE_TELEFONE?: string;
  PACIENTE_EMAIL?: string;
  PACIENTE_RUA?: string;
  PACIENTE_NUMERO?: string;
  PACIENTE_BAIRRO?: string;
  PACIENTE_CIDADE?: string;
  PACIENTE_ESTADO?: string;
  PACIENTE_CEP?: string;
  PACIENTE_RESPONSAVEL?: string;
  PACIENTE_RESPONSAVEL_CPF?: string;
  PACIENTE_PRONTUARIO?: string;
  // Clínica
  CLINICA_NOME?: string;
  CLINICA_CNPJ?: string;
  CLINICA_CIDADE?: string;
  CLINICA_ESTADO?: string;
  CLINICA_ENDERECO?: string;
  CLINICA_TELEFONE?: string;
  CLINICA_CRO_RESPONSAVEL?: string;
  CLINICA_DENTISTA_NOME?: string;
  CLINICA_LOGO_URL?: string;
  // Dentista que atende (pode ser diferente do responsável técnico)
  DENTISTA_NOME?: string;
  DENTISTA_CRO?: string;
  // Orçamento
  ORCAMENTO_NUMERO?: string;
  ORCAMENTO_DATA?: string;
  ORCAMENTO_VALOR_TOTAL?: string;
  ORCAMENTO_PROCEDIMENTOS?: string;
  ORCAMENTO_PARCELAS?: string;
  ORCAMENTO_VENCIMENTO?: string;
  ORCAMENTO_VALIDADE?: string;
  // Auto
  DATA_HOJE?: string;
  HORA_ATUAL?: string;
  DOCUMENTO_NUMERO?: string;
  ASSINATURA_DIGITAL?: string;
  [key: string]: string | undefined;
}

export function buildVars(
  paciente?: Record<string, any>,
  clinicaConfig?: Record<string, any>,
  orcamento?: Record<string, any>,
  dentista?: Record<string, any>,
  documentoNumero?: string,
): DocumentoVars {
  const now = new Date();
  const fmtData = (d?: string) =>
    d && !isNaN(new Date(d).getTime()) ? new Date(d).toLocaleDateString('pt-BR') : '';
  const fmtMoeda = (v?: number) =>
    v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';

  const orcProcs = orcamento?.orcamento_itens
    ?.map((i: any) => `• ${i.nome_procedimento}${i.dente_numero ? ` (dente ${i.dente_numero})` : ''}`)
    .join('\n') ?? '';

  const orcParcelas = orcamento
    ? `${orcamento.forma_pagamento ?? 'A combinar'}${orcamento.parcelas > 1 ? ` em ${orcamento.parcelas}x` : ' à vista'}`
    : '';

  return {
    PACIENTE_NOME: paciente?.nome ?? '',
    PACIENTE_NASCIMENTO: fmtData(paciente?.data_nascimento),
    PACIENTE_CPF: paciente?.cpf ?? '',
    PACIENTE_RG: paciente?.rg ?? '',
    PACIENTE_TELEFONE: paciente?.telefone ?? '',
    PACIENTE_EMAIL: paciente?.email ?? '',
    PACIENTE_RUA: paciente?.rua ?? '',
    PACIENTE_NUMERO: paciente?.numero ?? '',
    PACIENTE_BAIRRO: paciente?.bairro ?? '',
    PACIENTE_CIDADE: paciente?.cidade ?? '',
    PACIENTE_ESTADO: paciente?.estado ?? '',
    PACIENTE_CEP: paciente?.cep ?? '',
    PACIENTE_RESPONSAVEL: paciente?.responsavel ?? '',
    PACIENTE_RESPONSAVEL_CPF: paciente?.responsavel_cpf ?? '',
    PACIENTE_PRONTUARIO: paciente?.numero_prontuario ?? '',

    CLINICA_NOME: clinicaConfig?.nome ?? 'Instituto Belém de Odontologia',
    CLINICA_CNPJ: clinicaConfig?.cnpj ?? '',
    CLINICA_CIDADE: clinicaConfig?.cidade ?? 'Belém',
    CLINICA_ESTADO: clinicaConfig?.estado ?? 'PA',
    CLINICA_ENDERECO: clinicaConfig?.endereco ?? '',
    CLINICA_TELEFONE: clinicaConfig?.telefone ?? '',
    CLINICA_CRO_RESPONSAVEL: clinicaConfig?.cro_responsavel ?? dentista?.cro ?? '',
    CLINICA_DENTISTA_NOME: clinicaConfig?.dentista_responsavel ?? dentista?.nome ?? '',
    CLINICA_LOGO_URL: clinicaConfig?.logo_url ?? '',

    DENTISTA_NOME: dentista?.nome ?? clinicaConfig?.dentista_responsavel ?? '',
    DENTISTA_CRO: dentista?.cro ?? clinicaConfig?.cro_responsavel ?? '',

    ORCAMENTO_NUMERO: orcamento?.numero_orcamento ? `#${orcamento.numero_orcamento}` : '',
    ORCAMENTO_DATA: orcamento?.created_at ? fmtData(orcamento.created_at) : '',
    ORCAMENTO_VALOR_TOTAL: fmtMoeda(orcamento?.total_liquido),
    ORCAMENTO_PROCEDIMENTOS: orcProcs,
    ORCAMENTO_PARCELAS: orcParcelas,
    ORCAMENTO_VENCIMENTO: '',
    ORCAMENTO_VALIDADE: orcamento?.validade_dias
      ? fmtData(new Date(new Date(orcamento.created_at).getTime() + orcamento.validade_dias * 86_400_000).toISOString())
      : '',

    DATA_HOJE: now.toLocaleDateString('pt-BR'),
    HORA_ATUAL: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    DOCUMENTO_NUMERO: documentoNumero ?? '',
    ASSINATURA_DIGITAL: '',
  };
}

export async function exportarDocumentoPDF(elementId: string, filename: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Elemento não encontrado: ${elementId}`);

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf') as any,
    import('html2canvas') as any,
  ]);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: el.scrollWidth,
    height: el.scrollHeight,
  });

  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageHeight = 297;

  if (imgHeight <= pageHeight) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    let yOffset = 0;
    while (yOffset < imgHeight) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -yOffset, imgWidth, imgHeight);
      yOffset += pageHeight;
    }
  }

  pdf.save(filename);
}

// Tipos de documento para UI
export const TIPOS_DOCUMENTO = [
  { value: 'contrato', label: 'Contrato de Prestação de Serviços', grupo: 'Contrato' },
  { value: 'tcle_cirurgia', label: 'TCLE — Cirurgia Oral / Extração', grupo: 'TCLE' },
  { value: 'tcle_implante', label: 'TCLE — Implante Osseointegrado', grupo: 'TCLE' },
  { value: 'tcle_ortodontia', label: 'TCLE — Tratamento Ortodôntico', grupo: 'TCLE' },
  { value: 'tcle_clareamento', label: 'TCLE — Clareamento Dental', grupo: 'TCLE' },
  { value: 'tcle_endodontia', label: 'TCLE — Endodontia (Canal)', grupo: 'TCLE' },
  { value: 'tcle_protese', label: 'TCLE — Prótese Removível', grupo: 'TCLE' },
  { value: 'tcle_faceta', label: 'TCLE — Facetas / Laminados', grupo: 'TCLE' },
  { value: 'tcle_enxerto', label: 'TCLE — Enxerto Ósseo', grupo: 'TCLE' },
  { value: 'tcle_periodontal', label: 'TCLE — Cirurgia Periodontal', grupo: 'TCLE' },
  { value: 'tcle_sedacao', label: 'TCLE — Sedação Consciente', grupo: 'TCLE' },
  { value: 'tcle_imagem', label: 'TCLE — Uso de Imagem (LGPD)', grupo: 'TCLE' },
  { value: 'atestado', label: 'Atestado Odontológico', grupo: 'Clínico' },
  { value: 'receituario_pdf', label: 'Receituário', grupo: 'Clínico' },
  { value: 'anamnese_padrao', label: 'Anamnese Padrão', grupo: 'Anamnese' },
  { value: 'anamnese_infantil', label: 'Anamnese Infantil (0–6 anos)', grupo: 'Anamnese' },
  { value: 'anamnese_transicao', label: 'Anamnese Infantil-Adulta (7–12 anos)', grupo: 'Anamnese' },
  { value: 'anamnese_resumida', label: 'Anamnese Resumida (Retorno)', grupo: 'Anamnese' },
  { value: 'anamnese_completa', label: 'Anamnese Completa (C-CAP/CFO)', grupo: 'Anamnese' },
  { value: 'anamnese_periodontal', label: 'Anamnese Periodontal', grupo: 'Anamnese' },
  { value: 'anamnese_pcd', label: 'Anamnese — Paciente PCD', grupo: 'Anamnese' },
] as const;

export type TipoDocumento = typeof TIPOS_DOCUMENTO[number]['value'];
