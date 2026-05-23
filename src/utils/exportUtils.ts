import { format, parseISO } from "date-fns";

/**
 * Utilitário genérico para exportar dados para CSV
 */
export function downloadCSV(data: any[], filename: string = 'relatorio.csv') {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(header => item[header]));

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(value => {
      const stringValue = value === null || value === undefined ? "" : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(';'))
  ].join('\n');

  const blob = new Blob(["﻿" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute("download", finalFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportToCSV = downloadCSV;
