import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePaciente } from "@/hooks/usePacientes";
import { useOrcamentosByPaciente, type Orcamento } from "@/hooks/useOrcamentos";
import { useContasReceberByPaciente, type ContaReceber } from "@/hooks/useContasReceber";
import { FichaClinica } from "@/components/pacientes/FichaClinica";
import { Odontograma } from "@/components/pacientes/Odontograma";
import { Fotos } from "@/components/pacientes/Fotos";
import { Radiografias } from "@/components/pacientes/Radiografias";
import { Receituario } from "@/components/pacientes/Receituario";
import { AnamneseTab } from "@/components/pacientes/AnamneseTab";
import { EvolucaoSection } from "@/components/pacientes/EvolucaoSection";
import { AnimatePresence, motion } from "framer-motion";
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
  Pill,
  ClipboardList,
  DollarSign,
  Loader2,
  ExternalLink,
  ChevronRight,
  Menu,
} from "lucide-react";

// ─── Status helpers ───────────────────────────────────────────────────────────

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
    Pendente:  { label: "Pendente",  className: "bg-yellow-100 text-yellow-700" },
    Recebida:  { label: "Recebida",  className: "bg-green-100 text-green-700" },
    Vencida:   { label: "Vencida",   className: "bg-red-100 text-red-700" },
    Cancelada: { label: "Cancelada", className: "bg-slate-100 text-slate-600" },
  };
  const s = map[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return <Badge className={s.className}>{s.label}</Badge>;
}

// ─── Tab contents ─────────────────────────────────────────────────────────────

function SobreTab({ pacienteId }: { pacienteId: string }) {
  const { data: paciente, isLoading } = usePaciente(pacienteId);
  if (isLoading) return <LoadingState />;
  if (!paciente) return <EmptyState msg="Paciente não encontrado." />;

  const calculateAge = (d?: string | null) => {
    if (!d) return null;
    const today = new Date(), birth = new Date(d);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const row = (icon: React.ReactNode, label: string, value?: string | null) =>
    value ? (
      <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-semibold text-slate-800">{value}</p>
        </div>
      </div>
    ) : null;

  const enderecoCompleto = [
    paciente.rua, paciente.numero && `nº ${paciente.numero}`,
    paciente.complemento, paciente.bairro, paciente.cidade,
    paciente.estado, paciente.cep,
  ].filter(Boolean).join(", ") || paciente.endereco;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Dados Pessoais</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Informações cadastrais</p>
        </div>
      </div>
      {row(<Phone className="w-4 h-4 text-primary" />, "Telefone", paciente.telefone)}
      {row(<Mail className="w-4 h-4 text-primary" />, "E-mail", paciente.email)}
      {row(<Calendar className="w-4 h-4 text-primary" />, "Data de nascimento",
        paciente.data_nascimento
          ? `${new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")} (${calculateAge(paciente.data_nascimento)} anos)`
          : null)}
      {row(<CreditCard className="w-4 h-4 text-primary" />, "CPF", paciente.cpf)}
      {row(<Users className="w-4 h-4 text-primary" />, "Gênero", paciente.genero)}
      {row(<Briefcase className="w-4 h-4 text-primary" />, "Profissão", paciente.profissao)}
      {row(<MapPin className="w-4 h-4 text-primary" />, "Endereço", enderecoCompleto)}
      {row(<Activity className="w-4 h-4 text-primary" />, "Área de tratamento", paciente.area_tratamento)}
      {row(<FileText className="w-4 h-4 text-primary" />, "Como conheceu", paciente.como_conheceu)}
      {paciente.nome_responsavel && row(
        <User className="w-4 h-4 text-primary" />, "Responsável",
        `${paciente.nome_responsavel}${paciente.telefone_responsavel ? ` — ${paciente.telefone_responsavel}` : ""}`
      )}
    </div>
  );
}

function OrcamentosTab({ pacienteId }: { pacienteId: string }) {
  const navigate = useNavigate();
  const { data: orcamentos = [], isLoading } = useOrcamentosByPaciente(pacienteId);
  if (isLoading) return <LoadingState />;
  if (orcamentos.length === 0) return <EmptyState msg="Nenhum orçamento para este paciente." />;
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
                <td className="px-4 py-3 text-slate-600">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">
                  {o.total_liquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3">{statusOrcamentoBadge(o.status)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-7 rounded-lg gap-1" onClick={() => navigate(`/orcamentos/${o.id}`)}>
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

function DebitosTab({ pacienteId }: { pacienteId: string }) {
  const navigate = useNavigate();
  const { data: contas = [], isLoading } = useContasReceberByPaciente(pacienteId);
  if (isLoading) return <LoadingState />;
  if (contas.length === 0) return <EmptyState msg="Nenhuma conta a receber para este paciente." />;
  const total = contas.reduce((a, c) => a + c.valor, 0);
  const pendente = contas.filter(c => c.status === "Pendente" || c.status === "Vencida").reduce((a, c) => a + c.valor, 0);
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
            <p className="text-xl font-black text-slate-800">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-2 border-red-100 bg-red-50/50">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Pendente/Vencido</p>
            <p className="text-xl font-black text-red-600">{pendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
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
                    <Button variant="outline" size="sm" className="h-6 rounded-lg text-xs px-2 gap-1"
                      onClick={() => navigate(`/orcamentos/${c.orcamento!.id}`)}>
                      Orç. #{c.orcamento.numero_orcamento} <ExternalLink className="w-3 h-3" />
                    </Button>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{new Date(c.data_vencimento).toLocaleDateString("pt-BR")}</td>
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

function LoadingState() {
  return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <FileText className="w-10 h-10 text-slate-200" />
      <p className="text-sm text-slate-400 font-bold">{msg}</p>
    </div>
  );
}

// ─── Sidebar tabs config ──────────────────────────────────────────────────────

const TABS = [
  { id: "sobre",       label: "Sobre",        icon: User,          color: "text-primary",    bgColor: "bg-primary/10" },
  { id: "orcamentos",  label: "Orçamentos",   icon: FileText,      color: "text-green-600",  bgColor: "bg-green-500/10" },
  { id: "tratamentos", label: "Tratamentos",  icon: Activity,      color: "text-red-500",    bgColor: "bg-red-500/10" },
  { id: "anamnese",    label: "Anamnese",     icon: ClipboardList, color: "text-violet-600", bgColor: "bg-violet-500/10" },
  { id: "imagens",     label: "Imagens",      icon: Camera,        color: "text-pink-500",   bgColor: "bg-pink-500/10" },
  { id: "documentos",  label: "Documentos",   icon: Pill,          color: "text-emerald-500",bgColor: "bg-emerald-500/10" },
  { id: "debitos",     label: "Débitos",      icon: DollarSign,    color: "text-orange-500", bgColor: "bg-orange-500/10" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PacienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: paciente, isLoading: loadingPaciente } = usePaciente(id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabParam = searchParams.get("tab") ?? "sobre";
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (tabParam !== activeTab) setActiveTab(tabParam);
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
    setMobileMenuOpen(false);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/patients")}
              className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 border-2 h-9 shrink-0"
            >
              <ArrowLeft className="w-3 h-3" /> Pacientes
            </Button>

            {loadingPaciente ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : paciente ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic">
                    {paciente.nome}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={paciente.status === "Ativo" ? "bg-green-100 text-green-800 text-[10px]" : "bg-red-100 text-red-800 text-[10px]"}>
                      {paciente.status}
                    </Badge>
                    {paciente.area_tratamento && (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{paciente.area_tratamento}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Layout: sidebar + content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* DESKTOP SIDEBAR */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-2 p-2 bg-white rounded-[32px] border-2 shadow-xl sticky top-24">
            <div className="p-6 pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg rotate-3">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <h3 className="font-extrabold text-slate-800 truncate text-sm uppercase leading-none">
                    {loadingPaciente ? "…" : paciente?.nome ?? "—"}
                  </h3>
                  <span className="text-[10px] font-black text-primary uppercase mt-1">Prontuário</span>
                </div>
              </div>
            </div>

            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group w-full ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20 -translate-y-1"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-xl shrink-0 transition-colors ${activeTab === tab.id ? "bg-white/20" : tab.bgColor}`}>
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : tab.color}`} />
                  </div>
                  <span className={`font-bold text-sm tracking-tight truncate ${activeTab === tab.id ? "text-white" : "text-slate-700"}`}>
                    {tab.label}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 opacity-40 transition-transform ${activeTab === tab.id ? "text-white translate-x-1" : "text-slate-400"}`} />
              </button>
            ))}
          </div>

          {/* MOBILE MENU */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white rounded-2xl border-2 shadow-sm">
            <div className="flex items-center gap-2">
              {(() => { const t = TABS.find(t => t.id === activeTab); return t ? <t.icon className={`w-4 h-4 ${t.color}`} /> : null; })()}
              <span className="font-bold text-sm text-slate-800">
                {TABS.find(t => t.id === activeTab)?.label ?? ""}
              </span>
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2">
                  <Menu className="w-4 h-4" /> Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 rounded-r-3xl">
                <div className="p-8 pb-4">
                  <h2 className="text-xl font-black italic tracking-tighter text-primary">PRONTUÁRIO</h2>
                  {paciente && <p className="text-sm text-slate-500 mt-1 font-bold">{paciente.nome}</p>}
                </div>
                <div className="flex flex-col gap-2 p-4">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        activeTab === tab.id ? "bg-primary text-white shadow-lg" : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${activeTab === tab.id ? "bg-white/20" : "bg-white"}`}>
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : tab.color}`} />
                      </div>
                      <span className="font-bold">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* CONTENT AREA */}
          <motion.div
            className="lg:col-span-9"
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 sm:p-8 rounded-[40px] border-2 shadow-2xl bg-white/80 backdrop-blur-md">
              <AnimatePresence mode="wait">
                {activeTab === "sobre" && (
                  <motion.div key="sobre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SobreTab pacienteId={id} />
                  </motion.div>
                )}
                {activeTab === "orcamentos" && (
                  <motion.div key="orcamentos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <OrcamentosTab pacienteId={id} />
                  </motion.div>
                )}
                {activeTab === "tratamentos" && (
                  <motion.div key="tratamentos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <FichaClinica pacienteId={id} />
                    <div className="border-t-2 border-slate-100 pt-8 mt-8">
                      <Odontograma pacienteId={id} />
                    </div>
                    <div className="border-t-2 border-slate-100 pt-8 mt-8">
                      <EvolucaoSection pacienteId={id} />
                    </div>
                  </motion.div>
                )}
                {activeTab === "anamnese" && (
                  <motion.div key="anamnese" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AnamneseTab pacienteId={id} />
                  </motion.div>
                )}
                {activeTab === "imagens" && (
                  <motion.div key="imagens" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Fotos pacienteId={id} />
                    <div className="border-t-2 border-slate-100 pt-8 mt-8">
                      <Radiografias pacienteId={id} />
                    </div>
                  </motion.div>
                )}
                {activeTab === "documentos" && (
                  <motion.div key="documentos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Receituario pacienteId={id} />
                  </motion.div>
                )}
                {activeTab === "debitos" && (
                  <motion.div key="debitos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <DebitosTab pacienteId={id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
