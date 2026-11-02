# 0090. Revitalização das Cores do Ipê na Identidade Visual

**Data:** 2 de novembro de 2026  
**Status:** Aceito  
**Contexto Técnico:** `src/view/tokens.ts`, `src/view/home.tsx`, `src/view/components/IpePetalsCelebration.tsx`  
**Spec vinculada:** [116](../../specs/116-cores-vivas-ipe/spec.md)

## Contexto

A identidade visual do IpêBook é fundamentada na floração do ipê em Piripiri (Piauí), com a presença emblemática do ipê-amarelo e do ipê-rosa. As cores originais nos tokens de interface e nos cards editoriais da Home estavam com saturação excessivamente baixa e tons acinzentados/pastéis pálidos. Isso resultava em:
1. Card da Florada do Ipê com fundo branco frio sem expressão de florada;
2. Botões de Trocas e Doações com tons pálidos e desbotados (amarelo manteiga e bege);
3. Pétalas e flores na animação com opacidades muito baixas nas camadas de profundidade;
4. Distanciamento entre a experiência visual do usuário e a riqueza calorosa do ipê no Piauí.

## Decisão

1. **Ajuste dos Tokens de Identidade:**
   - **Ipê Amarelo:** Elevar o tom dourado solar de `ipe.bloom` para `#F59E0B`, `ipe.bloomDeep` para `#D97706`, `ipe.container` para `#FEF3C7` e `ipe.petalSoft` para `#FFFDF0`.
   - **Modalidade Trocas:** Atualizar `m3.tertiaryContainer` e `badge.trade.background` para `#FDE68A`, associado ao texto `#451A03`, proporcionando contraste de 12.0:1 (padrão WCAG AAA).
   - **Modalidade Doações (Ipê Rosa):** Atualizar `m3.doacaoContainer` e `badge.donation.background` para `#FCE7F3`, associado ao texto `#831843`, proporcionando contraste de 8.2:1 (padrão WCAG AAA).
   - **Modalidade Venda (Folhagem):** Atualizar `badge.sale.background` para `#DCFCE7` com texto `#14532D`, proporcionando contraste de 8.3:1 (padrão WCAG AAA).
2. **Revitalização do Card Florada do Ipê no Hero:**
   - Adotar fundo dourado suave acolhedor (`colors.ipe.petalSoft`), borda viva de 1.5px em `colors.ipe.bloomDeep` e sombra calorosa.
3. **Nitidez da Florada Animada:**
   - Calibrar as opacidades mínimas das camadas em `IpePetalsCelebration` para evitar desbotamento excessivo durante a queda.
4. **Preservação de Acessibilidade:**
   - Manter 100% de conformidade com os testes automatizados de razão de contraste em `tests/unit/themeContrast.test.ts`.

## Consequências

- **Positivas:** A interface reflete fielmente o calor solar e a identidade viva da florada do Ipê de Piripiri; os cards da Home ganham destaque emocional e expressivo; legibilidade de texto aprimorada com contrastes superiores a 8:1.
- **Limitações:** Mudanças de tons requerem validação conjunta nos temas claro e escuro, garantindo ausência de ofuscamento noturno.
