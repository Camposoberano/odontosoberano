/**
 * Utilitários para trabalhar com fuso horário de Brasília (GMT-3)
 */

/**
 * Retorna a data/hora atual no fuso horário de Brasília
 * Formato: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function getBrasiliaDateTime(): string {
  const now = new Date();
  
  // Obter timestamp em UTC e subtrair 3 horas para Brasília (GMT-3)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaTime = new Date(utc - (3 * 3600000));

  return brasiliaTime.toISOString();
}

/**
 * Retorna apenas a data no formato ISO (YYYY-MM-DD)
 * No fuso horário de Brasília
 */
export function getBrasiliaDate(): string {
  const now = new Date();
  
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaDate = new Date(utc - (3 * 3600000));

  const year = brasiliaDate.getFullYear();
  const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Formata uma data para exibição no padrão brasileiro
 * @param dateString - String ISO ou Date
 * @returns Data formatada: "28/10/2025 às 20:31"
 */
export function formatBrasiliaDateTime(dateString: string | Date): string {
  if (!dateString) return '';
  
  let date: Date;
  if (typeof dateString === 'string') {
    // Corrige formato para Edge/Safari onde 'YYYY-MM-DD HH:mm:ss' causa Invalid Date
    const safeStr = (typeof dateString === 'string' && dateString.includes('T')) 
      ? dateString 
      : (dateString ? dateString.toString().replace(' ', 'T') : '');
    date = new Date(safeStr);
  } else {
    date = dateString;
  }

  // Fallback seguro se ainda for inválido
  if (isNaN(date.getTime())) {
    return typeof dateString === 'string' ? dateString : '';
  }

  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata apenas a data no padrão brasileiro
 * @param dateString - String ISO ou Date
 * @returns Data formatada: "28/10/2025"
 */
export function formatBrasiliaDate(dateString: string | Date): string {
  if (!dateString) return '';
  
  let date: Date;
  if (typeof dateString === 'string') {
    // Corrige formato 'YYYY-MM-DD HH:mm:ss' para 'YYYY-MM-DDTHH:mm:ss'
    const safeStr = (typeof dateString === 'string' && dateString.includes('T'))
      ? dateString
      : (dateString ? dateString.toString().replace(' ', 'T') : '');
    date = new Date(safeStr);
  } else {
    date = dateString;
  }

  // Fallback seguro
  if (isNaN(date.getTime())) {
    return typeof dateString === 'string' ? dateString : '';
  }

  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
