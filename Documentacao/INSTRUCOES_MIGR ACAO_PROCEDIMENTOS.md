# Instruções para Aplicar a Migração de Procedimentos

## Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **ebpuykdqoqkmshfwrchd**

## Passo 2: Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (ou "+ Nova Consulta")

## Passo 3: Copiar e Executar a Migração

1. Abra o arquivo: `e:\Odonto PRO\supabase\migrations\35.sql`
2. Copie **TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou "Executar" / Ctrl+Enter)

## Passo 4: Verificar se Funcionou

Após executar, você deve ver a mensagem:
```
✅ Sistema de Procedimentos Odontológicos instalado com sucesso!
```

## Passo 5: Verificar as Tabelas Criadas

No menu lateral, clique em **Table Editor** e verifique se as seguintes tabelas foram criadas:

- ✅ `dentistas` (já existente - será utilizada)
- ✅ `proteticos`
- ✅ `procedimentos_ppr`
- ✅ `historico_procedimentos`

## O que Foi Criado?

### Tabelas:
1. **dentistas** - Cadastro de dentistas (tabela existente)
2. **proteticos** - Cadastro de protéticos/técnicos
3. **procedimentos_ppr** - Procedimentos de Prótese Parcial Removível (11 etapas)
4. **historico_procedimentos** - Auditoria completa de todas as ações

### Views (Relatórios):
- `v_procedimentos_andamento` - Procedimentos em andamento
- `v_proximas_entregas` - Próximas entregas
- `v_produtividade_dentistas` - Produtividade dos dentistas
- `v_produtividade_proteticos` - Produtividade dos protéticos

### ENUMs (Tipos):
- `tipo_procedimento` - 10 tipos de procedimentos
- `status_etapa` - Status das etapas
- `tipo_arcada` - SUP, INF, SUP/INF
- `status_procedimento` - Pendente, Em andamento, Concluído

### Segurança:
- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Cada usuário só vê seus próprios dados
- ✅ Políticas de acesso configuradas

## Dados de Exemplo

A migração insere 2 protéticos de exemplo para você testar.
Os dentistas já devem estar cadastrados na tabela `dentistas` existente.

**Protéticos:**
- Carlos Protético
- Ana Técnica

## Problemas?

Se houver algum erro:

1. Verifique se você está no projeto correto (**ebpuykdqoqkmshfwrchd**)
2. Verifique se há erros de sintaxe na mensagem de erro
3. Se necessário, delete as tabelas criadas e execute novamente
4. Entre em contato se precisar de ajuda

## Próximos Passos

Após aplicar a migração com sucesso:

1. ✅ As tabelas estarão criadas
2. ✅ Os components React já estão prontos
3. ✅ O sistema estará funcionando

Basta acessar a aplicação e usar o menu "Procedimentos" para começar a cadastrar!
