# ✅ PROBLEMA RESOLVIDO - Permissões de ADMIN

## 📋 Resumo do Problema

**Situação:** Usuário estava como ADMIN no banco de dados do Supabase, mas o sistema continuava reconhecendo como SECRETARIA e bloqueando acesso às etapas de procedimentos.

**Sintoma:**
- ❌ Não conseguia atualizar etapas de DENTISTA ou PROTÉTICO
- ❌ Via apenas etapas de SECRETARIA
- ❌ Erro 406 (Not Acceptable) ao buscar perfil

## 🔍 Causa Raiz

**Row Level Security (RLS)** estava bloqueando a leitura do próprio perfil do usuário.

### Detalhes Técnicos:

1. **Política RLS Problemática:**
   - A política "Users can view own profile" estava com problema
   - Impedia que o usuário lesse seu próprio perfil da tabela `user_profiles`
   - Causava erro HTTP 406 na requisição

2. **Comportamento do Sistema:**
   - Quando a query falhava (erro 406), o hook `usePermissions` usava perfil padrão: SECRETARIA
   - Com role SECRETARIA, a função `canExecuteEtapa()` bloqueava acesso às etapas de outros roles
   - Por isso mesmo sendo ADMIN no banco, o sistema via como SECRETARIA

## 🔧 Solução Aplicada

### 1. Corrigir Política RLS

```sql
-- Remover política problemática
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Criar política correta
CREATE POLICY "Users can view own profile v2"
ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);
```

### 2. Ajustes no Código

**Arquivo:** `src/hooks/usePermissions.ts`
- ✅ Removido cache excessivo (staleTime: 1 minuto)
- ✅ Limpeza de console.logs de debug

**Arquivo:** `src/types/permissions.ts`
- ✅ Removido console.logs de debug
- ✅ Mantida lógica: `if (role === 'ADMIN' || role === 'DEV') return true;`

**Arquivo:** `src/pages/procedimentos/FixaDetail.tsx`
- ✅ Removido componente DebugPermissoes

## ✅ Resultado

Agora o sistema funciona corretamente:

1. ✅ ADMIN consegue ler seu próprio perfil
2. ✅ Hook `usePermissions` retorna role correto (ADMIN)
3. ✅ Função `canExecuteEtapa()` permite acesso a TODAS as etapas
4. ✅ Botões "Atualizar Etapa" aparecem em todas as etapas
5. ✅ ADMIN pode executar etapas de DENTISTA, PROTÉTICO e SECRETARIA

## 📊 Como Funciona Agora

### Hierarquia de Permissões:

| Role | Etapas DENTISTA | Etapas PROTETICO | Etapas SECRETARIA |
|------|----------------|------------------|-------------------|
| **ADMIN** | ✅ Acesso Total | ✅ Acesso Total | ✅ Acesso Total |
| **DEV** | ✅ Acesso Total | ✅ Acesso Total | ✅ Acesso Total |
| DENTISTA | ✅ Apenas suas | ❌ Bloqueado | ❌ Bloqueado |
| PROTETICO | ❌ Bloqueado | ✅ Apenas suas | ❌ Bloqueado |
| SECRETARIA | ❌ Bloqueado | ❌ Bloqueado | ✅ Apenas suas |

### Fluxo de Verificação:

```typescript
// 1. usePermissions busca perfil do Supabase
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();

// 2. Retorna role (ex: 'ADMIN')
role = data.role; // 'ADMIN'

// 3. canExecuteEtapa verifica permissão
if (role === 'ADMIN' || role === 'DEV') {
  return true; // ✅ LIBERA ACESSO
}
```

## 🛡️ Políticas RLS Corretas

### user_profiles:

```sql
-- Política para usuário ver próprio perfil
CREATE POLICY "Users can view own profile v2"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Política para ADMIN ver todos os perfis
CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('ADMIN', 'DEV')
  )
);
```

## 📝 Lições Aprendidas

1. **RLS pode bloquear leituras mesmo de próprio perfil** - sempre testar políticas
2. **Erro 406 geralmente indica problema de RLS** - verificar políticas primeiro
3. **Cache de React Query pode mascarar problemas** - desabilitar temporariamente para debug
4. **Console.logs são essenciais para debug** - adicionar temporariamente para rastrear fluxo
5. **ADMIN e DEV devem ser equivalentes** - simplifica manutenção

## 🎯 Comandos de Verificação

### Verificar perfil atual:
```sql
SELECT email, role FROM user_profiles WHERE user_id = auth.uid();
```

### Testar RLS:
```sql
SELECT * FROM user_profiles WHERE user_id = auth.uid();
-- Se retornar vazio, RLS está bloqueando
```

### Ver todas as políticas:
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';
```

## ✅ Status Final

- ✅ Problema identificado: RLS bloqueando leitura de perfil
- ✅ Solução aplicada: Política RLS corrigida
- ✅ Sistema testado e funcionando
- ✅ Código limpo (removidos logs e componentes de debug)
- ✅ Documentação criada

---

**Data:** 2025-01-26
**Resolvido por:** Claude Code
**Tempo para resolução:** ~2 horas de debug
