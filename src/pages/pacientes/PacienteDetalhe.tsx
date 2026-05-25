import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaciente } from "@/hooks/usePacientes";
import { useOrcamentosByPaciente, type Orcamento } from "@/hooks/useOrcamentos";
import { useContasReceberByPaciente, type ContaReceber } from "@/hooks/useContasReceber";
import { FichaClinica } from "@/components/pacientes/FichaClinica";
import { Odontograma } from "@/components/pacientes/Odontograma";
import { Fotos } from "@/components/pacientes/Fotos";
import { Radiografias } from "@/components/pacientes/Radiografias";
import { Receituario } from "@/components/pacientes/Receituario";
import { AnamneseTab } from "@/components/pacientes/AnamneseTab";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  Users,
  FileText,
  Activity,
  Camera,
  Image as FileImage,
  Pill,
  ClipboardList,
  DollarSign,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Status badge helpers ─────────────────────────────────────────────────────

function statusOrcamentoBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    rascunho:          { label: "Rascunho",          className: "bg-slate-100 text-slate-700" },
    enviado:           { label: "Enviado",            className: "bg-blue-100 text-blue-700" },
    aprovado:          { label: "Aprovado",           className: "bg-green-100 text-green-700" },
    recusado:          { label: "Recusado",           className: "bg-red-100 text-red-700" },
    contrato_assinado: { label: "Contrato Assinado",  className: "bg-violet-100 text-violet-700" },
  };
  const s = map[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return <Badge className={s.className}>{s.label}</Badge>;
}

function statusContaBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    Pendente:   { label: "Pendente",   className: "bg-yellow-100 text-yellow-700" },
    Recebida:   { label: "Recebida",   className: "bg-green-100 text-green-700" },
    Vencida:    { label: "Vencida",    className: "bg-red-100 text-red-700" },
    Cancelada:  { label: "Cancelada",  className: "bg-slate-100 text-slate-600" },
  };
  const s = map[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return <Badge className={s.className}>{s.label}</Badge>;
}

// ─── Aba Sobre ────────────────────────────────────────────────────────────────

function SobreTab({ pacienteId }: { pacienteId: string }) {
  const { data: paciente, isLoading } = usePaciente(pacienteId);

  if (isLoading) return <LoadingState />;
  if (!paciente) return <EmptyState msg="Paciente não encontrado." />;

  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const row = (icon: React.ReactNode, label: string, value?: string | null) =>
    value ? (
      <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-semibold text-slate-800">{value}</p>
        </div>
      </div>
    ) : null;

  const enderecoCompleto = [
    paciente.rua,
    paciente.numero && `nº ${paciente.numero}`,
    paciente.complemento,
    paciente.bairro,
    paciente.cidade,
    paciente.estado,
    paciente.cep,
  ]
    .filter(Boolean)
    .join(", ") || paciente.endereco;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Dados Pessoais</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Informações cadastrais</p>
        </div>
      </div>

      <div>
        {row(<Phone className="w-4 h-4 text-primary" />, "Telefone", paciente.telefone)}
        {row(<Mail className="w-4 h-4 text-primary" />, "E-mail", paciente.email)}
        {row(<Calendar className="w-4 h-4 text-primary" />, "Data de nascimento",
          paciente.data_nascimento
            ? `${new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")} (${calculateAge(paciente.data_nascimento)} anos)`
            : null
        )}
        {row(<CreditCard className="w-4 h-4 text-primary" />, "CPF", paciente.cpf)}
        {row(<Users className="w-4 h-4 text-primary" />, "Gênero", paciente.genero)}
        {row(<Briefcase className="w-4 h-4 text-primary" />, "Profissão", paciente.profissao)}
        {row(<MapPin className="w-4 h-4 text-primary" />, "Endereço", enderecoCompleto)}
        {row(<Activity className="w-4 h-4 text-primary" />, "Área de tratamento", paciente.area_tratamento)}
        {row(<FileText className="w-4 h-4 text-primary" />, "Como conheceu", paciente.como_conheceu)}
        {paciente.nome_responsavel && row(
          <User className="w-4 h-4 text-primary" />,
          "Responsável",
          `${paciente.nome_responsavel}${paciente.telefone_responsavel ? ` — ${paciente.telefone_responsavel}` : ""}`
        )}
      </div>
    </div>
  );
}

// ─── Aba Orçamentos ───────────────────────────────────────────────────────────

function OrcamentosTab({ pacienteId }: { pacienteId: string }) {
  const navigate = useNavigate();
  const { data: orcamentos = [], isLoading } = useOrcamentosByPaciente(pacienteId);

  if (isLoading) return <LoadingState />;
  if (orcamentos.length === 0)
    return <EmptyState msg="Nenhum orçamento para este paciente." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Orçamentos</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            {orcamentos.length} orçamento{orcamentos.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Nº</th>
              <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Data</th>
              <th className="text-right px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Total</th>
              <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orcamentos.map((o: Orcamento) => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-800">#{o.numero_orcamento}</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(o.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">
                  {o.total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3">{statusOrcamentoBadge(o.status)}</td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-lg gap-1"
                    onClick={() => navigate(`/orcamentos/${o.id}`)}
                  >
                    <ExternalLink className="w-3 h-3" /> Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Aba Débitos ──────────────────────────────────────────────────────────────

function DebitosTab({ pacienteId }: { pacienteId: string }) {
  const navigate = useNavigate();
  const { data: contas = [], isLoading } = useContasReceberByPaciente(pacienteId);

  if (isLoading) return <LoadingState />;
  if (contas.length === 0)
    return <EmptyState msg="Nenhuma conta a receber para este paciente." />;

  const total = contas.reduce((acc, c) => acc + c.valor, 0);
  const pendente = contas
    .filter((c) => c.status === "Pendente" || c.status === "Vencida")
    .reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Débitos</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            {contas.length} parcela{contas.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <Card className="rounded-2xl border-2">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total gerado</p>
            <p className="text-xl font-black text-slate-800">
              {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-2 border-red-100 bg-red-50/50">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Pendente/Vencido</p>
            <p className="text-xl font-black text-red-600">
              {pendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Descrição</th>
              <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Orçamento</th>
              <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Vencimento</th>
              <th className="text-right px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Valor</th>
              <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((c: ContaReceber) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{c.descricao}</td>
                <td className="px-4 py-3">
                  {c.orcamento ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 rounded-lg text-xs px-2 gap-1"
                      onClick={() => navigate(`/orcamentos/${c.orcamento!.id}`)}
                    >
                      Orç. #{c.orcamento.numero_orcamento}
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(c.data_vencimento).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">
                  {c.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3">{statusContaBadge(c.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <FileText className="w-10 h-10 text-slate-200" />
      <p className="text-sm text-slate-400 font-bold">{msg}</p>
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "sobre",       label: "Sobre",       icon: User },
  { id: "orcamentos",  label: "Orçamentos",  icon: FileText },
  { id: "tratamentos", label: "Tratamentos", icon: Activity },
  { id: "anamnese",    label: "Anamnese",    icon: ClipboardList },
  { id: "imagens",     label: "Imagens",     icon: Camera },
  { id: "documentos",  label: "Documentos",  icon: Pill },
  { id: "debitos",     label: "Débitos",     icon: DollarSign },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PacienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: paciente, isLoading } = usePaciente(id);

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam ?? "sobre");

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam);
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  if (!id) {
    navigate("/patients");
    return null;
  }

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/patients")}
            className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 border-2 h-9"
          >
            <ArrowLeft className="w-3 h-3" /> Pacientes
          </Button>

          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : paciente ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic">
                  {paciente.nome}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      paciente.status === "Ativo"
                        ? "bg-green-100 text-green-800 text-[10px]"
                        : "bg-red-100 text-red-800 text-[10px]"
                    }
                  >
                    {paciente.status}
                  </Badge>
                  {paciente.area_tratamento && (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {paciente.area_tratamento}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-slate-100/80 p-1 rounded-2xl mb-2">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:shadow-sm"
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <Card className="p-4 sm:p-8 rounded-[40px] border-2 shadow-2xl bg-white/80 backdrop-blur-md">
            <TabsContent value="sobre" className="mt-0">
              <SobreTab pacienteId={id} />
            </TabsContent>

            <TabsContent value="orcamentos" className="mt-0">
              <OrcamentosTab pacienteId={id} />
            </TabsContent>

            <TabsContent value="tratamentos" className="mt-0 space-y-8">
              <FichaClinica pacienteId={id} />
              <div className="border-t-2 border-slate-100 pt-8">
                <Odontograma pacienteId={id} />
              </div>
            </TabsContent>

            <TabsContent value="anamnese" className="mt-0">
              <AnamneseTab pacienteId={id} />
            </TabsContent>

            <TabsContent value="imagens" className="mt-0 space-y-8">
              <Fotos pacienteId={id} />
              <div className="border-t-2 border-slate-100 pt-8">
                <Radiografias pacienteId={id} />
              </div>
            </TabsContent>

            <TabsContent value="documentos" className="mt-0">
              <Receituario pacienteId={id} />
            </TabsContent>

            <TabsContent value="debitos" className="mt-0">
              <DebitosTab pacienteId={id} />
            </TabsContent>
          </Card>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
