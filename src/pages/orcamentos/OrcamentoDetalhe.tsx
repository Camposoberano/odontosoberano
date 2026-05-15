import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Edit,
  FileText,
  MessageCircle,
  CheckCircle,
  XCircle,
  Printer,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { OrcamentoPDFTemplate } from "@/components/orcamentos/OrcamentoPDFTemplate";
import { useOrcamento, useOrcamentos, StatusOrcamento } from "@/hooks/useOrcamentos";

const STATUS_CONFIG: Record<
  StatusOrcamento,
  { label: string; color: string; bgColor: string }
> = {
  rascunho:          { label: "Rascunho",          color: "text-gray-600",   bgColor: "bg-gray-100" },
  enviado:           { label: "Enviado",            color: "text-blue-600",   bgColor: "bg-blue-50" },
  aprovado:          { label: "Aprovado",           color: "text-green-600",  bgColor: "bg-green-50" },
  recusado:          { label: "Recusado",           color: "text-red-600",    bgColor: "bg-red-50" },
  contrato_assinado: { label: "Contrato Assinado",  color: "text-purple-600", bgColor: "bg-purple-50" },
};

const DOCUSEAL_API_KEY = import.meta.env.VITE_DOCUSEAL_API_KEY as string | undefined;
const DOCUSEAL_TEMPLATE_ID = import.meta.env.VITE_DOCUSEAL_TEMPLATE_ID as string | undefined;

export default function OrcamentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);
  const { mudarStatus, atualizar } = useOrcamentos();
  const { data: orcamento, isLoading } = useOrcamento(id);

  const handleImprimir = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!orcamento?.paciente?.telefone) {
      alert("Paciente sem telefone cadastrado.");
      return;
    }
    const tel = orcamento.paciente.telefone.replace(/\D/g, "");
    const total = orcamento.total_liquido.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const msg = encodeURIComponent(
      `Olá ${orcamento.paciente.nome}! 👋\n\n` +
        `Segue o orçamento #${orcamento.numero_orcamento} da nossa clínica.\n\n` +
        `💰 Total: ${total}\n` +
        `💳 Pagamento: ${orcamento.forma_pagamento ?? "A combinar"}\n\n` +
        `Para mais detalhes ou para aprovar o orçamento, entre em contato conosco. 😊`
    );
    window.open(`https://wa.me/55${tel}?text=${msg}`, "_blank");
    mudarStatus.mutate({ id: orcamento.id, status: "enviado" });
  };

  const handleDocuSeal = async () => {
    if (!orcamento) return;
    if (!DOCUSEAL_API_KEY || !DOCUSEAL_TEMPLATE_ID) {
      alert(
        "Configure VITE_DOCUSEAL_API_KEY e VITE_DOCUSEAL_TEMPLATE_ID no arquivo .env para usar esta funcionalidade."
      );
      return;
    }

    try {
      const res = await fetch("https://api.docuseal.com/submissions", {
        method: "POST",
        headers: {
          "X-Auth-Token": DOCUSEAL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: Number(DOCUSEAL_TEMPLATE_ID),
          send_email: true,
          submitters: [
            {
              role: "Paciente",
              email: orcamento.paciente?.email ?? "",
              name: orcamento.paciente?.nome ?? "",
              fields: [
                { name: "Paciente", default_value: orcamento.paciente?.nome ?? "" },
                {
                  name: "Total",
                  default_value: orcamento.total_liquido.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }),
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const submissionId = json.id ?? json.submission_id;
      if (submissionId) {
        await atualizar.mutateAsync({
          id: orcamento.id,
          docuseal_submission_id: String(submissionId),
        });
      }
      alert("Contrato enviado para o paciente assinar! Verifique o e-mail cadastrado.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar para DocuSeal";
      alert(`Erro: ${msg}`);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!orcamento) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Orçamento não encontrado.</p>
          <Button variant="link" onClick={() => navigate("/orcamentos")}>
            Voltar para lista
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const cfg = STATUS_CONFIG[orcamento.status] ?? STATUS_CONFIG.rascunho;
  const itens = orcamento.orcamento_itens ?? [];

  return (
    <DashboardLayout>
      {/* Área visível na tela */}
      <div className="print:hidden space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/orcamentos")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Orçamento #{orcamento.numero_orcamento}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bgColor}`}
                >
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Criado em {new Date(orcamento.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/orcamentos/${orcamento.id}/editar`)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleImprimir} className="gap-2">
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleWhatsApp}
            className="gap-2 text-green-600 border-green-300 hover:bg-green-50"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={handleDocuSeal}
            className="gap-2 text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <ExternalLink className="w-4 h-4" />
            Contrato DocuSeal
          </Button>
          {orcamento.status !== "aprovado" && orcamento.status !== "contrato_assinado" && (
            <Button
              onClick={() => mudarStatus.mutate({ id: orcamento.id, status: "aprovado" })}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar Aprovado
            </Button>
          )}
          {orcamento.status !== "recusado" && (
            <Button
              variant="outline"
              onClick={() => mudarStatus.mutate({ id: orcamento.id, status: "recusado" })}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <XCircle className="w-4 h-4" />
              Marcar Recusado
            </Button>
          )}
        </div>

        {/* Paciente / Dentista */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Paciente</p>
              <p className="font-semibold">{orcamento.paciente?.nome ?? "—"}</p>
              {orcamento.paciente?.telefone && (
                <p className="text-sm text-muted-foreground">{orcamento.paciente.telefone}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Dentista</p>
              <p className="font-semibold">{orcamento.dentista?.nome ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Itens */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Procedimentos ({itens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedimento</TableHead>
                  <TableHead className="w-16 text-center">Qtd</TableHead>
                  <TableHead className="w-32 text-right">Valor Unit.</TableHead>
                  <TableHead className="w-32 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome_procedimento}</TableCell>
                    <TableCell className="text-center">{item.quantidade}</TableCell>
                    <TableCell className="text-right">
                      {item.preco_unitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.preco_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totais */}
            <div className="flex justify-end mt-4">
              <div className="w-56 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{orcamento.total_bruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                {orcamento.desconto_valor > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto{orcamento.desconto_tipo === "percentual" ? ` (${orcamento.desconto_valor}%)` : ""}</span>
                    <span>
                      - {orcamento.desconto_tipo === "percentual"
                        ? ((orcamento.total_bruto * orcamento.desconto_valor) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : orcamento.desconto_valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    {orcamento.total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                {orcamento.forma_pagamento && (
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Pagamento</span>
                    <span>
                      {orcamento.forma_pagamento}
                      {orcamento.parcelas > 1 ? ` em ${orcamento.parcelas}x` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              Criado em {new Date(orcamento.created_at).toLocaleString("pt-BR")}
            </div>
            {orcamento.data_envio && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Enviado em {new Date(orcamento.data_envio).toLocaleString("pt-BR")}
              </div>
            )}
            {orcamento.data_aprovacao && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Aprovado em {new Date(orcamento.data_aprovacao).toLocaleString("pt-BR")}
              </div>
            )}
            {orcamento.docuseal_submission_id && (
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                Contrato enviado via DocuSeal (ID: {orcamento.docuseal_submission_id})
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Template PDF — visível só na impressão */}
      <div className="hidden print:block" ref={pdfRef}>
        <OrcamentoPDFTemplate orcamento={orcamento} />
      </div>
    </DashboardLayout>
  );
}
