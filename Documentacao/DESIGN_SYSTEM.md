# 🎨 CRM SOBERANO - Design System Profissional

## 🎯 Identidade Visual

### Paleta de Cores Principal

```css
/* Cores Primárias - Azul Profissional */
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* Principal */
--primary-600: #2563EB;
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;

/* Cores Secundárias - Verde Sucesso */
--success-50: #F0FDF4;
--success-100: #DCFCE7;
--success-500: #22C55E;
--success-600: #16A34A;

/* Alertas */
--warning-50: #FFFBEB;
--warning-500: #F59E0B;
--warning-600: #D97706;

--danger-50: #FEF2F2;
--danger-500: #EF4444;
--danger-600: #DC2626;

/* Neutros - Cinzas Modernos */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Gradientes Modernos */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-success: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
--gradient-premium: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--gradient-dark: linear-gradient(135deg, #434343 0%, #000000 100%);
```

### Tipografia

```css
/* Fontes Profissionais */
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'Roboto',
  'Oxygen',
  'Ubuntu',
  sans-serif;

/* Tamanhos */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Pesos */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Sombras Modernas

```css
/* Sombras Suaves */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Sombras Coloridas */
--shadow-primary: 0 10px 40px -10px rgba(59, 130, 246, 0.4);
--shadow-success: 0 10px 40px -10px rgba(34, 197, 94, 0.4);
--shadow-danger: 0 10px 40px -10px rgba(239, 68, 68, 0.4);
```

### Bordas e Raios

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

### Espaçamento

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## 🌗 Tema Dark/Light

### Modo Claro (padrão)

```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;

  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;

  --border-primary: #E5E7EB;
  --border-secondary: #D1D5DB;

  --overlay: rgba(0, 0, 0, 0.5);
}
```

### Modo Escuro

```css
[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;

  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --text-tertiary: #9CA3AF;

  --border-primary: #374151;
  --border-secondary: #4B5563;

  --overlay: rgba(0, 0, 0, 0.8);
}
```

---

## 🎨 Componentes Visuais

### Cards Premium

```tsx
// Card com gradiente sutil
<div className="
  bg-white dark:bg-gray-800
  rounded-2xl
  shadow-xl
  border border-gray-100 dark:border-gray-700
  overflow-hidden
  transition-all duration-300
  hover:shadow-2xl hover:-translate-y-1
">
  {/* Linha superior colorida */}
  <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

  {/* Conteúdo */}
  <div className="p-6">
    ...
  </div>
</div>
```

### Botões Modernos

```tsx
// Botão Primary com gradiente
<button className="
  px-6 py-3
  bg-gradient-to-r from-blue-600 to-purple-600
  text-white font-semibold
  rounded-xl
  shadow-lg shadow-blue-500/50
  hover:shadow-xl hover:shadow-blue-500/60
  hover:scale-105
  transition-all duration-300
  focus:outline-none focus:ring-4 focus:ring-blue-500/30
">
  Criar Pedido
</button>

// Botão Glass Morphism
<button className="
  px-6 py-3
  bg-white/10 dark:bg-gray-800/10
  backdrop-blur-lg
  border border-white/20
  text-gray-900 dark:text-white
  rounded-xl
  hover:bg-white/20
  transition-all duration-300
">
  Filtrar
</button>
```

### Badges Modernos

```tsx
// Badge com ponto animado
<span className="
  inline-flex items-center gap-2
  px-3 py-1.5
  bg-gradient-to-r from-green-50 to-emerald-50
  dark:from-green-900/20 dark:to-emerald-900/20
  text-green-700 dark:text-green-300
  text-sm font-medium
  rounded-full
  border border-green-200 dark:border-green-800
">
  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
  Online
</span>
```

### Inputs Premium

```tsx
<div className="relative group">
  <input
    className="
      w-full px-4 py-3
      bg-gray-50 dark:bg-gray-800
      border-2 border-gray-200 dark:border-gray-700
      rounded-xl
      text-gray-900 dark:text-white
      placeholder-gray-400
      transition-all duration-300
      focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900
      focus:ring-4 focus:ring-blue-500/20
      focus:outline-none
    "
    placeholder="Buscar clientes..."
  />

  {/* Ícone com animação */}
  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
    <SearchIcon />
  </div>
</div>
```

### Avatares Premium

```tsx
<div className="relative">
  {/* Avatar com gradiente */}
  <div className="
    w-16 h-16
    rounded-2xl
    bg-gradient-to-br from-blue-500 to-purple-600
    flex items-center justify-center
    text-white text-xl font-bold
    shadow-lg shadow-blue-500/50
    ring-4 ring-white dark:ring-gray-800
  ">
    JD
  </div>

  {/* Status com animação */}
  <span className="
    absolute -bottom-1 -right-1
    w-5 h-5
    bg-green-500
    rounded-full
    border-4 border-white dark:border-gray-800
    animate-pulse
  "></span>
</div>
```

---

## 📊 Dashboard Moderno

### Layout Glass Morphism

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

  {/* Header com Blur */}
  <header className="
    sticky top-0 z-50
    bg-white/80 dark:bg-gray-900/80
    backdrop-blur-xl
    border-b border-gray-200/50 dark:border-gray-700/50
    shadow-sm
  ">
    <div className="px-6 py-4">
      {/* Logo e Menu */}
    </div>
  </header>

  {/* Conteúdo */}
  <main className="p-6">
    {/* Grid de Cards */}
  </main>
</div>
```

### Cards de Métricas Animados

```tsx
<div className="
  group
  bg-white dark:bg-gray-800
  rounded-2xl
  p-6
  shadow-lg
  border border-gray-100 dark:border-gray-700
  hover:shadow-2xl
  hover:border-blue-500/50
  transition-all duration-500
  hover:-translate-y-2
  cursor-pointer
">
  {/* Gradiente superior */}
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>

  <div className="flex items-start justify-between">
    {/* Valor */}
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
        Total de Vendas
      </p>
      <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        R$ 45.230
      </h3>

      {/* Trend */}
      <div className="flex items-center gap-2 mt-2">
        <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
          <ArrowUpIcon className="w-4 h-4" />
          23%
        </span>
        <span className="text-xs text-gray-400">vs mês anterior</span>
      </div>
    </div>

    {/* Ícone */}
    <div className="
      w-14 h-14
      bg-gradient-to-br from-blue-500 to-purple-600
      rounded-2xl
      flex items-center justify-center
      text-white
      shadow-lg shadow-blue-500/50
      group-hover:scale-110 group-hover:rotate-3
      transition-all duration-500
    ">
      <DollarIcon className="w-7 h-7" />
    </div>
  </div>

  {/* Gráfico mini */}
  <div className="mt-4 h-16 opacity-50 group-hover:opacity-100 transition-opacity">
    {/* MiniChart aqui */}
  </div>
</div>
```

---

## 🎯 Animações e Transições

### Animações CSS

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide In */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Pulse Slow */
@keyframes pulseSlow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Shimmer (Loading) */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f8f8f8 20%,
    #f0f0f0 40%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 🖼️ Ícones e Logo

### Especificações do Ícone

```
Tamanhos necessários:
- 16x16px (favicon)
- 32x32px (favicon)
- 48x48px (extensão)
- 128x128px (Chrome Web Store)
- 256x256px (alta resolução)
- 512x512px (marketing)
- 1024x1024px (App Store)

Formato: PNG com fundo transparente
Estilo: Moderno, minimalista, flat design
Cores: Gradiente azul-roxo (#3B82F6 → #8B5CF6)
```

### Conceito da Logo

```
CRM SOBERANO

Elementos:
1. Símbolo: Coroa estilizada (soberano) + Chat bubble (WhatsApp)
2. Gradiente: Azul profissional → Roxo premium
3. Tipografia: Sans-serif moderna, bold
4. Versões: Full color, Monocromática, Branca, Preta
```

Vou criar o código SVG da logo no próximo arquivo...

---

## 💼 Componentes Profissionais Extras

### Sidebar Lateral Moderna

```tsx
<aside className="
  w-72
  h-screen
  bg-white dark:bg-gray-900
  border-r border-gray-200 dark:border-gray-700
  flex flex-col
">
  {/* Header */}
  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-3">
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
        CS
      </div>
      <div>
        <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CRM SOBERANO
        </h1>
        <p className="text-xs text-gray-500">v7.4.2.12</p>
      </div>
    </div>
  </div>

  {/* Menu */}
  <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
    {/* Item de menu ativo */}
    <a href="#" className="
      flex items-center gap-3
      px-4 py-3
      bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20
      text-blue-600 dark:text-blue-400
      rounded-xl
      font-medium
      border-l-4 border-blue-600
    ">
      <DashboardIcon />
      Dashboard
    </a>

    {/* Item de menu normal */}
    <a href="#" className="
      flex items-center gap-3
      px-4 py-3
      text-gray-600 dark:text-gray-400
      rounded-xl
      font-medium
      hover:bg-gray-50 dark:hover:bg-gray-800
      transition-all duration-200
    ">
      <UsersIcon />
      Clientes
    </a>
  </nav>

  {/* Footer */}
  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-3">
      <Avatar />
      <div className="flex-1">
        <p className="font-medium text-sm">João Silva</p>
        <p className="text-xs text-gray-500">Administrador</p>
      </div>
      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <SettingsIcon />
      </button>
    </div>
  </div>
</aside>
```

### Tabela Moderna

```tsx
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          Cliente
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          Valor
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <Avatar />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                João Silva
              </div>
              <div className="text-sm text-gray-500">
                joao@email.com
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Badge variant="success">Ativo</Badge>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900 dark:text-white">
          R$ 1.234,56
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

Continuo criando os arquivos de implementação...
