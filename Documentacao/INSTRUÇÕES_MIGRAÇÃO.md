# 🚀 Como Executar a Migração no Supabase

## ⚠️ IMPORTANTE
Você precisa executar esta migração para permitir múltiplos procedimentos na mesma OS!

---

## 📋 Passo a Passo

### 1️⃣ Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto **Odonto Soberano**

### 2️⃣ Abra o SQL Editor
- No menu lateral esquerdo, clique em **SQL Editor**
- Clique no botão **New Query** (ou **+ New query**)

### 3️⃣ Cole o SQL
- Abra o arquivo: `EXECUTAR_NO_SUPABASE.sql`
- Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
- Cole no editor SQL do Supabase (Ctrl+V)

### 4️⃣ Execute
- Clique no botão **Run** (ou pressione Ctrl+Enter)
- Aguarde alguns segundos

### 5️⃣ Verifique o Resultado
Você deve ver estas mensagens:

```
✅ mensagem: "Migração aplicada com sucesso!"
✅ informacao: "Agora você pode criar múltiplos procedimentos para a mesma OS"
```

E uma tabela mostrando as constraints:

```
constraint_name: unique_procedimento_completo
definition: UNIQUE NULLS NOT DISTINCT (ordem_servico, nome_paciente, arcada, dente)
```

---

## ✅ Após Executar

Você poderá:

### ANTES (❌ Bloqueado):
- OS 12 → Procedimento 1 ✅
- OS 12 → Procedimento 2 ❌ ERRO!

### DEPOIS (✅ Permitido):
- OS 12 → João → SUP → Dente 11 ✅
- OS 12 → João → INF → Dente 31 ✅ (arcada diferente)
- OS 12 → João → SUP → Dente 12 ✅ (dente diferente)
- OS 12 → Maria → SUP → Dente 11 ✅ (paciente diferente)

### BLOQUEADO (❌ Duplicata Exata):
- OS 12 → João → SUP → Dente 11 (primeira vez) ✅
- OS 12 → João → SUP → Dente 11 (segunda vez) ❌ DUPLICATA!

---

## 🆘 Problemas?

### Erro: "permission denied"
- Certifique-se de estar logado como owner do projeto
- Verifique se tem permissões de administrador

### Erro: "constraint already exists"
- Tudo bem! Significa que já foi executado antes
- Pode pular esta etapa

### Erro: "column does not exist"
- A migração detecta e cria automaticamente
- Execute novamente

---

## 📞 Suporte

Se tiver dúvidas:
1. Tire um print do erro
2. Cole aqui no chat
3. Vou te ajudar! 😊
