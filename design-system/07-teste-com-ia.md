# Teste com IA

## Rodada 1

- **Ferramenta e modelo:** Claude Code, subagente `general-purpose` sem contexto prévio da
  conversa (sessão isolada, sem memória do restante do repositório).
- **Material entregue à IA:** somente os arquivos de `design-system/` — `README.md`,
  `01-principios.md`, `02-tokens.md`, `03-fundamentos.md`, `04-componentes/*.md`,
  `05-padroes.md`, `06-acessibilidade.md`. Instrução explícita para não ler `design-kit/`,
  `src/` nem `specs/`.
- **Prompt usado:**

> Construa o código React Native (Expo) da tela "Explorar" do app IpêBook — busca de livros e
> lista de resultados (capa, título, autor, bairro, tag de modalidade) — usando
> exclusivamente os tokens e componentes descritos nesses arquivos .md. Essa tela não aparece
> como exemplo em nenhum dos arquivos. Depois, liste os tokens/componentes usados, qualquer
> valor que precisou inventar, e qualquer regra ambígua ou contraditória.

- **Resultado:** [`ExplorarScreen.tsx`](ExplorarScreen.tsx) (404 linhas, gerado pelo subagente
  sem edição posterior), com `BookCover`, `Tag`, `BarraDeNavegacao`, campo de busca e chips de
  filtro inventados a partir das regras gerais, `FlatList` de resultados e estado vazio.

| Verificação | Passou? | Observação |
| --- | --- | --- |
| Cores, espaços e raios vieram de tokens | Sim | Usou `surface`, `surface-container-low/high`, `on-surface`/`on-surface-variant`, `outline`, `secondary-container`, `radius-sm/lg/full`, `space-1` a `space-8` |
| Todos os estados dos componentes foram respeitados | Parcial | Aplicou estado selecionado do chip e item ativo da navegação; não havia como validar hover/pressed num `.tsx` estático |
| Alvos de toque e contraste respeitados | Sim | Usou `hitSlop` para levar o chip de 32 px a 48 dp de toque; manteve nome da modalidade junto da cor na Tag |
| A IA não inventou valores sem avisar | Sim | Declarou explicitamente cada invenção (ver abaixo) — nenhuma foi escondida |

## Desvios e correções na documentação

| Desvio | Causa (o que faltava ou estava ambíguo) | Arquivo corrigido |
| --- | --- | --- |
| Tokens da tabela de cor (`primary`, `on-surface-variant`...) não batem com os nomes usados nos exemplos de código dos componentes (`tokens.colors.action`, `tokens.colors.secondaryText`...) — a IA teve que adivinhar que a API de código era a certa, sem uma tabela de conversão | `02-tokens.md` definia só os nomes M3 (fonte conceitual); faltava dizer que o código usa outra API (`src/view/tokens.ts`, ADR 0009) | `02-tokens.md` — nova seção "Nomes no código (`src/view/tokens.ts`)" com tabela de conversão papel M3 → chave em código, incluindo os papéis sem token próprio ainda (`on-primary`, `focus-ring`, `scrim`) |
| O exemplo de código de `dialogo.md` usa a cor do `scrim` como literal (`"#00000052"`), contradizendo a regra do README ("nunca escreva cores... literais no código") | Faltava token de `scrim` em `src/view/tokens.ts`; o README não previa o caso de um token documentado em `tokens.json` mas ainda ausente do módulo de código | `04-componentes/dialogo.md` — literal substituído por uma constante nomeada (`SCRIM_CLARO`) com comentário citando a origem do valor e a lacuna em `tokens.ts` |
| Não havia tamanho de serifa documentado para título de livro dentro de uma lista/cartão — só o de 32 px da tela raiz (`displayLarge`), grande demais ali; a IA inventou usar a família `brand` no tamanho de `m3-body-lg` | `02-tokens.md` listava só um corte da escala de marca, omitindo o corte "cartão/lista" que já existe em `design-kit/tokens.json` (`brand-card-title`, 19 px) | `02-tokens.md` — adicionada a linha `brand-card-title` (19 px/24 px/700) na tabela de tipografia |
| `Chip de filtro` e `BookRow` são citados no README e no Princípio 3, mas não têm arquivo próprio em `04-componentes/` (o mínimo de 6 componentes já foi atingido com outros 6) | Decisão de escopo da atividade (mínimo de 6), não um erro de redação — mas vale registrar como lacuna conhecida | Não corrigido nesta versão — registrado aqui como pendência; ver `design-kit/components/Chip/README.md` e `BookRow/README.md` para quem for criar esses arquivos depois |

## Rodada 2 (após as correções)

Reteste direcionado (sem repetir a construção completa da tela, para não gastar um segundo
ciclo de IA só para confirmar três edições pontuais): reli `02-tokens.md` e
`04-componentes/dialogo.md` já corrigidos, com a mesma pergunta que gerou cada desvio.

- A tabela "Nomes no código" resolve a ambiguidade: agora é possível ir de `secondary-container`
  (conceito) a `tokens.colors.soft`/`badge.sale.background` (código) sem adivinhar.
- O exemplo do diálogo não tem mais nenhum valor solto sem explicação — `SCRIM_CLARO` está
  nomeado e comentado, e a tabela da seção anterior também lista `scrim` como lacuna de
  `tokens.ts`.
- `brand-card-title` cobre o caso de título de livro em lista/cartão sem precisar reaproveitar o
  tamanho de tela raiz.
- A lacuna de `Chip`/`BookRow` sem arquivo dedicado continua aberta — decisão consciente de
  escopo, não um erro a "corrigir" às pressas; registrada acima para a próxima versão.
