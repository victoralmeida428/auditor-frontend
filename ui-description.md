# UI/CSS — iNorma Landing Page

## Stack

- **Framework:** Astro
- **CSS:** Tailwind CSS v4 (`@import "tailwindcss"`)
- **Plugin:** `@tailwindcss/typography` (para `prose`)
- **Componente interativo:** Vue 3 (formulário de contato)
- **Fonte:** Inter (400, 500, 600, 700, 800 via Google Fonts)

---

## Paleta personalizada (`norma`)

Paleta azul derivada do blue-500 da Tailwind, registrada em `global.css` via `@theme`:

| Token        | Valor      |
|-------------|------------|
| `norma-50`  | `#eff6ff`  |
| `norma-100` | `#dbeafe`  |
| `norma-200` | `#bfdbfe`  |
| `norma-300` | `#93c5fd`  |
| `norma-400` | `#60a5fa`  |
| `norma-500` | `#3b82f6`  |
| `norma-600` | `#2563eb`  |
| `norma-700` | `#1d4ed8`  |
| `norma-800` | `#1e40af`  |
| `norma-900` | `#1e3a8a`  |
| `norma-950` | `#172554`  |

Uso: `bg-norma-600`, `text-norma-600`, `hover:bg-norma-700`, etc.

---

## Layout Base (`BaseLayout.astro`)

```html
<body class="flex min-h-screen flex-col">
  <Header />
  <main class="flex-1"><slot /></main>
  <Footer />
</body>
```

- `<html lang="pt-BR">`
- `scroll-behavior: smooth`
- Meta tags OG (title, description, image)
- Favicon SVG + ICO

---

## Header (`Header.astro`)

| Propriedade      | Classe / Valor                                                  |
|-----------------|----------------------------------------------------------------|
| Posição         | `sticky top-0 z-50`                                            |
| Fundo           | `border-b border-gray-100 bg-white/80 backdrop-blur-md`        |
| Container       | `mx-auto max-w-7xl flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8` |

**Logo:**
- Ícone "N": `flex h-8 w-8 items-center justify-center rounded-lg bg-norma-600 text-sm font-bold text-white`
- Texto: `text-xl font-bold text-gray-900`

**Nav (desktop `md:flex`):**
- Links: `text-sm font-medium transition-colors hover:text-norma-600`
- Ativo (currentPath): `text-norma-600`
- Inativo: `text-gray-600`

**CTA button:**
- `rounded-lg bg-norma-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-norma-700 hover:shadow-md`

**Mobile (`<md`):**
- Hamburger: 3 spans `h-0.5 w-6 bg-gray-900`
- Menu toggle via JS vanilla (`classList.toggle('hidden')`)
- Mobile menu: `border-t border-gray-100 bg-white px-4 pb-6 pt-4`
- Mesmo estilo de links + CTA em full-width

---

## Hero (`Hero.astro`)

| Propriedade | Classe / Valor                                                            |
|------------|---------------------------------------------------------------------------|
| Fundo      | `bg-gradient-to-b from-white to-gray-50` + radial gradient overlay        |
| Overlay    | `bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.08),transparent)]` |
| Padding    | `px-4 pb-20 pt-24 sm:px-6 lg:px-8`                                       |
| Container  | `mx-auto max-w-4xl text-center`                                           |

**Título:**
- `text-4xl font-extrabold tracking-tight text-gray-900`
- Responsivo: `sm:text-5xl lg:text-6xl`

**Subtítulo:**
- `mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600`
- Responsivo: `sm:text-xl`

**CTAs (mobile col, `sm:flex-row`):**
- Primário: `rounded-xl bg-norma-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-norma-700 hover:shadow-xl`
- Secundário: `rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md`

---

## Features (`Features.astro`)

| Propriedade | Classe / Valor                                    |
|------------|--------------------------------------------------|
| Background | `bg-white`                                        |
| Padding    | `px-4 py-20 sm:px-6 lg:px-8`                     |
| Container  | `mx-auto max-w-7xl`                               |

**Cabeçalho:**
- Título: `text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl`
- Subtítulo: `mt-4 text-lg text-gray-600`

**Grid:** `mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3`

**Card individual:**
- `group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-norma-100 hover:shadow-md`
- Ícone: `flex h-12 w-12 items-center justify-center rounded-xl bg-norma-50 text-norma-600` (SVG inline via `set:html`)
- Título: `text-lg font-semibold text-gray-900`
- Descrição: `mt-2 text-sm leading-relaxed text-gray-500`

---

## Pricing (`Pricing.astro`)

| Propriedade | Classe / Valor                                    |
|------------|--------------------------------------------------|
| Background | `bg-gray-50`                                      |
| Padding    | `px-4 py-20 sm:px-6 lg:px-8`                     |
| Container  | `mx-auto max-w-7xl`                               |

**Grid:** `mt-16 grid gap-8 lg:grid-cols-2 lg:mx-auto lg:max-w-4xl`

**Card normal:**
- `rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg`

**Card destacado (Profissional — "Mais Popular"):**
- `border-norma-500 ring-1 ring-norma-500 scale-105`
- Badge: `absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-norma-600 px-4 py-1 text-xs font-semibold text-white`

**Preço:**
- Valor: `text-4xl font-extrabold text-gray-900`
- Sufixo: `ml-1 text-sm text-gray-500` ("/mês")
- Desconto anual: `mt-1 text-xs text-gray-400`

**Features:**
- `mt-8 space-y-3 flex-1`
- Item: `flex items-start gap-2 text-sm text-gray-600`
- Check icon: SVG `mt-0.5 h-4 w-4 shrink-0 text-norma-600`

**CTA button:**
- `mt-8 block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all`
- Destacado: `bg-norma-600 text-white shadow-md hover:bg-norma-700 hover:shadow-lg`
- Normal: `border border-gray-300 text-gray-700 hover:bg-gray-50`

---

## FAQ (página `/precos`)

- Container: `mx-auto max-w-3xl`, `space-y-6`

**Cada pergunta (`<details>`):**
- `rounded-xl border border-gray-200 p-5`
- Open: `open:border-norma-200 open:bg-norma-50/30`

**Summary:**
- `flex cursor-pointer items-center justify-between text-sm font-semibold text-gray-900`
- Chevron SVG: `h-5 w-5 text-gray-500 transition-transform group-open:rotate-180`

**Resposta:**
- `mt-3 text-sm text-gray-600`

---

## CTA Section (`CTASection.astro`)

| Propriedade | Classe / Valor                                              |
|------------|------------------------------------------------------------|
| Background | `bg-gradient-to-br from-norma-600 to-norma-800`            |
| Padding    | `px-4 py-20 sm:px-6 lg:px-8`                               |
| Container  | `mx-auto max-w-3xl text-center`                             |

- Título: `text-3xl font-bold tracking-tight text-white sm:text-4xl`
- Subtítulo: `mt-4 text-lg text-norma-100`
- CTA: `rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-norma-700 shadow-lg hover:bg-norma-50 hover:shadow-xl`

---

## Footer (`Footer.astro`)

| Propriedade | Classe / Valor                                    |
|------------|--------------------------------------------------|
| Background | `border-t border-gray-100 bg-gray-50`             |
| Container  | `mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8`   |

**Grid:** `grid gap-8 sm:grid-cols-2 lg:grid-cols-4`

**Coluna 1 — Brand:**
- Logo mesmo estilo do header (menor: `h-7 w-7 text-xs`)
- Descrição: `mt-3 text-sm text-gray-500`

**Colunas (Produto, Suporte, Legal):**
- Título: `mb-3 text-sm font-semibold text-gray-900`
- Links: `space-y-2`, `text-sm text-gray-500`, `hover:text-norma-600 transition-colors`

**Copyright:**
- `mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-400`

---

## Página Sobre

**Grid de valores:** `mt-6 grid gap-6 sm:grid-cols-2`

**Card:**
- `rounded-xl border border-gray-100 bg-gray-50 p-6`
- Título: `text-lg font-semibold text-gray-900`
- Descrição: `mt-2 text-sm text-gray-500`

**Conteúdo textual:**
- `mt-10 space-y-6 text-lg leading-relaxed text-gray-600`

---

## Página Contato

**Grid:** `mt-16 grid gap-12 lg:grid-cols-2`

**Formulário (Vue, `client:load`):**
- Inputs: `mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-norma-500 focus:outline-none focus:ring-1 focus:ring-norma-500`
- Button: `w-full rounded-xl bg-norma-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-norma-700 disabled:cursor-not-allowed disabled:opacity-60`
- Status states: sending / success / error

**Sidebar:**
- Card "Quer uma demonstração?": `rounded-2xl border border-norma-100 bg-norma-50/50 p-6`
- Botão: `rounded-lg bg-norma-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-norma-700`

---

## Blog

**Listing (`/blog`):**
- Grid: `mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3`

**Card (`BlogCard.astro`):**
- `group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-norma-100 hover:shadow-md`
- Data: `text-xs font-medium text-norma-600`
- Título: `mt-2 text-lg font-semibold text-gray-900 group-hover:text-norma-600 transition-colors`
- Descrição: `mt-2 text-sm leading-relaxed text-gray-500`
- Autor: `mt-4 text-xs text-gray-400`

**Post individual:**
- Layout: `mx-auto max-w-3xl px-4 py-20`
- Header: data (`text-sm font-medium text-norma-600`), título (`text-3xl font-extrabold sm:text-4xl`), descrição, autor
- Content: `<div class="prose prose-gray prose-a:text-norma-600 prose-headings:text-gray-900 mt-12 max-w-none">`

---

## Breakpoints

| Breakpoint | Largura | Uso principal                          |
|-----------|---------|---------------------------------------|
| `sm:`     | 640px   | Padding responsivo, grid 2 colunas     |
| `md:`     | 768px   | Header nav visível, mobile toggle      |
| `lg:`     | 1024px  | Grid 3 colunas, max-w-4xl/7xl          |

---

## Padrão de Componentes

Todos os componentes seguem a mesma estrutura:

1. Frontmatter `---` com Interface Props + valores default
2. `<section>` com `px-4 py-20 sm:px-6 lg:px-8`
3. Container `mx-auto max-w-7xl` (ou `max-w-3xl` / `max-w-4xl`)
4. Título: `text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl`
5. Subtítulo: `mt-4 text-lg text-gray-600`
6. Cards com `transition-all hover:shadow-md`

---

## Páginas Legais (Privacidade / Termos)

- Layout: `mx-auto max-w-3xl`, `px-4 py-20`
- Título: `text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl`
- Data: `mt-2 text-sm text-gray-500`
- Conteúdo: `<div class="prose prose-gray prose-a:text-norma-600 prose-headings:text-gray-900 mt-12 max-w-none">`
