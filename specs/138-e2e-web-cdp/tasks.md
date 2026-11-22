# Tarefas — Spec 138 (E2E Web via Chrome CDP)

- [x] T001 Criar especificação, plano e ADR 0112 da suíte E2E Web via CDP.
- [x] T002 Adicionar `dist-e2e/` ao `.gitignore` e scripts `test:e2e` / `test:e2e:build` ao `package.json`.
- [x] T003 Implementar cliente CDP e servidor estático local em `tests/e2e/cdp.mjs`.
- [x] T004 Implementar os 5 cenários E2E em `tests/e2e/run.mjs` e executar `npm run test:e2e:build`.
- [x] T005 Atualizar `docs/estado.md`, `README.md` e `docs/adr/README.md` e validar com `npm run validate`.

## Acesso ao catálogo pelas boas-vindas

- [x] Acrescentar a ação de navegação nas duas apresentações da Web em modo completo.
- [x] Verificar a navegação de visitante pelo cenário 1 da suíte CDP e preservar os fluxos de entrada e cadastro.

## Correções da auditoria web de 21/11/2026

- [x] T006 Validar que o logotipo no cabeçalho desktop funciona com Tab e Enter em outra página, mantém um endereço de link e leva ao início.
- [x] T007 Validar que um link web protegido mantém caminho e consulta após a entrada, que o retorno aceita apenas caminhos internos e que o fluxo OAuth usa o armazenamento temporário da aba.
- [x] T008 Validar que a tela web apresenta um único marco de conteúdo principal e que conversas, negociações, demais rotas dinâmicas, retorno de autenticação e 404 têm títulos descritivos. O detalhe carregado deve continuar com o título do livro.
- [x] T009 Validar a 320 px o título da seção da página inicial, os locais nos cartões e a orientação do campo de busca. Conferir que a página não ganha rolagem horizontal.
- [x] T010 Executar a suíte web via CDP e as verificações do repositório. Registrar resultados e limitações em `validacao.md`.
