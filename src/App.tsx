import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { get, set, del } from "idb-keyval";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AnimatePresence } from "framer-motion";
import { AnimatedRoute } from "@/components/layout/AnimatedRoute";

import { useRealTimeSync } from "@/hooks/useRealTimeSync";

const Auth = React.lazy(() => import("@/pages/Auth"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Patients = React.lazy(() => import("@/pages/Patients"));
const Appointments = React.lazy(() => import("@/pages/Appointments"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Dentistas = React.lazy(() => import("@/pages/cadastros/Dentistas").then(m => ({ default: m.Dentistas })));
const Proteticos = React.lazy(() => import("@/pages/cadastros/Proteticos").then(m => ({ default: m.Proteticos })));
// Importação legada de OrdemServico removida
const Funcionarios = React.lazy(() => import("@/pages/cadastros/Funcionarios").then(m => ({ default: m.Funcionarios })));
const Fornecedores = React.lazy(() => import("@/pages/cadastros/Fornecedores").then(m => ({ default: m.Fornecedores })));
const Patrimonio = React.lazy(() => import("@/pages/cadastros/Patrimonio").then(m => ({ default: m.Patrimonio })));
const ControleEstoque = React.lazy(() => import("@/pages/cadastros/ControleEstoque").then(m => ({ default: m.ControleEstoque })));
const Laboratorio = React.lazy(() => import("@/pages/cadastros/Laboratorio").then(m => ({ default: m.Laboratorio })));
const Convenios = React.lazy(() => import("@/pages/cadastros/Convenios").then(m => ({ default: m.Convenios })));
const TabelaHonorarios = React.lazy(() => import("@/pages/cadastros/TabelaHonorarios").then(m => ({ default: m.TabelaHonorarios })));
const ContasPagar = React.lazy(() => import("@/pages/financeiro/ContasPagar"));
const ContasReceber = React.lazy(() => import("@/pages/financeiro/ContasReceber"));
const FluxoCaixa = React.lazy(() => import("@/pages/financeiro/FluxoCaixa"));
const Comissoes = React.lazy(() => import("@/pages/financeiro/Comissoes"));
const ControleCheques = React.lazy(() => import("@/pages/financeiro/ControleCheques"));
const GanhoDentista = React.lazy(() => import("@/pages/relatorios/GanhoDentista"));
const RelatorioFinanceiro = React.lazy(() => import("@/pages/relatorios/RelatorioFinanceiro"));
const RelatorioComissao = React.lazy(() => import("@/pages/relatorios/RelatorioComissao"));
const RelatorioOrcamentos = React.lazy(() => import("@/pages/relatorios/RelatorioOrcamentos"));
const EfetuarPagamento = React.lazy(() => import("@/pages/pagamentos/EfetuarPagamento").then(m => ({ default: m.EfetuarPagamento })));
const ManuaisCodigos = React.lazy(() => import("@/pages/utilitarios/ManuaisCodigos"));
const ContatosUteis = React.lazy(() => import("@/pages/utilitarios/ContatosUteis"));
const Projects = React.lazy(() => import("@/pages/utilitarios/Projects"));
const ChecklistMateriais = React.lazy(() => import("@/pages/utilitarios/ChecklistMateriais"));

const SenhaAdmin = React.lazy(() => import("@/pages/configuracoes/SenhaAdmin").then(m => ({ default: m.SenhaAdmin })));
const InformacoesClinica = React.lazy(() => import("@/pages/configuracoes/InformacoesClinica").then(m => ({ default: m.InformacoesClinica })));
const Permissoes = React.lazy(() => import("@/pages/configuracoes/Permissoes").then(m => ({ default: m.Permissoes })));
const GerenciarUsuarios = React.lazy(() => import("@/pages/configuracoes/GerenciarUsuarios"));
const LogsAuditoria = React.lazy(() => import("@/pages/configuracoes/LogsAuditoria"));
const TwoFactorSettings = React.lazy(() => import("@/pages/configuracoes/TwoFactorSettings").then(m => ({ default: m.TwoFactorSettings })));
const TodosProcedimentos = React.lazy(() => import("@/pages/procedimentos/TodosProcedimentos"));
const ConsultaOSUniversal = React.lazy(() => import("@/pages/procedimentos/ConsultaOSUniversal"));
const GenericProcedimentoListPage = React.lazy(() => import("@/pages/procedimentos/GenericProcedimentoListPage"));
const GenericProcedimentoDetail = React.lazy(() => import("@/pages/procedimentos/GenericProcedimentoDetail"));
const GenericNovoProcedimento = React.lazy(() => import("@/pages/procedimentos/GenericNovoProcedimento"));
const PainelProducao = React.lazy(() => import("@/pages/analises/PainelProducao"));
const ListaOrcamentos = React.lazy(() => import("@/pages/orcamentos/ListaOrcamentos"));
const NovoOrcamento = React.lazy(() => import("@/pages/orcamentos/NovoOrcamento"));
const OrcamentoDetalhe = React.lazy(() => import("@/pages/orcamentos/OrcamentoDetalhe"));
const OrdemServicoLista = React.lazy(() => import("@/pages/ordens-servico/OrdemServicoLista"));
const OrdemServicoDetalhe = React.lazy(() => import("@/pages/ordens-servico/OrdemServicoDetalhe"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        </div>
      }>
        <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<AnimatedRoute><Auth /></AnimatedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><AnimatedRoute><Dashboard /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><AnimatedRoute><Patients /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><AnimatedRoute><Appointments /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AnimatedRoute><Profile /></AnimatedRoute></ProtectedRoute>} />
            
            {/* Cadastro Routes */}
            <Route path="/cadastros/dentistas" element={<ProtectedRoute><AnimatedRoute><Dentistas /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/cadastros/proteticos" element={<ProtectedRoute><AnimatedRoute><Proteticos /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/cadastros/funcionarios" element={<ProtectedRoute><AnimatedRoute><Funcionarios /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/cadastros/fornecedores" element={<ProtectedRoute><AnimatedRoute><Fornecedores /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/cadastros/patrimonio" element={<ProtectedRoute><AnimatedRoute><Patrimonio /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/cadastros/estoque" element={<ProtectedRoute><AnimatedRoute><ControleEstoque /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/cadastros/os" element={<Navigate to="/procedimentos/consulta" replace />} />
            <Route path="/cadastros/laboratorio" element={<ProtectedRoute><AnimatedRoute><Laboratorio /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/cadastros/convenios" element={<ProtectedRoute><AnimatedRoute><Convenios /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/cadastros/honorarios" element={<ProtectedRoute><AnimatedRoute><TabelaHonorarios /></AnimatedRoute></ProtectedRoute>} />

            {/* Procedimentos - Roteamento Genérico para os 15 Tipos */}
            <Route path="/procedimentos" element={<ProtectedRoute><TodosProcedimentos /></ProtectedRoute>} />
            <Route path="/procedimentos/consulta" element={<ProtectedRoute><ConsultaOSUniversal /></ProtectedRoute>} />
            
            {/* Rotas Genéricas: suportam ppr, pt, pm, fixa, protocolo-definitivo, etc. */}
            <Route path="/procedimentos/:tipo" element={<ProtectedRoute><AnimatedRoute><GenericProcedimentoListPage /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/procedimentos/:tipo/novo" element={<ProtectedRoute><AnimatedRoute><GenericNovoProcedimento /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/procedimentos/:tipo/:id" element={<ProtectedRoute><AnimatedRoute><GenericProcedimentoDetail /></AnimatedRoute></ProtectedRoute>} />

            {/* Financeiro Routes */}
            <Route path="/financeiro/contas-pagar" element={<ProtectedRoute><AnimatedRoute><ContasPagar /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/financeiro/contas-receber" element={<ProtectedRoute><AnimatedRoute><ContasReceber /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/financeiro/fluxo-caixa" element={<ProtectedRoute><AnimatedRoute><FluxoCaixa /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/financeiro/comissoes" element={<ProtectedRoute><AnimatedRoute><Comissoes /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/financeiro/cheques" element={<ProtectedRoute><AnimatedRoute><ControleCheques /></AnimatedRoute></ProtectedRoute>} />
            
            {/* Relatórios Routes */}
            <Route path="/relatorios/ganho-dentista" element={<ProtectedRoute><AnimatedRoute><GanhoDentista /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/relatorios/financeiro" element={<ProtectedRoute><AnimatedRoute><RelatorioFinanceiro /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/relatorios/comissao" element={<ProtectedRoute><AnimatedRoute><RelatorioComissao /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/relatorios/orcamentos" element={<ProtectedRoute><AnimatedRoute><RelatorioOrcamentos /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/analises/producao" element={<ProtectedRoute><AnimatedRoute><PainelProducao /></AnimatedRoute></ProtectedRoute>} />
            
            {/* Orçamentos Routes */}
            <Route path="/orcamentos" element={<ProtectedRoute><AnimatedRoute><ListaOrcamentos /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/orcamentos/novo" element={<ProtectedRoute><AnimatedRoute><NovoOrcamento /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/orcamentos/:id" element={<ProtectedRoute><AnimatedRoute><OrcamentoDetalhe /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/orcamentos/:id/editar" element={<ProtectedRoute><AnimatedRoute><NovoOrcamento /></AnimatedRoute></ProtectedRoute>} />

            {/* Ordens de Serviço Routes */}
            <Route path="/ordens-servico" element={<ProtectedRoute><AnimatedRoute><OrdemServicoLista /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/ordens-servico/:id" element={<ProtectedRoute><AnimatedRoute><OrdemServicoDetalhe /></AnimatedRoute></ProtectedRoute>} />

            {/* Pagamentos Routes */}
            <Route path="/pagamentos/efetuar-pagamento" element={<ProtectedRoute><AnimatedRoute><EfetuarPagamento /></AnimatedRoute></ProtectedRoute>} />
            
            {/* Utilitários Routes */}
            <Route path="/utilitarios/projetos" element={<ProtectedRoute><AnimatedRoute><Projects /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/utilitarios/manuais-codigos" element={<ProtectedRoute><AnimatedRoute><ManuaisCodigos /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/utilitarios/contatos-uteis" element={<ProtectedRoute><AnimatedRoute><ContatosUteis /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/utilitarios/checklist-materiais" element={<ProtectedRoute><AnimatedRoute><ChecklistMateriais /></AnimatedRoute></ProtectedRoute>} />

            
            {/* Configurações Routes */}
            <Route path="/configuracoes/senha-admin" element={<ProtectedRoute><AnimatedRoute><SenhaAdmin /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/configuracoes/informacoes-clinica" element={<ProtectedRoute><AnimatedRoute><InformacoesClinica /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/configuracoes/permissoes" element={<ProtectedRoute><AnimatedRoute><Permissoes /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/configuracoes/usuarios" element={<ProtectedRoute><AnimatedRoute><GerenciarUsuarios /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/configuracoes/seguranca" element={<ProtectedRoute><AnimatedRoute><TwoFactorSettings /></AnimatedRoute></ProtectedRoute>} />
            <Route path="/configuracoes/logs-auditoria" element={<ProtectedRoute><AnimatedRoute><LogsAuditoria /></AnimatedRoute></ProtectedRoute>} />
            
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
      </Routes>
        </React.Suspense>
    </AnimatePresence>
  );
};

const AppContent = () => {
  useRealTimeSync();

  return (
    <BrowserRouter basename="/orto/">
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  </ErrorBoundary>
);

export default App;
