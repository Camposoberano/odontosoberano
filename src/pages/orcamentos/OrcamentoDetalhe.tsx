import { useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { calcularExpiracao, EXPIRACAO_CONFIG } from "@/utils/orcamentoUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, PlayCircle, CheckSquare, Package } from "lucide-react";
import { useInformacoesClinica } from "@/hooks/useInformacoesClinica";
import { EvolucaoSection } from "@/components/pacientes/EvolucaoSection";
import { GerarDocumentoModal } from "@/components/pacientes/GerarDocumentoModal";
import { useDentistas } from "@/hooks/useDentistas";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";

const STATUS_CONFIG: Record<
  StatusOrcamento,
  { label: string; color: string; bgColor: string }
> = {
  rascunho:          { label: "Rascunho",          color: "text-gray-600",    bgColor: "bg-gray-100" },
  enviado:           { label: "Enviado",            color: "text-blue-600",    bgColor: "bg-blue-50" },
  aprovado:          { label: "Aprovado",           color: "text-green-600",   bgColor: "bg-green-50" },
  recusado:          { label: "Recusado",           color: "text-red-600",     bgColor: "bg-red-50" },
  contrato_assinado: { label: "Contrato Assinado",  color: "text-purple-600",  bgColor: "bg-purple-50" },
  em_andamento:      { label: "Em Andamento",       color: "text-amber-600",   bgColor: "bg-amber-50" },
  finalizado:        { label: "Finalizado",         color: "text-teal-600",    bgColor: "bg-teal-50" },
  entregue:          { label: "Entregue",           color: "text-emerald-700", bgColor: "bg-emerald-100" },
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
  const { informacoes: clinica } = useInformacoesClinica();
  const { dentistas } = useDentistas();
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const { data: contasVinculadas = [] } = useQuery({
    queryKey: ["contas_receber", "by_orcamento", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_receber")
        .select("id, descricao, valor, data_vencimento, status, forma_pagamento")
        .eq("orcamento_id", id!)
        .order("data_vencimento", { ascending: true });
      if (error) throw error;
      return data as Array<{
        id: string;
        descricao: string;
        valor: number;
        data_vencimento: string;
        status: string;
        forma_pagamento: string | null;
      }>;
    },
    enabled: !!id,
  });

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
      el.style.position = "absolute";
      el.style.left = "-9999px";
      el.style.top = "0";
      el.style.width = "800px";
      el.style.background = "#fff";
      el.style.zIndex = "-1";

      // aguardar browser renderizar antes de capturar
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff",
        logging: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
      });

      el.style.display = "none";
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      el.style.zIndex = "";

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
      const nomePaciente = (orcamento.paciente?.nome ?? "paciente")
        .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");
      pdf.save(`plano_de_tratamento_${nomePaciente}_${orcamento.numero_orcamento}.pdf`);
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
    const itens = (orcamento.orcamento_itens ?? [])
      .map(i => `• ${i.nome_procedimento}${i.dente_numero ? ` (dente ${i.dente_numero})` : ""}`)
      .join("\n");
    const pagamento = orcamento.forma_pagamento
      ? `${orcamento.forma_pagamento}${orcamento.parcelas > 1 ? ` em ${orcamento.parcelas}x` : " à vista"}`
      : "A combinar";

    const msg = encodeURIComponent(
      `Olá, ${orcamento.paciente.nome}! 😊\n\n` +
      `Aqui é o *Instituto Belém* — segue o seu *Plano de Tratamento #${orcamento.numero_orcamento}*.\n\n` +
      `📋 *Procedimentos planejados:*\n${itens}\n\n` +
      `💰 *Valor Total: ${total}*\n` +
      `💳 Pagamento: ${pagamento}\n\n` +
      `Para confirmar o seu plano de tratamento ou tirar qualquer dúvida, estamos à disposição! 🦷✨\n\n` +
      `Atenciosamente,\n*Instituto Belém*`
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

    // Após aprovação → perguntar se quer gerar documento
    setShowDocDialog(true);
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
  const expiracao = calcularExpiracao(orcamento.created_at, orcamento.validade_dias, orcamento.status);

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

        {/* Banner de expiração */}
        {expiracao && expiracao.status !== "ok" && (() => {
          const c = EXPIRACAO_CONFIG[expiracao.status];
          return (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${c.alertClass}`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 ${c.iconClass}`} />
              <div className="text-sm">
                <span className="font-bold">{c.label(expiracao.diasRestantes)}</span>
                {" — "}
                vencimento em {format(expiracao.dataExpiracao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
                {expiracao.status === "expirado" && " Considere renovar ou atualizar o status."}
              </div>
            </div>
          );
        })()}

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
          {(orcamento.status === "aprovado" || orcamento.status === "contrato_assinado") && (
            <Button
              variant="outline"
              onClick={() => mudarStatus.mutate({ id: orcamento.id, status: "em_andamento" })}
              className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              <PlayCircle className="w-4 h-4" />
              Iniciar Tratamento
            </Button>
          )}
          {orcamento.status === "em_andamento" && (
            <Button
              variant="outline"
              onClick={() => mudarStatus.mutate({ id: orcamento.id, status: "finalizado" })}
              className="gap-2 text-teal-600 border-teal-300 hover:bg-teal-50"
            >
              <CheckSquare className="w-4 h-4" />
              Finalizar
            </Button>
          )}
          {orcamento.status === "finalizado" && (
            <Button
              variant="outline"
              onClick={() => mudarStatus.mutate({ id: orcamento.id, status: "entregue" })}
              className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <Package className="w-4 h-4" />
              Marcar Entregue
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

        {/* Contas a Receber Geradas */}
        {contasVinculadas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Contas a Receber Geradas ({contasVinculadas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-32 text-right">Valor</TableHead>
                    <TableHead className="w-32 text-center">Vencimento</TableHead>
                    <TableHead className="w-28 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasVinculadas.map((c) => {
                    const statusColor =
                      c.status === "Recebida" ? "bg-green-100 text-green-700" :
                      c.status === "Vencida"  ? "bg-red-100 text-red-700" :
                      c.status === "Cancelada"? "bg-gray-100 text-gray-600" :
                                                "bg-yellow-100 text-yellow-700";
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">{c.descricao}</TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {new Date(c.data_vencimento).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                            {c.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="mt-3 flex justify-end">
                <Link
                  to="/financeiro/contas-receber"
                  className="text-xs text-primary hover:underline"
                >
                  Ver todas em Contas a Receber →
                </Link>
              </div>
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

      {/* Evolução / Sessões do tratamento */}
      {(orcamento.status === "em_andamento" || orcamento.status === "finalizado" || orcamento.status === "entregue" || orcamento.status === "aprovado") && orcamento.paciente_id && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-amber-500" />
              Evolução do Tratamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EvolucaoSection pacienteId={orcamento.paciente_id} />
          </CardContent>
        </Card>
      )}

      {/* Dialog pós-aprovação: gerar documento */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black">
              <BookOpen className="w-5 h-5 text-primary" />
              Orçamento aprovado!
            </DialogTitle>
            <DialogDescription>
              Deseja gerar o Contrato de Prestação de Serviços ou outro documento para este paciente?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="rounded-xl font-black gap-2 shadow-lg shadow-primary/20"
              onClick={() => { setShowDocDialog(false); setShowDocModal(true); }}
            >
              <BookOpen className="w-4 h-4" /> Gerar Contrato / Documento
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowDocDialog(false)}>
              Agora não
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de geração de documento vinculado ao orçamento */}
      {orcamento?.paciente && (
        <GerarDocumentoModal
          open={showDocModal}
          onClose={() => setShowDocModal(false)}
          paciente={orcamento.paciente as any}
          dentistas={dentistas}
          clinica={clinica}
          orcamento={orcamento}
          tipoInicial="contrato"
        />
      )}

      {/* Template PDF — renderizado fora da tela para html2canvas */}
      <div ref={pdfRef} style={{ display: "none" }}>
        <OrcamentoPDFTemplate
          orcamento={orcamento}
          clinicaNome={clinica?.nome_clinica ?? "Instituto Belém"}
          clinicaEndereco={clinica ? [clinica.endereco, clinica.numero, clinica.bairro, clinica.cidade, clinica.estado].filter(Boolean).join(', ') : "Belém, PA"}
          clinicaTelefone={clinica?.telefone ?? clinica?.celular ?? ""}
          clinicaCNPJ={clinica?.cnpj ?? ""}
          logoUrl={clinica?.logo_base64 ?? `${import.meta.env.BASE_URL}logo-ib.jpg`}
        />
      </div>
    </DashboardLayout>
  );
}
