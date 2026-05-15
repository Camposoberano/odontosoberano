# Odonto PRO Constitution

## Core Principles

### I. Supabase-First
Toda persistência passa pelo Supabase. RLS obrigatório em todas as tabelas. Nunca usar `supabase.auth.admin` no frontend. Nunca bypassar RLS com service_role key em produção.

### II. Generic Over Specific
`useProcedimentoGenerico` e `GenericProcedimentoListPage` são o padrão para todos os tipos de procedimento. Proibido criar hooks ou páginas específicas por tipo (ex: `useCreateProcedimentoPPR`, `NovoPPRPage`) — toda lógica de tipo entra no sistema genérico via configuração de slug/etapas.

### III. UI Defensiva (NON-NEGOTIABLE)
Toda query deve ter três estados tratados:
- **Loading**: Skeleton (`<Skeleton />` do shadcn/ui), não string `"Carregando..."`
- **Erro**: `<Alert variant="destructive">` com mensagem legível
- **Vazio**: Empty state com ícone e call-to-action

### IV. Dados Antes de Animação
Framer Motion só anima após dados carregados. Sem `<AnimatedRoute>` em páginas que mostram loading skeleton — espera os dados primeiro.

### V. Uma Identidade
- Nome oficial: **Odonto PRO**
- Proibido usar "Odonto Soberano" ou "Campo Soberano" em interfaces visíveis ao usuário
- PWA manifest e meta tags devem refletir "Odonto PRO"

### VI. Performance por Padrão
- `staleTime` global: 5 minutos (configurado no QueryClient)
- Queries de lista com dados que mudam raramente: `staleTime: 1000 * 60 * 15`
- Nunca usar `refetchOnWindowFocus: true` em dados que não mudam frequentemente
- Usar `useQueries` para múltiplas queries paralelas (padrão em `useProcedimentoGenerico`)

## Identidade Visual

- Design system: shadcn/ui + Tailwind CSS
- Paleta de cores: definida em `tailwind.config.ts` via variáveis CSS
- Ícones: Lucide React exclusivamente (proibido misturar com Heroicons ou FontAwesome)
- Componentes UI: sempre de `@/components/ui/` — nunca instalar componente externo sem discussão

## Workflow de Features

1. Criar spec em `specs/NNN-nome-feature/spec.md` (template em `.specify/templates/spec-template.md`)
2. Obter aprovação antes de implementar
3. Implementar na branch feature
4. Verificar contra checklist da constitution antes de PR

## Governance

Esta constitution tem precedência sobre todas as outras práticas. Mudanças requerem documentação e discussão explícita.

**Versão**: 1.0.0 | **Ratificado**: 2026-05-14
