# Encurtador — contrato do projeto

API de um encurtador de URL com analytics. Construída do zero, aula a aula, conduzindo o Claude Code. Este arquivo é o contrato: a IA lê antes de qualquer tarefa.

## Arquitetura (não mude sem me perguntar)

- Monorepo com **pnpm workspaces** + **Turborepo**. `apps/` tem os aplicativos, `packages/` o que é compartilhado.
- `apps/api` — API **Fastify 5** em TypeScript, rodando com `tsx`.
- `packages/database` — **Prisma 7** com driver adapter `@prisma/adapter-pg` e **Postgres na Neon**. O client gerado vai para `packages/database/generated` (ignorado no Git).
- Validação e tipos com **Zod 4** em toda borda: variáveis de ambiente, body, params e response. Via `fastify-type-provider-zod`.
- Formatação e lint com **Biome**, não ESLint/Prettier. Aspas simples, sem ponto e vírgula.

## Versões (instale exatamente estas majors)

`fastify@5`, `zod@4`, `prisma@7` e `@prisma/client@7` (não use a 8, que é release candidate), `fastify-type-provider-zod@7`, `typescript` atual (o `baseUrl` do tsconfig foi removido no TS 7: use só `paths`).

## Padrão de módulo na API

Cada recurso é uma pasta em `apps/api/src/modules/<nome>/` com:

- `schemas.ts` — schemas Zod de entrada/saída e tipos com `z.infer`
- `service.ts` — classe `<Nome>Service` com a regra de negócio; fala com o banco pelo `prisma` de `@repo/database`
- `route.ts` — exporta `<nome>Route` com o helper `tp`; a rota só orquestra. Toda rota declara `schema` com `tags`, `summary` e `response`, porque é daí que sai o OpenAPI

Registrar em `apps/api/src/routes.ts` (`app.register`) e em `apps/api/src/services.ts` em três lugares: import, interface no `declare module 'fastify'` e `createServices()`.

## Convenções

- Imports com alias `@/` e extensão `.js`.
- O `.env` mora na raiz do monorepo e é validado em `apps/api/src/utils/environment.ts`. Nunca commitar `.env`; só `.env.example`.
- Erro é tratado em um lugar só, o error handler global em `plugin.ts`. Nunca vazar stack para o cliente.
- Depois de mudar qualquer rota ou schema: `pnpm openapi` (o `apps/api/openapi.yaml` é o contrato e vai para o Git).
- Depois de mudar o `schema.prisma`: `pnpm db:migrate` e ler o SQL gerado antes de aplicar.

## Comandos

`pnpm dev` · `pnpm typecheck` · `pnpm lint` / `pnpm lint:fix` · `pnpm db:generate` · `pnpm db:migrate` · `pnpm openapi` · `pnpm setup` (instala e gera tudo)

## O que não fazer

- Não instalar dependência nova sem dizer por quê.
- Não trocar o padrão de módulo por controllers, decorators ou outra estrutura.
- Não usar `any`. Não usar `console.log` na API: use `request.log` / `app.log`.
