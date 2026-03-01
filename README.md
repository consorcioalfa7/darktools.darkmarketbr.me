# DarkToolsLabs - Documentação Técnica

## 📋 Visão Geral

DarkToolsLabs é uma suite premium de ferramentas de validação e análise, construída com Next.js 16, TypeScript, e Tailwind CSS.

---

## 🛣️ Rotas e Páginas

### Rotas Públicas
| Rota | Descrição | Arquivo |
|------|-----------|---------|
| `/` | Landing page principal | `src/app/page.tsx` |
| `/login` | Autenticação e planos | `src/app/login/page.tsx` |
| `/database` | Gestão de sites e BINs | `src/app/database/page.tsx` |
| `/dark-cards-validateur` | Validador de cartões visual | `src/app/dark-cards-validateur/page.tsx` |

### Rotas Protegidas (Requer Autenticação)
| Rota | Descrição | Arquivo |
|------|-----------|---------|
| `/amex-checker` | Validador AMEX V1.03 | `src/app/amex-checker/page.tsx` |
| `/card-checker` | Validador Multi-Banco | `src/app/card-checker/page.tsx` |
| `/cc-gen` | Gerador de Cartões | `src/app/cc-gen/page.tsx` |
| `/dark-gg-factory` | Fábrica de Lives | `src/app/dark-gg-factory/page.tsx` |
| `/find-gate` | Análise de Dados (Em breve) | `src/app/find-gate/page.tsx` |

---

## 🔌 API Routes para Backend

### Base URL
```
Production: https://api.darkmarketbr.me
Development: http://localhost:3001
```

### Variável de Ambiente
```env
NEXT_PUBLIC_API_URL=https://api.darkmarketbr.me
```

---

### 🔐 Autenticação

#### Validar Token de Acesso
```http
POST /api/validate
Content-Type: application/json

{
  "token": "string"
}
```

**Resposta Sucesso (200):**
```json
{
  "valid": true,
  "expiresAt": "2024-12-31T23:59:59Z",
  "plan": "monthly"
}
```

**Resposta Erro (401):**
```json
{
  "valid": false,
  "message": "Token inválido ou expirado"
}
```

---

### 📊 Database - Sites

#### Listar Sites
```http
GET /api/database/sites
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "url": "www.exemplo.com",
    "category": "ELETRÔNICOS",
    "platform": "NUVEM SHOP",
    "gateway": "PagBank",
    "bins": "553636, 498408",
    "status": "Ativo (Verificado)",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Criar Site
```http
POST /api/database/sites
Content-Type: application/json

{
  "url": "www.exemplo.com",
  "category": "ELETRÔNICOS",
  "platform": "NUVEM SHOP",
  "gateway": "PagBank",
  "bins": "553636, 498408",
  "status": "Ativo (Verificado)"
}
```

#### Atualizar Site
```http
PUT /api/database/sites/{id}
Content-Type: application/json

{
  "url": "www.exemplo.com",
  "category": "ELETRÔNICOS",
  "platform": "NUVEM SHOP",
  "gateway": "PagBank",
  "bins": "553636, 498408",
  "status": "Ativo (Verificado)"
}
```

#### Deletar Site
```http
DELETE /api/database/sites/{id}
```

#### Importação em Massa
```http
POST /api/database/bulk-import
Content-Type: application/json

{
  "sites": [
    {
      "url": "www.site1.com",
      "category": "INFORMÁTICA",
      "platform": "NUVEM SHOP",
      "gateway": "PagBank"
    }
  ]
}
```

---

### 📊 Database - BINs

#### Listar BINs
```http
GET /api/database/bins
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "Amazon",
    "bins": "553636, 498408, 552640",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Criar BIN
```http
POST /api/database/bins
Content-Type: application/json

{
  "name": "Amazon",
  "bins": "553636, 498408, 552640"
}
```

#### Deletar BIN
```http
DELETE /api/database/bins/{id}
```

---

### 💳 Validação de Cartões

#### Validar Cartão
```http
POST /api/validate-card
Content-Type: application/json

{
  "cardNumber": "4111111111111111",
  "expMonth": "12",
  "expYear": "2025",
  "cvv": "123"
}
```

**Resposta:**
```json
{
  "valid": true,
  "status": "LIVE",
  "brand": "Visa",
  "bank": "Chase Bank",
  "type": "Credit",
  "level": "Classic"
}
```

---

### 🎫 Sistema de Chaves de Acesso

#### Criar Chave (Admin)
```http
POST /api/admin/keys
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "plan": "monthly",
  "duration": 30,
  "quantity": 1
}
```

**Resposta:**
```json
{
  "keys": [
    {
      "token": "DTL-XXXX-XXXX-XXXX",
      "plan": "monthly",
      "duration": 30,
      "createdAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-01-31T00:00:00Z"
    }
  ]
}
```

#### Verificar Status da Chave
```http
GET /api/key/status
Authorization: Bearer {user_token}
```

**Resposta:**
```json
{
  "valid": true,
  "plan": "monthly",
  "daysRemaining": 25,
  "features": [
    "amex-checker",
    "card-checker",
    "cc-gen",
    "dark-gg-factory",
    "find-gate"
  ]
}
```

#### Revogar Chave (Admin)
```http
DELETE /api/admin/keys/{token}
Authorization: Bearer {admin_token}
```

---

## 💰 Planos de Acesso

| Plano | Preço | Duração | Env Variable |
|-------|-------|---------|--------------|
| Diário | R$ 50,00 | 24 horas | `NEXT_PUBLIC_PRICE_DAILY` |
| Semanal | R$ 150,00 | 7 dias | `NEXT_PUBLIC_PRICE_WEEKLY` |
| Mensal | R$ 295,00 | 30 dias | `NEXT_PUBLIC_PRICE_MONTHLY` |
| Vitalício | R$ 990,00 | Permanente | `NEXT_PUBLIC_PRICE_LIFETIME` |

---

## 🔧 Variáveis de Ambiente

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.darkmarketbr.me

# Pricing Display
NEXT_PUBLIC_PRICE_DAILY=50,00
NEXT_PUBLIC_PRICE_WEEKLY=150,00
NEXT_PUBLIC_PRICE_MONTHLY=295,00
NEXT_PUBLIC_PRICE_LIFETIME=990,00

# Purchase Links
NEXT_PUBLIC_PRICE_DAILY_URL=https://t.me/DarkMarket_Oficial
NEXT_PUBLIC_PRICE_WEEKLY_URL=https://t.me/DarkMarket_Oficial
NEXT_PUBLIC_PRICE_MONTHLY_URL=https://t.me/DarkMarket_Oficial
NEXT_PUBLIC_PRICE_LIFETIME_URL=https://t.me/DarkMarket_Oficial
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/darktools

# JWT Secret
JWT_SECRET=your-super-secret-key

# Admin Token
ADMIN_TOKEN=your-admin-token

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

---

## 🗄️ Schema do Banco de Dados

### Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_access TIMESTAMP,
  active BOOLEAN DEFAULT true
);
```

### Tabela: sites
```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR(500) NOT NULL,
  category VARCHAR(200),
  platform VARCHAR(200),
  gateway VARCHAR(200),
  bins TEXT,
  status VARCHAR(50) DEFAULT 'Ativo (Verificado)',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: known_bins
```sql
CREATE TABLE known_bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  bins TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: key_purchases
```sql
CREATE TABLE key_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_token VARCHAR(255) REFERENCES users(token),
  plan VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 PWA Configuration

### manifest.json
```json
{
  "name": "DarkToolsLabs",
  "short_name": "DarkTools",
  "description": "Suite Premium de Ferramentas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/darktools-logo.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/darktools-logo.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 🔒 Sistema de Autenticação

### Fluxo de Autenticação
1. Usuário acessa rota protegida
2. `AuthGuard` verifica `localStorage` por token
3. Se não encontrado ou expirado → redirect para `/login`
4. Na página de login, token é enviado para `/api/validate`
5. Se válido → token armazenado com expiração de 7 dias
6. Usuário redirecionado para home

### Código do AuthGuard
```typescript
// src/components/auth/auth-guard.tsx

const PUBLIC_ROUTES = ['/', '/login', '/dark-cards-validateur', '/database'];

// Token storage
localStorage.setItem('darktools_session', token);
localStorage.setItem('darktools_session_expiry', expiryDate);
```

---

## 🧭 Navegação

### Sidebar Items
| Label | Rota | Status | Acesso |
|-------|------|--------|--------|
| Início | `/` | Active | Público |
| DATABASE | `/database` | Active | Público |
| DARK CARDS | `/dark-cards-validateur` | Active | Público |
| CHK AMEX | `/amex-checker` | Active | Protegido |
| CHK CARDS | `/card-checker` | Active | Protegido |
| CC-GEN | `/cc-gen` | Active | Protegido |
| DARK GG FACTORY | `/dark-gg-factory` | Premium | Protegido |
| FIND GATE | `/find-gate` | Em Breve | Protegido |

### Links Externos
- DarkMarket Oficial: `https://t.me/DarkMarket_Oficial`
- DarkToolsLabs: `https://t.me/darktoolslabs`

---

## 📦 Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix) |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Estado | Zustand (client) |
| HTTP | Fetch API |
| PWA | Web App Manifest |

---

## 🚀 Comandos

```bash
# Desenvolvimento
bun run dev

# Build
bun run build

# Lint
bun run lint

# Database Push
bun run db:push
```

---

## 📞 Suporte

- Telegram: @DarkMarket_Oficial
- GitHub: github.com/consorcioalfa7

---

© 2026 DarkToolsLabs. Todos os direitos reservados.
