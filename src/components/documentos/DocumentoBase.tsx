import React from 'react';
import { DocumentoVars } from '@/utils/documentoUtils';

// Componente inline para variável preenchida
export function V({ vars, k }: { vars: DocumentoVars; k: string }) {
  const val = vars[k];
  return (
    <span style={{ fontWeight: 700, color: '#010101' }}>
      {val || <span style={{ color: '#b91c1c', fontStyle: 'italic' }}>[{k}]</span>}
    </span>
  );
}

export const BRAND = {
  preto: '#010101',
  dourado: '#f8cc72',
  douradoEscuro: '#c9a227',
  cinza: '#6b7280',
  cinzaClaro: '#f3f4f6',
  fundo: '#fffdf5',
};

// Estilo base da página A4 para html2canvas
export const pageStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  color: '#1a1a1a',
  background: '#ffffff',
  width: 780,
  padding: '36px 44px',
  boxSizing: 'border-box',
  lineHeight: 1.55,
  fontSize: 11,
};

interface HeaderProps {
  vars: DocumentoVars;
  titulo: string;
  subtitulo?: string;
  numero?: string;
}

export function DocumentoHeader({ vars, titulo, subtitulo, numero }: HeaderProps) {
  return (
    <>
      {/* Stripe superior */}
      <div style={{
        height: 5,
        background: `linear-gradient(90deg, ${BRAND.preto}, ${BRAND.douradoEscuro}, ${BRAND.dourado})`,
        borderRadius: '4px 4px 0 0',
      }} />
      <div style={{ padding: '28px 44px 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: 18,
          marginBottom: 20,
          borderBottom: `3px solid ${BRAND.dourado}`,
        }}>
          {/* Esquerda: Logo + Clínica */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {vars.CLINICA_LOGO_URL ? (
              <img src={vars.CLINICA_LOGO_URL} alt={vars.CLINICA_NOME} style={{ height: 56, objectFit: 'contain', marginBottom: 4 }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `linear-gradient(135deg, ${BRAND.preto}, ${BRAND.douradoEscuro})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: BRAND.dourado, fontSize: 16, fontWeight: 900 }}>IB</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: BRAND.preto }}>{vars.CLINICA_NOME ?? 'Instituto Belém de Odontologia'}</span>
              </div>
            )}
            {vars.CLINICA_ENDERECO && <span style={{ fontSize: 9.5, color: BRAND.cinza }}>{vars.CLINICA_ENDERECO}</span>}
            {vars.CLINICA_TELEFONE && <span style={{ fontSize: 9.5, color: BRAND.cinza }}>Tel.: {vars.CLINICA_TELEFONE}</span>}
            {vars.CLINICA_CNPJ && <span style={{ fontSize: 9.5, color: BRAND.cinza }}>CNPJ: {vars.CLINICA_CNPJ}</span>}
          </div>
          {/* Direita: Tipo de documento + número */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Documento Clínico</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: BRAND.preto, margin: '2px 0 4px' }}>{titulo}</p>
            {subtitulo && <p style={{ fontSize: 10, color: BRAND.cinza, margin: 0 }}>{subtitulo}</p>}
            {numero && <p style={{ fontSize: 12, fontWeight: 700, color: BRAND.douradoEscuro, margin: '2px 0 0' }}>Nº {numero}</p>}
            <p style={{ fontSize: 9.5, color: BRAND.cinza, margin: '4px 0 0' }}>Data: {vars.DATA_HOJE}</p>
          </div>
        </div>
      </div>
    </>
  );
}

interface FooterProps {
  vars: DocumentoVars;
}

export function DocumentoFooter({ vars }: FooterProps) {
  return (
    <div style={{
      borderTop: `2px solid ${BRAND.dourado}`, paddingTop: 10, marginTop: 24,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontSize: 8.5, color: '#9ca3af' }}>
        Gerado em {vars.DATA_HOJE} às {vars.HORA_ATUAL} — {vars.CLINICA_NOME ?? 'Instituto Belém de Odontologia'}
      </span>
      <span style={{ fontSize: 8.5, color: '#9ca3af' }}>Documento válido com assinatura</span>
    </div>
  );
}

interface AssinaturasProps {
  vars: DocumentoVars;
  linhas?: { nome: string; detalhe: string }[];
}

export function BlocoAssinaturas({ vars, linhas }: AssinaturasProps) {
  const items = linhas ?? [
    { nome: vars.PACIENTE_NOME ?? 'Paciente', detalhe: `CPF: ${vars.PACIENTE_CPF ?? ''}` },
    { nome: vars.DENTISTA_NOME ?? vars.CLINICA_DENTISTA_NOME ?? 'Dentista', detalhe: `CRO: ${vars.DENTISTA_CRO ?? vars.CLINICA_CRO_RESPONSAVEL ?? ''}` },
  ];
  return (
    <div style={{ display: 'flex', gap: 32, marginTop: 32, marginBottom: 20 }}>
      {items.map((item, i) => (
        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ borderBottom: `1.5px solid #9ca3af`, marginBottom: 8, height: 36 }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: BRAND.preto, margin: '0 0 2px' }}>{item.nome}</p>
          <p style={{ fontSize: 9.5, color: BRAND.cinza, margin: 0 }}>{item.detalhe}</p>
        </div>
      ))}
    </div>
  );
}

export function SecaoTitulo({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 800, color: BRAND.preto,
      textTransform: 'uppercase', letterSpacing: 0.5,
      borderLeft: `3px solid ${BRAND.dourado}`, paddingLeft: 8,
      margin: '18px 0 6px',
    }}>{children}</p>
  );
}

export function Clausula({ num, titulo, children }: { num: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: BRAND.preto, margin: '10px 0 4px' }}>
        {num} — {titulo}
      </p>
      <div style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.6, paddingLeft: 8 }}>
        {children}
      </div>
    </div>
  );
}

export function InfoBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: BRAND.fundo, border: `1.5px solid ${BRAND.dourado}`,
      borderRadius: 8, padding: '10px 16px', marginBottom: 16,
      fontSize: 10.5, lineHeight: 1.7,
    }}>
      {children}
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
      <span style={{ color: BRAND.cinza, minWidth: 140 }}>{label}:</span>
      <span style={{ fontWeight: 600, color: BRAND.preto }}>{value || '—'}</span>
    </div>
  );
}
