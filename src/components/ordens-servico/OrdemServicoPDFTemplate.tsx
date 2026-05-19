import { forwardRef } from "react";
import type { OrdemServico } from "@/hooks/useOrdensServico";

interface OrdemServicoPDFTemplateProps {
  os: OrdemServico;
  clinicaNome?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const OrdemServicoPDFTemplate = forwardRef<HTMLDivElement, OrdemServicoPDFTemplateProps>(
  ({ os, clinicaNome = "Odonto PRO" }, ref) => {
    const fmt = (d: string | null) => {
      if (!d) return "—";
      try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return d; }
    };

    const itens = os.ordem_servico_itens ?? [];

    return (
      <div
        ref={ref}
        id="os-pdf"
        style={{ fontFamily: "Arial, sans-serif", color: "#1a1a1a", background: "#fff" }}
        className="p-8 max-w-[800px] mx-auto"
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-orange-500">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">{clinicaNome}</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Laboratório Dental</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Ordem de Serviço</p>
            <p className="text-2xl font-bold text-orange-600">#{os.numero_os}</p>
            <p className="text-xs text-gray-500 mt-1">Emitida em {fmt(os.created_at)}</p>
            <span
              style={{
                display: "inline-block",
                marginTop: "4px",
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                background: "#fff7ed",
                color: "#c2410c",
                border: "1px solid #fed7aa",
              }}
            >
              {STATUS_LABEL[os.status] ?? os.status}
            </span>
          </div>
        </div>

        {/* Dados principais */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Paciente</p>
            <p className="font-semibold text-gray-800">{os.paciente?.nome ?? "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Dentista Responsável</p>
            <p className="font-semibold text-gray-800">{os.dentista?.nome ?? "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Protético</p>
            <p className="font-semibold text-gray-800">{os.protetico?.nome ?? "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Cor do Dente / Prazo</p>
            <p className="font-semibold text-gray-800">
              {os.cor_dente ? `${os.cor_dente} ` : ""}
              <span className="text-gray-500 font-normal">
                {os.prazo ? `· Prazo: ${fmt(os.prazo)}` : "Sem prazo definido"}
              </span>
            </p>
          </div>
        </div>

        {/* Tabela de itens */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="text-left py-2 px-3 rounded-tl font-semibold w-20">Dente</th>
              <th className="text-left py-2 px-3 font-semibold">Procedimento</th>
              <th className="text-center py-2 px-3 font-semibold w-16">Qtd</th>
              <th className="text-center py-2 px-3 rounded-tr font-semibold w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-3 text-center text-gray-400 italic">
                  Nenhum item registrado.
                </td>
              </tr>
            ) : (
              itens.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-2 px-3 font-mono text-sm">
                    {item.dente_numero ? `#${item.dente_numero}` : "—"}
                  </td>
                  <td className="py-2 px-3">{item.descricao}</td>
                  <td className="py-2 px-3 text-center">{item.quantidade}</td>
                  <td className="py-2 px-3 text-center capitalize text-xs text-gray-600">
                    {item.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Observações */}
        {os.observacoes && (
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Observações</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{os.observacoes}</p>
          </div>
        )}

        {/* Rodapé / Assinatura */}
        <div className="mt-16 pt-8 border-t grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="border-b border-gray-400 mb-2" />
            <p className="text-xs text-gray-500">
              Assinatura do Protético{os.protetico ? ` — ${os.protetico.nome}` : ""}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {os.prazo ? `Prazo de entrega: ${fmt(os.prazo)}` : ""}
            </p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 mb-2" />
            <p className="text-xs text-gray-500">
              Assinatura do Dentista{os.dentista ? ` — ${os.dentista.nome}` : ""}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Documento gerado em {new Date().toLocaleString("pt-BR")} — {clinicaNome}
        </p>
      </div>
    );
  }
);

OrdemServicoPDFTemplate.displayName = "OrdemServicoPDFTemplate";
