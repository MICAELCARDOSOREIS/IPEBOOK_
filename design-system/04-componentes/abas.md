# Abas (Tabs)

> [!NOTE]
> **Padrão composto.** A Estante usa `Chip` para alternar entre Anúncios, Propostas e Concluídos.
> Termos e privacidade compõe duas abas na própria tela. A `NavigationBar` reúne os três
> destinos principais do app. Consulte o [ADR 0019](../../docs/adr/0019-alinhamento-design-system-e-componentes.md) para a decisão sobre componentes genéricos.

Origem no sistema base: Material 3, Primary tabs. Situação: **Herdado**.

## Quando usar

- Alternar conteúdo dentro da mesma tela, com no máximo quatro abas de rótulo curto — ex.
  "Anúncios, Propostas, Concluídos" numa tela de negociação.

## Quando não usar

- Para navegação entre telas diferentes (use [Barra de navegação](barra-de-navegacao.md)).
- Mais de quatro categorias — nesse caso use Chip de filtro.

## Anatomia

1. Linha de rótulos curtos.
2. Em Termos e privacidade, indicador de 2 px embaixo da aba ativa (`colors.action`).
3. Na Estante, a seleção aparece no estado do chip.

## Variantes

Termos e privacidade usa uma linha de abas sublinhadas. A Estante usa chips de seção.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Inativa | `on-surface-variant` | Toque troca o conteúdo | Anunciada como não selecionada |
| Ativa | `colors.action`, com indicador na tela de Termos e privacidade | Exibe o painel associado | Anunciada como selecionada |
| Foco na Web | Indicador de foco do teclado | Setas alternam a seção | Foco acompanha a aba selecionada |

## Acessibilidade

- `accessibilityRole="tab"` com `accessibilityState={{ selected }}` em cada aba, dentro de um
  container `accessibilityRole="tablist"`.
- Alvo de toque mínimo 48 dp de altura mesmo com rótulo curto.
- Em Termos e privacidade na Web, `Tab` entra pela aba selecionada e segue para seu painel.
  Esquerda e Direita movem o foco e selecionam a aba, com retorno na extremidade. `Home` e
  `End` selecionam a primeira e a última. `Enter` e Espaço ativam a aba em foco.
- Cada aba web aponta para um painel por `aria-controls`. O painel recebe o nome da aba por
  `aria-labelledby`, e apenas o painel ativo fica visível e entra na ordem de foco.
- O endereço `/termos?aba=privacidade` seleciona a política após a hidratação da página estática.
- A Estante usa a aparência segmentada no iPhone com os mesmos chips da tela.

## Faça e evite

- **Faça:** rótulos curtos, no máximo uma palavra ou duas.
- **Evite:** mais de quatro abas — vira ilegível e não cabe em telas pequenas.

## Onde está no código

- [Estante](../../src/view/listings/myListings.tsx)
- [Termos e privacidade](../../src/view/legal/termsAndPrivacy.tsx)
- [Padrão de abas do W3C](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
