# 🚀 Instalação Passo a Passo - CRM SOBERANO

## ✅ Pré-requisitos

Antes de começar, verifique se você tem instalado:

- **Node.js** (v18 ou superior) - https://nodejs.org
- **Git** (opcional) - https://git-scm.com
- **Editor de Código** - VS Code recomendado: https://code.visualstudio.com

### Verificar Instalações

Abra o terminal e execute:

```bash
node --version
# Deve mostrar: v18.x.x ou superior

npm --version
# Deve mostrar: 9.x.x ou superior
```

Se não tiver Node.js instalado:
1. Baixe em https://nodejs.org (versão LTS)
2. Instale normalmente
3. Reinicie o terminal

---

## 📦 Passo 1: Preparar o Projeto

### 1.1 Abrir Terminal na Pasta do Projeto

```bash
cd "E:\Odonto PRO"
```

### 1.2 Verificar Estrutura

Execute:
```bash
dir
# ou no PowerShell/Linux/Mac:
ls
```

Deve aparecer:
- `src/`
- `supabase/`
- `package.json`
- `README.md`
- etc.

---

## 🔧 Passo 2: Instalar Dependências

### 2.1 Inicializar NPM (se necessário)

Se não existir `package.json`, execute:

```bash
npm init -y
```

### 2.2 Instalar Todas as Dependências

Execute este comando (pode demorar alguns minutos):

```bash
npm install
```

**Se der erro de permissão no Windows:**
```bash
# Execute PowerShell como Administrador
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 2.3 Dependências que Serão Instaladas

O npm vai instalar automaticamente:
- React e React DOM
- Supabase Client
- Tailwind CSS
- TypeScript
- Vite
- Lucide Icons
- E todas as outras...

**Aguarde até aparecer:**
```
added 234 packages in 45s
```

---

## ⚙️ Passo 3: Configurar Ambiente

### 3.1 Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto:

**Windows (CMD):**
```bash
type nul > .env
```

**PowerShell:**
```bash
New-Item .env
```

**Linux/Mac:**
```bash
touch .env
```

### 3.2 Editar .env

Abra o arquivo `.env` e adicione:

```env
# Supabase (deixe vazio por enquanto, funciona local)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Ambiente
VITE_APP_ENV=development
VITE_APP_VERSION=7.4.2.12
```

**Salve o arquivo!**

---

## 🎨 Passo 4: Configurar Tailwind

### 4.1 Substituir Config do Tailwind

Execute:

```bash
# Windows (CMD)
copy tailwind.config.modern.js tailwind.config.js

# PowerShell
Copy-Item tailwind.config.modern.js tailwind.config.js

# Linux/Mac
cp tailwind.config.modern.js tailwind.config.js
```

### 4.2 Criar PostCSS Config

Crie arquivo `postcss.config.js`:

```bash
# Windows (CMD)
type nul > postcss.config.js

# PowerShell
New-Item postcss.config.js

# Linux/Mac
touch postcss.config.js
```

E adicione este conteúdo (abra no editor):

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 📄 Passo 5: Configurar Vite

### 5.1 Criar vite.config.ts

Crie o arquivo `vite.config.ts`:

```bash
# Windows (CMD)
type nul > vite.config.ts

# PowerShell
New-Item vite.config.ts

# Linux/Mac
touch vite.config.ts
```

E adicione (abra no editor):

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

---

## 📱 Passo 6: Criar Estrutura HTML

### 6.1 Criar index.html na Raiz

Crie arquivo `index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CRM SOBERANO - WhatsApp CRM</title>

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />

  <!-- Fonte Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- Meta Tags -->
  <meta name="description" content="CRM Profissional para WhatsApp Web" />
  <meta name="theme-color" content="#3B82F6" />
</head>
<body>
  <div id="root"></div>

  <!-- Detectar tema -->
  <script>
    const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    document.documentElement.classList.add(theme)
    document.documentElement.setAttribute('data-theme', theme)
  </script>

  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### 6.2 Criar src/main.tsx

Crie o arquivo de entrada:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 6.3 Criar src/App.tsx

```tsx
import React from 'react'
import { DashboardModerno } from './pages/DashboardModerno'

function App() {
  return (
    <div className="App">
      <DashboardModerno />
    </div>
  )
}

export default App
```

---

## 🚀 Passo 7: EXECUTAR!

### 7.1 Rodar em Modo Desenvolvimento

Execute:

```bash
npm run dev
```

Deve aparecer:

```
  VITE v5.0.11  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 7.2 Abrir no Navegador

O navegador deve abrir automaticamente em:
```
http://localhost:3000
```

Se não abrir, copie o link e cole no navegador.

---

## ✅ Passo 8: Testar Funcionalidades

### 8.1 Dashboard Deve Aparecer

Você deve ver:
- ✅ Header com logo "CRM SOBERANO"
- ✅ Toggle de tema (claro/escuro)
- ✅ 4 cards de métricas com gradientes
- ✅ Animações ao passar o mouse
- ✅ Layout responsivo

### 8.2 Testar Dark Mode

Clique no toggle (sol/lua) no header:
- ✅ Fundo muda para escuro
- ✅ Textos invertem cores
- ✅ Cards adaptam
- ✅ Transição suave

### 8.3 Testar Responsividade

No navegador:
1. Pressione F12 (DevTools)
2. Clique no ícone de mobile (📱)
3. Teste diferentes tamanhos

Deve funcionar em:
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)

---

## 🐛 Resolução de Problemas

### Erro: "Cannot find module '@/'"

**Solução:**
1. Verifique se existe `tsconfig.json`
2. Adicione:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Erro: "Module not found: Can't resolve 'lucide-react'"

**Solução:**
```bash
npm install lucide-react
```

### Erro: Tailwind não está funcionando

**Solução:**
1. Verifique se `tailwind.config.js` existe
2. Verifique se `globals.css` importa:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Porta 3000 já está em uso

**Solução:**
```bash
# Mude a porta no vite.config.ts
server: {
  port: 3001, // ou outra porta
}
```

### Build para Produção

```bash
npm run build
```

Gera pasta `dist/` com arquivos otimizados.

---

## 📊 Conectar com Supabase (Opcional)

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique "New Project"
3. Escolha nome, senha, região
4. Aguarde criar (2-3 minutos)

### 2. Executar SQL

1. No painel, vá em "SQL Editor"
2. Clique "New Query"
3. Cole o conteúdo de `supabase/schema.sql`
4. Clique "Run"

### 3. Copiar Credenciais

1. Vá em "Settings" → "API"
2. Copie:
   - **Project URL**
   - **anon public key**

### 4. Atualizar .env

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 5. Reiniciar

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

Agora os dados serão salvos no Supabase! 🎉

---

## 📋 Checklist de Instalação

- [ ] Node.js instalado (v18+)
- [ ] Pasta do projeto aberta no terminal
- [ ] `npm install` executado com sucesso
- [ ] Arquivo `.env` criado
- [ ] `tailwind.config.js` configurado
- [ ] `postcss.config.js` criado
- [ ] `vite.config.ts` criado
- [ ] `index.html` criado
- [ ] `src/main.tsx` criado
- [ ] `src/App.tsx` criado
- [ ] `npm run dev` rodando
- [ ] Dashboard aparecendo no navegador
- [ ] Dark mode funcionando
- [ ] Responsivo testado

---

## 🎯 Próximos Passos

1. ✅ Testar todas as funcionalidades
2. ✅ Gerar ícones PNG (ver GUIA_ASSETS.md)
3. ✅ Configurar Supabase (opcional)
4. ✅ Customizar cores e logo
5. ✅ Adicionar mais páginas

---

## 🆘 Precisa de Ajuda?

### Comandos Úteis

```bash
# Ver dependências instaladas
npm list --depth=0

# Limpar cache do npm
npm cache clean --force

# Reinstalar tudo
rm -rf node_modules package-lock.json
npm install

# Ver versão do Node
node --version

# Ver erros detalhados
npm run dev --verbose
```

### Logs

Se algo não funcionar:
1. Copie o erro completo
2. Verifique se todas as dependências foram instaladas
3. Verifique se os arquivos de config existem

---

**Tudo pronto! Agora é só rodar `npm run dev` e ver o CRM funcionando! 🚀**
