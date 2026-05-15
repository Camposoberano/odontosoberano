# 🔍 Como Verificar Suas Permissões de ADMIN

## ⚡ Confirmação Importante

**ADMIN JÁ TEM ACESSO TOTAL!** ✅

O código em `src/types/permissions.ts` linha 128:
```typescript
if (role === 'ADMIN' || role === 'DEV') return true;
```

Isso significa que **ADMIN = DEV** em termos de permissões!

---

## 🎯 Passo 1: Verificar no Navegador (Método Rápido)

### Adicione o Componente de Debug

1. Abra: `src/pages/procedimentos/FixaDetail.tsx`

2. Adicione o import no topo:
```typescript
import { DebugPermissoes } from '@/components/debug/DebugPermissoes';
```

3. Adicione o componente logo após o primeiro `<div className="p-4 sm:p-6">`:
```tsx
<div className="p-4 sm:p-6">
  {/* COMPONENTE DE DEBUG - REMOVER DEPOIS */}
  <DebugPermissoes />

  {/* resto do código... */}
```

4. Salve e acesse qualquer procedimento FIXA

5. Você verá um card roxo mostrando:
   - ✅ Seu role atual
   - ✅ Se pode executar cada tipo de etapa
   - ✅ Diagnóstico completo

6. **IMPORTANTE:** Remova o componente depois de verificar!

---

## 🔧 Passo 2: Verificar no Banco (Se ainda não funcionar)

Execute no Supabase:

```sql
-- 1. Ver seu perfil atual
SELECT email, nome, role, ativo
FROM user_profiles
WHERE email = 'seu_email@example.com'; -- SUBSTITUA

-- 2. Se não estiver como ADMIN, atualize:
UPDATE user_profiles
SET role = 'ADMIN', ativo = true, updated_at = NOW()
WHERE email = 'seu_email@example.com'; -- SUBSTITUA

-- 3. Confirme a atualização
SELECT email, nome, role
FROM user_profiles
WHERE role = 'ADMIN';
```

---

## 🔄 Passo 3: Limpar Cache

Após atualizar o perfil:

1. Faça **logout** do sistema
2. Feche **completamente** o navegador
3. Abra novamente
4. Faça **login**
5. O sistema buscará o perfil atualizado

---

## 📊 O Que Você Deve Ver

### ✅ Se Estiver Como ADMIN (Correto):

**No Componente de Debug:**
- ✅ Role: ADMIN
- ✅ É Admin/Dev: SIM ✅
- ✅ Executar etapas de DENTISTA: SIM ✅
- ✅ Executar etapas de PROTÉTICO: SIM ✅
- ✅ Executar etapas de SECRETARIA: SIM ✅

**Nos Procedimentos:**
- Verá botão "Atualizar Etapa" em TODAS as etapas
- Nenhuma mensagem de "responsabilidade do..."

### ❌ Se NÃO Estiver Como ADMIN:

**No Componente de Debug:**
- ❌ Role: DENTISTA/PROTETICO/SECRETARIA
- ❌ É Admin/Dev: NÃO ❌
- ⚠️ Diagnóstico mostrará aviso

**Nos Procedimentos:**
- Verá mensagem "Esta etapa é de responsabilidade do..."
- Botões bloqueados em certas etapas

---

## 🔐 Tabela de Permissões

| Característica | DEV | ADMIN | Outros Roles |
|---------------|-----|-------|--------------|
| Etapas DENTISTA | ✅ | ✅ | Apenas DENTISTA |
| Etapas PROTÉTICO | ✅ | ✅ | Apenas PROTETICO |
| Etapas SECRETARIA | ✅ | ✅ | Apenas SECRETARIA |
| Acesso Total | ✅ | ✅ | ❌ |
| São Equivalentes | ✅ | ✅ | ❌ |

**CONCLUSÃO:** DEV e ADMIN são **EXATAMENTE IGUAIS** em permissões!

---

## 🐛 Solução de Problemas

### "Ainda vejo restrições sendo ADMIN"

**Causa:** Perfil não está como ADMIN no banco OU cache não atualizou

**Solução:**
1. Execute o script SQL do Passo 2
2. Faça logout COMPLETO
3. Feche o navegador
4. Limpe cache (Ctrl + Shift + Delete)
5. Abra e faça login novamente

### "Componente de debug não aparece"

**Causa:** Erro de import ou sintaxe

**Solução:**
1. Verifique se criou o arquivo: `src/components/debug/DebugPermissoes.tsx`
2. Verifique o import: `import { DebugPermissoes } from '@/components/debug/DebugPermissoes';`
3. Adicione corretamente: `<DebugPermissoes />`
4. Veja o console do navegador (F12) para erros

### "Perfil está ADMIN mas não funciona"

**Causa:** Cache do React Query (5 minutos)

**Solução:**
1. Aguarde 5 minutos OU
2. Faça logout e login novamente OU
3. Recarregue a página com Ctrl + F5 (hard reload)

---

## ✅ Checklist Final

- [ ] Adicionei o componente DebugPermissoes
- [ ] Verifiquei que meu role é ADMIN
- [ ] Vejo todas as permissões como ✅
- [ ] Posso executar TODAS as etapas
- [ ] Removi o componente DebugPermissoes após verificar

---

## 📝 Notas Importantes

1. **ADMIN = DEV** em permissões (código comprova isso)
2. O problema NÃO é no código (já está correto)
3. O problema é apenas certificar que seu perfil está ADMIN
4. Após confirmar, o componente de debug pode ser removido

---

**Se após tudo isso ainda tiver problemas, me avise com:**
- Print do componente DebugPermissoes
- Print do resultado da query SQL
- Descrição exata do que não funciona
