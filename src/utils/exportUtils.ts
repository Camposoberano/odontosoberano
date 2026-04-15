import { ProteseAnalyticItem } from "@/hooks/useProteseAnalytics";
import { format, parseISO } from "date-fns";

/**
 * Utilitário genérico para exportar dados para CSV
 * Aceita um array de objetos ou um array de arrays de itens de prótese
 */
export function downloadCSV(data: any[], filename: string = 'relatorio.csv') {
  if (!data || data.length === 0) return;

  let headers: string[] = [];
  let rows: any[][] = [];

  // Se os dados forem do tipo ProteseAnalyticItem (nosso novo dashboard)
  if (data[0] && typeof data[0] === 'object' && 'ordem_servico' in data[0]) {
    headers = [
      "OS", "Paciente", "Tipo Prótese", "Status Geral", 
      "Dentista", "Protético", "Valor Lab", "Status Pgto", "Data Pgto", "Data Atualização"
    ];
    rows = (data as ProteseAnalyticItem[]).map(item => [
      item.ordem_servico.toString().padStart(6, '0'),
      item.nome_paciente,
      item.tipo,
      item.status_geral,
      item.dentista_nome || 'N/A',
      item.protetico_nome || 'N/A',
      item.valor_lab?.toString() || '0',
      item.pagamento_lab_status || 'Pendente',
      item.pagamento_lab_data || 'N/A',
      item.updated_at ? format(parseISO(item.updated_at), 'dd/MM/yyyy HH:mm') : 'N/A'
    ]);
  } else {
    // Caso contrário, tenta exportar genericamente (suporte aos relatórios antigos)
    headers = Object.keys(data[0]);
    rows = data.map(item => headers.map(header => item[header]));
  }

  // Juntar tudo com separador ponto-e-vírgula (excel friendly em PT-BR)
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(value => {
      const stringValue = value === null || value === undefined ? "" : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(';'))
  ].join('\n');

  // Adicionar BOM para suporte a caracteres especiais no Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  
  // Garantir extensão .csv
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute("download", finalFilename);
  
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Alias para manter compatibilidade com o que implementamos no Painel de Prótese
export const exportToCSV = downloadCSV;
