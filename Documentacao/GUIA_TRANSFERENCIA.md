# 🚀 Guia de Transferência - Odonto PRO

## Para Outro Computador

### 📦 O que transferir:

**Copie APENAS estas pastas/arquivos:**
```
Odonto PRO/
├── src/                    ✅ Transferir
├── supabase/              ✅ Transferir
├── public/                ✅ Transferir
├── assets/                ✅ Transferir
├── package.json           ✅ Transferir
├── package-lock.json      ✅ Transferir
├── .gitignore             ✅ Transferir
├── .env.example           ✅ Transferir
├── index.html             ✅ Transferir
├── vite.config.ts         ✅ Transferir
├── tailwind.config.js     ✅ Transferir
├── tsconfig.json          ✅ Transferir
├── postcss.config.js      ✅ Transferir
└── *.md (documentação)    ✅ Transferir
```

**NÃO transfira:**
```
├── node_modules/          ❌ NÃO transferir (muito pesado, será reinstalado)
├── dist/                  ❌ NÃO transferir (build temporário)
├── .env                   ❌ NÃO transferir (contém credenciais)
└── *.log                  ❌ NÃO transferir
```

### 🔧 No computador de destino:

1. **Copie a pasta do projeto**
   ```bash
   # Via pendrive, rede, ou compactado
   ```

2. **Crie o arquivo `.env`**
   ```bash
   # Copie o conteúdo de .env.example
   # Preencha com suas credenciais do Supabase
   ```

3. **Instale as dependências**
   ```bash
   cd "caminho/para/Odonto PRO"
   npm install
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

---

## Para VPS (Servidor)

### Pré-requisitos na VPS:
- Ubuntu/Debian 20.04+ (recomendado)
- Node.js 18+ instalado
- NPM ou Yarn
- Git (opcional)
- Nginx ou Apache (para produção)
- Domínio configurado (opcional)

### 📡 Passo 1: Conectar na VPS

```bash
ssh usuario@ip-da-vps
```

### 📥 Passo 2: Transferir arquivos

**Opção A: Via SCP (do seu computador)**
```bash
# Compactar o projeto (sem node_modules)
tar -czf odonto-pro.tar.gz --exclude=node_modules --exclude=dist --exclude=.env .

# Transferir
scp odonto-pro.tar.gz usuario@ip-da-vps:/home/usuario/

# Na VPS, descompactar
ssh usuario@ip-da-vps
cd /home/usuario
tar -xzf odonto-pro.tar.gz -C odonto-pro
```

**Opção B: Via Git (recomendado)**
```bash
# Na VPS
cd /home/usuario
git clone seu-repositorio.git odonto-pro
cd odonto-pro
```

### ⚙️ Passo 3: Configurar na VPS

```bash
# 1. Navegar até a pasta
cd /home/usuario/odonto-pro

# 2. Instalar Node.js (se não tiver)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x

# 4. Criar arquivo .env
nano .env
```

Cole no `.env`:
```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# 5. Instalar dependências
npm install

# 6. Build para produção
npm run build
```

### 🌐 Passo 4: Configurar Nginx

```bash
# Instalar Nginx
sudo apt update
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/odonto-pro
```

Cole:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;  # ou IP da VPS

    root /home/usuario/odonto-pro/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Compressão
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Salve e ative:
```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/odonto-pro /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Habilitar no boot
sudo systemctl enable nginx
```

### 🔒 Passo 5: HTTPS com Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática já está configurada
```

### 🚀 Passo 6: Acessar

```
http://seu-dominio.com
# ou
http://ip-da-vps
```

### 🔄 Atualizar o projeto (depois de mudanças)

```bash
# Conectar na VPS
ssh usuario@ip-da-vps

# Ir para a pasta
cd /home/usuario/odonto-pro

# Puxar mudanças (se usar Git)
git pull

# Ou re-transferir arquivos via SCP

# Reinstalar dependências (se mudou package.json)
npm install

# Rebuild
npm run build

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔧 Manutenção na VPS

### Ver logs do Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Verificar status
```bash
sudo systemctl status nginx
```

### Reiniciar serviços
```bash
sudo systemctl restart nginx
```

---

## 📊 Modo Desenvolvimento na VPS (não recomendado)

Se quiser rodar em modo dev (apenas para testes):

```bash
# Instalar PM2
npm install -g pm2

# Criar script de start
echo '#!/bin/bash
cd /home/usuario/odonto-pro
npm run dev' > start-dev.sh

chmod +x start-dev.sh

# Rodar com PM2
pm2 start start-dev.sh --name odonto-pro

# Salvar configuração
pm2 save
pm2 startup
```

Acesse em: `http://ip-da-vps:3000`

---

## ✅ Checklist de Transferência

### Para outro computador:
- [ ] Copiar pasta (sem node_modules e .env)
- [ ] Criar .env no destino
- [ ] Executar `npm install`
- [ ] Executar `npm run dev`
- [ ] Testar no navegador

### Para VPS:
- [ ] VPS configurada com Node.js
- [ ] Arquivos transferidos
- [ ] .env criado com credenciais corretas
- [ ] `npm install` executado
- [ ] `npm run build` executado com sucesso
- [ ] Nginx instalado e configurado
- [ ] Site acessível via domínio/IP
- [ ] SSL configurado (opcional)

---

## ⚠️ Importante

1. **Nunca compartilhe o arquivo `.env`**
   - Contém credenciais sensíveis
   - Crie manualmente em cada ambiente

2. **node_modules/ é ENORME**
   - ~236 MB ou mais
   - Sempre reinstale com `npm install`

3. **Credenciais do Supabase**
   - Copie de https://supabase.com/dashboard
   - Settings → API
   - Use as mesmas credenciais em todos os ambientes

4. **Firewall na VPS**
   ```bash
   # Liberar portas HTTP e HTTPS
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

---

## 🆘 Problemas Comuns

### "Cannot connect to Supabase"
- Verifique se o .env está correto
- Confirme as credenciais no dashboard do Supabase

### "Port 80 already in use"
- Outro serviço está usando a porta
- Pare o Apache: `sudo systemctl stop apache2`

### "Permission denied"
- Use `sudo` para comandos de sistema
- Ou ajuste permissões: `sudo chown -R $USER:$USER /home/usuario/odonto-pro`

### Build falha
- Verifique Node.js: `node --version` (deve ser 18+)
- Limpe cache: `npm cache clean --force`
- Reinstale: `rm -rf node_modules && npm install`

---

**Pronto para transferir! 🚀**
