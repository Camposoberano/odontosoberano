# Design System — Instituto Belém
## Referência: Simples Dental

---

## 1. LAYOUT GERAL

```
┌─────────────────────────────────────────┐  height: 50px
│              TOPBAR                      │  background: #2196F3
├───────┬─────────────────────────────────┤
│       │                                 │
│ SIDE  │     ÁREA DE CONTEÚDO           │
│  BAR  │     background: #EBEBEB        │
│ 70px  │     margin-left: 70px          │
│       │                                 │
└───────┴─────────────────────────────────┘
```

- **Topbar**: height 50px, largura total
- **Sidebar**: width 70px, fixa, só ícones (sem labels), tooltip no hover
- **Conteúdo**: background `rgba(0,0,0,0.08)` ≈ `#EBEBEB`

---

## 2. PALETA DE CORES

| Elemento | Cor | Hex |
|---|---|---|
| Topbar background | Azul primário | `#2196F3` |
| Sidebar background | Branco | `#FFFFFF` |
| Página de fundo | Cinza suave | `#EBEBEB` |
| Card / tabela | Branco | `#FFFFFF` |
| Botão primário "Novo" | Verde | `#50AE54` |
| CTA destaque | Verde escuro | `#3C823F` |
| Item ativo sidebar | Azul claro (bg) | `#E6F4FF` |
| Ícone ativo sidebar | Azul médio | `#1F8CE3` |
| Ícones inativos | Cinza médio | `#696969` |
| Texto principal | Preto quase opaco | `rgba(0,0,0,0.87)` |
| Texto secundário | Cinza médio | `#696969` |
| WhatsApp ativo | Verde WhatsApp | `#129909` |
| Badge notificação | Vermelho | `#DF2020` |
| Link azul | Azul | `#33A4F2` |

---

## 3. TOPBAR

- Background: `#2196F3`
- Height: `50px`
- Conteúdo (esq → dir):
  - Ícone hambúrguer (branco)
  - Ícone dente / logo (branco)
  - Breadcrumb `"Instituto Belém > [Página]"` — branco, 16px
  - `flex: 1` (espaço)
  - Botão "Novidades" — `#3C823F`, border-radius 8px
  - Ícone notificações (branco) + badge vermelho
  - Avatar + nome usuário (branco)

---

## 4. SIDEBAR

- Width: `70px` fixo
- Background: `#FFFFFF`
- Item: `41×44px`, ícone centralizado `24×24px`
- Sem texto — só ícones com tooltip no hover
- Item ativo: background `#E6F4FF`, ícone `#1F8CE3`
- Item inativo: ícone `#696969`

---

## 5. CARDS

- Background: `#FFFFFF`
- Border-radius: `8px`
- Box-shadow: sutil (`0 1px 3px rgba(0,0,0,0.12)`)
- Padding: `16px`

---

## 6. ABA TRATAMENTOS — ESTRUTURA

### Layout (2 painéis side-by-side)
- **Esquerda (70%)**: Formulário + Odontograma + Lista de Tratamentos
- **Direita (30%)**: Evoluções

### Formulário "Adicionar Tratamento"

| Campo | Tipo | Obrigatório |
|---|---|---|
| Plano | autocomplete | Sim |
| Tratamento | autocomplete + busca | Sim |
| Dentes/Região | dropdown | Não |
| Valor | input monetário | Sim |
| Profissional | autocomplete | Sim |

Botão **ADICIONAR TRATAMENTO** — `#50AE54`, exibido após Tratamento preenchido.

### Dentes/Região — Opções
- Permanentes: 11–18, 21–28, 31–38, 41–48
- Decíduos: 51–55, 61–65, 71–75, 81–85
- Regiões: Maxila, Mandíbula, Face, Arcada Superior, Arcada Inferior, Arcadas

---

## 7. ODONTOGRAMA

### Permanentes
```
Maxila:    18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
Mandíbula: 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
```

### Decíduos
```
Superior: 55 54 53 52 51 | 61 62 63 64 65
Inferior: 85 84 83 82 81 | 71 72 73 74 75
```

### Filtros visuais
- ☑ Aberto (laranja)
- ☑ Finalizado (verde)
- Anotações (alerta)

---

## 8. MODAL "ADICIONAR EVOLUÇÃO"

| Campo | Tipo | Detalhe |
|---|---|---|
| Profissional | Autocomplete | Pré-preenchido |
| Data | Datepicker | Default: hoje |
| Evolução | Rich Text (TinyMCE) | Bold, listas, undo/redo |
| Imagens | Upload | Máx. 6 |

IA no editor: transcrição por voz, melhoria de texto.

---

## 9. PROCEDIMENTOS CADASTRADOS (40)

Harmonização: Bichectomia, Bioestimulador, Fios PDO, Preenchimentos (malar, mandíbula, mento, olheiras, marionete, bigode chinês, fossa canina, labial, têmporas), Skinbooster, Subcision, Toxina botulínica, Lipo papada

Odontologia: Consultas (inicial, retorno, auditoria), Restaurações, Placa clareamento, Coroas (metalo-cerâmica, cerâmica pura, metálica, acrílica, cerômero, metalo-plástica, policarbonato adulto/decíduo)

---

## 10. IMPLEMENTAÇÃO — ORDEM SUGERIDA

1. [ ] Aplicar paleta de cores no `index.css` / `tailwind.config.ts`
2. [ ] Redesenhar Topbar (azul `#2196F3`, 50px)
3. [ ] Redesenhar Sidebar (70px, só ícones, tooltip)
4. [ ] Ajustar background de conteúdo (`#EBEBEB`)
5. [ ] Estilizar Cards (branco, shadow suave)
6. [ ] Botões: primário verde `#50AE54`
7. [ ] Atualizar catálogo de procedimentos com os 40 listados
8. [ ] Configurar banco Coolify + migrations
9. [ ] Criar usuário admin (`agrovittairece@gmail.com`)
