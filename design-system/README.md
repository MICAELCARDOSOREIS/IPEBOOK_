# IpêBook Design System · Sistema de design do app IpêBook

> Versão: 1.0.0 · Disciplinas: IHC e PDM
>
> Fonte única do design do app. Conteúdo originalmente trazido do Figma do projeto para
> `design-kit/` e depois migrado integralmente para cá (ver
> [ADR 0010](../docs/adr/0010-design-system-substitui-design-kit.md), que substitui o
> [ADR 0009](../docs/adr/0009-design-kit-tokens-como-fonte-unica.md) — `design-kit/` não existe
> mais no repositório). Formato exigido pela atividade "Sistema de Design do Trabalho Final", com
> um único sistema base e as etiquetas Herdado/Adaptado/Novo.

## 1. Visão geral

O IpêBook é um app para vender, trocar e doar livros entre pessoas do mesmo bairro. O sistema
de design transmite confiança de vizinhança: sóbrio, direto, sem ruído visual — a cor da marca
(verde ipê-do-cerrado) aparece só na ação principal, e cada livro tem sempre a mesma capa
ilustrativa quando não tem foto, para a estante parecer organizada mesmo sem fotos reais.

- **App:** IpêBook
- **Plataforma e stack:** Android e Web com Expo/React Native (React Native Web); iOS
  planejado para quando voltar ao escopo (ver seção 3 e [ADR 0008](../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md))
- **Sistema base:** Material 3 (Google) — único, conforme exigido pela atividade

## 2. Por que este sistema base (as cinco forças)

| Força | Justificativa em uma linha |
| --- | --- |
| Usuários | Público geral de bairro, sem familiaridade técnica esperada: Material 3 tem padrões de navegação (barra inferior, FAB) e feedback (ripple, snackbar) que a maioria já reconhece de outros apps Android. |
| Acessibilidade | M3 já define contraste mínimo, alvo de toque de 48 dp e papéis de cor consistentes (`on-*`); o app herda isso e mede os pares que usa (ver [06-acessibilidade.md](06-acessibilidade.md)). |
| Marca | A identidade (verde ipê-do-cerrado, serifa Source Serif 4 para títulos) entra como camada de marca sobre os papéis neutros do M3 — ver `brand-*` em [02-tokens.md](02-tokens.md). |
| Plataforma | A stack real do app é Expo/React Native, com a primeira entrega em Android e Web — M3 é o sistema nativo do Android e tem suporte direto em React Native Web. |
| Tecnologia | Os tokens já existem como JSON (`tokens.json`) e como módulo TypeScript (`src/view/tokens.ts`, ver [ADR 0010](../docs/adr/0010-design-system-substitui-design-kit.md)); os componentes React Native consomem esses tokens diretamente, sem reescrever valores. |

## 3. Inventário: telas × componentes

| Tela | Componentes necessários |
| --- | --- |
| Entrar / Criar conta (US1, spec 003) | Campo de texto, Botão, Logotipo |
| Anunciar livro — 3 etapas (US2, spec 003) | Indicador de etapas, Campo de texto, Botão, Barra superior, Capa ilustrativa |
| Início / Explorar | Campo de busca, Chip, Linha de livro, Barra de navegação, Logotipo |
| Estante (meus anúncios) | Linha de livro, Capa ilustrativa, Tag, Estado vazio, Fab, Barra de navegação |
| Detalhe do anúncio | Capa ilustrativa, Tag, Botão, Barra superior, Avatar |
| Negociação / Conversa (spec 004) | Bolha de mensagem, Campo de texto, Botão, Barra superior, Avatar, Cartão de informação |
| Diálogo de confirmação (ex. excluir anúncio) | Diálogo, Botão (Perigo) |
| Configurações / Perfil | Item de lista, Interruptor, Avatar, Barra superior |
| Propostas / Concluídos (spec 004) | Abas, Linha de livro, Badge |

Lista completa dos 23 componentes em [04-componentes/](04-componentes/).

## 4. Mapa dos arquivos

| Arquivo | Conteúdo |
| --- | --- |
| [01-principios.md](01-principios.md) | Valores que guiam as decisões |
| [02-tokens.md](02-tokens.md) | Tokens primitivos, semânticos e de componente |
| [03-fundamentos.md](03-fundamentos.md) | Regras de cor, tipografia, espaço, ícones, elevação e movimento |
| [04-componentes/](04-componentes/) | Um arquivo por componente — os 23 componentes do design, cada um com anatomia, estados, acessibilidade e código React Native |
| [05-padroes.md](05-padroes.md) | Fluxos: entrar/cadastrar, anunciar livro |
| [06-acessibilidade.md](06-acessibilidade.md) | Contraste, alvos de toque, foco, leitor de tela |
| [07-teste-com-ia.md](07-teste-com-ia.md) | Validação do sistema com um assistente de IA |
| [CHANGELOG.md](CHANGELOG.md) | Versões e mudanças |
| [`tokens.json`](tokens.json) | Versão machine-readable dos tokens (dado de apoio, não markdown) |

Esta pasta é autossuficiente: não depende de nenhum outro diretório do repositório além de
`src/view/tokens.ts` (o módulo de código que consome estes tokens).

## 5. Etiquetas de origem

Cada token, componente e regra traz uma etiqueta:

- **Herdado:** veio do Material 3 sem mudança (a diretriz ou o token de origem é citado).
- **Adaptado:** veio do Material 3 com mudança (o motivo é explicado — marca, público,
  acessibilidade ou tecnologia).
- **Novo:** não existe no Material 3 (o motivo da necessidade é explicado).

Pelo menos três decisões Adaptadas ou Novas que expressam a identidade do app:

1. **Capa ilustrativa (`BookCover`) — Novo.** M3 não define um componente de capa gerada por
   id; o IpêBook precisa de uma imagem consistente para anúncios sem foto, para a estante não
   parecer incompleta.
2. **Papel de cor `doacao-container` — Novo.** M3 só define `primary`/`secondary`/`tertiary`
   (contêiner); o app precisa de uma quarta cor fixa e exclusiva para a modalidade Doação, que
   não concorre com `tertiary-container` (usado em Troca).
3. **Serifa de marca (Source Serif 4 Bold) sobre a escala tipográfica M3 — Adaptado.** M3
   recomenda uma única família tipográfica; o app usa a serifa só no logotipo, nos títulos de
   tela raiz e no título do livro, para diferenciar a voz da marca do texto de interface, mantendo
   Roboto para o resto da escala M3.
4. **Sem dark mode nesta etapa — Adaptado (omissão deliberada).** M3 dá suporte nativo a tema
   escuro e os valores já existem em `tokens.json`; o escopo atual implementa só o tema claro
   (ver [ADR 0008](../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)), para não
   dobrar o trabalho de cada tela nova no MVP.

## 6. Glossário

| Termo | Significado |
| --- | --- |
| Token | Decisão de design com nome e valor (`primary` → `#2c5e45`) |
| Modalidade | O tipo de anúncio do livro: Venda, Troca ou Doação |
| Papel de cor (color role) | Nome semântico de um token de cor no M3 (`primary`, `surface`, `on-surface` etc.), independente do valor exato |
| Container (M3) | Papel de cor de fundo de menor destaque associado a um papel principal (ex. `secondary-container` é o fundo tonal de `secondary`) |
| Capa ilustrativa | Imagem gerada (cor + motivo) usada quando o anúncio de livro não tem foto |
| Grade de espaço | Conjunto de valores de espaçamento em múltiplos de 4 px usados em toda margem e padding |

## 7. Quem mantém

- **Modelo de governança:** centralizado — Micael Cardoso Reis mantém `design-system/`
  (fonte única desde o [ADR 0010](../docs/adr/0010-design-system-substitui-design-kit.md));
  mudanças de token ou componente passam por ele antes de entrar em `develop`,
  para evitar que Maria Clara e Eric decidam valores de design em paralelo durante a
  implementação das telas (Tarefas 23 e 24).
- **Responsável por revisar mudanças:** Micael Cardoso Reis.
- **Como propor uma mudança:** pull request de uma branch de funcionalidade para `develop` que
  altera o(s) arquivo(s) de `design-system/` (e `tokens.json` quando for um token) e
  o `CHANGELOG.md`; decisões de maior impacto (novo papel de cor, nova plataforma) ganham também
  um ADR em `docs/adr/`.

## 8. Uso de IA na redação

Estes arquivos foram redigidos com apoio de um assistente de IA (Claude), a partir do conteúdo
que existia em `design-kit/` (brand book, `tokens.json` e READMEs de componente, todos escritos
anteriormente neste projeto, antes de a pasta ser migrada para cá e removida — ADR 0010) e dos
ADRs 0008 e 0009. A IA reorganizou e resumiu esse material no formato exigido pela atividade;
não inventou tokens, cores ou regras novas além dos pontos marcados como "Novo"/"Adaptado" na
seção 5, que refletem decisões de escopo já tomadas no projeto.

## 9. Instruções para assistentes de IA

Ao gerar ou alterar interface neste projeto:

1. Leia `01-principios.md`, `02-tokens.md` e `03-fundamentos.md` antes de qualquer tela.
2. Use **somente tokens** (`src/view/tokens.ts`, consumido de `tokens.json`). Nunca
   escreva cores, tamanhos ou raios literais no código de componente.
3. Para cada componente, siga o arquivo correspondente em `04-componentes/`, incluindo todos os
   estados (padrão, pressionado, foco, desabilitado).
4. Respeite `06-acessibilidade.md`: contraste mínimo de 4,5:1 para texto, alvo de toque mínimo
   de 48 dp, foco sempre visível.
5. Não implemente tema escuro nem toggle de tema — fora de escopo (ADR 0008). Se faltar um
   token, componente ou regra, pergunte ou registre a lacuna; não invente valores.
6. Ao final, liste os tokens e componentes que você usou.
