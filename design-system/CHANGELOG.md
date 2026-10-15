# Changelog

Versões no formato `MAIOR.MENOR.CORREÇÃO`. Mudança grande = versão nova.

## 1.2.0 · 2026-10-15

- Implementados os componentes React Native que faltavam para as telas do fluxo "Anunciar
  livro" (Figma), identificados na mesma verificação da versão 1.1.1.
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças:**
  - `src/view/components/Chip.tsx`: chip de filtro (`chip.md`), já documentado mas sem
    implementação em código.
  - `src/view/components/AddPhotoCard.tsx` e `04-componentes/cartao-de-adicionar-foto.md`
    (**Novo**): cartão de upload de foto da etapa 1 de "Anunciar livro". Não existia componente
    M3 equivalente nem documentação prévia — documentado e implementado juntos.
  - `tests/components/chip.test.tsx` e `tests/components/addPhotoCard.test.tsx`: cobertura dos
    dois componentes novos.
  - `README.md`: contagem de componentes atualizada de 23 para 24.
- **Pendência registrada, não resolvida nesta versão:** o indicador de etapas usado no Figma
  (barra segmentada de 3 traços) ainda diverge do componente documentado em
  `indicador-de-etapas.md` (círculos numerados) — precisa de decisão de design antes de mexer
  no componente ou na doc.

## 1.1.1 · 2026-10-15

- Sincronizado `src/view/tokens.ts` com `design-system/tokens.json`, a partir de uma
  verificação direta das telas Android no Figma (amostra de 15 telas, cobrindo as 12 áreas
  funcionais do arquivo, via MCP do Figma).
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças em `src/view/tokens.ts`:**
  - `colors.cover.brown`: corrigido de `#633E36` para `#7B4A2F` (valor real do token
    `cover-brown`, estava desatualizado em relação a `tokens.json`).
  - `colors.cover.text`: corrigido de `#F6F1E8` para `#F5EFE8` (valor real do token `cover-on`).
  - `colors.cover`: adicionadas as cores `wine` (`#6B2A36`) e `ochre` (`#86581A`), que faltavam
    — a capa ilustrativa tem 5 cores no design system (Azul, Marrom, Verde, Vinho, Mostarda),
    só 3 estavam implementadas. `BookCover.tsx` passa a sortear entre as 5.
  - `colors.m3`: adicionados `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`,
    `secondary`, `onSecondary` — papéis M3 usados nas telas de início, detalhe do livro,
    conversa e estante que ainda não existiam no arquivo de tokens de código.
  - Novo export `elevation` (níveis 0 a 5, tema claro), espelhando `shadow.tokens` de
    `tokens.json`; ainda não consumido por nenhum componente.
- Nenhuma mudança em `tokens.json` nem em `04-componentes/`: a fonte canônica já estava correta
  e batendo com o Figma — a divergência era só no arquivo de código.

## 1.1.0 · 2026-10-14

- `design-system/` passa a ser a **fonte única** de design do projeto; `design-kit/` foi
  apagado do repositório ([ADR 0010](../docs/adr/0010-design-system-substitui-design-kit.md),
  que substitui o [ADR 0009](../docs/adr/0009-design-kit-tokens-como-fonte-unica.md)).
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças:**
  - `tokens.json`: cópia integral do `design-kit/tokens.json` (dado machine-readable completo,
    ~50 tokens de cor + tipografia + espaço + forma + elevação + movimento), agora dentro desta
    pasta.
  - `04-componentes/`: migrados os 17 componentes que só existiam em `design-kit/components/`
    (avatar, badge, linha-de-livro, chip, campo-de-busca, snackbar, indicador-de-etapas,
    interruptor, abas, barra-superior, estado-vazio, fab, cartão-de-info, item-de-lista,
    logotipo, bolha-de-mensagem, opção-única) — total de 23, cobrindo todos os componentes que
    existiam no design-kit.
  - `README.md`, `01-principios.md`, `02-tokens.md`, `03-fundamentos.md`, `05-padroes.md`: links
    para `design-kit/` trocados por links internos a esta pasta.
- **Limitação assumida:** os arquivos de implementação de referência Web do `design-kit/`
  (`bundle.js`, `bundle.css`, `index.d.ts`, `preview.html` de cada componente) não foram
  migrados — não são markdown e não eram consumidos pelo app (React Native, não Web); o
  conteúdo relevante (anatomia, estados, acessibilidade, regras de uso) foi resumido em cada
  arquivo de `04-componentes/`, com um trecho de código React Native no lugar do código Web.

## 1.0.0 · 2026-10-14

- Primeira versão do sistema, criada a partir do `design-kit/` já existente no repositório
  (importado do Figma e refinado nas Tarefas 23/24/26), reorganizado no formato de 8 arquivos
  exigido pela atividade de IHC + PDM, com Material 3 como sistema base único.
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças:**
  - `README.md`: visão geral, cinco forças, inventário de telas, mapa de arquivos, etiquetas de
    origem, glossário, governança e instruções para IA.
  - `01-principios.md`: 5 princípios (uma ação por tela, cor nunca é o único sinal, bairro não
    distância, marca na serifa, sem dark mode ainda).
  - `02-tokens.md` e `03-fundamentos.md`: tokens primitivos/semânticos/de componente e regras de
    uso, extraídos de `tokens.json`.
  - `04-componentes/`: 6 componentes (botão, campo de texto, tag, capa ilustrativa, barra de
    navegação, diálogo), cada um com anatomia, variantes, estados, acessibilidade e código React
    Native.
  - `05-padroes.md`: fluxos "Entrar/Criar conta" e "Anunciar livro", com estados de carregando,
    erro, vazio e sucesso.
  - `06-acessibilidade.md`: tabela de contraste com os 6 pares já verificados na Tarefa 26.
  - `07-teste-com-ia.md`: teste cego com um assistente de IA construindo a tela Explorar.
- Ajustes feitos após o teste com IA: ver [07-teste-com-ia.md](07-teste-com-ia.md), seção
  "Desvios e correções na documentação".
