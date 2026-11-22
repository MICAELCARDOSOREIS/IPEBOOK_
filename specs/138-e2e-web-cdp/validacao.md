# Validação — Spec 138 (E2E Web via Chrome CDP)

- **Data:** 2026-11-17
- **Comando executado:** `npm run test:e2e` (contra build isolada gerada por `EXPO_PUBLIC_BACKEND=memory npx expo export --platform web --output-dir dist-e2e`)
- **Ambiente:** Node.js v24.22.1 + Google Chrome headless via CDP puro (sem Playwright)

## Resultados observados

1. **Cenário 1 — Boas-vindas, catálogo público (Desktop/Mobile), busca e detalhe:** `PASSOU (4849ms)`
2. **Cenário 2 — Cadastro, edição de perfil e limpeza de histórico em configurações:** `PASSOU (5381ms)`
3. **Cenário 3 — Publicação em 3 etapas, pausa/retomada, edição e exclusão na Estante:** `PASSOU (7648ms)`
4. **Cenário 4 — Favoritar livro no detalhe, conferir em Favoritos e remover:** `PASSOU (4379ms)`
5. **Cenário 5 — Enviar pedido de livro e cancelar em Conversas:** `PASSOU (4578ms)`
6. **Cenário 6 — Ciclo completo entre 2 contas (anúncio, pedido, aceite, chat, encontro, entrega e avaliação):** `PASSOU (23754ms)`
7. **Cenário 7 — Resiliência offline/online e banner de conexão:** `PASSOU (2995ms)`

**Resumo:** `7/7 cenários aprovados`, 0 exceções JavaScript não tratadas.

## Acesso ao catálogo pelas boas-vindas em 21 de novembro de 2026

- O Chrome abriu a pesquisa pelo botão **Explorar livros** em `localhost:8081` com o Supabase configurado. O catálogo exibiu 20 resultados na primeira página.
- O cenário 1 passou em uma exportação isolada. A verificação adicional por CDP confirmou a navegação a 320 e 1440 px e o estado selecionado na árvore de acessibilidade. A tecla Espaço marcou e desmarcou a caixa de aceite dos termos.
- Na suíte conjunta com as alterações paralelas, seis cenários passaram na execução inicial. O cenário 2 também passou ao ser repetido com a verificação de dimensões atualizada para tolerar o arredondamento de 1 px do Chrome.
- O Chrome confirmou os nove caminhos canônicos no pré-cache e recebeu o HTML da Ajuda do service worker após simular a desconexão.
- O login com Google chegou à página do provedor. A conclusão do login, a recuperação por e-mail e o recebimento de notificações dependem de uma conta de teste e de um dispositivo com notificações habilitadas.
- O Metro permitiu a validação com o Supabase após o primeiro reinício, mas voltou a exceder o tempo de espera durante as verificações simultâneas. Após novo reinício com cache limpo e um trabalhador, `/status` respondeu com HTTP 200 em aproximadamente 39 s e a página inicial excedeu 55 s. A estabilidade do servidor de desenvolvimento ficou pendente.

## Correções da auditoria web em 21 de novembro de 2026

- Exportação em modo memória com `expo export --platform web --output-dir dist-e2e --max-workers 2` e execução de `npm run test:e2e`. Os 7 cenários passaram no Chrome CDP.
- A suíte confirmou o link HTML do logotipo, sua ativação com Enter, o marco principal e a legibilidade do início a 320 px. A pesquisa manteve a orientação do campo dentro da área útil. O link para Configurações preservou a consulta no login por e-mail. Uma conferência CDP adicional confirmou o foco com Tab e o fluxo simulado de Google.
- A conferência visual a 320 px mostrou o título completo da seção e os locais dos cartões em mais de uma linha quando necessário. Os testes focados de títulos, autenticação, rotas e cabeçalho passaram.
- `npm run typecheck`, `npm run lint`, `npm run check:architecture`, `npm run check:design-system`, `npm run check:numbering`, `npm run check:build-config` e `npm run test:sql` passaram. O lint apresentou avisos.
- `npm run test:coverage` aprovou 2.335 testes em 317 arquivos e atingiu os limites de cobertura do projeto.
- A validação do retorno usou contas em memória. O provedor Google externo e a publicação ficaram fora desta execução.
