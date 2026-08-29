<div align="center">
  <img src="docs/logo.png" alt="Quarta Parede" width="140" />

  # Quarta Parede

  Blog geek: cinema, animes, séries e games — site público + painel administrativo
  completo, sem depender de nenhum CMS externo.

  [![CI](https://github.com/Anderson-Sa/Quarta-Parede/actions/workflows/ci.yml/badge.svg)](https://github.com/Anderson-Sa/Quarta-Parede/actions/workflows/ci.yml)
  ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)
  ![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)
  ![Playwright](https://img.shields.io/badge/e2e-Playwright-2EAD33?logo=playwright&logoColor=white)
</div>

<br />

## Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
  - [Site público](#site-público)
  - [Painel administrativo](#painel-administrativo-admin)
- [Stack técnica](#stack-técnica)
- [Começando](#começando)
- [Scripts](#scripts)
- [Testes](#testes)
- [Deploy](#deploy)
- [Licença](#licença)

## Sobre

**Quarta Parede** é um blog full‑stack sobre cultura geek — cinema, animes, séries e
games — com site público e um painel administrativo completo para gerenciar todo o
conteúdo, sem depender de nenhum CMS externo. É um projeto pessoal usado como campo de
testes para práticas de produto real: autenticação com 2FA, agendamento de conteúdo,
moderação, analytics, campanhas patrocinadas e cobertura de testes automatizados.

## Funcionalidades

### Site público

- Editor de blocos rico (texto, imagens, embeds do Instagram/X/Threads) renderizado com
  sanitização de HTML e slugs automáticos
- Páginas de categoria, tag e autor, busca full‑text (SQLite FTS5), RSS (`/feed.xml`) e
  sitemap
- Home configurável em seções (Destaques, Outros, Últimas) com layouts alternativos por
  seção, definidos direto pelo admin
- Banners de campanha patrocinada por posicionamento, com contagem de views/clicks
- Comentários com moderação, resposta oficial da equipe, honeypot, rate limit anti‑spam
  e suporte opcional a Cloudflare Turnstile
- Assinatura de newsletter com digest semanal por e‑mail (via Resend)
- SEO: JSON‑LD (`Article`), Open Graph/Twitter cards, canonical URLs e imagem
  OG gerada por convenção de arquivo
- Consentimento de cookies e analytics opt‑in (nenhuma ferramenta de rastreio ativada
  por padrão)

### Painel administrativo (`/admin`)

- CRUD de posts com agendamento de publicação, categorias, tags, imagem de capa,
  histórico de revisões e lixeira (soft‑delete) com restauração
- Detecção de conflito de edição (optimistic concurrency) quando dois admins editam o
  mesmo post
- Gerenciamento de categorias, tags e assinantes da newsletter
- Moderação de comentários com resposta oficial e atribuição de quem moderou
- Marketing: CRUD de campanhas/banners patrocinados por posicionamento na home
- Analytics interno: visualizações por período, gráfico diário e ranking de posts mais
  vistos
- Autenticação com 2FA (TOTP), gerenciamento de usuários administrativos com papéis
  (RBAC) e log de auditoria de ações administrativas
- Configurações de aparência (cores, fontes, layout da home) e dados gerais do site
  (nome, logo, rodapé, redes sociais)

## Stack técnica

| Camada       | Tecnologia                                                                       |
| ------------ | --------------------------------------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org) (App Router) + React 19                          |
| Linguagem    | TypeScript                                                                         |
| Estilo       | Tailwind CSS 4                                                                     |
| Banco        | SQLite via [Prisma 7](https://www.prisma.io) (`@prisma/adapter-better-sqlite3`)   |
| Validação    | Zod                                                                                |
| Editor       | Editor de blocos próprio com drag‑and‑drop (`@dnd-kit`)                           |
| Conteúdo     | `react-markdown` + `rehype` (highlight, sanitize, slug) para renderização segura  |
| E‑mail       | [Resend](https://resend.com) (newsletter e notificações)                          |
| Imagens      | `sharp` para otimização de upload                                                 |
| Ícones       | `lucide-react` / `react-icons`                                                    |
| Testes       | Vitest (unitários) + Playwright (e2e)                                             |
| CI           | GitHub Actions                                                                     |
| Deploy       | Vercel (com cron jobs para newsletter e posts agendados)                          |

## Começando

### Pré‑requisitos

- Node.js 22+
- npm

### Instalação

```bash
npm install
cp .env.example .env
```

Preencha o `.env` — veja os comentários em [`.env.example`](.env.example) para o que
cada variável faz. Só `DATABASE_URL`, `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL` e
`ADMIN_PASSWORD` são obrigatórias para rodar localmente; o resto (Resend, Turnstile,
cron secret) é opcional e cada recurso se desliga sozinho quando a variável não está
configurada.

```bash
npx prisma migrate dev
npm run db:seed   # opcional: popula o banco com dados de exemplo
npm run dev
```

O site fica em `http://localhost:3000` e o painel admin em `http://localhost:3000/admin`
— a primeira pessoa a logar com `ADMIN_EMAIL`/`ADMIN_PASSWORD` vira a conta admin
inicial.

## Scripts

| Comando               | Descrição                                    |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Sobe o servidor de desenvolvimento            |
| `npm run build`        | Build de produção                             |
| `npm start`            | Roda o build de produção                      |
| `npm run lint`         | ESLint                                        |
| `npm run typecheck`    | Checagem de tipos (`tsc --noEmit`)            |
| `npm test`             | Testes unitários (Vitest)                     |
| `npm run test:watch`   | Testes unitários em modo watch                |
| `npm run test:e2e`     | Testes end‑to‑end (Playwright)                |
| `npm run db:seed`      | Popula o banco com dados de exemplo           |

## Testes

```bash
npm test          # unitários
npm run test:e2e  # e2e (requer `npx playwright install` na primeira vez)
```

O workflow de CI (`.github/workflows/ci.yml`) roda lint, typecheck, testes unitários,
build e os testes e2e a cada push/PR para `main`.

## Deploy

Pensado para deploy na [Vercel](https://vercel.com). O arquivo
[`vercel.json`](vercel.json) já configura os cron jobs para o digest semanal da
newsletter e para publicação automática de posts agendados — basta configurar as
variáveis de ambiente de produção no painel da Vercel.

## Licença

Código aberto para fins de portfólio e estudo — sinta‑se à vontade para explorar,
rodar localmente e se inspirar. Sem licença de código aberto formal atribuída; para
reuso em outro projeto, entre em contato.
