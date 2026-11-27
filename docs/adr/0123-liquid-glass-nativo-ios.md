# ADR 0123 — Liquid Glass nativo no iOS

- **Data** 2026-11-26
- **Status** Aceito
- **Relacionados** [ADR 0115](0115-base-liquid-glass-apple-hig.md), [ADR 0120](0120-navegacao-por-arraste-entre-abas-e-transicoes-direcionais.md), [Spec 137](../../specs/137-ios-nativo-apple-hig/spec.md)

## Contexto

As superfícies no iPhone foram construídas com desfoque e cores translúcidas. O SDK do iOS oferece refração, reflexão e adaptação de contraste pelo sistema.

As 12 capturas de iPhone de 26/11 mostram o dock, os controles flutuantes, os filtros e as folhas, além das superfícies de leitura de livros e listas.

## Decisão

Usar `GlassView` do `expo-glass-effect` para renderizar o material nativo das superfícies iOS. Consultar a disponibilidade do recurso, a segurança da API e Reduzir Transparência antes da renderização. Em versões incompatíveis, usar as superfícies sólidas do design system.

Usar o material em navegação, ações e painéis sobrepostos. Manter os cartões estáticos de conteúdo em material sólido. O iPhone usa `NativeTabs` e o `UITabBar` do UIKit. A seleção passa a seguir a interação do sistema. O pager por arraste da Spec 144 continua no Android. O grupo de rotas preserva os endereços de Início, Explorar e Estante.

## Consequências

A folha de exemplar reservado ou entregue usa o `BottomSheet` compartilhado com `Modal` do React Native e `GlassView`. Essa combinação preserva a abertura em builds em que o host experimental `RNSFormSheetHost` falha ao montar. As ações de navegação aguardam `onDismiss` no iOS. Os outros modais customizados usam `GlassView` na superfície ou nas ações sobre mídia em tela cheia.

A validação da refração exige iPhone com iOS 26 ou superior e runtime que inclua o módulo. O material sólido mantém a legibilidade no iOS anterior e com Reduzir Transparência.

- [GlassEffect no Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/glass-effect/)
- [Como adotar Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass)
- [Abas nativas no Expo Router](https://docs.expo.dev/router/advanced/native-tabs/)
