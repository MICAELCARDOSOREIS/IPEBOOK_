# Validação — Spec 038

**Data:** 21 de outubro de 2026
**Issue:** #179

## O que foi testado

1. **Agregação Territorial e de Modalidades (`tests/unit/betaMetricsAggregator.test.ts`):**
   - Cobertura dos 17 bairros oficiais de Piripiri definidos em `location.ts`.
   - Distribuição de livros por bairro, calculando volumes totais, disponíveis, reservados e por modalidade (`trade`, `donation`, `sale`).
   - Cálculo de preços para livros à venda (médio, mínimo, máximo) e tratamento adequado de modalidades sem valor financeiro.
   - Cálculo de taxas de cobertura territorial e métricas de pedidos e negociações com taxa de sucesso.
   - Resiliência com bases de dados vazias (zero division avoidance) e tratamento de bairros não informados ou fora do vocabulário oficial.

2. **Garantia de Privacidade e Conformidade LGPD:**
   - Inspeção recursiva de todos os nós de métricas via `validarConformidadeLgpd`.
   - Bloqueio comprovado de chaves proibidas (`owner_id`, `user_id`, `email`, `phone`, `photo_url`, etc.).
   - Bloqueio comprovado de valores em formato de e-mail ou UUID.
   - Anonimização de titulares: contagem de anunciantes calculada unicamente por contagem cardinal distinta (`count(distinct owner_id)`), sem persistência de UUIDs.

3. **Formatadores e Interface CLI:**
   - Emissão de relatório formatado para terminal com bordas e sumários limpos.
   - Emissão de documento Markdown estruturado (`--markdown`) com tabelas GFM.
   - Emissão de JSON estruturado (`--json`) para integração contínua.
   - Opção `--help` / `-h` documentando todos os parâmetros e conformidade legal.

4. **Fontes de Dados (Local vs Remoto):**
   - Execução local via PGlite com carregamento de migrações e dados semente de Piripiri (`popular-catalogo-piripiri.mjs`).
   - Execução remota contra a REST API do Supabase com credenciais do ambiente/`.env` e mascaramento da URL de destino.

## Comandos executados e resultados

- `npm run stats:beta`: executado com sucesso localmente gerando relatório terminal de 10 livros em 9 bairros de Piripiri (52.9% de cobertura).
- `npm run stats:beta -- --json`: validado com JSON válido e ausência de identificadores pessoais.
- `npm run stats:beta -- --markdown`: validado com documento Markdown formatado.
- `npm run stats:beta -- --remote`: validado contra backend remoto Supabase (`https://xiuuiggpccpgrwkzeloc.supabase.co`).
- `npm run validate` (typecheck, `check:architecture`, `test:sql`, `test:coverage`):
  - **794 testes em 115 arquivos aprovados com 100% de sucesso.**
  - **226 arquivos verificados sem violação arquitetural.**

## Limitações

- Em ambiente sem acesso à internet ou sandbox estrita, a execução remota (`--remote`) não acessa a rede e orienta o uso do modo local PGlite (comportamento seguro e esperado).
