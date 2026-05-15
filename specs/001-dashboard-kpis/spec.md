# Feature Specification: Dashboard com KPIs em Tempo Real

**Feature Branch**: `001-dashboard-kpis`
**Criado**: 2026-05-14
**Status**: Draft

## User Stories

### User Story 1 — KPIs Visíveis no Dashboard (Priority: P1)

O dentista/administrador abre o sistema e imediatamente vê os indicadores mais importantes da clínica sem navegar para outra página.

**Por que P1**: O dashboard é a primeira tela após login. Se não mostrar dados úteis, o usuário vai para outra seção.

**Teste Independente**: Acessar `/dashboard` com dados no Supabase → ver 4 cards com valores reais.

**Acceptance Scenarios**:

1. **Given** usuário logado com pacientes cadastrados, **When** acessa `/dashboard`, **Then** vê card "Pacientes Ativos" com contagem correta
2. **Given** existem agendamentos para hoje, **When** acessa `/dashboard`, **Then** vê card "Agendamentos Hoje" com total, confirmados e pendentes
3. **Given** contas recebidas neste mês, **When** acessa `/dashboard`, **Then** vê card "Faturamento Mensal" com valor formatado em R$
4. **Given** query em andamento, **When** dados ainda não carregaram, **Then** vê skeleton nos cards, não texto "Carregando..."

---

### User Story 2 — Navegação pelos Cards (Priority: P2)

Clicar num card do dashboard navega para a seção detalhada correspondente.

**Acceptance Scenarios**:

1. **Given** card "Pacientes Ativos", **When** clica, **Then** navega para `/patients`
2. **Given** card "Agendamentos Hoje", **When** clica, **Then** navega para `/appointments`
3. **Given** card "Faturamento Mensal", **When** clica, **Then** navega para `/financeiro/contas-receber`

---

### User Story 3 — Dados Frescos via Supabase Realtime (Priority: P3)

Os KPIs atualizam automaticamente quando outro usuário adiciona um paciente ou agendamento.

**Acceptance Scenarios**:

1. **Given** dashboard aberto, **When** outro usuário cadastra paciente no Supabase, **Then** contador de pacientes atualiza sem refresh manual

---

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE exibir contagem de pacientes com `status = 'Ativo'` do `user_id` logado
- **FR-002**: Sistema DEVE exibir agendamentos do dia atual (00:00 → 23:59 do timezone local)
- **FR-003**: Sistema DEVE exibir soma de `contas_receber.valor` onde `status = 'Recebida'` e `data_recebimento` no mês atual
- **FR-004**: Todos os cards DEVEM mostrar skeleton durante loading (Constitution Princípio III)
- **FR-005**: Cards DEVEM ser clicáveis e navegar para a seção correspondente

### Key Entities

- **pacientes**: `id`, `user_id`, `status` ('Ativo' | 'Inativo')
- **agendamentos**: `id`, `user_id`, `data_agendamento`, `status` ('Agendado' | 'Confirmado' | 'Cancelado' | 'Realizado')
- **contas_receber**: `id`, `user_id`, `valor`, `status` ('Recebida' | 'Pendente'), `data_recebimento`

## Success Criteria

- **SC-001**: Dashboard carrega dados reais em menos de 3 segundos com conexão normal
- **SC-002**: Skeleton aparece em menos de 100ms após mount (antes dos dados chegarem)
- **SC-003**: Clicar em qualquer card navega para a página correta
- **SC-004**: Com `staleTime: 5min`, navegar para outra página e voltar NÃO refaz as queries

## Assumptions

- Supabase está configurado e RLS permite `select` nas tabelas para o `user_id` logado
- `useDashboardStats.ts` já tem a lógica de queries — este spec é para melhorar a UI que consome o hook
- Timezone: Brasília (UTC-3) — usar `date-fns` já instalado
- Hook já existente: `src/hooks/useDashboardStats.ts`
- Dashboard existente: `src/pages/Dashboard.tsx` (auditar e melhorar)
