# Spec 116 — Cores Vivas do Ipê na Identidade Visual e Home

**Status:** Concluída  
**Data:** 2 de novembro de 2026  
**Contexto:** IHC / Identidade Visual / Home / Temas  
**ADR vinculada:** [0090](../../docs/adr/0090-cores-vivas-ipe.md)

## 1. Problema

A identidade visual do IpêBook é inspirada na florada dos ipês de Piripiri (Piauí), em especial o ipê-amarelo e o ipê-rosa. No entanto, os tons aplicados no hero da tela inicial e nos tokens de destaque estavam excessivamente desbotados, acinzentados e pálidos:
- O card interativo da **Florada do Ipê** utilizava fundo branco puro (`#FFFFFF`) e borda tênue de 1px, sem o calor, o brilho ou o aconchego da florada dourada.
- O botão/card de **Trocas** utilizava `#f8d88a` (amarelo manteiga/areia lavado, sem saturação de florada).
- O botão/card de **Doações** utilizava `#f4ddd3` (bege acinzentado, sem o frescor floral do ipê-rosa).
- As pétalas da celebração (`IpePetalsCelebration`) possuíam opacidades baixas nas camadas de fundo (0.64), gerando aspecto translúcido e desbotado na tela.
- Os tokens `ipe.container` e `ipe.petalSoft` não transmitiam a luminosidade solar característica do ipê em flor plena.

## 2. Escopo

1. **Tokens de Identidade do Ipê (`src/view/tokens.ts`):**
   - Elevar a vivacidade e o calor do **Ipê Amarelo**: `bloom` em amarelo ouro solar (`#F59E0B` / `#FFB800`), `bloomDeep` em âmbar dourado (`#D97706`), `container` em creme dourado luminoso (`#FEF08A` / `#FEF3C7`) e `onContainer` em madeira nobre profunda (`#451A03` / `#3A1E08`).
   - Elevar o destaque de **Trocas**: `m3.tertiaryContainer` e `badge.trade` com o dourado vivo do Ipê Amarelo (`#FDE68A`) e texto de alto contraste (`#451A03`).
   - Preservar o tom canônico de **Doações**: manter `m3.doacaoContainer` e `badge.donation` no tom terracota/pêssego original do design system (`#F4DDD3` com texto `#6E3A28`), evitando desvios para rosa e mantendo harmonia com a identidade.
   - Tema escuro (`darkColors`): preservar harmonia noturna com contraste elevado e calor âmbar/ouro noturno.
2. **Card da Florada do Ipê no Hero da Home (`src/view/home.tsx`):**
   - Substituir o fundo branco genérico por um tom suave de pétalas douradas (`colors.ipe.petalSoft` / `#FFFDF0`).
   - Borda âmbar enriquecida (`colors.ipe.bloomDeep`, 1.5px) e sombra calorosa de sol.
   - Textos e ícone da árvore `IpeMark` com destaque acolhedor.
3. **Chuva de Pétalas da Florada (`src/view/components/IpePetalsCelebration.tsx`):**
   - Ajustar opacidades mínimas para que flores trombetas e pétalas douradas mantenham presença e nitidez durante a queda.
4. **Verificação de Contraste e Acessibilidade (WCAG AA/AAA):**
   - Garantir que todas as novas cores atinjam a razão de contraste mínima de 4.5:1 (e 7:1 onde aplicável) em `tests/unit/themeContrast.test.ts`.

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Todos os pares de texto e fundo dos tokens de identidade e badges mantêm contraste ≥ 4.5:1 no tema claro e escuro. | `npm test tests/unit/themeContrast.test.ts` |
| CA2 | Card da Florada do Ipê na Home exibe fundo dourado de pétalas e borda âmbar viva. | Testes de renderização e inspeção visual |
| CA3 | Card de Trocas exibe o ouro vivo de Ipê Amarelo e Doações preserva o tom canônico terracota do design system. | Testes de componentes da Home |
| CA4 | Pétalas da animação da Florada possuem opacidade e vivacidade adequadas. | Teste de unidade / componente |
