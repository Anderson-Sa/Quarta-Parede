<div align="center">
  <img src="docs/logo.png" alt="Quarta Parede" width="140" />

  # Quarta Parede

  Blog geek: cinema, animes, séries e games.

  [![CI](https://github.com/Anderson-Sa/Quarta-Parede/actions/workflows/ci.yml/badge.svg)](https://github.com/Anderson-Sa/Quarta-Parede/actions/workflows/ci.yml)
  ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
  ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)
  ![License](https://img.shields.io/badge/license-private-lightgrey)
</div>

---

## Sobre

**Quarta Parede** é um blog full‑stack sobre cultura geek — cinema, animes, séries e
games — com site público e um painel administrativo completo para gerenciar todo o
conteúdo, sem depender de nenhum CMS externo.

## Funcionalidades

### Site público

- Posts em Markdown com syntax highlighting, sanitização de HTML e slugs automáticos
- Páginas de categoria e tag, busca full‑text, RSS (`/feed.xml`) e sitemap
- Comentários com moderação, honeypot e rate limit anti‑spam (+ suporte opcional a
  Cloudflare Turnstile) e respostas em thread
- Assinatura de newsletter com digest semanal por e‑mail (via Resend)
- Consentimento de cookies e analytics opt‑in (sem nenhuma ferramenta de rastreio
  ativada por padrão)

### Painel administrativo (`/admin`)

- CRUD de posts com agendamento de publicação, categorias, tags e lixeira
  (soft‑delete) com restauração
- Ações em massa sobre posts (publicar, excluir, mover de categoria, etc.)
- Gerenciamento de categorias e tags
- Moderação de comentários e assinantes da newsletter
- Autenticação com 2FA, log de auditoria de ações administrativas e gerenciamento
  de usuários
- Analytics interno de visualizações e termos de busca
- Configurações de aparência (logo, cores, texto do rodapé) e do site

## Stack técnica

| Camada       | Tecnologia                                                        |
| ------------ | ------------------------------------------------------------------ |
| Framework    | [Next.js 16](https://nextjs.org) (App Router) + React 19            |
| Linguagem    | TypeScript                                                          |
| Estilo       | Tailwind CSS 4                                                      |
| Banco        | SQLite via [Prisma 7](https://www.prisma.io) (`@prisma/adapter-better-sqlite3`) |
| E‑mail       | [Resend](https://resend.com) (newsletter e notificações)           |
| Testes       | Vitest (unitários) + Playwright (e2e)                               |
| CI           | GitHub Actions                                                      |
| Deploy       | Vercel (com cron jobs para newsletter e posts agendados)            |

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

| Comando              | Descrição                                   |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Sobe o servidor de desenvolvimento           |
| `npm run build`       | Build de produção                            |
| `npm start`           | Roda o build de produção                     |
| `npm run lint`        | ESLint                                       |
| `npm run typecheck`   | Checagem de tipos (`tsc --noEmit`)           |
| `npm test`            | Testes unitários (Vitest)                    |
| `npm run test:watch`  | Testes unitários em modo watch               |
| `npm run test:e2e`    | Testes end‑to‑end (Playwright)               |
| `npm run db:seed`     | Popula o banco com dados de exemplo          |

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

Projeto privado — todos os direitos reservados.
