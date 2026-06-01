# Instituto Belém — Regras do Projeto

## ⚠️ BANCO DE DADOS — REGRA CRÍTICA

Este projeto usa o Supabase **self-hosted do Instituto Belém**:

- **URL**: `https://bancodedados.institutobelem.com`
- **MCP correto**: `supabase-institutobelem` (definido em `.mcp.json`)

### NUNCA usar:
- `mcp__claude_ai_bancode_dados_supabse` → este é o banco do **Soberano/OdontoPRO** (`bancodedados.soberano.pro`) — **banco errado, projeto diferente**
- `mcp__claude_ai_Supabase` → Supabase cloud, precisa de `project_id`, não serve para self-hosted

### Verificação antes de qualquer operação no banco:
Antes de executar SQL ou migrations, confirme que o endpoint é `bancodedados.institutobelem.com`.
Se o MCP `supabase-institutobelem` não estiver disponível, use a API REST diretamente:
```
URL: https://bancodedados.institutobelem.com
apikey: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3ODk1Mzc0MCwiZXhwIjo0OTM0NjI3MzQwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.A_qxjhvNBYROjpT8Pwu7lOxGyZtN-ByU18n-WZRxjG4
```
Exemplo: `node -e "const https = require('https'); ..."`

## Stack

- **Frontend**: React + TypeScript + Vite, base path `/inst.belem/`
- **Backend**: Supabase self-hosted (PostgreSQL + Storage + Auth)
- **Deploy**: Coolify em `187.127.28.228`
- **UI**: shadcn/ui, Tailwind, identidade visual dourado `#f8cc72` + preto `#010101`

## Comandos principais

```bash
npm run dev      # dev server
npm run build    # build produção (dist/)
npx tsc --noEmit # check TypeScript
```

## Migrações

Arquivos em `supabase/migrations/`. Aplicar via MCP `supabase-institutobelem` ou API REST direta.
Numeração sequencial: último = verificar pasta.
