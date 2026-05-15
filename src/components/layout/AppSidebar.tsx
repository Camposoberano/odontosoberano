import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Home,
  Settings,
  Stethoscope,
  CreditCard,
  Wrench,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserCheck,
  FileText,
  Building,
  Truck,
  Package,
  FlaskConical,
  Shield,
  Calculator,
  Receipt,
  TrendingUp,
  Banknote,
  CheckSquare,
  PieChart,
  TrendingDown,
  CreditCard as CreditCardIcon,
  BookOpen,
  Phone,
  Lock,
  Info,
  ShieldCheck,
  User,
  ClipboardList,
  Search,
  FolderOpen,
  LayoutDashboard,
} from "lucide-react";


import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const cadastroItems = [
  { title: "Dentistas", url: "/cadastros/dentistas", icon: UserCheck },
  { title: "Protéticos", url: "/cadastros/proteticos", icon: Wrench },
  { title: "Pacientes", url: "/patients", icon: Users },
  { title: "Funcionários", url: "/cadastros/funcionarios", icon: Building },
  { title: "Fornecedores", url: "/cadastros/fornecedores", icon: Truck },
  { title: "Patrimônio", url: "/cadastros/patrimonio", icon: Shield },
  { title: "Controle de estoque", url: "/cadastros/estoque", icon: Package },
  { title: "Laboratório", url: "/cadastros/laboratorio", icon: FlaskConical },
  { title: "Convênio / Planos", url: "/cadastros/convenios", icon: Shield },
  { title: "Tabela de Preços", url: "/cadastros/honorarios", icon: Calculator },
];

const financeiroItems = [
  { title: "Contas a Pagar", url: "/financeiro/contas-pagar", icon: Receipt },
  { title: "Contas a Receber", url: "/financeiro/contas-receber", icon: TrendingUp },
  { title: "Fluxo de Caixa", url: "/financeiro/fluxo-caixa", icon: Banknote },
  { title: "Controle de Cheques", url: "/financeiro/cheques", icon: CheckSquare },
  { title: "Relatório", url: "/relatorios/financeiro", icon: BarChart3 },
];



const pagamentosItems = [
  { title: "Efetuar pagamento", url: "/pagamentos/efetuar-pagamento", icon: CreditCardIcon },
];

const utilitariosItems = [
  { title: "Projetos", url: "/utilitarios/projetos", icon: LayoutDashboard },
  { title: "Manuais e Códigos", url: "/utilitarios/manuais-codigos", icon: BookOpen },
  { title: "Contatos Úteis", url: "/utilitarios/contatos-uteis", icon: Phone },
];


const procediventoRemovivelItems = [
  { title: "PPR", url: "/procedimentos/ppr", icon: ClipboardList },
  { title: "Prótese Total (PT)", url: "/procedimentos/pt", icon: ClipboardList },
  { title: "Prótese Móvel (PM)", url: "/procedimentos/pm", icon: ClipboardList },
];

const procediventoProtocoloItems = [
  { title: "Protocolo Definitivo", url: "/procedimentos/protocolo-definitivo", icon: ClipboardList },
  { title: "Protocolo Provisório", url: "/procedimentos/protocolo-provisorio", icon: ClipboardList },
];

const procediventoFixaItems = [
  { title: "Fixa Provisória", url: "/procedimentos/fixa", icon: ClipboardList },
  { title: "Fixa de Cerâmica", url: "/procedimentos/fixa-ceramica", icon: ClipboardList },
  { title: "Fixa Impressa", url: "/procedimentos/fixa-impressa", icon: ClipboardList },
  { title: "Adesiva", url: "/procedimentos/adesiva", icon: ClipboardList },
  { title: "Restauração Indireta", url: "/procedimentos/restauracao-indireta", icon: ClipboardList },
];

const procediventoEsteticaItems = [
  { title: "Placa de Bruxismo", url: "/procedimentos/bruxismo", icon: Shield },
  { title: "Clareamento", url: "/procedimentos/clareamento", icon: TrendingUp },
];

const procediventoLabExternoItems = [
  { title: "Laboratório Externo", url: "/procedimentos/lab-externo", icon: FlaskConical },
  { title: "Coroa sobre Implante", url: "/procedimentos/coroa-implante", icon: Wrench },
  { title: "Fixa de Zircônia", url: "/procedimentos/fixa-zirconia", icon: Wrench },
];

const configuracoesItems = [
  { title: "Perfil", url: "/profile", icon: User },
  { title: "Gerenciar Usuários", url: "/configuracoes/usuarios", icon: Users },
  { title: "Segurança 2FA", url: "/configuracoes/seguranca", icon: Shield },
  { title: "Senha do Administrador", url: "/configuracoes/senha-admin", icon: Lock },
  { title: "Informações da Clínica", url: "/configuracoes/informacoes-clinica", icon: Info },
  { title: "Permissões", url: "/configuracoes/permissoes", icon: ShieldCheck },
];

const menuItems = [
  { title: "Início / Dashboard", url: "/dashboard", icon: Home, color: "text-primary" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  // Route match helpers for submenu opening
  const cadastroMatch = currentPath.startsWith("/cadastros") || currentPath === "/patients";
  const financeiroMatch = currentPath.startsWith("/financeiro") || currentPath === "/relatorios/financeiro";
  const pagamentosMatch = currentPath.startsWith("/pagamentos");
  const utilitariosMatch = currentPath.startsWith("/utilitarios");
  const configuracoesMatch = currentPath.startsWith("/configuracoes") || currentPath === "/profile";

  // Active state helpers - only true when the parent menu should be highlighted
  const isCadastroActive = false; // Parent menu never highlighted, only children
  const isFinanceiroActive = false; // Parent menu never highlighted, only children
  const isPagamentosActive = false; // Parent menu never highlighted, only children
  const isUtilitariosActive = false; // Parent menu never highlighted, only children
  const isConfiguracoesActive = false; // Parent menu never highlighted, only children

  // Initialize open state from current route to avoid flicker
  const [isCadastroOpen, setIsCadastroOpen] = useState(cadastroMatch);
  const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(financeiroMatch);
  const [isPagamentosOpen, setIsPagamentosOpen] = useState(pagamentosMatch);
  const [isUtilitariosOpen, setIsUtilitariosOpen] = useState(utilitariosMatch);
  const [isConfiguracoesOpen, setIsConfiguracoesOpen] = useState(configuracoesMatch);

  // Estados para Grupos de Procedimentos
  const atendimentosMatch = currentPath.includes("/procedimentos") && !currentPath.includes("/procedimentos/consulta");
  const [isAtendimentosOpen, setIsAtendimentosOpen] = useState(atendimentosMatch);
  
  const [isRemovivelOpen, setIsRemovivelOpen] = useState(currentPath.includes("/procedimentos/ppr") || currentPath.includes("/procedimentos/pt") || currentPath.includes("/procedimentos/pm"));
  const [isProtocoloOpen, setIsProtocoloOpen] = useState(currentPath.includes("/procedimentos/protocolo"));
  const [isFixaOpen, setIsFixaOpen] = useState(currentPath.includes("/procedimentos/fixa") || currentPath.includes("/procedimentos/adesiva") || currentPath.includes("/procedimentos/restauracao"));
  const [isEsteticaOpen, setIsEsteticaOpen] = useState(currentPath.includes("/procedimentos/bruxismo") || currentPath.includes("/procedimentos/clareamento"));
  const [isLabExternoOpen, setIsLabExternoOpen] = useState(currentPath.includes("/procedimentos/lab-externo") || currentPath.includes("/procedimentos/coroa-implante") || currentPath.includes("/procedimentos/fixa-zirconia"));

  const { signOut } = useAuth();
  const { toast } = useToast();

  // Keep the matching group open on route change without closing others
  React.useLayoutEffect(() => {
    if (cadastroMatch) setIsCadastroOpen(true);
    if (financeiroMatch) setIsFinanceiroOpen(true);
    if (pagamentosMatch) setIsPagamentosOpen(true);
    if (utilitariosMatch) setIsUtilitariosOpen(true);
    if (configuracoesMatch) setIsConfiguracoesOpen(true);
    if (atendimentosMatch) setIsAtendimentosOpen(true);
  }, [cadastroMatch, financeiroMatch, pagamentosMatch, utilitariosMatch, configuracoesMatch, atendimentosMatch]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      navigate("/auth", { replace: true });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => currentPath === path;
  
  const getNavClass = (_: { isActive: boolean }) => "hover:bg-muted/50";

  const getSubmenuNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium ml-4" : "text-sidebar-foreground hover:bg-muted/50 ml-4";
    
  const getParentNavClass = (_isChildActive: boolean) =>
    "hover:bg-muted/50 py-3 text-base";

  const menuButtonClass = "py-6 text-base font-semibold transition-all hover:translate-x-1";

  return (
    <Sidebar className={isCollapsed ? "w-14 glass border-r border-border/50" : "w-64 glass border-r border-border/50"} collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-2 h-14 sm:h-16 flex items-center">
        <div className="flex items-center gap-3 w-full hover-scale cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-6 h-6 sm:w-8 sm:h-8 gradient-hero rounded-lg flex items-center justify-center flex-shrink-0 shadow-medical">
            <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold font-heading text-foreground truncate">Odonto Soberano</h2>
              <p className="text-xs text-muted-foreground truncate">Sistema de Gestão</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={menuButtonClass}>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                </motion.div>
              ))}

              {/* Agenda */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={menuButtonClass}>
                  <NavLink to="/appointments" end className={getNavClass}>
                    <Calendar className="w-5 h-5 text-primary" />
                    {!isCollapsed && <span>Agenda</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Ordens de Serviço (Busca Universal) */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={menuButtonClass}>
                  <NavLink to="/procedimentos/consulta" end className={getNavClass}>
                    <Search className="w-5 h-5 text-orange-400" />
                    {!isCollapsed && <span className="font-medium">Ordens de Serviço</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Painel de Produção e Analytics de Prótese */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={menuButtonClass}>
                  <NavLink to="/analises/producao" end className={getNavClass}>
                    <BarChart3 className="w-5 h-5 text-primary" />
                    {!isCollapsed && <span className="font-semibold text-primary">Painel de Produção</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Orçamentos */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={menuButtonClass}>
                  <NavLink to="/orcamentos" className={getNavClass}>
                    <FileText className="w-5 h-5 text-teal-500" />
                    {!isCollapsed && <span className="text-teal-600 font-medium">Orçamentos</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* NOVO GRUPO: ATENDIMENTOS */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setIsAtendimentosOpen(!isAtendimentosOpen)}
                  className="py-6 text-base font-bold bg-primary/5"
                >
                  <Stethoscope className="w-5 h-5 text-primary" />
                  {!isCollapsed && (
                    <>
                      <span className="text-primary">Atendimentos</span>
                      {isAtendimentosOpen ? (
                        <ChevronDown className="ml-auto w-4 h-4 text-primary" />
                      ) : (
                        <ChevronRight className="ml-auto w-4 h-4 text-primary" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {isAtendimentosOpen && !isCollapsed && (
                  <SidebarMenuSub className="ml-2 border-l-2 border-primary/20 flex flex-col gap-1 py-2">
                    {/* Grupo: Próteses Removíveis */}
                    <SidebarMenuItem className="ml-2">
                      <SidebarMenuButton onClick={() => setIsRemovivelOpen(!isRemovivelOpen)} className="py-5 text-sm font-medium">
                        <Package className="w-4 h-4 text-orange-400" />
                        <span>Removíveis</span>
                        {isRemovivelOpen ? <ChevronDown className="ml-auto w-3 h-3" /> : <ChevronRight className="ml-auto w-3 h-3" />}
                      </SidebarMenuButton>
                      {isRemovivelOpen && (
                        <SidebarMenuSub>
                          {procediventoRemovivelItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                                <NavLink to={item.url} end><span>{item.title}</span></NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>

                    {/* Grupo: Protocolos */}
                    <SidebarMenuItem className="ml-2">
                      <SidebarMenuButton onClick={() => setIsProtocoloOpen(!isProtocoloOpen)} className="py-5 text-sm font-medium">
                        <ClipboardList className="w-4 h-4 text-orange-500" />
                        <span>Protocolos</span>
                        {isProtocoloOpen ? <ChevronDown className="ml-auto w-3 h-3" /> : <ChevronRight className="ml-auto w-3 h-3" />}
                      </SidebarMenuButton>
                      {isProtocoloOpen && (
                        <SidebarMenuSub>
                          {procediventoProtocoloItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                                <NavLink to={item.url} end><span>{item.title}</span></NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>

                    {/* Grupo: Próteses Fixas */}
                    <SidebarMenuItem className="ml-2">
                      <SidebarMenuButton onClick={() => setIsFixaOpen(!isFixaOpen)} className="py-5 text-sm font-medium">
                        <FolderOpen className="w-4 h-4 text-orange-600" />
                        <span>Fixas</span>
                        {isFixaOpen ? <ChevronDown className="ml-auto w-3 h-3" /> : <ChevronRight className="ml-auto w-3 h-3" />}
                      </SidebarMenuButton>
                      {isFixaOpen && (
                        <SidebarMenuSub>
                          {procediventoFixaItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                                <NavLink to={item.url} end><span>{item.title}</span></NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>

                    {/* Grupo: Estética e Placas */}
                    <SidebarMenuItem className="ml-2">
                      <SidebarMenuButton onClick={() => setIsEsteticaOpen(!isEsteticaOpen)} className="py-5 text-sm font-medium">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>Estética / Placas</span>
                        {isEsteticaOpen ? <ChevronDown className="ml-auto w-3 h-3" /> : <ChevronRight className="ml-auto w-3 h-3" />}
                      </SidebarMenuButton>
                      {isEsteticaOpen && (
                        <SidebarMenuSub>
                          {procediventoEsteticaItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                                <NavLink to={item.url} end><span>{item.title}</span></NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>

                    {/* Grupo: Laboratórios Externos */}
                    <SidebarMenuItem className="ml-2">
                      <SidebarMenuButton onClick={() => setIsLabExternoOpen(!isLabExternoOpen)} className="py-5 text-sm font-medium">
                        <FlaskConical className="w-4 h-4 text-orange-500" />
                        <span>Lab. Externo</span>
                        {isLabExternoOpen ? <ChevronDown className="ml-auto w-3 h-3" /> : <ChevronRight className="ml-auto w-3 h-3" />}
                      </SidebarMenuButton>
                      {isLabExternoOpen && (
                        <SidebarMenuSub>
                          {procediventoLabExternoItems.map(item => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                                <NavLink to={item.url} end><span>{item.title}</span></NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Cadastros with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsCadastroOpen(!isCadastroOpen)}
                  className={`${menuButtonClass} ${getParentNavClass(isCadastroActive)}`}
                >
                  <Users className={`w-5 h-5 ${isCadastroActive ? "text-primary" : "text-amber-500"}`} />
                  {!isCollapsed && (
                    <>
                      <span className={isCadastroActive ? "text-primary" : "text-amber-600"}>Cadastros</span>
                      {isCadastroOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isCadastroOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {cadastroItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              
              {/* Financeiro with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsFinanceiroOpen(!isFinanceiroOpen)}
                  className={`${menuButtonClass} ${getParentNavClass(isFinanceiroActive)}`}
                >
                  <DollarSign className={`w-5 h-5 ${isFinanceiroActive ? "text-primary" : "text-lime-500"}`} />
                  {!isCollapsed && (
                    <>
                      <span className={isFinanceiroActive ? "text-primary" : "text-lime-600"}>Financeiro</span>
                      {isFinanceiroOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isFinanceiroOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {financeiroItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              

              
              {/* Pagamentos with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsPagamentosOpen(!isPagamentosOpen)}
                  className={`${menuButtonClass} ${getParentNavClass(isPagamentosActive)}`}
                >
                  <CreditCard className={`w-5 h-5 ${isPagamentosActive ? "text-primary" : "text-violet-500"}`} />
                  {!isCollapsed && (
                    <>
                      <span className={isPagamentosActive ? "text-primary" : "text-violet-600"}>Pagamentos</span>
                      {isPagamentosOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isPagamentosOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {pagamentosItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              
              {/* Utilitários with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsUtilitariosOpen(!isUtilitariosOpen)}
                  className={`${menuButtonClass} ${getParentNavClass(isUtilitariosActive)}`}
                >
                  <Wrench className={`w-5 h-5 ${isUtilitariosActive ? "text-primary" : "text-slate-500"}`} />
                  {!isCollapsed && (
                    <>
                      <span className={isUtilitariosActive ? "text-primary" : "text-slate-600"}>Utilitários</span>
                      {isUtilitariosOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isUtilitariosOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {utilitariosItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              
              {/* Configurações with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsConfiguracoesOpen(!isConfiguracoesOpen)}
                  className={`${menuButtonClass} ${getParentNavClass(isConfiguracoesActive)}`}
                >
                  <Settings className={`w-5 h-5 ${isConfiguracoesActive ? "text-primary" : "text-gray-500"}`} />
                  {!isCollapsed && (
                    <>
                      <span className={isConfiguracoesActive ? "text-primary" : "text-gray-600"}>Configurações</span>
                      {isConfiguracoesOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isConfiguracoesOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {configuracoesItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </motion.div>
      </SidebarContent>

      {/* Fixed logout button at bottom */}
      <div className="mt-auto border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer mobile-touch-target"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>Desconectar</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}