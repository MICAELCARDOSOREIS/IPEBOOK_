# 0004 — Design System, tokens contratuais e diretrizes de IHC

Data: 2026-10-13. Status: aceito.

## Contexto
O aplicativo IpêBook está sendo desenvolvido para avaliação final conjunta de Interação Humano-Computador (IHC) e Programação para Dispositivos Móveis (PDM) no IFPI Piripiri. O edital de IHC exige documentação formal de sistema de design (tipografia, paleta de cores, espaçamentos, escala tipográfica e alvos de toque mínimos de 48 × 48 dp), garantindo acessibilidade (WCAG 2.1 / 2.2 AA) e identidade visual coesa com a cultura local de Piripiri (PI) e do Ipê Amarelo.

## Decisão
1. **Fonte Visual Canônica:** Adotar o arquivo oficial do Figma (`cxEisNRzOQR6krv8Ow7HCa`) como a única fonte de verdade visual para componentes e telas.
2. **Contrato de Tokens (`design-tokens.json`):** Manter na raiz do repositório o arquivo formal em padrão comunitário contendo todas as variáveis de cor (sRGB), tipografia, espaçamento, cantos arredondados, layout, motion e acessibilidade. *(Substituído em 2026-10-14 por `design-kit/tokens.json` — ver [ADR 0009](0009-design-kit-tokens-como-fonte-unica.md) — e novamente em 2026-10-14 por `design-system/tokens.json` — ver [ADR 0010](0010-design-system-substitui-design-kit.md).)*
3. **Módulo TypeScript Tipado (`src/view/tokens.ts`):** Disponibilizar os tokens no código como constantes imutáveis fortemente tipadas em TypeScript, pertencendo exclusivamente à camada de **View (UI)** da arquitetura MVVM, impedindo vazamento para a lógica de negócio.
4. **Alvos de Toque Mínimos:** Estabelecer `accessibility.touchTarget = 48` (48 × 48 dp) para todos os componentes interativos do aplicativo, atendendo aos critérios ergonômicos e de acessibilidade.
5. **Acessibilidade Universal:** Cores informativas (como badges de venda, troca e doação) nunca transmitem significado isoladamente; sempre acompanham rótulo de texto explicativo. Elementos interativos utilizam `accessibilityRole` e textos descritivos para leitores de tela.

## Consequências
- A equipe possui uma base formal documentada em `docs/design-system.md` para a entrega e apresentação de IHC.
- Cores, tipografia e espaçamentos no código deixam de ser valores mágicos literais e passam a consumir os tokens contratuais.
- Os testes com RNTL e verificações de arquitetura continuam 100% aderentes e protegidos contra regressões.

Vínculos: [Design System](../design-system.md), [ADR 0002](0002-adotar-expo-mvvm.md), [ADR 0003](0003-estrategia-testes-iso25010.md).
