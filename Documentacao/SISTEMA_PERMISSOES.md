# 🔐 Sistema de Permissões - Odonto PRO

## ✅ STATUS ATUAL

O sistema de permissões está **CORRETAMENTE IMPLEMENTADO** e funcionando.

### Como funciona:

1. **Roles disponíveis:**
   - `DEV` - Desenvolvedor (acesso total)
   - `ADMIN` - Administrador (acesso total)
   - `FINANCEIRO` - Apenas financeiro e relatórios
   - `DENTISTA` - Pode executar apenas etapas de dentista
   - `PROTETICO` - Pode executar apenas etapas de protético
   - `SECRETARIA` - Pode executar apenas etapas de secretária

2. **Controle de Etapas nos Procedimentos:**
   - ✅ **DENTISTA**: só pode executar etapas marcadas como "DENTISTA"
   - ✅ **PROTETICO**: só pode executar etapas marcadas como "PROTETICO"
   - ✅ **SECRETARIA**: só pode executar etapas marcadas como "SECRETARIA"
   - ✅ **DEV e ADMIN**: podem executar TODAS as etapas (sem restrições)

3. **Onde está implementado:**
   - `src/types/permissions.ts` - Definições e lógica de permissões
   - `src/hooks/usePermissions.ts` - Hook para acessar permissões
   - `src/components/auth/ProtectedByRole.tsx` - Componente de proteção
   - Todos os arquivos `*Detail.tsx` usam `canExecuteEtapa()`

## 🔧 Como verificar se sua conta é DEV

### Passo 1: Verificar no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor** > **user_profiles**
3. Procure por seu email
4. Verifique se a coluna `role` está como `DEV`

### Passo 2: Usar o Script SQL

Execute o arquivo: `supabase/migrations/60_verificar_atualizar_perfil_dev.sql`

```sql
-- 1. Verificar seu perfil atual
SELECT * FROM user_profiles WHERE email = 'seu_email@example.com';

-- 2. Atualizar para DEV
UPDATE user_profiles
SET role = 'DEV', updated_at = NOW()
WHERE email = 'seu_email@example.com';

-- 3. Confirmar atualização
SELECT email, nome, role FROM user_profiles WHERE role = 'DEV';
```

### Passo 3: Limpar cache e relogar

Após atualizar o perfil:

1. Faça logout do sistema
2. Limpe o cache do navegador (Ctrl + Shift + Delete)
3. Faça login novamente
4. O sistema carregará suas novas permissões

## 📋 Verificação de Funcionamento

### Procedimentos (PPR, PT/PM, FIXA)

**Com role DENTISTA:**
- ✅ Pode ver botão "Atualizar Etapa" em etapas de DENTISTA
- ❌ Vê mensagem "Esta etapa é de responsabilidade do protético" em etapas de PROTÉTICO

**Com role PROTETICO:**
- ✅ Pode ver botão "Atualizar Etapa" em etapas de PROTÉTICO
- ❌ Vê mensagem "Esta etapa é de responsabilidade do dentista" em etapas de DENTISTA

**Com role DEV ou ADMIN:**
- ✅ Pode ver botão "Atualizar Etapa" em TODAS as etapas
- ✅ Sem restrições de acesso

## 🛠️ Arquitetura do Sistema

```typescript
// permissions.ts - Função que controla acesso
export function canExecuteEtapa(
  role: UserRole,
  tipoEtapa: 'DENTISTA' | 'PROTETICO' | 'SECRETARIA'
): boolean {
  // ⭐ DEV e ADMIN podem TUDO
  if (role === 'ADMIN' || role === 'DEV') return true;

  // Demais roles precisam verificar permissões específicas
  const actionMap = {
    'DENTISTA': 'execute_etapa_dentista',
    'PROTETICO': 'execute_etapa_protetico',
    'SECRETARIA': 'execute_etapa_secretaria'
  };

  return hasActionAccess(role, actionMap[tipoEtapa]);
}
```

```typescript
// Uso nos componentes Detail
const { canExecuteEtapa } = usePermissions();

// Renderização condicional do botão
{canExecuteEtapa(etapa.responsavel) ? (
  <Button onClick={handleAtualizar}>
    Atualizar Etapa
  </Button>
) : (
  <div>Esta etapa é de responsabilidade do {etapa.responsavel.toLowerCase()}</div>
)}
```

## ⚠️ Possíveis Problemas

### Problema: "Não consigo executar etapas sendo DEV"

**Solução:**

1. Verifique seu perfil no banco: `SELECT role FROM user_profiles WHERE email = 'seu_email'`
2. Se não for 'DEV', atualize: `UPDATE user_profiles SET role = 'DEV' WHERE email = 'seu_email'`
3. Faça logout e login novamente
4. Limpe o cache do navegador

### Problema: "Alteração não surte efeito"

**Solução:**

O hook `usePermissions` tem cache de 5 minutos. Para forçar atualização:

1. Faça logout completo
2. Feche o navegador
3. Abra novamente e faça login
4. O sistema buscará o perfil atualizado

## 📊 Resumo das Permissões

| Role | Etapas DENTISTA | Etapas PROTETICO | Etapas SECRETARIA | Todas Etapas |
|------|----------------|------------------|-------------------|--------------|
| DEV | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| DENTISTA | ✅ | ❌ | ❌ | ❌ |
| PROTETICO | ❌ | ✅ | ❌ | ❌ |
| SECRETARIA | ❌ | ❌ | ✅ | ❌ |
| FINANCEIRO | ❌ | ❌ | ❌ | ❌ |

## ✅ Conclusão

O sistema de permissões está funcionando corretamente. Se você é DEV e ainda vê restrições:

1. ✅ Execute o script `60_verificar_atualizar_perfil_dev.sql`
2. ✅ Atualize seu perfil para role = 'DEV'
3. ✅ Faça logout e login novamente
4. ✅ Teste em um procedimento - você deve ver todos os botões
