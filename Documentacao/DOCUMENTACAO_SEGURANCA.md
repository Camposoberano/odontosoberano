# 🔐 DOCUMENTAÇÃO DE SEGURANÇA - Odonto PRO

**Versão:** 2.0
**Última Atualização:** 2025-12-04
**Status:** ✅ Produção Ready

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Segurança](#arquitetura-de-segurança)
3. [Autenticação e Autorização](#autenticação-e-autorização)
4. [Validação de Dados](#validação-de-dados)
5. [Proteção contra Vulnerabilidades](#proteção-contra-vulnerabilidades)
6. [Sistema de Auditoria](#sistema-de-auditoria)
7. [Rate Limiting](#rate-limiting)
8. [Row Level Security (RLS)](#row-level-security-rls)
9. [Boas Práticas Implementadas](#boas-práticas-implementadas)
10. [Checklist de Segurança](#checklist-de-segurança)
11. [Incidentes e Resposta](#incidentes-e-resposta)
12. [Compliance e Regulamentação](#compliance-e-regulamentação)

---

## 🎯 VISÃO GERAL

O Odonto PRO implementa múltiplas camadas de segurança para proteger dados sensíveis de pacientes e operações da clínica odontológica. Este documento descreve todas as medidas de segurança implementadas e como utilizá-las corretamente.

### Princípios de Segurança

- **Defesa em Profundidade**: Múltiplas camadas de proteção
- **Privilégio Mínimo**: Usuários têm apenas as permissões necessárias
- **Segurança por Design**: Segurança integrada desde o desenvolvimento
- **Auditoria Completa**: Todas ações críticas são registradas
- **Validação em Camadas**: Cliente e servidor validam dados

---

## 🏗️ ARQUITETURA DE SEGURANÇA

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
├─────────────────────────────────────────────────────────┤
│  • Validação Zod                                         │
│  • Sanitização de Inputs                                 │
│  • Rate Limiting                                         │
│  • Error Boundary                                        │
│  • XSS Protection                                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓ HTTPS
                 │
┌────────────────┴────────────────────────────────────────┐
│               SUPABASE (Backend)                         │
├─────────────────────────────────────────────────────────┤
│  • Autenticação JWT                                      │
│  • Row Level Security (RLS)                              │
│  • Triggers de Auditoria                                 │
│  • Políticas de Acesso                                   │
│  • Validação de Constraints                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 AUTENTICAÇÃO E AUTORIZAÇÃO

### Autenticação

**Método:** Supabase Auth (JWT tokens)

**Configuração de Senha:**
```typescript
Requisitos:
- Mínimo: 12 caracteres ✅
- Maiúsculas: Obrigatório ✅
- Minúsculas: Obrigatório ✅
- Números: Obrigatório ✅
- Caracteres Especiais: Obrigatório ✅
```

**Implementação:**
```typescript
// src/pages/Auth.tsx:86-100
if (password.length < 12) {
  setError('A senha deve ter pelo menos 12 caracteres');
  return;
}

// Validação de complexidade (OWASP)
const hasUpperCase = /[A-Z]/.test(password);
const hasLowerCase = /[a-z]/.test(password);
const hasNumbers = /\d/.test(password);
const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
```

**Sessões:**
- Duração: Configurável no Supabase
- Refresh automático de tokens
- Logout limpa todo o estado local

### Autorização

**Sistema de Roles:**
```typescript
type Role = 'ADMIN' | 'DEV' | 'DENTISTA' | 'SECRETARIA' | 'FINANCEIRO';
```

**Hierarquia de Permissões:**
1. **ADMIN** - Acesso total ao sistema
2. **DEV** - Acesso de desenvolvimento e debugging
3. **DENTISTA** - Acesso a procedimentos e pacientes
4. **SECRETARIA** - Acesso a agendamentos e cadastros
5. **FINANCEIRO** - Acesso a módulo financeiro

**Verificação de Permissões:**
```sql
-- Função otimizada no banco de dados
CREATE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND (
      role IN ('ADMIN', 'DEV')
      OR permissions ? permission_name
    )
  );
$$;
```

**Componente de Proteção de Rotas:**
```typescript
// src/components/auth/ProtectedRoute.tsx
<ProtectedRoute requiredRole="ADMIN">
  <AdminPanel />
</ProtectedRoute>
```

---

## ✅ VALIDAÇÃO DE DADOS

### Frontend (Zod)

**Schema de Validação de Pacientes:**
```typescript
// src/components/pacientes/PacienteForm.tsx:46-71
const pacienteSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .toLowerCase()
    .trim(),

  cpf: z.string()
    .optional()
    .refine(val => !val || isValidCPF(val), 'CPF inválido'),

  telefone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .regex(/^[\d\s()+-]+$/, 'Telefone inválido'),
});
```

**Validação de CPF:**
```typescript
// Algoritmo oficial brasileiro implementado
// src/components/pacientes/PacienteForm.tsx:13-43
const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  // ... validação completa dos dígitos verificadores
};
```

### Sanitização de Inputs

**Proteção contra XSS:**
```typescript
// src/components/pacientes/PacienteForm.tsx:124-130
const sanitizeInput = (value: string): string => {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};
```

**Aplicação:**
```typescript
const sanitizedData = {
  ...formData,
  nome: sanitizeInput(formData.nome),
  email: sanitizeInput(formData.email).toLowerCase(),
  endereco: sanitizeInput(formData.endereco),
};

const validatedData = pacienteSchema.parse(sanitizedData);
```

---

## 🛡️ PROTEÇÃO CONTRA VULNERABILIDADES

### XSS (Cross-Site Scripting)

**Medidas Implementadas:**

1. ✅ **Sanitização de Inputs** (todos os formulários)
2. ✅ **React Auto-Escaping** (padrão do React)
3. ✅ **Validação Zod** (antes de processar dados)
4. ✅ **DOMPurify Ready** (suporte para conteúdo HTML se necessário)

**Exemplo de Proteção:**
```typescript
// ❌ PERIGOSO (não usado)
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ SEGURO (usado)
<div>{sanitizeInput(userInput)}</div>
```

### SQL Injection

**Proteção:**
- ✅ **Supabase Client** (prepared statements automáticos)
- ✅ **Row Level Security** (políticas no banco)
- ✅ **Validação de tipos** (TypeScript + Zod)

**Exemplo Seguro:**
```typescript
// Supabase usa prepared statements internamente
const { data } = await supabase
  .from('pacientes')
  .select('*')
  .eq('cpf', userInputCPF); // ✅ Seguro contra SQL injection
```

### CSRF (Cross-Site Request Forgery)

**Proteção:**
- ✅ **JWT Tokens** (no header Authorization)
- ✅ **SameSite Cookies** (configurado no Supabase)
- ✅ **Origin Validation** (CORS configurado)

### Brute Force

**Proteção:**
- ✅ **Rate Limiting** (frontend + backend)
- ✅ **Login Attempts Tracking** (auditoria)
- ✅ **Account Lockout** (após 5 tentativas)

---

## 📊 SISTEMA DE AUDITORIA

### Tabela de Auditoria

**Schema:**
```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_role TEXT,
  action VARCHAR(50), -- INSERT, UPDATE, DELETE, LOGIN, LOGOUT
  table_name VARCHAR(100),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tabelas Monitoradas:**
```
✅ pacientes
✅ user_profiles
✅ dentistas
✅ funcionarios
✅ procedimentos_ppr
✅ procedimentos_pt_pm
✅ procedimentos_fixa
✅ protocolo_provisorio
✅ protocolo_definitivo
✅ contas_pagar
✅ contas_receber
```

**Triggers Automáticos:**
```sql
-- Exemplo de trigger
CREATE TRIGGER audit_pacientes
  AFTER INSERT OR UPDATE OR DELETE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();
```

**Auditoria de Login/Logout:**
```typescript
// src/contexts/AuthContext.tsx:59-75
// Login
await supabase.rpc('log_audit', {
  p_action: 'LOGIN',
  p_table_name: 'auth.users',
  p_record_id: data.user.id,
  p_new_data: { email, timestamp }
});

// Logout
await supabase.rpc('log_audit', {
  p_action: 'LOGOUT',
  p_table_name: 'auth.users',
  p_record_id: currentUser.id,
  p_old_data: { email, timestamp }
});
```

**Interface Web:**
- Acesso: `/configuracoes/logs-auditoria`
- Permissão: Apenas ADMIN e DEV
- Recursos:
  - Filtros por ação, tabela, usuário
  - Busca em tempo real
  - Exportação CSV
  - Paginação eficiente

**Retenção de Logs:**
```sql
-- Função para limpar logs antigos
SELECT public.cleanup_old_audit_logs(365); -- Manter 1 ano
```

---

## ⏱️ RATE LIMITING

### Implementação Frontend

**Hook Personalizado:**
```typescript
// src/hooks/useRateLimit.ts
const { checkRateLimit, getRemainingAttempts } = useLoginRateLimit();

if (!checkRateLimit()) {
  return; // Bloqueado
}
```

**Configurações por Contexto:**

| Contexto | Max Tentativas | Janela de Tempo | Bloqueio |
|----------|----------------|-----------------|----------|
| **Login** | 5 | 5 minutos | 5 minutos |
| **Formulários** | 10 | 1 minuto | 1 minuto |
| **Busca** | 20 | 1 minuto | 1 minuto |
| **API Externa** | 30 | 1 minuto | 1 minuto |

**Hooks Especializados:**
```typescript
// Login (anti brute-force)
const { checkRateLimit } = useLoginRateLimit();

// Formulários (anti spam)
const { checkRateLimit } = useFormRateLimit();

// Busca (anti sobrecarga)
const { checkRateLimit } = useSearchRateLimit();

// API (respeitar limites)
const { checkRateLimit } = useApiRateLimit();
```

**Exemplo de Uso:**
```typescript
// src/pages/Auth.tsx:58-61
if (!checkRateLimit()) {
  return; // Toast automático informa bloqueio
}
```

**Feedback ao Usuário:**
```
❌ "Muitas tentativas de login. Por segurança,
    aguarde 5 minutos antes de tentar novamente."

⏳ "Tentativas restantes: 3"

⏱️ "Bloqueado por 287 segundos"
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Políticas Otimizadas

**Funções Auxiliares:**
```sql
-- Verificar se é ADMIN ou DEV (cache otimizado)
CREATE FUNCTION public.is_admin_or_dev()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE  -- Cache durante a transação
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('ADMIN', 'DEV')
  );
$$;

-- Verificar permissão específica
CREATE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND (
      role IN ('ADMIN', 'DEV')
      OR permissions ? permission_name
    )
  );
$$;
```

**Exemplo de Políticas:**

```sql
-- PACIENTES
-- SELECT: Todos autenticados podem ver
CREATE POLICY "optimized_select_pacientes" ON public.pacientes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT: Precisa de permissão
CREATE POLICY "optimized_insert_pacientes" ON public.pacientes
  FOR INSERT WITH CHECK (
    public.has_permission('cadastro_pacientes')
    OR public.is_admin_or_dev()
  );

-- DELETE: Apenas ADMINs
CREATE POLICY "optimized_delete_pacientes" ON public.pacientes
  FOR DELETE USING (public.is_admin());
```

**Índices para Performance:**
```sql
-- Busca rápida de role
CREATE INDEX idx_user_profiles_user_id_role
  ON public.user_profiles(user_id, role);

-- Verificação rápida de ADMINs
CREATE INDEX idx_user_profiles_role
  ON public.user_profiles(role)
  WHERE role IN ('ADMIN', 'DEV');
```

---

## ✅ BOAS PRÁTICAS IMPLEMENTADAS

### OWASP Top 10 (2021)

| Vulnerabilidade | Status | Implementação |
|-----------------|--------|---------------|
| A01 - Broken Access Control | ✅ | RLS + Role-based auth |
| A02 - Cryptographic Failures | ✅ | HTTPS + JWT + Supabase |
| A03 - Injection | ✅ | Prepared statements + validação |
| A04 - Insecure Design | ✅ | Security by design |
| A05 - Security Misconfiguration | ✅ | .env protegido + configs |
| A06 - Vulnerable Components | ⚠️ | npm audit (4 vuln) |
| A07 - Auth Failures | ✅ | Senha forte + rate limit |
| A08 - Software & Data Integrity | ✅ | Auditoria completa |
| A09 - Logging Failures | ✅ | Sistema de auditoria |
| A10 - SSRF | ✅ | Sem requests externos |

### LGPD (Lei Geral de Proteção de Dados)

**Conformidade:**

✅ **Consentimento**: Sistema de permissões
✅ **Acesso**: Pacientes podem ver seus dados
✅ **Correção**: Edição de dados implementada
✅ **Exclusão**: Soft delete com auditoria
✅ **Portabilidade**: Exportação de dados
✅ **Auditoria**: Registro completo de acessos
✅ **Segurança**: Múltiplas camadas de proteção

**Recomendações Adicionais:**
- ⚠️ Implementar termo de consentimento explícito
- ⚠️ Adicionar funcionalidade de "Direito ao Esquecimento"
- ⚠️ Criar relatório de dados pessoais por paciente

---

## 📋 CHECKLIST DE SEGURANÇA

### Deploy

```bash
☐ Rotacionar credenciais Supabase
☐ Verificar .env não está no Git
☐ Executar migrações do banco
☐ Testar login/logout
☐ Verificar RLS habilitado
☐ Revisar políticas de acesso
☐ Configurar CORS adequadamente
☐ Habilitar HTTPS
☐ Configurar rate limiting no backend
☐ Revisar logs de auditoria
☐ Fazer backup do banco
☐ Documentar credenciais em gerenciador seguro
```

### Manutenção Regular

```bash
☐ Revisar logs de auditoria (semanal)
☐ Atualizar dependências (mensal)
☐ Rotacionar credenciais (trimestral)
☐ Revisar permissões de usuários (trimestral)
☐ Fazer backup completo (semanal)
☐ Testar recuperação de backup (mensal)
☐ Executar npm audit (semanal)
☐ Limpar logs antigos (anual)
```

### Desenvolvimento

```bash
✅ Validar inputs com Zod
✅ Sanitizar dados do usuário
✅ Usar componentes com máscara
✅ Adicionar rate limiting em forms
✅ Implementar Error Boundary
✅ Não logar dados sensíveis
✅ Usar HTTPS em dev
✅ Revisar políticas RLS
✅ Testar com diferentes roles
✅ Documentar mudanças de segurança
```

---

## 🚨 INCIDENTES E RESPOSTA

### Plano de Resposta a Incidentes

**1. Detecção**
- Monitorar logs de auditoria diariamente
- Alertas automáticos (TODO: Implementar Sentry)
- Relatórios de usuários

**2. Contenção**
- Bloquear conta suspeita imediatamente
- Rotacionar credenciais comprometidas
- Isolar sistema se necessário

**3. Erradicação**
- Identificar e corrigir vulnerabilidade
- Atualizar dependências afetadas
- Aplicar patches de segurança

**4. Recuperação**
- Restaurar dados de backup se necessário
- Verificar integridade do sistema
- Monitorar atividade pós-incidente

**5. Lições Aprendidas**
- Documentar incidente
- Atualizar procedimentos
- Treinar equipe

### Contatos de Emergência

```
Administrador do Sistema: [PREENCHER]
DPO (LGPD): [PREENCHER]
Suporte Supabase: https://supabase.com/support
```

---

## 📜 COMPLIANCE E REGULAMENTAÇÃO

### LGPD (Brasil)

**Artigos Relevantes:**
- Art. 7º - Base Legal
- Art. 8º - Consentimento
- Art. 18º - Direitos do Titular
- Art. 46º - Segurança da Informação

**Implementação:**
- ✅ Dados sensíveis protegidos (RLS)
- ✅ Registro de operações (auditoria)
- ✅ Acesso controlado (roles)
- ⚠️ TODO: Termo de consentimento
- ⚠️ TODO: Portal do titular

### CFM (Conselho Federal de Medicina)

**Resolução CFM nº 1.821/2007:**
- ✅ Prontuário eletrônico protegido
- ✅ Backup regular de dados
- ✅ Auditoria de acessos
- ✅ Confidencialidade garantida

---

## 🔗 REFERÊNCIAS

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [React Security Best Practices](https://react.dev/learn/security)

---

## 📝 HISTÓRICO DE MUDANÇAS

### v2.0 (2025-12-04)
- ✅ Sistema de auditoria completo
- ✅ Rate limiting implementado
- ✅ Políticas RLS otimizadas
- ✅ Validação Zod com sanitização
- ✅ Senha forte (12+ caracteres OWASP)
- ✅ Error Boundary
- ✅ Componentes de loading padronizados
- ✅ Máscaras de input
- ✅ Auditoria de login/logout

### v1.0 (Anterior)
- Autenticação básica
- RLS básico
- Validação HTML

---

**Última Revisão:** 2025-12-04
**Próxima Revisão:** 2025-03-04 (trimestral)
**Responsável:** Equipe de Desenvolvimento

---

## 📞 SUPORTE

Para questões de segurança, contate:
- Email: [security@odontopro.com]
- Emergências: [telefone]
- Horário: 24/7

**⚠️ IMPORTANTE:** Nunca compartilhe credenciais ou tokens por email ou chat não criptografado.
