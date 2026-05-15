# 📋 Mapeamento dos Novos Tipos de Procedimentos

**Criado em:** 2025-12-04
**Objetivo:** Documentar a estrutura de cada novo tipo de procedimento a ser implementado

---

## 🎯 Tipos a Implementar

1. **RESINA IMPRESSA** (5 etapas)
2. **CERAMICA ORTOVITAL** (11 etapas)
3. **PLACA DE BRUXISMO/CLAREAMENTO** (8 etapas)
4. **PROVISÓRIO/ADESIVA** (9 etapas)
5. **LAB MAURICIO** (Laboratório Externo - 11 etapas)

---

## 1️⃣ RESINA IMPRESSA

### Informações Básicas:
- **Campo adicional:** DENTE

### Etapas (5):

| # | Etapa | Responsável | Tem Agenda? | Campos |
|---|-------|-------------|-------------|---------|
| 1 | ESCANER | PROTETICO | Não | status, data, executor |
| 2 | EXOCAD | PROTETICO | Não | status, data, executor |
| 3 | IMPRESSÃO | PROTETICO | Não | status, data, executor |
| 4 | MAQUIAGEM | PROTETICO | Não | status, data, executor |
| 5 | Paciente 3 (Prova Final) | DENTISTA | Sim | status, data, agenda, executor |

### Estrutura da Tabela:
```sql
CREATE TABLE procedimentos_resina_impressa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id),
    data_inicial DATE NOT NULL,
    dente VARCHAR(100),
    dentista_id UUID REFERENCES dentistas(id),
    protetico_id BIGINT REFERENCES proteticos(id),
    status_geral status_procedimento DEFAULT 'Pendente',
    data_entrega DATE,

    -- ETAPA 1: ESCANER
    escaner_status status_etapa DEFAULT 'Pendente',
    escaner_data DATE,
    escaner_executor_id BIGINT,
    escaner_executado_em TIMESTAMP,
    escaner_executado_por VARCHAR(255),

    -- ETAPA 2: EXOCAD
    exocad_status status_etapa DEFAULT 'Pendente',
    exocad_data DATE,
    exocad_executor_id BIGINT,
    exocad_executado_em TIMESTAMP,
    exocad_executado_por VARCHAR(255),

    -- ETAPA 3: IMPRESSÃO
    impressao_status status_etapa DEFAULT 'Pendente',
    impressao_data DATE,
    impressao_executor_id BIGINT,
    impressao_executado_em TIMESTAMP,
    impressao_executado_por VARCHAR(255),

    -- ETAPA 4: MAQUIAGEM
    maquiagem_status status_etapa DEFAULT 'Pendente',
    maquiagem_data DATE,
    maquiagem_executor_id BIGINT,
    maquiagem_executado_em TIMESTAMP,
    maquiagem_executado_por VARCHAR(255),

    -- ETAPA 5: Paciente 3
    paciente3_status status_etapa DEFAULT 'Pendente',
    paciente3_data DATE,
    paciente3_agenda DATE,
    paciente3_executor_id UUID,
    paciente3_executado_em TIMESTAMP,
    paciente3_executado_por VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2️⃣ CERAMICA ORTOVITAL

### Informações Básicas:
- **Campo adicional:** DENTE, COPIA (tipo: ESCANEAMENTO ou MOLDAGEM)

### Etapas (11):

| # | Etapa | Responsável | Tem Agenda? | Campos |
|---|-------|-------------|-------------|---------|
| 1 | ESCANER | PROTETICO | Não | status, data, executor |
| 2 | EXOCAD | PROTETICO | Não | status, data, executor |
| 3 | IMP RES CALCINAVEL | PROTETICO | Não | status, data, executor |
| 4 | MOLDAGEM | DENTISTA | Não | status, data, executor |
| 5 | VG (Vazamento Gesso) | PROTETICO | Não | status, data, executor |
| 6 | ENCERAMENTO | PROTETICO | Não | status, data, executor |
| 7 | QUEIMA DE CERAMICA | PROTETICO | Não | status, data, executor |
| 8 | INJEÇÃO | PROTETICO | Não | status, data, executor |
| 9 | MAQUIAGEM | PROTETICO | Não | status, data, executor |
| 10 | Paciente 3 (Prova Final) | DENTISTA | Sim | status, data, agenda, executor |

---

## 3️⃣ PLACA DE BRUXISMO/CLAREAMENTO

### Informações Básicas:
- **Campo adicional:** ARCADA (SUP/INF), COPIA (tipo: ESCANEAMENTO ou MOLDAGEM)

### Etapas (8):

| # | Etapa | Responsável | Tem Agenda? | Campos |
|---|-------|-------------|-------------|---------|
| 1 | ESCANER | PROTETICO | Não | status, data, executor |
| 2 | EXOCAD | PROTETICO | Não | status, data, executor |
| 3 | IMPRESSÃO | PROTETICO | Não | status, data, executor |
| 4 | MOLDAGEM | DENTISTA | Não | status, data, executor |
| 5 | VG (Vazamento Gesso) | PROTETICO | Não | status, data, executor |
| 6 | CONFECÇÃO DE PLACA | PROTETICO | Não | status, data, executor |
| 7 | Paciente 3 (Prova Final) | DENTISTA | Sim | status, data, agenda, executor |

---

## 4️⃣ PROVISÓRIO/ADESIVA

### Informações Básicas:
- **Campo adicional:** DENTE, COPIA (tipo: ESCANEAMENTO ou MOLDAGEM)

### Etapas (9):

| # | Etapa | Responsável | Tem Agenda? | Campos |
|---|-------|-------------|-------------|---------|
| 1 | ESCANER | PROTETICO | Não | status, data, executor |
| 2 | EXOCAD | PROTETICO | Não | status, data, executor |
| 3 | IMPRESSÃO | PROTETICO | Não | status, data, executor |
| 4 | MAQUIAGEM | PROTETICO | Não | status, data, executor |
| 5 | MOLDAGEM | DENTISTA | Não | status, data, executor |
| 6 | VG (Vazamento Gesso) | PROTETICO | Não | status, data, executor |
| 7 | MONTAGEM DE DENTE | PROTETICO | Não | status, data, executor |
| 8 | Paciente 2 (Prova) | DENTISTA | Sim | status, data, agenda, executor |

---

## 5️⃣ LAB MAURICIO (Laboratório Externo)

### Informações Básicas:
- **Campo adicional:** ARCADA

### Etapas (11):

| # | Etapa | Responsável | Tem Agenda? | Campos |
|---|-------|-------------|-------------|---------|
| 1 | ESCANER | PROTETICO | Não | status, data, executor |
| 2 | ENVIO DE ARQUIVO | SECRETARIA | Não | status, data, executor |
| 3 | MOLDAGEM | DENTISTA | Não | status, data, executor |
| 4 | VG (Vazamento Gesso) | PROTETICO | Não | status, data, executor |
| 5 | ENV LAB (Envio Lab) | SECRETARIA | Não | status, data, executor |
| 6 | REC DO LAB COPPING | SECRETARIA | Não | status, data, executor |
| 7 | PROVA DE COPING | DENTISTA | Sim | status, data, agenda, executor |
| 8 | ENVIO DE LB (Envio Lab) | SECRETARIA | Não | status, data, executor |
| 9 | RECEBIMENTO LAB | SECRETARIA | Não | status, data, executor |
| 10 | Paciente 3 (Prova Final) | DENTISTA | Sim | status, data, agenda, executor |

---

## 📋 Padrão de Implementação

### Para CADA tipo, criar:

1. **Migration SQL** (`supabase/migrations/XXX_criar_[tipo].sql`)
   - Tabela com todas as etapas
   - RLS policies
   - Triggers de auditoria
   - Índices

2. **Hook customizado** (`src/hooks/use[Tipo].ts`)
   - useListar[Tipo]()
   - use[Tipo](os)
   - useCreate[Tipo]()
   - useUpdate[Tipo]()
   - useDelete[Tipo]()
   - useUpdateEtapa[Tipo]()

3. **Arquivo de tipos** (`src/types/[tipo].ts`)
   - Interface do procedimento
   - Array de etapas (ETAPAS_[TIPO])
   - Tipos auxiliares

4. **Componente de Formulário** (`src/pages/procedimentos/Novo[Tipo].tsx`)
   - Formulário de criação
   - Validação Zod
   - Select de dentista/protético
   - Campos específicos (dente, arcada, etc)

5. **Componente de Listagem** (`src/pages/procedimentos/[Tipo]ListPage.tsx`)
   - Tabela com todos os procedimentos
   - Filtros e busca
   - Botão para criar novo

6. **Componente de Detalhes** (`src/pages/procedimentos/[Tipo]Detail.tsx`)
   - Visualização completa
   - Cards de etapas
   - Edição inline de etapas
   - Controle de permissões

7. **Rotas** (`src/App.tsx`)
   - `/procedimentos/[tipo]` - listagem
   - `/procedimentos/[tipo]/novo` - criar
   - `/procedimentos/[tipo]/:os` - detalhes

8. **Integração**
   - Adicionar no `useTodosProcedimentos.ts`
   - Adicionar no Dashboard
   - Adicionar no TodosProcedimentos

---

## 🎨 Cores por Tipo (para UI)

```typescript
const CORES_TIPOS = {
  'PPR': 'bg-blue-100 text-blue-800 border-blue-300',
  'PT/PM': 'bg-purple-100 text-purple-800 border-purple-300',
  'FIXA': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'PROT. PROV': 'bg-amber-100 text-amber-800 border-amber-300',
  'PROT. DEF': 'bg-rose-100 text-rose-800 border-rose-300',
  'RESINA IMPRESSA': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'CERAMICA': 'bg-pink-100 text-pink-800 border-pink-300',
  'PLACA': 'bg-lime-100 text-lime-800 border-lime-300',
  'PROVISORIO': 'bg-orange-100 text-orange-800 border-orange-300',
  'LAB EXTERNO': 'bg-indigo-100 text-indigo-800 border-indigo-300',
};
```

---

## ✅ Checklist de Implementação

Para cada tipo:
- [ ] Migration SQL criada e testada
- [ ] Hook customizado implementado
- [ ] Tipos TypeScript definidos
- [ ] Formulário de criação funcionando
- [ ] Listagem funcionando
- [ ] Detalhes e edição de etapas funcionando
- [ ] Rotas adicionadas
- [ ] Integrado no Dashboard
- [ ] Integrado no hook unificado
- [ ] Testado fluxo completo

---

## 🚀 Ordem de Implementação Sugerida

1. **RESINA IMPRESSA** (mais simples - 5 etapas)
2. **PLACA DE BRUXISMO/CLAREAMENTO** (8 etapas)
3. **PROVISÓRIO/ADESIVA** (9 etapas)
4. **CERAMICA ORTOVITAL** (11 etapas)
5. **LAB MAURICIO** (11 etapas, mais complexo)

---

**Status:** 📝 Documentação completa
**Próximo passo:** Criar migrations SQL
