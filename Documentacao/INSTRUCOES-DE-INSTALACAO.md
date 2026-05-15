# 📦 Instruções de Instalação - Tema News Soberano

## 🎯 Passo a Passo para Instalar no Hostinger

### 1️⃣ Baixar o Arquivo
Você já tem o arquivo `news-soberano.zip` pronto!

### 2️⃣ Acessar o WordPress
1. Entre no painel do Hostinger
2. Acesse o WordPress do seu site (jornal.camposoberano.com.br/wp-admin)
3. Faça login com suas credenciais

### 3️⃣ Instalar o Tema
1. No painel do WordPress, vá em: **Aparência → Temas**
2. Clique no botão **"Adicionar novo"** (no topo)
3. Clique no botão **"Enviar tema"** (no topo)
4. Clique em **"Escolher arquivo"**
5. Selecione o arquivo `news-soberano.zip`
6. Clique em **"Instalar agora"**
7. Aguarde o upload e instalação
8. Clique em **"Ativar"**

### 4️⃣ Configuração Inicial

#### Configurar o Logo
1. Vá em: **Aparência → Personalizar**
2. Clique em **"Identidade do site"**
3. Clique em **"Selecionar logo"**
4. Faça upload do logo do jornal
5. Clique em **"Publicar"**

#### Configurar o Menu
1. Vá em: **Aparência → Menus**
2. Crie um novo menu ou edite o existente
3. Adicione as páginas e categorias que desejar
4. Em "Configurações do menu", marque **"Menu Principal"**
5. Clique em **"Salvar menu"**

#### Configurar a Sidebar
1. Vá em: **Aparência → Widgets**
2. Arraste widgets para **"Sidebar Principal"**:
   - Posts Populares (News Soberano) - mostra notícias mais lidas
   - Categorias - mostra categorias do site
   - Pesquisa - campo de busca

#### Configurar o Rodapé
1. Ainda em **Aparência → Widgets**
2. Arraste widgets para **"Rodapé 1"**, **"Rodapé 2"** e **"Rodapé 3"**
3. Sugestões:
   - Rodapé 1: Texto/HTML com informações do jornal
   - Rodapé 2: Menu de navegação ou categorias
   - Rodapé 3: Redes sociais ou informações de contato

### 5️⃣ Ajustes de Performance

#### WP Rocket (Já Integrado)
1. Vá em: **Configurações → WP Rocket**
2. Na aba **"Cache"**: Ative cache de página
3. Na aba **"Otimização de arquivos"**:
   - Ative "Minificar arquivos CSS"
   - Ative "Minificar arquivos JavaScript"
4. Na aba **"Mídia"**: Ative "LazyLoad para imagens"
5. Clique em **"Salvar alterações"**

#### Rank Math SEO (Já Integrado)
1. Vá em: **Rank Math → Títulos e Metas**
2. Configure títulos para posts e páginas
3. Vá em: **Rank Math → Sitemap**
4. Ative o sitemap XML
5. Vá em: **Rank Math → Geral → Breadcrumbs**
6. Ative os breadcrumbs

### 6️⃣ Personalização de Cores

1. Vá em: **Aparência → Personalizar**
2. Clique em **"Cores do Tema"**
3. Ajuste o verde e marrom conforme preferir
4. As cores padrão já estão configuradas de acordo com o seu logo:
   - Verde: `#2d5016`
   - Marrom: `#6b4423`

### 7️⃣ Criar Post em Destaque

Para definir uma notícia como destaque na homepage:

1. Edite o post que deseja destacar
2. Role até o final da página de edição
3. Procure por **"Campos personalizados"**
4. Adicione um novo campo:
   - Nome: `_is_ns_featured`
   - Valor: `1`
5. Clique em **"Atualizar"**

**Dica:** Apenas um post deve estar marcado como destaque por vez!

### 8️⃣ Ativar AMP (Opcional mas Recomendado)

1. Vá em: **Plugins → Adicionar novo**
2. Busque por "AMP"
3. Instale o plugin oficial **"AMP"** da Automattic
4. Ative o plugin
5. Vá em: **AMP → Configurações**
6. Selecione modo **"Paired"** (Emparelhado)
7. O tema já tem suporte completo ao AMP!

## ✅ Checklist Final

- [ ] Tema instalado e ativado
- [ ] Logo configurado
- [ ] Menu principal criado
- [ ] Sidebar com widgets
- [ ] Rodapé configurado
- [ ] WP Rocket otimizado
- [ ] Rank Math configurado
- [ ] Cores personalizadas (se necessário)
- [ ] Post em destaque definido
- [ ] AMP instalado (opcional)

## 🎨 Recursos do Tema

### ✨ Funcionalidades Principais
- ✅ Design moderno estilo G1
- ✅ Cores verde e marrom personalizadas
- ✅ Totalmente responsivo (mobile-first)
- ✅ Modo escuro/claro (botão no header)
- ✅ Otimizado para SEO
- ✅ Suporte completo a AMP
- ✅ Lazy loading de imagens
- ✅ Sistema de posts populares
- ✅ Posts relacionados automáticos
- ✅ Compartilhamento social
- ✅ Tempo de leitura estimado
- ✅ Contador de visualizações
- ✅ Breadcrumbs integrados
- ✅ Comentários estilizados
- ✅ Busca com modal
- ✅ Botão "Voltar ao topo"

### 📱 Performance
- Otimizado para Core Web Vitals
- Compatível com WP Rocket
- CSS e JS minificados
- Carregamento progressivo de imagens
- Prefetch de links

### 🔍 SEO
- Schema.org markup
- Open Graph tags
- Twitter Cards
- Compatível com Rank Math
- URLs amigáveis
- Sitemap ready

## 🆘 Problemas Comuns

### As cores não aparecem
**Solução:** Limpe o cache do WP Rocket:
1. Vá em **WP Rocket → Limpar cache**
2. Limpe também o cache do navegador (Ctrl + F5)

### Menu mobile não funciona
**Solução:** Verifique se o JavaScript está ativo:
1. Verifique o console do navegador (F12)
2. Desative outros plugins que possam conflitar

### Imagens não carregam
**Solução:**
1. Verifique se as imagens têm tamanhos adequados
2. No WP Rocket, desative o lazy load se estiver duplicado

### AMP não funciona
**Solução:**
1. Instale o plugin AMP oficial
2. Ative o modo "Paired"
3. Teste acessando: `jornal.camposoberano.com.br/post-exemplo/?amp=1`

## 📞 Precisa de Ajuda?

Se tiver qualquer problema durante a instalação:
1. Revise este guia passo a passo
2. Verifique se todos os plugins recomendados estão instalados
3. Limpe o cache do site e do navegador

---

**Tema:** News Soberano v1.0.0
**Desenvolvido para:** Jornal Campo Soberano
**Data:** Dezembro 2025
