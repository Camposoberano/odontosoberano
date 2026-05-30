import { forwardRef } from 'react';
import { DocumentoVars } from '@/utils/documentoUtils';
import { DocumentoFooter } from './DocumentoBase';

// ─── Mesmas seções do formulário ─────────────────────────────────────────────

interface Pergunta {
  id: string;
  texto: string;
  tipo: 'input' | 'text' | 'radio' | 'radio_text';
  alerta?: string;
  detalheLabel?: string;
}

const SECOES_PDF = [
  {
    titulo: 'Dados Pessoais e Emergência',
    perguntas: [
      { id: 'data_nascimento', texto: 'Data de Nascimento', tipo: 'input' },
      { id: 'cpf', texto: 'CPF', tipo: 'input' },
      { id: 'telefone', texto: 'Telefone / WhatsApp', tipo: 'input' },
      { id: 'contato_emergencia', texto: 'Contato de Emergência', tipo: 'input' },
    ] as Pergunta[],
  },
  {
    titulo: 'Motivo da Consulta',
    perguntas: [
      { id: 'queixa_principal', texto: 'Queixa principal', tipo: 'text' },
      { id: 'ultima_visita', texto: 'Última visita ao dentista', tipo: 'text' },
    ] as Pergunta[],
  },
  {
    titulo: 'Histórico Odontológico',
    perguntas: [
      { id: 'freq_escovacao', texto: 'Frequência de escovação', tipo: 'input' },
      { id: 'fio_dental', texto: 'Usa fio dental?', tipo: 'radio_text' },
      { id: 'sangramento', texto: 'Sangramento na escovação?', tipo: 'radio' },
      { id: 'doces', texto: 'Come muitos doces?', tipo: 'radio_text' },
      { id: 'bruxismo', texto: 'Range/aperta os dentes (Bruxismo)?', tipo: 'radio', alerta: 'Bruxismo' },
      { id: 'dor_atm', texto: 'Dor de cabeça / ao abrir a boca?', tipo: 'radio', alerta: 'DTM' },
    ] as Pergunta[],
  },
  {
    titulo: 'Procedimentos Anteriores',
    perguntas: [
      { id: 'internado', texto: 'Já esteve internado(a)?', tipo: 'radio_text' },
      { id: 'cirurgia', texto: 'Já fez cirurgia médica geral?', tipo: 'radio_text' },
      { id: 'cirurgia_oral', texto: 'Já fez Cirurgia Oral?', tipo: 'radio_text' },
      { id: 'reacao_anestesia', texto: 'Reação alérgica à anestesia?', tipo: 'radio_text', alerta: 'Alérgico ao anestésico' },
      { id: 'sedacao', texto: 'Já passou por sedação?', tipo: 'radio_text', alerta: 'Sedado', detalheLabel: 'Tipo de sedação' },
    ] as Pergunta[],
  },
  {
    titulo: 'Medicação e Alergias',
    perguntas: [
      { id: 'medico', texto: 'Acompanhamento médico regular?', tipo: 'radio_text', detalheLabel: 'Especialidade / médico' },
      { id: 'medicacao', texto: 'Usando alguma medicação?', tipo: 'radio_text', alerta: 'Toma medicação' },
      { id: 'alergia', texto: 'Possui alergia? (Penicilina, AAS...)', tipo: 'radio_text', alerta: 'Alérgico a' },
    ] as Pergunta[],
  },
  {
    titulo: 'Cardiovascular e Sangue',
    perguntas: [
      { id: 'hemorragia', texto: 'Hemorragia diagnosticada?', tipo: 'radio', alerta: 'Risco de hemorragia' },
      { id: 'cicatrizacao', texto: 'Dificuldade de cicatrização?', tipo: 'radio', alerta: 'Problema de cicatrização' },
      { id: 'alt_sanguinea', texto: 'Alteração sanguínea?', tipo: 'radio_text', alerta: 'Alteração sanguínea' },
      { id: 'anemia', texto: 'Possui anemia?', tipo: 'radio', alerta: 'Anêmico' },
      { id: 'cardiovascular', texto: 'Alteração cardiovascular?', tipo: 'radio_text', alerta: 'Alteração cardíaca' },
      { id: 'pressao_alta', texto: 'Tem pressão alta?', tipo: 'radio_text', alerta: 'Hipertenso' },
      { id: 'media_pressao', texto: 'Média da pressão arterial', tipo: 'input' },
    ] as Pergunta[],
  },
  {
    titulo: 'Condições Sistêmicas',
    perguntas: [
      { id: 'diabetes', texto: 'Possui diabetes?', tipo: 'radio_text', alerta: 'Diabético' },
      { id: 'asma', texto: 'Possui asma?', tipo: 'radio', alerta: 'Asmático' },
      { id: 'respiratoria', texto: 'Disfunção respiratória?', tipo: 'radio_text', alerta: 'Problema respiratório' },
      { id: 'hepatica', texto: 'Disfunção hepática?', tipo: 'radio_text', alerta: 'Disfunção hepática' },
      { id: 'renal', texto: 'Disfunção renal?', tipo: 'radio_text', alerta: 'Problema renal' },
      { id: 'gastro', texto: 'Gastrite, úlcera ou refluxo?', tipo: 'radio_text', alerta: 'Problema gástrico' },
    ] as Pergunta[],
  },
  {
    titulo: 'Outras Condições',
    perguntas: [
      { id: 'neurologico', texto: 'Desmaios, convulsões ou epilepsia?', tipo: 'radio_text', alerta: 'Neurológico' },
      { id: 'ossea', texto: 'Alteração óssea?', tipo: 'radio_text', alerta: 'Alteração óssea' },
      { id: 'transmissivel', texto: 'Doença transmissível? (HIV, Hepatite)', tipo: 'radio_text', alerta: 'Doença transmissível' },
      { id: 'febre', texto: 'Febre nos últimos 14 dias?', tipo: 'radio' },
      { id: 'outra_doenca', texto: 'Outra doença não mencionada?', tipo: 'radio_text', alerta: 'Outra doença' },
    ] as Pergunta[],
  },
  {
    titulo: 'Saúde Mental e Hábitos',
    perguntas: [
      { id: 'depressao', texto: 'Possui depressão?', tipo: 'radio' },
      { id: 'psicologico', texto: 'Em tratamento psicológico?', tipo: 'radio' },
      { id: 'fumante', texto: 'É fumante?', tipo: 'radio_text', alerta: 'Fumante' },
      { id: 'drogas', texto: 'Consome álcool ou drogas?', tipo: 'radio_text' },
    ] as Pergunta[],
  },
  {
    titulo: 'Condição Feminina',
    perguntas: [
      { id: 'gravida', texto: 'Está grávida?', tipo: 'radio_text', alerta: 'Grávida' },
      { id: 'amamentando', texto: 'Está amamentando?', tipo: 'radio' },
    ] as Pergunta[],
  },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  vars: DocumentoVars;
  dadosCompletos: Record<string, string>;
  alertasMedicos?: string[];
}

// ─── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  preto: '#010101',
  dourado: '#f8cc72',
  douradoClaro: '#fffbee',
  cinza: '#6b7280',
  cinzaClaro: '#f3f4f6',
  verde: '#15803d',
  verdeClaro: '#f0fdf4',
  vermelho: '#dc2626',
  vermelhClaro: '#fef2f2',
  ambar: '#d97706',
  ambarClaro: '#fffbeb',
  border: '#e5e7eb',
};

// ─── Renderiza resposta ────────────────────────────────────────────────────────

function Resposta({ p, dados }: { p: Pergunta; dados: Record<string, string> }) {
  const resp = dados[p.id];
  const det = dados[`${p.id}_detalhe`];
  const isAlert = p.alerta && resp === 'Sim';

  if (!resp) {
    return (
      <div style={{ fontSize: 11, color: C.cinza, fontStyle: 'italic', padding: '2px 0' }}>
        Não respondido
      </div>
    );
  }

  if (p.tipo === 'input' || p.tipo === 'text') {
    return (
      <div style={{ fontSize: 11, color: C.preto, fontWeight: 600, padding: '2px 0', whiteSpace: 'pre-wrap', maxWidth: 400 }}>
        {resp}
      </div>
    );
  }

  // Radio / radio_text
  const isSim = resp === 'Sim';
  const isNao = resp === 'Não';

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 10.5,
    fontWeight: 700,
    background: isSim ? (isAlert ? C.vermelhClaro : C.verdeClaro) : C.cinzaClaro,
    color: isSim ? (isAlert ? C.vermelho : C.verde) : C.cinza,
    border: `1px solid ${isSim ? (isAlert ? '#fca5a5' : '#86efac') : C.border}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={badgeStyle}>
        {isSim ? '✓' : isNao ? '✗' : '?'} {resp}
      </span>
      {det && (
        <div style={{
          fontSize: 10.5, color: C.ambar, fontStyle: 'italic',
          paddingLeft: 10, borderLeft: `2px solid ${C.dourado}`,
        }}>
          {p.detalheLabel ? `${p.detalheLabel}: ` : ''}{det}
        </div>
      )}
    </div>
  );
}

// ─── Template principal ────────────────────────────────────────────────────────

export const AnamneseRespostasPDF = forwardRef<HTMLDivElement, Props>(
  ({ vars, dadosCompletos, alertasMedicos = [] }, ref) => {
    const agora = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
      <div ref={ref} id="anamnese-respostas-pdf" style={{ background: '#fff', width: 800, fontFamily: 'Arial, sans-serif' }}>

        {/* ── Header ── */}
        <div style={{ background: C.preto, padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {vars.CLINICA_LOGO_URL ? (
              <img src={vars.CLINICA_LOGO_URL} alt="Logo" style={{ height: 48, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 8, background: C.dourado, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: C.preto }}>
                IB
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 11, color: C.dourado, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                {vars.CLINICA_NOME || 'Instituto Belém de Odontologia'}
              </p>
              <p style={{ margin: 0, fontSize: 16, color: '#fff', fontWeight: 900, letterSpacing: 0.5 }}>
                FICHA DE ANAMNESE
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 9.5, color: '#9ca3af' }}>Data do preenchimento</p>
            <p style={{ margin: 0, fontSize: 13, color: '#fff', fontWeight: 700 }}>{agora}</p>
          </div>
        </div>

        {/* ── Stripe dourada ── */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.dourado}, #fde68a)` }} />

        {/* ── Info do paciente ── */}
        <div style={{ background: C.douradoClaro, borderBottom: `1.5px solid ${C.dourado}`, padding: '10px 28px', display: 'flex', gap: 32 }}>
          <div>
            <p style={{ margin: 0, fontSize: 9, color: C.cinza, textTransform: 'uppercase', letterSpacing: 0.5 }}>Paciente</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.preto }}>{vars.PACIENTE_NOME || '—'}</p>
          </div>
          {vars.CLINICA_CNPJ && (
            <div>
              <p style={{ margin: 0, fontSize: 9, color: C.cinza, textTransform: 'uppercase', letterSpacing: 0.5 }}>CNPJ</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.cinza }}>{vars.CLINICA_CNPJ}</p>
            </div>
          )}
          {vars.CLINICA_TELEFONE && (
            <div>
              <p style={{ margin: 0, fontSize: 9, color: C.cinza, textTransform: 'uppercase', letterSpacing: 0.5 }}>Telefone</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.cinza }}>{vars.CLINICA_TELEFONE}</p>
            </div>
          )}
        </div>

        <div style={{ padding: '20px 28px 28px' }}>

          {/* ── Alertas médicos ── */}
          {alertasMedicos.length > 0 && (
            <div style={{
              background: C.vermelhClaro, border: `1.5px solid #fca5a5`,
              borderRadius: 8, padding: '10px 14px', marginBottom: 18,
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, color: C.vermelho, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ⚠ Alertas Médicos
              </p>
              {alertasMedicos.map((a, i) => (
                <p key={i} style={{ margin: '2px 0', fontSize: 10.5, color: C.vermelho, fontWeight: 600 }}>• {a}</p>
              ))}
            </div>
          )}

          {/* ── Seções ── */}
          {SECOES_PDF.map((secao, si) => {
            // Verificar se a seção tem alguma resposta preenchida
            const temDados = secao.perguntas.some(p => dadosCompletos[p.id]);
            if (!temDados) return null;

            // Verificar alertas na seção
            const temAlerta = secao.perguntas.some(p => p.alerta && dadosCompletos[p.id] === 'Sim');

            return (
              <div key={si} style={{
                marginBottom: 14,
                border: `1px solid ${temAlerta ? '#fca5a5' : C.border}`,
                borderRadius: 8,
                overflow: 'hidden',
              }}>
                {/* Cabeçalho da seção */}
                <div style={{
                  background: temAlerta ? C.vermelhClaro : C.cinzaClaro,
                  borderBottom: `1px solid ${temAlerta ? '#fca5a5' : C.border}`,
                  padding: '7px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{ width: 3, height: 14, background: temAlerta ? C.vermelho : C.dourado, borderRadius: 2 }} />
                  <p style={{
                    margin: 0, fontSize: 10.5, fontWeight: 800,
                    color: temAlerta ? C.vermelho : C.preto,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {secao.titulo}
                  </p>
                  {temAlerta && <span style={{ fontSize: 10, color: C.vermelho }}>⚠</span>}
                </div>

                {/* Perguntas */}
                <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {secao.perguntas.map((p, pi) => {
                    if (!dadosCompletos[p.id]) return null;
                    return (
                      <div key={pi} style={{ borderBottom: `1px dashed ${C.border}`, paddingBottom: 6 }}>
                        <p style={{ margin: '0 0 3px', fontSize: 9.5, color: C.cinza, lineHeight: 1.3 }}>{p.texto}</p>
                        <Resposta p={p} dados={dadosCompletos} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── Observações (se tiver) ── */}
          {dadosCompletos['observacoes'] && (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ background: C.cinzaClaro, borderBottom: `1px solid ${C.border}`, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 14, background: C.dourado, borderRadius: 2 }} />
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, color: C.preto, textTransform: 'uppercase', letterSpacing: 0.5 }}>Observações</p>
              </div>
              <div style={{ padding: '10px 14px', fontSize: 11, color: C.preto, whiteSpace: 'pre-wrap' }}>
                {dadosCompletos['observacoes']}
              </div>
            </div>
          )}

          {/* ── Declaração e assinaturas ── */}
          <div style={{ borderTop: `1.5px dashed ${C.border}`, marginTop: 18, paddingTop: 14 }}>
            <p style={{ fontSize: 10, textAlign: 'center', color: C.cinza, fontStyle: 'italic', margin: '0 0 16px' }}>
              Declaro que as informações acima são verdadeiras e foram prestadas de forma voluntária.
              {vars.CLINICA_CIDADE ? ` ${vars.CLINICA_CIDADE},` : ''} {agora}.
            </p>
            <div style={{ display: 'flex', gap: 40 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ borderBottom: `1.5px solid #9ca3af`, height: 36, marginBottom: 6 }} />
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700 }}>{vars.PACIENTE_NOME || '___________________________________'}</p>
                <p style={{ margin: '2px 0 0', fontSize: 9.5, color: C.cinza }}>Paciente ou Responsável</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ borderBottom: `1.5px solid #9ca3af`, height: 36, marginBottom: 6 }} />
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700 }}>{vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME || '___________________________________'}</p>
                <p style={{ margin: '2px 0 0', fontSize: 9.5, color: C.cinza }}>
                  Cirurgião(ã)-Dentista{vars.DENTISTA_CRO ? ` — CRO: ${vars.DENTISTA_CRO}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DocumentoFooter vars={vars} />
      </div>
    );
  }
);

AnamneseRespostasPDF.displayName = 'AnamneseRespostasPDF';
