# 0010 — `design-system/` substitui `design-kit/` como fonte única de design

Data: 2026-10-14. Status: aceito. Substitui o [ADR 0009](0009-design-kit-tokens-como-fonte-unica.md).

## Contexto

A Tarefa de criar `design-system/` (pasta exigida pela atividade "Sistema de Design do Trabalho
Final" de IHC + PDM, ver [docs/design-system.md](../design-system.md) e a entrega da disciplina)
reorganizou o conteúdo que já existia em `design-kit/` — tokens, brand book e os READMEs de
23 componentes de referência — no formato de 8 arquivos markdown exigido pela atividade, com
Material 3 como sistema base único e etiquetas Herdado/Adaptado/Novo em cada decisão.

Depois da primeira versão de `design-system/` (1.0.0, com 6 dos 23 componentes), ficou decidido
manter só uma pasta de design no repositório, em vez de duas fontes parcialmente sobrepostas
(`design-kit/`, mais completa mas em formato livre; `design-system/`, no formato da atividade
mas inicialmente incompleta). Migrar tudo para `design-system/` e apagar `design-kit/` resolve
essa duplicidade.

## Decisão

1. **`design-system/` é a fonte única de design do projeto a partir de agora.** `design-kit/`
   foi apagado do repositório. Qualquer link para `design-kit/` em ADRs anteriores (0008, 0009),
   `docs/design-system.md`, tarefas ou código deve ser lido como apontando para `design-system/`.
2. **`design-system/tokens.json`** é a cópia do antigo `design-kit/tokens.json` e assume o papel
   de contrato técnico canônico que o ADR 0009 havia atribuído a `design-kit/tokens.json`.
   `src/view/tokens.ts` continua sendo o módulo TypeScript consumido pelo código, com os mesmos
   valores (tema claro, ADR 0008).
3. **Todos os 23 componentes do antigo `design-kit/components/`** têm agora um arquivo
   equivalente em `design-system/04-componentes/`, em markdown, com anatomia, variantes,
   estados, acessibilidade e um trecho de código React Native (não React Web).
4. **Os arquivos de implementação de referência Web não foram migrados** —
   `design-kit/components/bundle.js`, `bundle.css`, `index.d.ts` e os `preview.html` de cada
   componente eram código de referência em React Web (o app é Expo/React Native), não consumido
   pelo app nem exigidos pelo formato markdown da atividade. O conteúdo relevante deles (classes,
   estrutura, regras de acessibilidade) já estava resumido nos READMEs de componente, que foram
   migrados.
5. **`docs/design-system.md`** (documento de IHC pré-existente, anterior à importação do
   design-kit) teve seus links para `design-kit/tokens.json` e para o ADR 0009 atualizados para
   apontar para `design-system/tokens.json` e para este ADR.

## Alternativas consideradas

- Manter as duas pastas, com `design-kit/` como fonte técnica completa e `design-system/` como
  um resumo/entrega acadêmica: rejeitada a pedido explícito — duas fontes de verdade para o
  mesmo conteúdo tendem a divergir silenciosamente (como já estava acontecendo com os 17
  componentes que só existiam numa das duas pastas).
- Copiar também os arquivos de implementação Web (`bundle.js`/`bundle.css`) para dentro de
  `design-system/`: rejeitada — não são markdown, não são consumidos pelo app React Native, e
  manter código morto dentro da entrega acadêmica confundiria o que é documentação do que é
  implementação.

## Consequências

- Qualquer pessoa ou IA que precise do design do app só precisa olhar `design-system/` — não há
  mais necessidade de decidir entre duas pastas.
- Links antigos para `design-kit/README.md`, `design-kit/USO.md` e `design-kit/components/*`
  (em ADRs 0008/0009, `docs/design-system.md`, tarefas 23/24/26 e no histórico de commits)
  ficam órfãos; os documentos vivos foram atualizados para apontar para `design-system/`, mas o
  texto histórico dos ADRs 0008 e 0009 não foi reescrito — eles documentam decisões tomadas
  quando `design-kit/` ainda existia e continuam válidos como registro histórico.
- Quem for implementar as telas das Tarefas 23/24 usa `design-system/04-componentes/` como
  referência (React Native, não mais os componentes Web de `design-kit/`).

Vínculos: [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md),
[ADR 0009](0009-design-kit-tokens-como-fonte-unica.md) (substituído por este),
[design-system/README.md](../../design-system/README.md),
[design-system/CHANGELOG.md](../../design-system/CHANGELOG.md).
