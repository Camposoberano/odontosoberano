import { forwardRef } from "react";
import { Orcamento } from "@/hooks/useOrcamentos";

interface OrcamentoPDFTemplateProps {
  orcamento: Orcamento;
  clinicaNome?: string;
  clinicaEndereco?: string;
  clinicaTelefone?: string;
  clinicaCNPJ?: string;
  logoUrl?: string; // URL ou base64 da logo
}

// ─── Odontograma simplificado ──────────────────────────────────────────────

const SUPERIOR = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28];
const INFERIOR = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];

function OdontogramaVisualizacao({ dentesAfetados }: { dentesAfetados: (string | number)[] }) {
  const afetados = new Set(dentesAfetados.map(String));

  const DenteBadge = ({ num, inferior }: { num: number; inferior?: boolean }) => {
    const selecionado = afetados.has(String(num));
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 26 }}>
        {!inferior && (
          <span style={{ fontSize: 9, color: selecionado ? "#1a3a5c" : "#999", fontWeight: selecionado ? 700 : 400 }}>
            {num}
          </span>
        )}
        <div style={{
          width: 20, height: 20, borderRadius: 4,
          border: selecionado ? "2px solid #1a3a5c" : "1.5px solid #ccc",
          backgroundColor: selecionado ? "#c8dff5" : "#f9f9f9",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {selecionado && (
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1a3a5c" }} />
          )}
        </div>
        {inferior && (
          <span style={{ fontSize: 9, color: selecionado ? "#1a3a5c" : "#999", fontWeight: selecionado ? 700 : 400 }}>
            {num}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{
      border: "1.5px solid #dde4ee", borderRadius: 10, padding: "14px 10px",
      backgroundColor: "#f7f9fc", marginBottom: 22,
    }}>
      {/* Superior */}
      <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 6 }}>
        {SUPERIOR.slice(0,8).map(n => <DenteBadge key={n} num={n} />)}
        <div style={{ width: 1, backgroundColor: "#ccc", margin: "0 4px" }} />
        {SUPERIOR.slice(8).map(n => <DenteBadge key={n} num={n} />)}
      </div>
      {/* Linha separadora */}
      <div style={{ borderTop: "1px dashed #c0cfe0", margin: "6px 8px" }} />
      {/* Inferior */}
      <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 6 }}>
        {INFERIOR.slice(0,8).map(n => <DenteBadge key={n} num={n} inferior />)}
        <div style={{ width: 1, backgroundColor: "#ccc", margin: "0 4px" }} />
        {INFERIOR.slice(8).map(n => <DenteBadge key={n} num={n} inferior />)}
      </div>
      {/* Legenda */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#c8dff5", border: "1.5px solid #1a3a5c" }} />
          <span style={{ fontSize: 9, color: "#666" }}>Dente incluído no plano</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#f9f9f9", border: "1.5px solid #ccc" }} />
          <span style={{ fontSize: 9, color: "#666" }}>Sem procedimento</span>
        </div>
      </div>
    </div>
  );
}

// ─── Template principal ────────────────────────────────────────────────────

export const OrcamentoPDFTemplate = forwardRef<HTMLDivElement, OrcamentoPDFTemplateProps>(
  ({
    orcamento,
    clinicaNome = "Instituto Belém",
    clinicaEndereco,
    clinicaTelefone,
    clinicaCNPJ,
    logoUrl,
  }, ref) => {
    const itens = orcamento.orcamento_itens ?? [];

    const dentesAfetados = itens
      .map(i => i.dente_numero)
      .filter(Boolean) as string[];

    const dataEmissao = new Date(orcamento.created_at).toLocaleDateString("pt-BR");

    const descontoValor = orcamento.desconto_valor > 0
      ? orcamento.desconto_tipo === "percentual"
        ? (orcamento.total_bruto * orcamento.desconto_valor) / 100
        : orcamento.desconto_valor
      : 0;

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const s: Record<string, React.CSSProperties> = {
      page: {
        fontFamily: "'Segoe UI', Arial, sans-serif",
        color: "#1a1a2e",
        background: "#ffffff",
        width: 780,
        padding: "40px 44px",
        boxSizing: "border-box",
      },

      // Header
      header: {
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        paddingBottom: 20, marginBottom: 24,
        borderBottom: "3px solid #1a3a5c",
      },
      headerLeft: { display: "flex", flexDirection: "column", gap: 4 },
      logo: { height: 48, objectFit: "contain", marginBottom: 4 },
      clinicaNome: { fontSize: 20, fontWeight: 800, color: "#1a3a5c", letterSpacing: -0.5, margin: 0 },
      clinicaInfo: { fontSize: 10, color: "#6b7280", margin: 0, lineHeight: 1.6 },
      headerRight: { textAlign: "right" as const },
      docLabel: { fontSize: 9, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: 1, margin: 0 },
      docTitle: { fontSize: 22, fontWeight: 800, color: "#1a3a5c", margin: "2px 0 4px" },
      docNum: { fontSize: 13, fontWeight: 700, color: "#4b7cc9", margin: 0 },
      docDate: { fontSize: 10, color: "#6b7280", margin: "2px 0 0" },

      // Título central
      sectionTitle: {
        fontSize: 15, fontWeight: 700, color: "#1a3a5c",
        textAlign: "center" as const, margin: "0 0 18px",
        letterSpacing: 0.3,
      },

      // Paciente info bar
      patientBar: {
        backgroundColor: "#f0f5ff",
        border: "1.5px solid #d0dff5",
        borderRadius: 10,
        padding: "10px 18px",
        marginBottom: 20,
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 6,
        alignItems: "center",
      },
      patientName: { fontSize: 13, fontWeight: 700, color: "#1a3a5c", marginRight: 8 },
      patientDetail: { fontSize: 11, color: "#4b5563" },
      patientSep: { color: "#d1d5db", margin: "0 4px" },

      // Tabela
      table: { width: "100%", borderCollapse: "collapse" as const, marginBottom: 20 },
      thead: {},
      thRow: { backgroundColor: "#1a3a5c" },
      th: { padding: "9px 12px", fontSize: 10, fontWeight: 700, color: "#ffffff",
            textTransform: "uppercase" as const, letterSpacing: 0.6, textAlign: "left" as const },
      thRight: { padding: "9px 12px", fontSize: 10, fontWeight: 700, color: "#ffffff",
            textTransform: "uppercase" as const, letterSpacing: 0.6, textAlign: "right" as const },
      tdEven: { padding: "9px 12px", fontSize: 11, color: "#1f2937", backgroundColor: "#f8faff", borderBottom: "1px solid #e5eaf5" },
      tdOdd: { padding: "9px 12px", fontSize: 11, color: "#1f2937", backgroundColor: "#ffffff", borderBottom: "1px solid #e5eaf5" },
      tdCenter: { textAlign: "center" as const },
      tdRight: { textAlign: "right" as const, fontWeight: 600 },

      // Totais
      totaisBox: { display: "flex", justifyContent: "flex-end", marginBottom: 28 },
      totaisInner: { width: 260, borderTop: "2px solid #e5eaf5", paddingTop: 12 },
      totaisRow: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4b5563", marginBottom: 5 },
      totaisLabel: { color: "#6b7280" },
      descontoRow: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#dc2626", marginBottom: 5 },
      totalRow: {
        display: "flex", justifyContent: "space-between",
        fontSize: 15, fontWeight: 800, color: "#1a3a5c",
        borderTop: "2px solid #1a3a5c", paddingTop: 8, marginTop: 4,
      },
      pagamentoRow: {
        display: "flex", justifyContent: "space-between",
        fontSize: 10, color: "#6b7280", marginTop: 6, paddingTop: 5,
        borderTop: "1px dashed #d1d5db",
      },

      // Observações
      obsBox: {
        backgroundColor: "#fffbeb", border: "1.5px solid #fde68a",
        borderRadius: 8, padding: "10px 14px", marginBottom: 24,
      },
      obsLabel: { fontSize: 9, fontWeight: 700, color: "#b45309", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 3 },
      obsText: { fontSize: 11, color: "#78350f", lineHeight: 1.5 },

      // Declaração
      declaracao: {
        textAlign: "center" as const, fontSize: 11, color: "#4b5563",
        margin: "28px 0 32px", fontStyle: "italic" as const,
        borderTop: "1px solid #e5eaf5", paddingTop: 20,
      },

      // Assinaturas
      signaturas: { display: "flex", justifyContent: "space-between", gap: 40, marginBottom: 24 },
      signaturaBox: { flex: 1, textAlign: "center" as const },
      signaturaLinha: { borderBottom: "1.5px solid #9ca3af", marginBottom: 8 },
      signaturaNome: { fontSize: 12, fontWeight: 700, color: "#1a3a5c", marginBottom: 2 },
      signaturaDetalhe: { fontSize: 10, color: "#6b7280" },

      // Rodapé
      rodape: {
        borderTop: "2px solid #1a3a5c", paddingTop: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      },
      rodapeLeft: { fontSize: 9, color: "#9ca3af" },
      rodapeRight: { fontSize: 9, color: "#9ca3af", textAlign: "right" as const },

      // Accent stripe
      accentStripe: {
        height: 5, background: "linear-gradient(90deg, #1a3a5c, #4b7cc9, #7eb8e8)",
        borderRadius: "4px 4px 0 0", marginBottom: 0,
      },
    };

    return (
      <div ref={ref} id="orcamento-pdf">
        {/* Stripe superior */}
        <div style={s.accentStripe} />

        <div style={s.page}>
          {/* ── HEADER ── */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              {logoUrl ? (
                <img src={logoUrl} alt={clinicaNome} style={s.logo} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "linear-gradient(135deg, #1a3a5c, #4b7cc9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>IB</span>
                  </div>
                  <p style={s.clinicaNome}>{clinicaNome}</p>
                </div>
              )}
              {logoUrl && <p style={s.clinicaNome}>{clinicaNome}</p>}
              {clinicaEndereco && <p style={s.clinicaInfo}>{clinicaEndereco}</p>}
              {clinicaTelefone && <p style={s.clinicaInfo}>Tel.: {clinicaTelefone}</p>}
              {clinicaCNPJ && <p style={s.clinicaInfo}>CNPJ: {clinicaCNPJ}</p>}
            </div>
            <div style={s.headerRight}>
              <p style={s.docLabel}>Plano de Tratamento</p>
              <p style={s.docTitle}>PLANO DE TRATAMENTO</p>
              <p style={s.docNum}>#{orcamento.numero_orcamento}</p>
              <p style={s.docDate}>Emitido em {dataEmissao}</p>
            </div>
          </div>

          {/* ── DADOS DO PACIENTE ── */}
          <div style={s.patientBar}>
            <span style={s.patientName}>{orcamento.paciente?.nome ?? "—"}</span>
            {orcamento.paciente?.telefone && (
              <>
                <span style={s.patientSep}>·</span>
                <span style={s.patientDetail}>Celular: {orcamento.paciente.telefone}</span>
              </>
            )}
            {orcamento.dentista?.nome && (
              <>
                <span style={s.patientSep}>·</span>
                <span style={s.patientDetail}>Dr(a).: {orcamento.dentista.nome}</span>
              </>
            )}
          </div>

          {/* ── TÍTULO CENTRAL ── */}
          <p style={s.sectionTitle}>
            Plano de Tratamento de {orcamento.paciente?.nome ?? "—"}
          </p>

          {/* ── ODONTOGRAMA ── */}
          {dentesAfetados.length > 0 && (
            <OdontogramaVisualizacao dentesAfetados={dentesAfetados} />
          )}

          {/* ── TABELA DE PROCEDIMENTOS ── */}
          <table style={s.table}>
            <thead style={s.thead}>
              <tr style={s.thRow}>
                <th style={s.th}>Procedimentos</th>
                <th style={{ ...s.th, textAlign: "center", width: 60 }}>Dente</th>
                <th style={{ ...s.th, textAlign: "center", width: 140 }}>Dentista</th>
                <th style={{ ...s.thRight, width: 90 }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, idx) => {
                const td = idx % 2 === 0 ? s.tdEven : s.tdOdd;
                return (
                  <tr key={item.id}>
                    <td style={td}>{item.nome_procedimento}</td>
                    <td style={{ ...td, ...s.tdCenter }}>{item.dente_numero ?? "—"}</td>
                    <td style={{ ...td, ...s.tdCenter }}>{orcamento.dentista?.nome ?? "—"}</td>
                    <td style={{ ...td, ...s.tdRight }}>
                      {fmt(item.preco_total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ── TOTAIS ── */}
          <div style={s.totaisBox}>
            <div style={s.totaisInner}>
              {orcamento.total_bruto !== orcamento.total_liquido && (
                <div style={s.totaisRow}>
                  <span style={s.totaisLabel}>Subtotal</span>
                  <span>{fmt(orcamento.total_bruto)}</span>
                </div>
              )}
              {descontoValor > 0 && (
                <div style={s.descontoRow}>
                  <span>Desconto{orcamento.desconto_tipo === "percentual" ? ` (${orcamento.desconto_valor}%)` : ""}</span>
                  <span>- {fmt(descontoValor)}</span>
                </div>
              )}
              <div style={s.totalRow}>
                <span>Valor Total:</span>
                <span>{fmt(orcamento.total_liquido)}</span>
              </div>
              {orcamento.forma_pagamento && (
                <div style={s.pagamentoRow}>
                  <span>Pagamento</span>
                  <span>
                    {orcamento.forma_pagamento}
                    {orcamento.parcelas > 1 ? ` em ${orcamento.parcelas}x` : " à vista"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── OBSERVAÇÕES ── */}
          {orcamento.observacoes && (
            <div style={s.obsBox}>
              <p style={s.obsLabel}>Observações</p>
              <p style={s.obsText}>{orcamento.observacoes}</p>
            </div>
          )}

          {/* ── DECLARAÇÃO ── */}
          <p style={s.declaracao}>
            Assino este declarando verdadeiras as informações escritas acima
          </p>

          {/* ── ASSINATURAS ── */}
          <div style={s.signaturas}>
            <div style={s.signaturaBox}>
              <div style={{ ...s.signaturaLinha, height: 40 }} />
              <p style={s.signaturaNome}>{orcamento.paciente?.nome ?? "Paciente"}</p>
              <p style={s.signaturaDetalhe}>Paciente ou Responsável</p>
            </div>
            <div style={s.signaturaBox}>
              <div style={{ ...s.signaturaLinha, height: 40 }} />
              <p style={s.signaturaNome}>{orcamento.dentista?.nome ?? "Dentista"}</p>
              <p style={s.signaturaDetalhe}>Cirurgião(ã)-Dentista</p>
            </div>
          </div>

          {/* ── RODAPÉ ── */}
          <div style={s.rodape}>
            <span style={s.rodapeLeft}>
              Documento gerado em {new Date().toLocaleDateString("pt-BR")} — {clinicaNome}
            </span>
            <span style={s.rodapeRight}>Página 1 de 1</span>
          </div>
        </div>
      </div>
    );
  }
);

OrcamentoPDFTemplate.displayName = "OrcamentoPDFTemplate";
