import { forwardRef } from "react";
import { Orcamento } from "@/hooks/useOrcamentos";

interface OrcamentoPDFTemplateProps {
  orcamento: Orcamento;
  clinicaNome?: string;
  clinicaEndereco?: string;
  clinicaTelefone?: string;
}

export const OrcamentoPDFTemplate = forwardRef<HTMLDivElement, OrcamentoPDFTemplateProps>(
  ({ orcamento, clinicaNome = "Odonto PRO", clinicaEndereco, clinicaTelefone }, ref) => {
    const dataValidade = orcamento.created_at
      ? new Date(
          new Date(orcamento.created_at).getTime() +
            orcamento.validade_dias * 24 * 60 * 60 * 1000
        ).toLocaleDateString("pt-BR")
      : "-";

    const itens = orcamento.orcamento_itens ?? [];

    return (
      <div
        ref={ref}
        id="orcamento-pdf"
        style={{ fontFamily: "Arial, sans-serif", color: "#1a1a1a", background: "#fff" }}
        className="p-8 max-w-[800px] mx-auto"
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-blue-600">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">{clinicaNome}</h1>
            {clinicaEndereco && <p className="text-sm text-gray-500 mt-1">{clinicaEndereco}</p>}
            {clinicaTelefone && <p className="text-sm text-gray-500">{clinicaTelefone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Orçamento</p>
            <p className="text-2xl font-bold text-blue-700">#{orcamento.numero_orcamento}</p>
            <p className="text-xs text-gray-500 mt-1">
              Emitido em {new Date(orcamento.created_at).toLocaleDateString("pt-BR")}
            </p>
            <p className="text-xs text-gray-500">Válido até {dataValidade}</p>
          </div>
        </div>

        {/* Paciente / Dentista */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Paciente</p>
            <p className="font-semibold text-gray-800">{orcamento.paciente?.nome ?? "—"}</p>
            {orcamento.paciente?.telefone && (
              <p className="text-sm text-gray-500">{orcamento.paciente.telefone}</p>
            )}
            {orcamento.paciente?.email && (
              <p className="text-sm text-gray-500">{orcamento.paciente.email}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Dentista Responsável</p>
            <p className="font-semibold text-gray-800">{orcamento.dentista?.nome ?? "—"}</p>
          </div>
        </div>

        {/* Tabela de Itens */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="text-left py-2 px-3 rounded-tl font-semibold">Procedimento</th>
              <th className="text-center py-2 px-3 font-semibold w-16">Qtd</th>
              <th className="text-right py-2 px-3 font-semibold w-28">Valor Unit.</th>
              <th className="text-right py-2 px-3 rounded-tr font-semibold w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="py-2 px-3">{item.nome_procedimento}</td>
                <td className="py-2 px-3 text-center">{item.quantidade}</td>
                <td className="py-2 px-3 text-right">
                  {item.preco_unitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="py-2 px-3 text-right font-medium">
                  {item.preco_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totais */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{orcamento.total_bruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            {orcamento.desconto_valor > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>
                  Desconto
                  {orcamento.desconto_tipo === "percentual"
                    ? ` (${orcamento.desconto_valor}%)`
                    : ""}
                </span>
                <span>
                  -{" "}
                  {orcamento.desconto_tipo === "percentual"
                    ? ((orcamento.total_bruto * orcamento.desconto_valor) / 100).toLocaleString(
                        "pt-BR",
                        { style: "currency", currency: "BRL" }
                      )
                    : orcamento.desconto_valor.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-blue-700 pt-2 border-t">
              <span>Total</span>
              <span>{orcamento.total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            {orcamento.forma_pagamento && (
              <div className="flex justify-between text-xs text-gray-500 pt-1">
                <span>Pagamento</span>
                <span>
                  {orcamento.forma_pagamento}
                  {orcamento.parcelas > 1 ? ` em ${orcamento.parcelas}x` : " à vista"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Observações */}
        {orcamento.observacoes && (
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Observações</p>
            <p className="text-sm text-gray-700">{orcamento.observacoes}</p>
          </div>
        )}

        {/* Rodapé / Assinatura */}
        <div className="mt-16 pt-8 border-t grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="border-b border-gray-400 mb-2" />
            <p className="text-xs text-gray-500">Assinatura do Dentista</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 mb-2" />
            <p className="text-xs text-gray-500">Assinatura do Paciente</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Documento gerado em {new Date().toLocaleString("pt-BR")} — {clinicaNome}
        </p>
      </div>
    );
  }
);

OrcamentoPDFTemplate.displayName = "OrcamentoPDFTemplate";
