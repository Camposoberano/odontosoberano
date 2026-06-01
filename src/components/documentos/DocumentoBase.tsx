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
  const clinicaNome = vars.CLINICA_NOME ?? 'Instituto Belém de Odontologia';
  return (
    <>
      {/* Barra superior gradiente — marca */}
      <div style={{
        height: 8,
        background: `linear-gradient(90deg, ${BRAND.preto} 0%, ${BRAND.douradoEscuro} 55%, ${BRAND.dourado} 100%)`,
      }} />

      {/* Área principal do cabeçalho */}
      <div style={{
        padding: '22px 44px 0',
        background: '#fff',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 24,
        }}>

          {/* ESQUERDA — Identidade visual da clínica */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Logo ou monograma */}
            {vars.CLINICA_LOGO_URL ? (
              <img
                src={vars.CLINICA_LOGO_URL}
                alt={clinicaNome}
                style={{ maxHeight: 72, maxWidth: 72, height: 'auto', width: 'auto', flexShrink: 0, display: 'block' }}
              />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(145deg, ${BRAND.preto} 30%, #2a1f00 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${BRAND.dourado}`,
                boxShadow: `0 2px 8px rgba(200,160,40,0.25)`,
              }}>
                <span style={{ color: BRAND.dourado, fontSize: 22, fontWeight: 900, letterSpacing: -1 }}>IB</span>
              </div>
            )}

            {/* Nome e dados da clínica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
              <span style={{
                fontSize: 18, fontWeight: 900, color: BRAND.preto,
                letterSpacing: -0.5, lineHeight: 1.1,
              }}>{clinicaNome}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, color: BRAND.douradoEscuro,
                textTransform: 'uppercase', letterSpacing: 2,
              }}>Odontologia Especializada</span>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {vars.CLINICA_ENDERECO && (
                  <span style={{ fontSize: 9, color: BRAND.cinza }}>
                    {[vars.CLINICA_ENDERECO, vars.CLINICA_CIDADE, vars.CLINICA_ESTADO].filter(Boolean).join(' — ')}
                  </span>
                )}
                {vars.CLINICA_TELEFONE && (
                  <span style={{ fontSize: 9, color: BRAND.cinza }}>Tel.: {vars.CLINICA_TELEFONE}</span>
                )}
                {vars.CLINICA_CNPJ && (
                  <span style={{ fontSize: 9, color: BRAND.cinza }}>CNPJ: {vars.CLINICA_CNPJ}</span>
                )}
                {vars.CLINICA_CRO_RESPONSAVEL && (
                  <span style={{ fontSize: 9, color: BRAND.cinza }}>Resp. Técnico: {vars.CLINICA_DENTISTA_NOME} — CRO {vars.CLINICA_CRO_RESPONSAVEL}</span>
                )}
              </div>
            </div>
          </div>

          {/* DIREITA — Badge do documento */}
          <div style={{
            flexShrink: 0,
            border: `1.5px solid ${BRAND.dourado}`,
            borderRadius: 10,
            padding: '10px 18px',
            textAlign: 'right',
            background: BRAND.fundo,
            minWidth: 150,
          }}>
            <p style={{
              fontSize: 7.5, fontWeight: 800, color: BRAND.douradoEscuro,
              textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 3px',
            }}>Documento Clínico</p>
            {numero && (
              <p style={{ fontSize: 13, fontWeight: 900, color: BRAND.preto, margin: '0 0 4px', letterSpacing: -0.3 }}>
                Nº {numero}
              </p>
            )}
            <p style={{ fontSize: 9, color: BRAND.cinza, margin: 0 }}>
              Emitido em<br />
              <strong style={{ color: BRAND.preto, fontSize: 10 }}>{vars.DATA_HOJE}</strong>
            </p>
            {subtitulo && (
              <p style={{ fontSize: 8.5, color: BRAND.cinza, margin: '4px 0 0', fontStyle: 'italic' }}>{subtitulo}</p>
            )}
          </div>
        </div>

        {/* Título do documento — faixa elegante */}
        <div style={{
          marginTop: 18,
          marginBottom: 0,
          background: BRAND.preto,
          borderRadius: '6px 6px 0 0',
          padding: '10px 20px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 11.5, fontWeight: 900, color: BRAND.dourado,
            textTransform: 'uppercase', letterSpacing: 2, margin: 0,
          }}>{titulo}</p>
        </div>

        {/* Linha dourada embaixo do título */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND.douradoEscuro}, ${BRAND.dourado}, ${BRAND.douradoEscuro})`, marginBottom: 0 }} />
      </div>
    </>
  );
}

interface FooterProps {
  vars: DocumentoVars;
}

export function DocumentoFooter({ vars }: FooterProps) {
  const clinicaNome = vars.CLINICA_NOME ?? 'Instituto Belém de Odontologia';
  return (
    <div style={{ marginTop: 28 }}>
      {/* Linha dupla decorativa */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND.douradoEscuro}, ${BRAND.dourado}, ${BRAND.douradoEscuro})` }} />
      <div style={{ height: 1, background: BRAND.preto, marginTop: 2, marginBottom: 10 }} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '0 2px',
      }}>
        {/* Esquerda — clínica + timestamp */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <span style={{ fontSize: 8.5, fontWeight: 700, color: BRAND.preto }}>{clinicaNome}</span>
          {vars.CLINICA_TELEFONE && (
            <span style={{ fontSize: 8, color: BRAND.cinza }}>Tel.: {vars.CLINICA_TELEFONE}</span>
          )}
          {vars.CLINICA_CNPJ && (
            <span style={{ fontSize: 8, color: BRAND.cinza }}>CNPJ: {vars.CLINICA_CNPJ}</span>
          )}
        </div>

        {/* Centro — CRO / Responsável */}
        {vars.CLINICA_CRO_RESPONSAVEL && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 8, color: BRAND.cinza }}>
              Resp. Técnico: {vars.CLINICA_DENTISTA_NOME}<br />
              CRO {vars.CLINICA_CRO_RESPONSAVEL}
            </span>
          </div>
        )}

        {/* Direita — geração + validade */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <span style={{ fontSize: 8, color: BRAND.cinza }}>
            Gerado em {vars.DATA_HOJE} às {vars.HORA_ATUAL}
          </span>
          <span style={{ fontSize: 8, color: BRAND.cinza }}>Documento válido com assinatura</span>
          <span style={{
            fontSize: 7.5, fontWeight: 700, color: BRAND.douradoEscuro,
            textTransform: 'uppercase', letterSpacing: 0.8,
          }}>Odontologia Especializada</span>
        </div>
      </div>
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
