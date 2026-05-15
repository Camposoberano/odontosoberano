import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Edit,
  FileText,
  MessageCircle,
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  Copy,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { mudarStatus, atualizar, duplicar } = useOrcamentos();
  const { data: orcamento, isLoading } = useOrcamento(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [gerandoPDF, setGerandoPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!orcamento || !pdfRef.current) return;
    setGerandoPDF(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const el = pdfRef.current;
      el.style.display = "block";
      el.style.position = "fixed";
      el.style.top = "-9999px";
      el.style.left = "0";
      el.style.width = "800px";
      el.style.background = "#fff";

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#fff" });

      el.style.display = "none";
      el.style.position = "";
      el.style.top = "";
      el.style.left = "";
      el.style.width = "";

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`orcamento-${orcamento.numero_orcamento}.pdf`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar PDF";
      toast({ title: "Erro ao gerar PDF", description: msg, variant: "destructive" });
    } finally {
      setGerandoPDF(false);
    }
  };

  const handleWhatsApp = () => {
    if (!orcamento?.paciente?.telefone) {
      toast({ title: "Paciente sem telefone cadastrado", variant: "destructive" });
      return;
    }
    const tel = orcamento.paciente.telefone.replace(/\D/g, "");
    const total = orcamento.total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const msg = encodeURIComponent(
      `Olá ${orcamento.paciente.nome}! 👋\n\n` +
      `Segue o orçamento #${orcamento.numero_orcamento}.\n\n` +
      `💰 Total: ${total}\n` +
      `💳 Pagamento: ${orcamento.forma_pagamento ?? "A combinar"}\n\n` +
      `Para dúvidas ou aprovação, entre em contato. 😊`
    );
    window.open(`https://wa.me/55${tel}?text=${msg}`, "_blank");
    mudarStatus.mutate({ id: orcamento.id, status: "enviado" });
  };

  const handleEmail = () => {
    if (!orcamento) return;
    const email = orcamento.paciente?.email ?? "";
    const total = orcamento.total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const itens = (orcamento.orcamento_itens ?? [])
      .map((i) => `- ${i.nome_procedimento} (${i.quantidade}x): ${i.preco_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`)
      .join("\n");

    const subject = encodeURIComponent(`Orçamento #${orcamento.numero_orcamento} — ${orcamento.paciente?.nome ?? ""}`);
    const body = encodeURIComponent(
      `Olá ${orcamento.paciente?.nome ?? ""}!\n\n` +
      `Segue o resumo do seu orçamento #${orcamento.numero_orcamento}:\n\n` +
      `${itens}\n\n` +
      `Total: ${total}\n` +
      `Pagamento: ${orcamento.forma_pagamento ?? "A combinar"}` +
      (orcamento.parcelas > 1 ? ` em ${orcamento.parcelas}x` : "") + "\n\n" +
      `Validade: ${orcamento.validade_dias} dias a partir da emissão.\n\n` +
      `Qualquer dúvida estamos à disposição!`
    );

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    mudarStatus.mutate({ id: orcamento.id, status: "enviado" });
  };

  const handleAprovar = async () => {
    if (!orcamento || !user) return;
    await mudarStatus.mutateAsync({ id: orcamento.id, status: "aprovado" });

    const parcelas = orcamento.parcelas ?? 1;
    const hoje = new Date();

    // ── Criar contas_receber (1 por parcela) ──────────────────────────────
    const entradasFinanceiras = Array.from({ length: parcelas }, (_, i) => {
      const vencimento = new Date(hoje);
      vencimento.setDate(hoje.getDate() + i * 30);

      const valorParcela =
        i < parcelas - 1
          ? Math.round((orcamento.total_liquido / parcelas) * 100) / 100
          : Math.round(
              (orcamento.total_liquido -
                Math.round((orcamento.total_liquido / parcelas) * 100) / 100 * (parcelas - 1)) * 100
            ) / 100;

      return {
        user_id: user.id,
        paciente_id: orcamento.paciente_id,
        descricao:
          parcelas > 1
            ? `Parcela ${i + 1}/${parcelas} — Orçamento #${orcamento.numero_orcamento} — ${orcamento.paciente?.nome ?? ""}`
            : `Orçamento #${orcamento.numero_orcamento} — ${orcamento.paciente?.nome ?? ""}`,
        categoria: "Tratamento Odontológico",
        valor: valorParcela,
        data_vencimento: vencimento.toISOString().split("T")[0],
        status: "Pendente",
        forma_pagamento: orcamento.forma_pagamento ?? undefined,
        observacoes: `Gerado ao aprovar orçamento #${orcamento.numero_orcamento}`,
        orcamento_id: orcamento.id,
      };
    });

    const { error: finErr } = await supabase.from("contas_receber").insert(entradasFinanceiras);

    if (finErr) {
      toast({ title: "Aprovado, mas erro no financeiro", description: finErr.message, variant: "destructive" });
      return;
    }

    // ── Atualizar odontograma do paciente ─────────────────────────────────
    const itensComDente = (orcamento.orcamento_itens ?? []).filter((i) => i.dente_numero);

    if (itensComDente.length > 0 && orcamento.paciente_id) {
      try {
        // Buscar odontograma existente
        const { data: odonto } = await supabase
          .from("odontograma")
          .select("id, dados_dentes")
          .eq("paciente_id", orcamento.paciente_id)
          .maybeSingle();

        const dadosAtuais: Record<string, { numero: number; procedimentos: string[]; observacoes?: string }> =
          (odonto?.dados_dentes as Record<string, { numero: number; procedimentos: string[] }>) ?? {};

        for (const item of itensComDente) {
          const num = item.dente_numero!;
          const dente = dadosAtuais[num] ?? { numero: Number(num), procedimentos: [] };
          if (!dente.procedimentos.includes(item.nome_procedimento)) {
            dente.procedimentos.push(item.nome_procedimento);
          }
          dadosAtuais[num] = dente;
        }

        if (odonto) {
          await supabase
            .from("odontograma")
            .update({ dados_dentes: dadosAtuais })
            .eq("id", odonto.id);
        } else {
          await supabase.from("odontograma").insert({
            user_id: user.id,
            paciente_id: orcamento.paciente_id,
            dados_dentes: dadosAtuais,
          });
        }

        toast({
          title: "Orçamento aprovado!",
          description: `${parcelas} conta(s) a receber criada(s) · Odontograma atualizado (${itensComDente.length} dente(s))`,
        });
      } catch {
        toast({
          title: "Orçamento aprovado!",
          description: `${parcelas} conta(s) a receber criada(s) · Erro ao atualizar odontograma`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Orçamento aprovado!",
        description: `${parcelas} conta(s) a receber criada(s)`,
      });
    }
  };

  const handleDuplicar = async () => {
    if (!orcamento) return;
    const novo = await duplicar.mutateAsync(orcamento.id);
    navigate(`/orcamentos/${novo.id}/editar`);
  };

  const handleDocuSeal = async () => {
    if (!orcamento) return;
    if (!DOCUSEAL_API_KEY || !DOCUSEAL_TEMPLATE_ID) {
      toast({ title: "DocuSeal não configurado", description: "Adicione VITE_DOCUSEAL_API_KEY e VITE_DOCUSEAL_TEMPLATE_ID no .env", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("https://api.docuseal.com/submissions", {
        method: "POST",
        headers: { "X-Auth-Token": DOCUSEAL_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: Number(DOCUSEAL_TEMPLATE_ID),
          send_email: true,
          submitters: [{
            role: "Paciente",
            email: orcamento.paciente?.email ?? "",
            name: orcamento.paciente?.nome ?? "",
            fields: [
              { name: "Paciente", default_value: orcamento.paciente?.nome ?? "" },
              { name: "Total", default_value: orcamento.total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
            ],
          }],
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const submissionId = json.id ?? json.submission_id;
      if (submissionId) {
        await atualizar.mutateAsync({ id: orcamento.id, docuseal_submission_id: String(submissionId) });
      }
      toast({ title: "Contrato enviado!", description: "Paciente receberá o link por e-mail." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro";
      toast({ title: "Erro ao enviar para DocuSeal", description: msg, variant: "destructive" });
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
          <Button variant="link" onClick={() => navigate("/orcamentos")}>Voltar para lista</Button>
        </div>
      </DashboardLayout>
    );
  }

  const cfg = STATUS_CONFIG[orcamento.status] ?? STATUS_CONFIG.rascunho;
  const itens = orcamento.orcamento_itens ?? [];

  return (
    <DashboardLayout>
      {/* Tela normal */}
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
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bgColor}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Criado em {new Date(orcamento.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicar} className="gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              Duplicar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/orcamentos/${orcamento.id}/editar`)} className="gap-1.5">
              <Edit className="w-3.5 h-3.5" />
              Editar
            </Button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={gerandoPDF}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {gerandoPDF ? "Gerando..." : "Baixar PDF"}
          </Button>
          <Button
            variant="outline"
            onClick={handleWhatsApp}
            className="gap-2 text-green-600 border-green-300 hover:bg-green-50"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={handleEmail}
            className="gap-2 text-sky-600 border-sky-300 hover:bg-sky-50"
          >
            <Mail className="w-4 h-4" />
            E-mail
          </Button>
          <Button
            variant="outline"
            onClick={handleDocuSeal}
            className="gap-2 text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <ExternalLink className="w-4 h-4" />
            DocuSeal
          </Button>
          {orcamento.status !== "aprovado" && orcamento.status !== "contrato_assinado" && (
            <Button onClick={handleAprovar} className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4" />
              Aprovar (+ Conta a Receber)
            </Button>
          )}
          {orcamento.status !== "recusado" && (
            <Button
              variant="outline"
              onClick={() => mudarStatus.mutate({ id: orcamento.id, status: "recusado" })}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <XCircle className="w-4 h-4" />
              Recusar
            </Button>
          )}
        </div>

        {/* Paciente / Dentista */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Paciente</p>
              <p className="font-semibold">{orcamento.paciente?.nome ?? "—"}</p>
              {orcamento.paciente?.telefone && <p className="text-sm text-muted-foreground">{orcamento.paciente.telefone}</p>}
              {orcamento.paciente?.email && <p className="text-sm text-muted-foreground">{orcamento.paciente.email}</p>}
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
                  <TableHead className="w-20 text-center">Dente</TableHead>
                  <TableHead className="w-16 text-center">Qtd</TableHead>
                  <TableHead className="w-32 text-right">Valor Unit.</TableHead>
                  <TableHead className="w-32 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome_procedimento}</TableCell>
                    <TableCell className="text-center">
                      {item.dente_numero ? (
                        <span className="inline-block bg-primary/10 text-primary text-xs font-mono font-semibold px-1.5 py-0.5 rounded">
                          {item.dente_numero}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
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
                    <span>{orcamento.forma_pagamento}{orcamento.parcelas > 1 ? ` em ${orcamento.parcelas}x` : ""}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {orcamento.observacoes && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
              <p className="text-sm">{orcamento.observacoes}</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader><CardTitle className="text-base">Histórico</CardTitle></CardHeader>
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

      {/* Template PDF — renderizado fora da tela para html2canvas */}
      <div ref={pdfRef} style={{ display: "none" }}>
        <OrcamentoPDFTemplate orcamento={orcamento} />
      </div>
    </DashboardLayout>
  );
}
