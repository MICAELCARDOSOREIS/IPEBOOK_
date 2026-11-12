# Correções da análise integral

**Branch:** `fix/correcoes-analise-integral`  
**Estado:** Implementada e validada localmente em 2026-11-04

## Objetivo e escopo

Corrigir os defeitos encontrados na análise integral da `develop` de 2026-11-04:

1. A Cloudflare Pages Function `functions/livro/[id].ts` (Spec 119, ADR 0093) consultava `trade_type` e `bairro`, colunas inexistentes em `v2_books` (o esquema usa `modality` e `neighborhood`). O Supabase respondia `42703 column v2_books.trade_type does not exist`, a function devolvia o HTML sem metadados e os cards de compartilhamento nunca eram gerados. O teste unitário passava porque simulava a resposta com as mesmas colunas erradas.
2. Hooks chamados dentro de ternários (`prop ? useGuardedPress(prop) : undefined`) em Configurações, pedidos recebidos/enviados e denúncias de anúncio/pessoa violavam as Rules of Hooks; a regra `useHookAtTopLevel` estava rebaixada para aviso no Biome.
3. 509 avisos de lint, dos quais parte corrigível automaticamente sem mudança de comportamento.

Fora do escopo: publicação no Cloudflare Pages, promoção para `main`, proteção de branches e limpeza de branches remotas (exigem autorização), além da refatoração de telas grandes e dos avisos manuais (`noExplicitAny`, `useExhaustiveDependencies`).

## Critérios de aceite e verificação

1. A function consulta somente colunas existentes em `v2_books`, mapeia `modality = 'sale'` para venda e gera título, descrição com preço e bairro e imagem. Verificação: `tests/unit/cloudflareFunction.test.ts` confere o parâmetro `select` enviado e compara `OPEN_GRAPH_BOOK_COLUMNS` com `BOOK_COLUMNS` do adaptador do app; o teste falha na versão anterior e passa na corrigida. A consulta com as novas colunas foi conferida no Supabase de produção (somente leitura, chave publicável).
2. Nenhum hook é chamado condicionalmente: `useGuardedPress` é sempre chamado e o resultado só é exposto quando a prop existe. Verificação: `useHookAtTopLevel` volta ao nível padrão (erro) e `npm run lint` passa sem ocorrências; testes de componentes das telas afetadas passam.
3. Correções automáticas do Biome (imports não usados, `import type`, `**`, `flatMap`, `const`) sem alterar comportamento. Verificação: `npm run validate` e `npm run build:web` aprovados.

## Resultado da validação

`npm run validate` passou com 2.043 testes em 288 arquivos (cobertura: 91,14% statements, 80,51% branches, 87,84% functions, 92,25% lines), 41 migrações em PGlite, arquitetura sem violações e lint com 0 erros e 337 avisos (antes 509). `npm run build:web` aprovado; `dist/livro/[id].html` contém o fallback estático de Open Graph.

Limitação: a correção da function só terá efeito depois de uma nova publicação no Cloudflare Pages. Em 2026-11-04, `https://ipebook.app/` e `https://ipebook.app/livro/{id}` não serviam nenhuma tag `og:`, nem o fallback estático gerado pelo build atual, o que indica que a publicação em produção está desatualizada.
