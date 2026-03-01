# DarkTools Labs - Documentação Técnica

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌─────────────────┐
│   VERCEL        │     │   VPS           │
│   Frontend      │────▶│   Backend API   │
│   Next.js 16    │     │   Express.js    │
│   Port: 3000    │     │   Port: 3001    │
└─────────────────┘     └─────────────────┘
```

---

## 📡 API Endpoints - Backend VPS

### **Base URL**
```
https://api.darkmarketbr.me
```

### **Variável de Ambiente Frontend**
```env
NEXT_PUBLIC_API_URL=https://api.darkmarketbr.me
```

---

## 🔐 Autenticação

### **POST /api/validate**
Valida código de acesso e retorna dados da sessão.

**Request:**
```json
{
  "code": "SEU_CODIGO_ACESSO"
}
```

**Response (Sucesso - 200):**
```json
{
  "valid": true,
  "message": "Código válido",
  "data": {
    "code": "SEU_CODIGO_ACESSO",
    "planId": "DIÁRIO",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "expiresAt": "2025-01-16T10:30:00.000Z"
  }
}
```

**Response (Erro - 401):**
```json
{
  "valid": false,
  "message": "Código inválido ou expirado"
}
```

### **Tipos de Plano (planId)**
| Valor | Duração |
|-------|---------|
| `DIÁRIO` | 1 dia |
| `SEMANAL` | 7 dias |
| `MENSAL` | 30 dias |
| `VITALÍCIO` | Permanente |

> ⚠️ **IMPORTANTE:** Os valores devem ser enviados EXATAMENTE como mostrado acima (maiúsculas e com acento).

---

## 📊 Database API

### **GET /api/database/sites**
Retorna lista de sites cadastrados.

**Response:**
```json
[
  {
    "id": "uuid-123",
    "url": "www.exemplo.com.br",
    "category": "INFORMÁTICA",
    "platform": "NUVEM SHOP",
    "gateway": "PagBank",
    "bins": "531234, 451234",
    "status": "Ativo (Verificado)",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

> ⚠️ **IMPORTANTE:** A resposta é um **ARRAY direto**, não um objeto com propriedade `sites`.
> 
> **Correto:** `const sites = await res.json();`
> 
> **ERRADO:** `const data = await res.json(); data.sites.map(...)` → VAI CRASHAR!

---

### **POST /api/database/sites**
Cria um novo site.

**Request:**
```json
{
  "url": "www.novosite.com.br",
  "category": "ELETRÔNICOS",
  "platform": "Shopify",
  "gateway": "PagarMe",
  "bins": "531234, 451234",
  "status": "Ativo (Verificado)"
}
```

---

### **PUT /api/database/sites/:id**
Atualiza um site existente.

---

### **DELETE /api/database/sites/:id**
Remove um site.

---

### **GET /api/database/bins**
Retorna lista de BINs conhecidos.

**Response:**
```json
[
  {
    "id": "uuid-456",
    "name": "Amazon",
    "bins": "553636, 498408, 552640",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

---

### **POST /api/database/bins**
Cria uma nova entrada de BIN.

**Request:**
```json
{
  "name": "Mercado Livre",
  "bins": "651652, 230650, 536119"
}
```

---

### **DELETE /api/database/bins/:id**
Remove uma entrada de BIN.

---

### **POST /api/database/bulk-import**
Importa múltiplos sites de uma vez.

**Request:**
```json
{
  "sites": [
    {
      "url": "www.site1.com.br",
      "category": "INFORMÁTICA",
      "platform": "NUVEM SHOP",
      "gateway": "PagBank",
      "bins": "",
      "status": "Ativo (Verificado)"
    }
  ]
}
```

**Response:**
```json
{
  "count": 10,
  "message": "10 sites importados com sucesso"
}
```

---

## 🔧 Tipos TypeScript - Frontend

### Arquivo: `src/lib/types/auth.ts`

```typescript
// Tipos de plano disponíveis (valores exatos do banco de dados)
export type PlanId = 'DIÁRIO' | 'SEMANAL' | 'MENSAL' | 'VITALÍCIO';

// Interface da requisição de validação
export interface ValidateRequest {
  code: string; // Enviar 'code' em vez de 'token'
}

// Interface da resposta de validação (campos em camelCase)
export interface ValidateResponse {
  valid: boolean;
  message?: string;
  data?: {
    code: string;
    planId: PlanId;
    createdAt: string; // ISO date string
    expiresAt: string; // ISO date string
  };
}

// Interface para dados da sessão armazenada localmente
export interface SessionData {
  code: string;
  planId: PlanId;
  expiresAt: string;
  createdAt: string;
}

// Constantes dos nomes dos planos
export const PLAN_NAMES = {
  DAILY: 'DIÁRIO' as PlanId,
  WEEKLY: 'SEMANAL' as PlanId,
  MONTHLY: 'MENSAL' as PlanId,
  LIFETIME: 'VITALÍCIO' as PlanId,
};
```

---

## 📱 LocalStorage - Sessão

Após login bem-sucedido, o frontend armazena:

| Chave | Valor |
|-------|-------|
| `darktools_session` | Código de acesso |
| `darktools_session_expiry` | Data de expiração (ISO) |
| `darktools_session_plan` | ID do plano |
| `darktools_session_created` | Data de criação (ISO) |

---

## 🌐 CORS Configuration

O backend VPS deve ter CORS configurado para aceitar requisições do frontend:

```javascript
// Express.js
app.use(cors({
  origin: [
    'https://darktoolslabs.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🚀 Deploy

### Frontend (Vercel)
```bash
# Variáveis de ambiente
NEXT_PUBLIC_API_URL=https://api.darkmarketbr.me
NEXT_PUBLIC_PRICE_DAILY_URL=https://t.me/DarkMarket_Oficial
NEXT_PUBLIC_PRICE_WEEKLY_URL=https://t.me/DarkMarket_Oficial
NEXT_PUBLIC_PRICE_MONTHLY_URL=https://t.me/DarkMarket_Oficial
NEXT_PUBLIC_PRICE_LIFETIME_URL=https://t.me/DarkMarket_Oficial
```

### Backend (VPS)
```bash
# PM2 ou systemd
pm2 start server.js --name darktools-api
pm2 save
pm2 startup
```

---

## 📝 Checklist de Sincronização

### Frontend → Backend

- [x] POST `/api/validate` envia `{ code: "..." }` (não `token`)
- [x] Response usa campos camelCase: `planId`, `createdAt`, `expiresAt`
- [x] Planos em maiúsculas: `DIÁRIO`, `SEMANAL`, `MENSAL`, `VITALÍCIO`
- [x] Database API retorna arrays direto (não `{ sites: [...] }`)

### Backend → Frontend

- [ ] CORS habilitado para domínio Vercel
- [ ] Rate limiting configurado
- [ ] Logs de erro estruturados

---

## 🔗 Links Úteis

- **Telegram Oficial:** [@DarkMarket_Oficial](https://t.me/DarkMarket_Oficial)
- **DarkToolsLabs:** [@DarkToolsLabs](https://t.me/DarkToolsLabs)
- **API Base:** https://api.darkmarketbr.me

---

## 📅 Versão

- **Data:** Janeiro 2025
- **Versão Frontend:** 1.0.0
- **Versão API:** 1.0.0
- **Copyright:** © 2026 DarkToolsLabs
