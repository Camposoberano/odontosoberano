import { addDays, differenceInDays, startOfDay } from "date-fns";

export type ExpiracaoStatus = "expirado" | "critico" | "expirando" | "ok";

export interface ExpiracaoInfo {
  dataExpiracao: Date;
  diasRestantes: number;
  status: ExpiracaoStatus;
}

const STATUSES_FECHADOS = ["aprovado", "recusado", "contrato_assinado"];

export function calcularExpiracao(
  created_at: string,
  validade_dias: number,
  orcamentoStatus: string
): ExpiracaoInfo | null {
  if (STATUSES_FECHADOS.includes(orcamentoStatus)) return null;

  const criacao = new Date(created_at);
  const dataExpiracao = addDays(criacao, validade_dias);
  const hoje = startOfDay(new Date());
  const diasRestantes = differenceInDays(startOfDay(dataExpiracao), hoje);

  let status: ExpiracaoStatus;
  if (diasRestantes < 0) status = "expirado";
  else if (diasRestantes <= 3) status = "critico";
  else if (diasRestantes <= 7) status = "expirando";
  else status = "ok";

  return { dataExpiracao, diasRestantes, status };
}

export const EXPIRACAO_CONFIG = {
  expirado: {
    label: (d: number) => `Expirado há ${Math.abs(d)} dia${Math.abs(d) !== 1 ? "s" : ""}`,
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    alertClass: "border-red-300 bg-red-50 text-red-800",
    iconClass: "text-red-500",
  },
  critico: {
    label: (d: number) => d === 0 ? "Vence hoje!" : `Vence em ${d} dia${d !== 1 ? "s" : ""}`,
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
    alertClass: "border-orange-300 bg-orange-50 text-orange-800",
    iconClass: "text-orange-500",
  },
  expirando: {
    label: (d: number) => `Vence em ${d} dias`,
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    alertClass: "border-amber-300 bg-amber-50 text-amber-800",
    iconClass: "text-amber-500",
  },
  ok: {
    label: (d: number) => `${d} dias`,
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    alertClass: "",
    iconClass: "text-green-500",
  },
} satisfies Record<ExpiracaoStatus, { label: (d: number) => string; badgeClass: string; alertClass: string; iconClass: string }>;
