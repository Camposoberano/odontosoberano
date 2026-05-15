# 🔐 GUIA DE ROTAÇÃO DE CREDENCIAIS SUPABASE - URGENTE

## ⚠️ ATENÇÃO: AÇÃO IMEDIATA NECESSÁRIA

As credenciais do Supabase foram expostas no arquivo `.env` e podem estar comprometidas. Siga este guia IMEDIATAMENTE para proteger seu banco de dados.

---

## 🚨 FASE 1: ROTAÇÃO DE CREDENCIAIS (FAZER AGORA)

### Passo 1: Acessar o Painel do Supabase

1. Acesse https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto: **ebpuykdqoqkmshfwrchd**

### Passo 2: Resetar a API Key

1. No painel lateral, vá em **Settings** > **API**
2. Na seção "Project API keys", clique em **Reveal** para ver as chaves atuais
3. Clique no ícone de **Refresh** ou **Regenerate** ao lado do `anon/public key`
4. **IMPORTANTE**: Copie a nova chave imediatamente para um local seguro

### Passo 3: Atualizar Credenciais Localmente

1. Abra o arquivo `.env` no projeto:
   ```
   E:\Odonto PRO\.env
   ```

2. Substitua a chave antiga pela nova:
   ```env
   VITE_SUPABASE_PROJECT_ID="ebpuykdqoqkmshfwrchd"
   VITE_SUPABASE_PUBLISHABLE_KEY="<NOVA_CHAVE_AQUI>"
   VITE_SUPABASE_URL="https://ebpuykdqoqkmshfwrchd.supabase.co"
   ```

3. **Salve o arquivo**

### Passo 4: Verificar Aplicação

1. Pare o servidor se estiver rodando (Ctrl+C)
2. Execute novamente:
   ```bash
   npm run dev
   ```
3. Teste o login para garantir que está funcionando

---

## 🔒 FASE 2: PROTEÇÃO DO ARQUIVO .env

### Passo 5: Adicionar .env ao .gitignore

1. Abra o arquivo `.gitignore` na raiz do projeto
2. Certifique-se que estas linhas estão presentes:
   ```
   .env
   .env.local
   .env.*.local
   ```

### Passo 6: Remover .env do Histórico do Git

⚠️ **CUIDADO**: Isso reescreve o histórico do Git

```bash
# Remover .env do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Forçar garbage collection
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push para atualizar repositório remoto (SE APLICÁVEL)
# git push origin --force --all
```

**Alternativa Segura**: Se você usa GitHub/GitLab, considere:
- Criar um novo repositório limpo
- Fazer um commit fresh sem o .env
- Arquivar o repositório antigo

---

## 🛡️ FASE 3: CONFIGURAÇÕES DE SEGURANÇA ADICIONAIS

### Passo 7: Configurar Políticas de Segurança no Supabase

1. No painel do Supabase, vá em **Authentication** > **Policies**
2. Verifique se RLS (Row Level Security) está habilitado em todas as tabelas
3. Revise as políticas para garantir que estão restritivas

### Passo 8: Ativar Autenticação Multifator (Recomendado)

1. Vá em **Settings** > **Security**
2. Ative a autenticação de dois fatores (2FA) na sua conta Supabase
3. Configure notificações de segurança

### Passo 9: Revisar Logs de Acesso

1. Vá em **Logs** no painel do Supabase
2. Verifique se há acessos suspeitos recentes
3. Revise APIs chamadas de IPs desconhecidos

---

## 📝 FASE 4: BOAS PRÁTICAS FUTURAS

### Checklist de Segurança

- [ ] Nunca commitar arquivos `.env` no Git
- [ ] Usar variáveis de ambiente diferentes para dev/staging/prod
- [ ] Rotacionar credenciais a cada 90 dias
- [ ] Manter backup das credenciais em gerenciador de senhas
- [ ] Documentar todas as mudanças de credenciais
- [ ] Implementar monitoramento de segurança (Sentry, LogRocket)
- [ ] Configurar alertas de acesso não autorizado

### Arquivo .env.example

Crie um arquivo `.env.example` (SEM valores reais) para documentação:

```env
# Copie este arquivo para .env e preencha com suas credenciais

VITE_SUPABASE_PROJECT_ID="seu-project-id-aqui"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica-aqui"
VITE_SUPABASE_URL="https://seu-project-id.supabase.co"
```

---

## 🔍 VERIFICAÇÃO FINAL

### Confirme que:

1. ✅ Nova API key foi gerada no Supabase
2. ✅ Arquivo `.env` local foi atualizado
3. ✅ Aplicação está funcionando com novas credenciais
4. ✅ `.env` está no `.gitignore`
5. ✅ `.env` foi removido do histórico do Git
6. ✅ RLS está habilitado no Supabase
7. ✅ 2FA está ativado na conta Supabase
8. ✅ Logs foram revisados

---

## 📞 SUPORTE

Se você encontrar problemas:

1. **Erro de conexão**: Verifique se copiou a API key completa
2. **Auth não funciona**: Limpe cache do navegador e tente novamente
3. **Erro de permissão**: Revise políticas RLS no Supabase

### Links Úteis

- [Documentação Supabase - Security](https://supabase.com/docs/guides/auth)
- [Best Practices - API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ⏰ PRÓXIMA ROTAÇÃO

- **Data recomendada**: 90 dias após hoje
- **Lembrete**: Configure um alarme de calendário para rotacionar em: **{DATA + 90 dias}**

---

**Status**: ⚠️ PENDENTE - Execute este guia IMEDIATAMENTE

**Última atualização**: 2025-12-04
