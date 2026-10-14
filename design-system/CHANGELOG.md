# Changelog

Versões no formato `MAIOR.MENOR.CORREÇÃO`. Mudança grande = versão nova.

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
