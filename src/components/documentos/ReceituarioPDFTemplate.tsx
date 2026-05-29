import { forwardRef } from 'react';
import { DocumentoVars } from '@/utils/documentoUtils';
import { pageStyle, DocumentoHeader, DocumentoFooter, BRAND } from './DocumentoBase';
import { Medicamento } from '@/hooks/useReceituario';

interface Props {
  vars: DocumentoVars;
  medicamentos: Medicamento[];
  diagnostico?: string;
  observacoes?: string;
  pesoPaciente?: string;
}

export const ReceituarioPDFTemplate = forwardRef<HTMLDivElement, Props>(
  ({ vars, medicamentos, diagnostico, observacoes, pesoPaciente }, ref) => {
    return (
      <div ref={ref} id="documento-pdf" style={{ background: '#fff' }}>
        <DocumentoHeader vars={vars} titulo="RECEITUÁRIO ODONTOLÓGICO" numero={vars.DOCUMENTO_NUMERO} />

        <div style={{ ...pageStyle, paddingTop: 0 }}>
          {/* Dados do paciente */}
          <div style={{
            backgroundColor: BRAND.fundo, border: `1.5px solid ${BRAND.dourado}`,
            borderRadius: 8, padding: '10px 16px', marginBottom: 16,
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <div>
              <p style={{ fontSize: 9, color: BRAND.cinza, textTransform: 'uppercase', margin: '0 0 2px' }}>Paciente</p>
              <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: BRAND.preto }}>{vars.PACIENTE_NOME || '—'}</p>
              {vars.PACIENTE_NASCIMENTO && <p style={{ fontSize: 10, color: BRAND.cinza, margin: '2px 0 0' }}>Nasc.: {vars.PACIENTE_NASCIMENTO}</p>}
            </div>
            <div>
              <p style={{ fontSize: 9, color: BRAND.cinza, textTransform: 'uppercase', margin: '0 0 2px' }}>Data</p>
              <p style={{ fontWeight: 700, fontSize: 12, margin: 0 }}>{vars.DATA_HOJE}</p>
              {pesoPaciente && <p style={{ fontSize: 10, color: BRAND.cinza, margin: '2px 0 0' }}>Peso: {pesoPaciente} kg</p>}
            </div>
          </div>

          {diagnostico && (
            <div style={{ marginBottom: 12, fontSize: 10.5 }}>
              <span style={{ fontWeight: 700 }}>Diagnóstico: </span>{diagnostico}
            </div>
          )}

          {/* Rp. */}
          <p style={{ fontSize: 14, fontWeight: 800, fontStyle: 'italic', color: BRAND.preto, margin: '0 0 8px' }}>Rp.</p>

          {medicamentos.length === 0 ? (
            <>{[1, 2, 3].map(n => (
              <div key={n} style={{
                border: `1px solid #e5e7eb`, borderRadius: 8,
                padding: '12px 14px', marginBottom: 10,
              }}>
                <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: 11 }}>{n}. ____________________________________________________</p>
                <p style={{ fontSize: 10.5, color: BRAND.cinza, margin: '0 0 4px' }}>Dosagem: ________________ | Frequência: ________________ | Duração: ________________</p>
                <p style={{ fontSize: 10.5, color: BRAND.cinza, margin: 0 }}>Via: [ ] Oral  [ ] Tópico  [ ] Sublingual  [ ] Outro: ___________</p>
              </div>
            ))}</>
          ) : (
            medicamentos.map((med, i) => (
              <div key={i} style={{
                border: `1px solid #e5e7eb`, borderRadius: 8,
                padding: '12px 14px', marginBottom: 10,
                backgroundColor: i % 2 === 0 ? '#fff' : BRAND.fundo,
              }}>
                <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: 11, color: BRAND.preto }}>{i + 1}. {med.nome}</p>
                <p style={{ fontSize: 10.5, color: '#374151', margin: '0 0 4px' }}>
                  {med.dosagem} — {med.frequencia} — {med.duracao}
                  {med.via ? ` | Via: ${med.via}` : ''}
                </p>
                {med.observacoes && (
                  <p style={{ fontSize: 10, color: BRAND.cinza, margin: 0, fontStyle: 'italic' }}>Obs.: {med.observacoes}</p>
                )}
              </div>
            ))
          )}

          {observacoes && (
            <div style={{
              backgroundColor: '#fffbeb', border: `1.5px solid #fde68a`,
              borderRadius: 8, padding: '10px 14px', marginTop: 8,
            }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', margin: '0 0 4px' }}>Observações</p>
              <p style={{ fontSize: 10.5, color: '#78350f', margin: 0 }}>{observacoes}</p>
            </div>
          )}

          <div style={{
            border: `1px solid #fde68a`, borderRadius: 6, padding: '8px 12px',
            marginTop: 16, fontSize: 10, color: '#92400e', backgroundColor: '#fffbeb',
          }}>
            ⚠️ Antibióticos sujeitos a prescrição e retenção de receita — ANVISA RDC 20/2011.
          </div>

          <div style={{ borderTop: `1px dashed #d1d5db`, margin: '24px 0 16px' }} />

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <div style={{ borderTop: `1.5px solid #9ca3af`, width: 280, margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: 12 }}>{vars.DENTISTA_NOME || vars.CLINICA_DENTISTA_NOME || '________________________________'}</p>
            <p style={{ fontSize: 10, color: BRAND.cinza, margin: 0 }}>CRO: {vars.DENTISTA_CRO || vars.CLINICA_CRO_RESPONSAVEL || '_______________'}</p>
          </div>

          <p style={{ textAlign: 'center', fontSize: 9, color: BRAND.cinza, marginTop: 16, fontStyle: 'italic' }}>
            Validade da receita: 30 dias. Não é válida sem assinatura e carimbo do profissional.
          </p>

          <DocumentoFooter vars={vars} />
        </div>
      </div>
    );
  }
);

ReceituarioPDFTemplate.displayName = 'ReceituarioPDFTemplate';
