import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePaciente, usePacientes } from "@/hooks/usePacientes";
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { useOrcamentosByPaciente, type Orcamento } from "@/hooks/useOrcamentos";
import { useContasReceberByPaciente, type ContaReceber } from "@/hooks/useContasReceber";
import { FichaClinica } from "@/components/pacientes/FichaClinica";
import { Odontograma } from "@/components/pacientes/Odontograma";
import { Fotos } from "@/components/pacientes/Fotos";
import { Radiografias } from "@/components/pacientes/Radiografias";
import { Receituario } from "@/components/pacientes/Receituario";
import { AnamneseFormulario } from "@/components/pacientes/AnamneseFormulario";
import { EvolucaoSection } from "@/components/pacientes/EvolucaoSection";
import { DocumentosTab } from "@/components/pacientes/DocumentosTab";
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
  Edit2,
  MessageCircle,
  Hash,
  Share2,
  Home,
  BadgeCheck,
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

function SobreTab({ pacienteId, onEdit }: { pacienteId: string; onEdit?: () => void }) {
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
      <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-semibold text-slate-800">{value}</p>
        </div>
      </div>
    ) : null;

  const section = (title: string, children: React.ReactNode) => (
    <div className="space-y-0.5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4 first:mt-0">{title}</p>
      {children}
    </div>
  );

  const p = paciente as any;
  const hasEndereco = !!(p.rua || p.bairro || p.cidade || p.cep || p.endereco);
  const hasResponsavel = !!(p.nome_responsavel);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Dados Pessoais</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Informações cadastrais</p>
          </div>
        </div>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="rounded-xl gap-2 font-bold text-xs">
            <Edit2 className="w-3.5 h-3.5" /> Editar
          </Button>
        )}
      </div>

      {section("Identificação",
        <>
          {row(<User className="w-3.5 h-3.5 text-primary" />, "Nome completo", paciente.nome)}
          {row(<BadgeCheck className="w-3.5 h-3.5 text-primary" />, "Apelido / Como gosta de ser chamado", paciente.apelido)}
          {row(<CreditCard className="w-3.5 h-3.5 text-primary" />, "CPF", paciente.cpf)}
          {row(<Users className="w-3.5 h-3.5 text-primary" />, "Gênero", paciente.genero)}
          {row(<Calendar className="w-3.5 h-3.5 text-primary" />, "Data de nascimento",
            paciente.data_nascimento
              ? `${new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")} (${calculateAge(paciente.data_nascimento)} anos)`
              : null)}
          {row(<Briefcase className="w-3.5 h-3.5 text-primary" />, "Profissão", paciente.profissao)}
          {row(<Hash className="w-3.5 h-3.5 text-primary" />, "Nº Prontuário", paciente.numero_prontuario)}
        </>
      )}

      {section("Contato",
        <>
          {row(<Phone className="w-3.5 h-3.5 text-primary" />, "Telefone", paciente.telefone)}
          {row(<MessageCircle className="w-3.5 h-3.5 text-green-600" />, "WhatsApp", p.whatsapp)}
          {row(<Mail className="w-3.5 h-3.5 text-primary" />, "E-mail", paciente.email)}
          {row(<Share2 className="w-3.5 h-3.5 text-primary" />, "Rede Social", paciente.rede_social)}
        </>
      )}

      {hasEndereco && section("Endereço",
        <>
          {row(<MapPin className="w-3.5 h-3.5 text-primary" />, "CEP", p.cep)}
          {(p.rua || p.numero) && row(<Home className="w-3.5 h-3.5 text-primary" />, "Logradouro",
            [p.rua, p.numero && `nº ${p.numero}`, p.complemento].filter(Boolean).join(", "))}
          {row(<MapPin className="w-3.5 h-3.5 text-primary" />, "Bairro / Cidade / Estado",
            [p.bairro, p.cidade, p.estado].filter(Boolean).join(", "))}
          {row(<FileText className="w-3.5 h-3.5 text-slate-400" />, "Obs. de Endereço", p.observacao_endereco)}
        </>
      )}

      {section("Clínico",
        <>
          {row(<Activity className="w-3.5 h-3.5 text-primary" />, "Área de tratamento", paciente.area_tratamento)}
          {row(<FileText className="w-3.5 h-3.5 text-primary" />, "Como conheceu", paciente.como_conheceu)}
        </>
      )}

      {hasResponsavel && section("Responsável",
        <>
          {row(<Users className="w-3.5 h-3.5 text-primary" />, "Parentesco", p.parentesco_responsavel)}
          {row(<User className="w-3.5 h-3.5 text-primary" />, "Nome", p.nome_responsavel)}
          {row(<CreditCard className="w-3.5 h-3.5 text-primary" />, "CPF", p.cpf_responsavel)}
          {row(<Phone className="w-3.5 h-3.5 text-primary" />, "Telefone", p.telefone_responsavel)}
          {row(<Mail className="w-3.5 h-3.5 text-primary" />, "E-mail", p.email_responsavel)}
        </>
      )}
    </div>
  );
}

function OrcamentosTab({ pacienteId }: { pacienteId: string }) {
  const navigate = useNavigate();
  const { data: orcamentos = [], isLoading } = useOrcamentosByPaciente(pacienteId);
  if (isLoading) return <LoadingState />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
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
        <Button
          onClick={() => navigate(`/orcamentos/novo?paciente=${pacienteId}`)}
          className="rounded-xl font-black text-[11px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
          size="sm"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Novo Orçamento
        </Button>
      </div>
      {orcamentos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhum orçamento ainda</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

function DebitosTab({ pacienteId }: { pacienteId: string }) {
  const navigate = useNavigate();
  const { data: contas = [], isLoading } = useContasReceberByPaciente(pacienteId);
  if (isLoading) return <LoadingState />;
  if (contas.length === 0) return <EmptyState msg="Nenhuma conta a receber para este paciente." />;

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const total   = contas.reduce((a, c) => a + c.valor, 0);
  const pago    = contas.filter(c => c.status === "Recebida").reduce((a, c) => a + c.valor, 0);
  const pendente= contas.filter(c => c.status === "Pendente").reduce((a, c) => a + c.valor, 0);
  const vencido = contas.filter(c => c.status === "Vencida").reduce((a, c) => a + c.valor, 0);

  const groups = [
    { label: "Vencidas",  status: "Vencida",   items: contas.filter(c => c.status === "Vencida"),   border: "border-red-200",    bg: "bg-red-50/50",    dot: "bg-red-500" },
    { label: "Pendentes", status: "Pendente",  items: contas.filter(c => c.status === "Pendente"),  border: "border-yellow-200", bg: "bg-yellow-50/50", dot: "bg-yellow-500" },
    { label: "Pagas",     status: "Recebida",  items: contas.filter(c => c.status === "Recebida"),  border: "border-green-200",  bg: "bg-green-50/50",  dot: "bg-green-500" },
    { label: "Canceladas",status: "Cancelada", items: contas.filter(c => c.status === "Cancelada"), border: "border-slate-200",  bg: "bg-slate-50/50",  dot: "bg-slate-400" },
  ].filter(g => g.items.length > 0);

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

      {/* Resumo financeiro */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border-2">
          <CardContent className="p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total gerado</p>
            <p className="text-lg font-black text-slate-800">{fmt(total)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-2 border-green-100 bg-green-50/50">
          <CardContent className="p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-1">Pago</p>
            <p className="text-lg font-black text-green-700">{fmt(pago)}</p>
          </CardContent>
        </Card>
        {pendente > 0 && (
          <Card className="rounded-2xl border-2 border-yellow-100 bg-yellow-50/50">
            <CardContent className="p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-1">Pendente</p>
              <p className="text-lg font-black text-yellow-700">{fmt(pendente)}</p>
            </CardContent>
          </Card>
        )}
        {vencido > 0 && (
          <Card className="rounded-2xl border-2 border-red-100 bg-red-50/50">
            <CardContent className="p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Vencido</p>
              <p className="text-lg font-black text-red-600">{fmt(vencido)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grupos por status */}
      {groups.map(group => (
        <div key={group.status}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${group.bg} border ${group.border} mb-2`}>
            <div className={`w-2 h-2 rounded-full ${group.dot}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">{group.label}</span>
            <span className="ml-auto text-xs font-bold text-slate-500">{group.items.length} parcela{group.items.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="space-y-2">
            {group.items.map((c: ContaReceber) => (
              <div key={c.id} className={`rounded-2xl border-2 ${group.border} p-3 flex items-center gap-3`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.descricao}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vence: {new Date(c.data_vencimento).toLocaleDateString("pt-BR")}
                    {c.forma_pagamento && ` · ${c.forma_pagamento}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-slate-800">{fmt(c.valor)}</p>
                  {c.orcamento && (
                    <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px] text-primary mt-0.5"
                      onClick={() => navigate(`/orcamentos/${c.orcamento!.id}`)}>
                      Orç.#{c.orcamento.numero_orcamento} <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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
  { id: "documentos",  label: "Documentos",   icon: FileText,      color: "text-emerald-500",bgColor: "bg-emerald-500/10" },
  { id: "debitos",     label: "Débitos",      icon: DollarSign,    color: "text-orange-500", bgColor: "bg-orange-500/10" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PacienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: paciente, isLoading: loadingPaciente } = usePaciente(id);
  const { updatePaciente } = usePacientes();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
                    <SobreTab pacienteId={id} onEdit={() => setEditOpen(true)} />
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
                    <AnamneseFormulario pacienteId={id!} nomePaciente={paciente?.nome} paciente={paciente} />
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
                {activeTab === "documentos" && paciente && (
                  <motion.div key="documentos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <DocumentosTab pacienteId={id!} paciente={paciente} />
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

      {/* Modal de edição do paciente */}
      {paciente && (
        <PacienteForm
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSubmit={async (data) => {
            if (!id) return;
            await updatePaciente(id, data);
            queryClient.invalidateQueries({ queryKey: ["paciente", id] });
            setEditOpen(false);
          }}
          paciente={paciente}
          title="Editar Paciente"
        />
      )}
    </DashboardLayout>
  );
}
