# Changelog

Versões no formato `MAIOR.MENOR.CORREÇÃO`. Mudança grande = versão nova.

## 1.7.0 · 2026-10-20

- Alinhamento das telas sob responsabilidade do Micael às telas do Figma (Spec 028).
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças:**
  - Implementação das variantes de botão que o `04-componentes/botao.md` já documentava e o código
    não tinha: `OutlinedButton` (`src/view/components/OutlinedButton.tsx`) e `TextButton`
    (`src/view/components/TextButton.tsx`, com tom destrutivo).
  - Novo componente `Checkbox` (`src/view/components/Checkbox.tsx`) e seu documento
    `04-componentes/caixa-de-selecao.md`, usado no aceite dos termos do cadastro (`01.03`).
  - Ícone `mail` acrescentado ao `AppIcon` para a confirmação de e-mail (`01.05`).
  - Telas de acesso, publicação, gerenciamento de anúncio e favoritos passam a usar a copy, a
    hierarquia e os estados dos nós correspondentes do Figma; o bairro deixa de ser texto livre e
    passa a sair da lista oficial de Piripiri.
  - Cor de tema da Web corrigida de `#0D47A1` para a cor de ação do design system (`#2C5E45`) e
    ícones do manifesto apontando para arquivos que existem no pacote publicado.

## 1.6.0 · 2026-10-17

- Alinhamento completo dos 24 componentes documentados em `04-componentes/` contra a realidade do produto em `src/view/components/` (Issue #92, ADR 0019).
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças:**
  - Implementação do componente `Tag` (`src/view/components/Tag.tsx`) para unificação das modalidades (`venda`, `troca`, `doacao`) e status (`disponivel`, `reservado`, `pausado`, `concluido`) com contraste e acessibilidade garantidos.
  - Implementação do componente `Snackbar` (`src/view/components/Snackbar.tsx`) para confirmação de ações com `accessibilityLiveRegion="polite"` e ação reversível opcional.
  - Confirmação do `Dialog` (`src/view/components/Dialog.tsx`) implementado na issue #89.
  - Classificação e marcação explícita de componentes dependentes de outras issues (`avatar` em #55/#73, `estado-vazio` em #76/Spec 021).
  - Alerta explícito de fora de escopo nos componentes deliberadamente descartados para a beta (`bolha-de-mensagem`, `interruptor`, `item-de-lista`, `linha-de-livro`, `cartao-de-info`, `abas`, `fab`, `opcao-unica`).
  - Registro de decisão formal no ADR 0019 (`docs/adr/0019-alinhamento-design-system-e-componentes.md`).
  - Testes de componentes dedicados para `Tag` e `Snackbar` com 100% de cobertura.

## 1.5.0 · 2026-10-15

- Completa a pendência da versão 1.4.0: inventário das telas do Figma nas outras 2 plataformas
  (iPhone e Web), mesmo padrão já usado para Android.
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças:**
  - `design-system/telas-iphone-figma.md` (novo): 144 telas iPhone/iOS 26, mesma organização
    por fluxo. Marcado como fora do escopo atual de implementação (ADR 0008) — é só
    consulta/planejamento.
  - `design-system/telas-web-figma.md` (novo): 126 telas Web, cada uma com os 3 links
    (Desktop 1440 / Tablet 834 / Celular 390).
  - `telas-android-figma.md`, `docs/design-system.md` e `README.md`: referências cruzadas para
    os dois novos inventários.
- Contagens (144 iPhone / 126 Web) conferem exatamente com os números citados no guia do
  próprio arquivo Figma.

## 1.4.0 · 2026-10-15

- Novo arquivo `telas-android-figma.md`: inventário das 137 telas Android do Figma (nome,
  node-id, link em modo Dev de cada uma), para consulta offline sem precisar manter o Figma
  aberto ou re-extrair a metadata a cada pergunta.
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças:**
  - `design-system/telas-android-figma.md` (novo): 137 telas organizadas pelos 12 fluxos do
    arquivo (01 · Acesso a 12 · Acessibilidade e temas), cada uma com link direto para o modo
    Dev do Figma (`&m=dev`).
  - `docs/design-system.md`: adicionado o link do Figma em modo Dev no cabeçalho do documento.
  - `README.md`: referência ao novo inventário no mapa de arquivos.
- **Pendência:** cobre só a página Android. As páginas iPhone (144 telas) e Web (126 telas)
  ainda não foram extraídas.

## 1.3.0 · 2026-10-15

- Resolvida a pendência registrada na versão 1.2.0: o indicador de etapas documentado
  (`indicador-de-etapas.md`) foi conferido de novo contra screenshots reais das telas 04.01 e
  04.05 do Figma (não só a metadata/variáveis).
- **Responsáveis:** Micael Cardoso Reis.
- **Correção de leitura anterior:** a hipótese registrada na 1.2.0 ("barra segmentada de 3
  traços" vs. "círculos numerados" da doc) estava **errada nos dois lados** — a doc já descrevia
  uma barra, não círculos; e a barra real do Figma não é 3 segmentos de largura igual, é uma
  **barra contínua** com preenchimento proporcional a `etapaAtual / totalDeEtapas`.
- **Mudanças:**
  - `indicador-de-etapas.md`: reescrita a anatomia para descrever a barra contínua com
    proporção, não os três segmentos iguais.
  - `src/view/components/StepProgress.tsx` (novo): implementação da barra contínua.
  - `cartao-de-adicionar-foto.md` e `src/view/components/AddPhotoCard.tsx`: corrigidos depois
    de conferir o screenshot real da tela 04.01 — é um quadrado com "+" e rótulo empilhados ao
    lado dos campos de título/autor, não uma faixa de largura total com borda tracejada (erro
    da versão 1.2.0, que foi inferido sem checar a imagem renderizada).
  - Testes atualizados/criados para os três componentes.

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
