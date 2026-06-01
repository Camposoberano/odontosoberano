import { forwardRef } from 'react';
import { DocumentoVars } from '@/utils/documentoUtils';
import { pageStyle, DocumentoHeader, DocumentoFooter, BRAND } from './DocumentoBase';

interface Props {
  vars: DocumentoVars;
  procedimentoRealizado?: string;
  horas?: string;
  tipoAfastamento?: 'integral' | 'parcial';
  horarioAfastamento?: string;
  cid10?: string;
}

export const AtestadoTemplate = forwardRef<HTMLDivElement, Props>(
  ({ vars, procedimentoRealizado, horas = '___', tipoAfastamento = 'integral', horarioAfastamento, cid10 }, ref) => {
    return (
      <div ref={ref} id="documento-pdf" style={{ background: '#fff' }}>
        <DocumentoHeader vars={vars} titulo="ATESTADO ODONTOLÓGICO" />

        <div style={{ ...pageStyle, paddingTop: 0 }}>
          {/* Bloco clínica */}
          <div style={{
            border: `2px solid ${BRAND.dourado}`, borderRadius: 10,
            padding: '12px 18px', marginBottom: 24, fontSize: 11, textAlign: 'center',
          }}>
            <p style={{ fontWeight: 800, fontSize: 14, margin: '0 0 4px' }}>{vars.CLINICA_NOME ?? 'Instituto Belém de Odontologia'}</p>
            {vars.CLINICA_ENDERECO && <p style={{ margin: '0 0 2px', color: BRAND.cinza }}>{vars.CLINICA_ENDERECO} — {vars.CLINICA_CIDADE}/{vars.CLINICA_ESTADO}</p>}
            {vars.CLINICA_TELEFONE && <p style={{ margin: '0 0 2px', color: BRAND.cinza }}>Tel.: {vars.CLINICA_TELEFONE}</p>}
          </div>

          {/* Corpo do atestado */}
          <p style={{ fontSize: 11, lineHeight: 1.8, marginBottom: 16 }}>
            Atesto, para os devidos fins, que o(a) paciente
          </p>

          <div style={{
            backgroundColor: BRAND.fundo, border: `1.5px solid ${BRAND.dourado}`,
            borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 11,
          }}>
            <p style={{ fontWeight: 800, fontSize: 14, margin: '0 0 6px', color: BRAND.preto }}>{vars.PACIENTE_NOME || '________________________________'}</p>
            <p style={{ margin: '0 0 2px' }}>CPF: <strong>{vars.PACIENTE_CPF || '___.___.___-__'}</strong></p>
            <p style={{ margin: '0 0 2px' }}>Data de Nascimento: <strong>{vars.PACIENTE_NASCIMENTO || '___/___/______'}</strong></p>
            {vars.PACIENTE_TELEFONE && (
              <p style={{ margin: '0 0 2px' }}>Celular/WhatsApp: <strong>{vars.PACIENTE_TELEFONE}</strong></p>
            )}
            {vars.PACIENTE_LOCAL_TRABALHO && (
              <p style={{ margin: 0 }}>Local de Trabalho: <strong>{vars.PACIENTE_LOCAL_TRABALHO}</strong></p>
            )}
          </div>

          <p style={{ fontSize: 11, lineHeight: 1.8, marginBottom: 8 }}>
            esteve sob meus cuidados profissionais no dia <strong>{vars.DATA_HOJE || '___/___/______'}</strong>,
            no horário das <strong>{vars.HORA_ATUAL || '___:___'}</strong>, sendo submetido(a) ao seguinte
            procedimento odontológico:
          </p>

          <div style={{
            border: `1px solid #d1d5db`, borderRadius: 6,
            padding: '10px 14px', marginBottom: 16, fontSize: 11, minHeight: 36,
          }}>
            {procedimentoRealizado || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Procedimento odontológico</span>}
          </div>

          {cid10 && (
            <p style={{ fontSize: 11, marginBottom: 12 }}>
              CID-10 (quando aplicável): <strong>{cid10}</strong>
            </p>
          )}

          <p style={{ fontSize: 11, lineHeight: 1.8, marginBottom: 8 }}>
            necessitando de repouso por <strong>{horas}</strong> hora(s) / dia(s).
          </p>

          <div style={{ display: 'flex', gap: 24, marginBottom: 16, fontSize: 11 }}>
            <label>
              <input type="checkbox" readOnly checked={tipoAfastamento === 'integral'} style={{ marginRight: 4 }} />
              Afastamento integral
            </label>
            <label>
              <input type="checkbox" readOnly checked={tipoAfastamento === 'parcial'} style={{ marginRight: 4 }} />
              Afastamento parcial — horário: {horarioAfastamento || 'das ___ às ___'}
            </label>
          </div>

          <p style={{ fontSize: 11, lineHeight: 1.8 }}>
            <input type="checkbox" readOnly style={{ marginRight: 4 }} />
            Apto(a) para retornar às atividades normais após o período de repouso.
          </p>

          <div style={{ borderTop: `1px dashed #d1d5db`, margin: '24px 0 16px' }} />

          <p style={{ fontSize: 10.5, textAlign: 'center', color: '#4b5563', fontStyle: 'italic', marginBottom: 24 }}>
            {vars.CLINICA_NOME || 'Instituto Belém de Odontologia'}, {vars.DATA_HOJE} às {vars.HORA_ATUAL}
          </p>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <div style={{ borderTop: `1.5px solid #9ca3af`, width: 280, margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: 12 }}>{vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME || '________________________________'}</p>
            <p style={{ fontSize: 10, color: BRAND.cinza, margin: 0 }}>CRO: {vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL || '_______________'}</p>
          </div>

          <p style={{ textAlign: 'center', fontSize: 9, color: BRAND.cinza, marginTop: 20, fontStyle: 'italic' }}>
            Este atestado é emitido exclusivamente para fins legais e trabalhistas.
            Não é válido sem assinatura do profissional.
          </p>

          <DocumentoFooter vars={vars} />
        </div>
      </div>
    );
  }
);

AtestadoTemplate.displayName = 'AtestadoTemplate';
