# 🔧 Guia de Solução de Problemas - YouTube Organizer

## Visão Geral

Este guia ajuda a diagnosticar e resolver problemas comuns no YouTube Organizer. Está organizado por categoria e inclui soluções passo-a-passo para os problemas mais frequentes.

## 🚀 Problemas de Inicialização

### Aplicação Não Inicia

#### Sintomas
- Erro ao executar `npm run dev`
- Porta 3000 já em uso
- Erros de dependências

#### Soluções

**1. Verificar Porta Disponível**
```bash
# Verificar se porta 3000 está em uso
netstat -ano | findstr :3000

# Matar processo usando a porta (Windows)
taskkill /PID <PID> /F

# Ou usar porta alternativa
npm run dev -- -p 3001
```

**2. Limpar Cache e Node Modules**
```bash
# Remover node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Limpar cache npm
npm cache clean --force

# Reinstalar dependências
npm install
```

**3. Verificar Node.js Version**
```bash
# Verificar versão
node --version
npm --version

# Se versão incorreta, instalar Node.js 18+
# Windows: https://nodejs.org/
# macOS: brew install node
# Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

#### Logs de Erro Comuns
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solução:** Liberar porta 3000 ou usar porta alternativa

```
Error: Cannot find module 'next'
```
**Solução:** Reinstalar dependências com `npm install`

### Banco de Dados Não Conecta

#### Sintomas
- Erro de conexão com Prisma
- Migrações não aplicadas
- Dados não salvos

#### Soluções

**1. Verificar Arquivo .env**
```env
# .env
DATABASE_URL="file:./dev.db"
```

**2. Aplicar Migrações**
```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações
npx prisma db push

# Resetar banco (cuidado: perde dados)
npx prisma migrate reset
```

**3. Verificar Permissões**
```bash
# Linux/Mac
chmod 644 dev.db

# Windows - verificar permissões da pasta
```

## 🔐 Problemas de Autenticação

### Login Não Funciona

#### Sintomas
- Erro ao fazer login com Google
- Redirecionamento incorreto
- Sessão não mantida

#### Soluções

**1. Verificar Configuração OAuth**
```env
# .env.local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**2. Configurar Google OAuth**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Criar projeto ou selecionar existente
3. Ativar Google+ API e YouTube Data API v3
4. Criar credenciais OAuth 2.0
5. Adicionar URI: `http://localhost:3000/api/auth/callback/google`

**3. Limpar Cookies e Cache**
```javascript
// No navegador: F12 > Application > Storage > Clear
// Ou: Ctrl+Shift+Delete (Chrome)
```

**4. Verificar Logs do Servidor**
```bash
npm run dev
# Verificar console para erros de autenticação
```

### Sessão Expira Frequentemente

#### Causas Possíveis
- NEXTAUTH_SECRET incorreto
- Cookies bloqueados
- Configuração de domínio incorreta

#### Soluções
```javascript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'database', // ou 'jwt'
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
};
```

## 📺 Problemas com YouTube API

### Vídeos Não Carregam

#### Sintomas
- Erro ao adicionar vídeos
- Metadados não carregam
- Transcripts indisponíveis

#### Soluções

**1. Verificar Chave da API**
```env
# .env.local
YOUTUBE_API_KEY="your-youtube-api-key"
```

**2. Configurar YouTube API**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Ativar YouTube Data API v3
3. Criar chave de API
4. Configurar restrições (opcional)

**3. Verificar Quota da API**
```javascript
// Verificar uso da quota
// Dashboard Google Cloud > APIs & Services > YouTube Data API v3
```

**4. Tratamento de Erros da API**
```typescript
// lib/services/videos.ts
export async function getVideoMetadata(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics`
    );

    if (response.status === 403) {
      throw new Error('Quota da API do YouTube excedida');
    }

    if (!response.ok) {
      throw new Error(`Erro na API do YouTube: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Erro ao buscar metadados:', error);
    throw error;
  }
}
```

### Transcripts Não Disponíveis

#### Causas
- Vídeo não tem legendas
- Idioma não suportado
- Vídeo muito longo

#### Verificações
```typescript
// Verificar disponibilidade de transcripts
const captionsResponse = await fetch(
  `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}`
);

if (captionsResponse.ok) {
  const captions = await captionsResponse.json();
  // Processar captions disponíveis
}
```

## 🔄 Problemas de Sincronização

### Feeds Não Atualizam

#### Sintomas
- Novos vídeos não aparecem
- Sincronização manual falha
- Erros de timeout

#### Soluções

**1. Verificar Configuração do Feed**
```typescript
// Verificar se feed está ativo
const feed = await prisma.collectionFeed.findUnique({
  where: { id: feedId }
});

if (!feed.isActive) {
  throw new Error('Feed está desabilitado');
}
```

**2. Testar Sincronização Manual**
```bash
# No navegador console
fetch('/api/feeds/{feedId}/sync', { method: 'POST' })
  .then(response => response.json())
  .then(data => console.log(data));
```

**3. Verificar Logs de Sincronização**
```typescript
// Adicionar logging detalhado
console.log('Iniciando sincronização do feed:', feedId);
console.log('Buscando vídeos desde:', lastFetched);

// ... lógica de sincronização

console.log('Sincronização concluída:', {
  novosVideos: newVideos.length,
  erros: errors.length
});
```

**4. Otimizar Performance**
```typescript
// Implementar batch processing
const batchSize = 50;
for (let i = 0; i < videoIds.length; i += batchSize) {
  const batch = videoIds.slice(i, i + batchSize);
  await processBatch(batch);
  await delay(100); // Evitar rate limiting
}
```

## 🔔 Problemas de Notificações

### Notificações Não Chegam

#### Sintomas
- Emails não são enviados
- Push notifications não aparecem
- Notificações atrasadas

#### Soluções

**1. Verificar Configuração de Email**
```env
# .env.local
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@youtube-organizer.com
```

**2. Testar Conexão SMTP**
```javascript
// Teste básico de email
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Erro na configuração SMTP:', error);
  } else {
    console.log('SMTP configurado corretamente');
  }
});
```

**3. Verificar Preferências do Usuário**
```typescript
// Verificar se notificações estão habilitadas
const preferences = await prisma.notificationPreference.findUnique({
  where: { userId }
});

if (!preferences.emailEnabled) {
  console.log('Notificações por email desabilitadas');
}
```

**4. Verificar Spam/Junk Folder**
- Adicionar domínio aos contatos seguros
- Configurar SPF/DKIM records
- Usar serviço de email profissional

### Push Notifications Não Funcionam

#### Verificações
1. **Permissões do navegador**
   - Verificar se notificações estão permitidas
   - Resetar permissões se necessário

2. **Service Worker**
   ```javascript
   // Verificar se SW está registrado
   navigator.serviceWorker.getRegistrations()
     .then(registrations => console.log(registrations));
   ```

3. **Configuração do Firebase**
   ```env
   # .env.local
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   ```

## 🗄️ Problemas de Banco de Dados

### Erros de Conexão

#### Sintomas
- Queries falham
- Timeout de conexão
- Dados corrompidos

#### Soluções

**1. Verificar Conexão**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**2. Otimizar Queries**
```typescript
// Evitar N+1 queries
const collections = await prisma.collection.findMany({
  include: {
    videos: {
      include: {
        video: true, // Evita query adicional
      },
    },
  },
});
```

**3. Implementar Connection Pooling**
```env
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10"
```

### Dados Corrompidos

#### Recuperação
```bash
# Fazer backup
cp dev.db dev.db.backup

# Resetar banco
npx prisma migrate reset

# Restaurar dados essenciais
# (implementar script de recuperação)
```

## 🚀 Problemas de Performance

### Aplicação Lenta

#### Diagnóstico

**1. Verificar Bundle Size**
```bash
npm run build
# Verificar tamanho do bundle em .next/static
```

**2. Otimizar Imagens**
```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};

export default nextConfig;
```

**3. Implementar Caching**
```typescript
// lib/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutos
});

export async function getCachedData(key: string, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached) return cached;

  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

**4. Otimizar Database Queries**
```typescript
// Adicionar índices
// prisma/schema.prisma
model Collection {
  // ... outros campos
  @@index([userId, createdAt])
  @@index([name])
}
```

### Memória Insuficiente

#### Soluções
```javascript
// Verificar uso de memória
console.log(process.memoryUsage());

// Otimizar grandes objetos
const videos = await getVideos();
const optimizedVideos = videos.map(video => ({
  id: video.id,
  title: video.title,
  // Remover campos grandes
}));
```

## 🌐 Problemas de Rede

### API Calls Falham

#### Diagnóstico
```typescript
// Adicionar interceptors para debugging
import axios from 'axios';

axios.interceptors.request.use(request => {
  console.log('API Request:', request.method, request.url);
  return request;
});

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

#### Implementar Retry Logic
```typescript
// lib/api-client.ts
export async function apiRequest(url: string, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();

      if (response.status >= 500) {
        // Retry para erros de servidor
        await delay(Math.pow(2, i) * 1000);
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
}
```

### CORS Errors

#### Configuração
```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## 📱 Problemas Mobile/Responsividade

### Interface Quebrada em Mobile

#### Verificações
1. **Viewport Meta Tag**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

2. **CSS Responsivo**
   ```css
   /* Verificar media queries */
   @media (max-width: 768px) {
     .container { padding: 1rem; }
   }
   ```

3. **Testar em Dispositivos Reais**
   ```bash
   # Usar Chrome DevTools Device Mode
   # Ou testar em dispositivos reais
   ```

### Toque Não Funciona

#### Soluções
```typescript
// Adicionar event listeners apropriados
useEffect(() => {
  const handleTouch = (e: TouchEvent) => {
    // Lidar com eventos de toque
  };

  element.addEventListener('touchstart', handleTouch);
  return () => element.removeEventListener('touchstart', handleTouch);
}, []);
```

## 🔧 Problemas de Desenvolvimento

### Hot Reload Não Funciona

#### Soluções
```bash
# Limpar cache Next.js
rm -rf .next

# Verificar se arquivos estão sendo watched
# Windows: verificar antivírus
# macOS/Linux: verificar inotify limits
```

### TypeScript Errors

#### Comandos Úteis
```bash
# Verificar tipos
npm run type-check

# Gerar tipos automaticamente
npx tsc --noEmit

# Verificar tipos de dependências
npx tsc --noEmit --skipLibCheck
```

### ESLint Errors

#### Configuração
```javascript
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## 📊 Monitoramento e Logs

### Implementar Logging

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Uso
logger.info('Aplicação iniciada', { port: 3000 });
logger.error('Erro na API', { error: error.message, stack: error.stack });
```

### Monitoramento de Performance

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: Function) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}

// Uso
const data = measurePerformance('Database Query', () =>
  prisma.collection.findMany()
);
```

## 🚨 Contato e Suporte

### Quando Pedir Ajuda

**Suporte Comunitário**
- [GitHub Issues](https://github.com/youtube-organizer/issues)
- [Discord Community](https://discord.gg/youtube-organizer)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/youtube-organizer)

**Suporte Premium**
- Email: `support@youtube-organizer.com`
- Chat ao vivo (24/7)
- Telefone: +1 (555) 123-4567

### Informações para Relatar Bugs

```markdown
**Descrição do Problema:**
[Descreva o problema detalhadamente]

**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Comportamento Esperado:**
[O que deveria acontecer]

**Comportamento Atual:**
[O que está acontecendo]

**Ambiente:**
- OS: [Windows/macOS/Linux]
- Browser: [Chrome/Firefox/Safari]
- Node.js: [versão]
- YouTube Organizer: [versão]

**Logs de Erro:**
[Inclua logs relevantes]

**Screenshots:**
[Anexe screenshots se aplicável]
```

---

## 📝 Checklist de Troubleshooting

### Antes de Reportar um Problema
- [ ] Reproduzi o problema em ambiente limpo
- [ ] Verifiquei logs do console do navegador
- [ ] Testei em diferentes navegadores
- [ ] Verifiquei conexão com internet
- [ ] Limpei cache e cookies
- [ ] Testei em modo incógnito
- [ ] Verifiquei versão do Node.js
- [ ] Atualizei dependências

### Informações Essenciais para Suporte
- Versão do YouTube Organizer
- Sistema operacional e versão
- Navegador e versão
- Logs de erro completos
- Passos exatos para reproduzir
- Comportamento esperado vs atual

Seguindo este guia sistematicamente, a maioria dos problemas pode ser resolvida rapidamente. Para questões complexas, nossa equipe de suporte está sempre pronta para ajudar!
