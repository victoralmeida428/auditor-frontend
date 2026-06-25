# Plano: Preparar auditor-frontend para Cloudflare Pages

## 1. Resumo

O `auditor-frontend/` é um app Vue 3 + Vite + PrimeVue que consome `/api` do backend Go. Para rodar no Cloudflare Pages, precisamos de:
- Rota SPA (`_redirects`)
- Proxy de API via Pages Functions
- Build configurado para produção (sem `vueDevTools`)
- Variáveis de ambiente para o target da API

---

## 2. Mudanças necessárias

### 2.1 SPA Fallback — `public/_redirects`

Criar `public/_redirects`:

```
/api/*
https://api.inorma.com.br/api/* 200
/*    /index.html   200
```

A primeira linha faz o proxy da API (ajustar URL conforme domínio real do backend).  
A segunda linha faz o catch-all SPA: toda rota que não for `/api/*` serve `index.html` com HTTP 200.

> **Alternativa**: se o backend estiver num subdomínio diferente (ex: `api.inorma.com`), usar `functions/api/[[path]].ts` em vez de redirect, para evitar CORS.

### 2.2 Pages Functions — Proxy de API

Criar `functions/api/[[path]].ts`:

```ts
// functions/api/[[path]].ts
export async function onRequest(context) {
  const apiUrl = context.env.API_URL || 'https://api.inorma.com.br'
  const url = new URL(context.request.url)
  const target = `${apiUrl}${url.pathname}${url.search}`

  const init: RequestInit = {
    method: context.request.method,
    headers: context.request.headers,
  }

  if (!['GET', 'HEAD'].includes(context.request.method)) {
    init.body = context.request.body
  }

  return fetch(target, init)
}
```

Isso faz proxy de `/api/*` para o backend real sem expor CORS.

**Dependência**: Cloudflare Pages Functions requer Node 18+ (já suportado).

### 2.3 Vite config — Remover `vueDevTools` em produção

Em `vite.config.ts`, condicionar o plugin:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    vue(),
    // vueDevTools apenas em dev
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
```

### 2.4 Variável de ambiente `VITE_API_URL` (opcional)

Caso o app precise saber a URL base em runtime (ex: para SSR ou debug), adicionar em `api.ts`:

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})
```

Mas com o proxy acima, `/api` relativo já funciona direto.

### 2.5 `wrangler.toml` para deploy via CLI

```toml
name = "auditor-inorma"
compatibility_date = "2025-06-01"
pages_build_output_dir = "dist"
compatibility_flags = ["nodejs_compat"]

[env.production]
vars = { API_URL = "https://api.inorma.com.br" }
```

### 2.6 Ajustes no `package.json`

Build script já está ok (`vite build`). Pode-se adicionar um script de deploy:

```json
"deploy:cloudflare": "npm run build && wrangler pages deploy dist --project-name=auditor-inorma"
```

---

## 3. Configuração no Painel Cloudflare Pages

1. **Conectar repositório** (GitHub)
2. **Framework preset**: Vue
3. **Build command**: `npm run build`
4. **Build output**: `dist`
5. **Root directory**: `auditor-frontend/`
6. **Environment variables**:
   - `API_URL` = `https://api.inorma.com.br` (URL do backend em produção)
   - `NODE_VERSION` = `22`
7. **Cloudflare Functions**: ativado por padrão ao detectar `functions/`

---

## 4. Checklist final

| Item | Status |
|------|--------|
| `public/_redirects` com SPA fallback | Pendente |
| `functions/api/[[path]].ts` com proxy | Pendente |
| `vite.config.ts` — remover vueDevTools em prod | Pendente |
| `api.ts` — `VITE_API_URL` opcional | Pendente |
| `wrangler.toml` (opcional) | Pendente |
| Testar build localmente | Pendente |
| Deploy no Cloudflare Pages | Pendente |

---

## 5. Observações

- **CORS**: o proxy via Pages Functions elimina qualquer problema de CORS.
- **Refresh token**: o fluxo de refresh (`/api/auth/refresh`) será proxyado normalmente.
- **Upload de arquivos**: se houver upload (`/api/documentos/upload`), o proxy também funciona, mas o limite de tamanho do body em Pages Functions é 100MB (suficiente).
- **Domínios personalizados**: configurar no painel Cloudflare Pages após o deploy.
