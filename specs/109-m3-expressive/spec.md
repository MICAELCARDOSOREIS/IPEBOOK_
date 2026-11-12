# Especificação 109 — Adoção do Material 3 Expressive

Status: implementada e validada localmente

## Objetivo
Incorporar os princípios visuais e de movimento do **Material 3 Expressive** (Android 16+ / Google Material Design) ao Design System do IpêBook, tornando os componentes interativos mais expressivos, responsivos e táteis por meio de física de molas (*spring motion*), metamorfose de formas (*shape morphing*) e hierarquia visual enfatizada, mantendo a identidade editorial (Source Serif 4 Bold + paleta Ipê) e a conformidade WCAG.

## Escopo
1. **Tokens de Movimento por Mola e Forma Expressiva (`src/view/tokens.ts`)**:
   - Definir `tokens.spring` com os perfis canônicos do M3 Expressive:
     - `spatialFast` (botões, chips, ícones: resposta imediata com leve elasticidade).
     - `spatialStandard` (indicador da `NavigationBar`, cartões, abas).
     - `spatialSlow` (diálogos, folhas modais e transições amplas).
     - `effectsFast` (opacidade e cor, sem overshoot).
   - Definir `tokens.shapeMorph` com pares de raios de borda para estados de repouso, pressionado e selecionado (ex.: pílula `9999` ↔ squircle expressivo `16 dp` / `12 dp`).
2. **Hook de Interação Expressiva (`src/view/useExpressivePress.ts`)**:
   - Prover animação baseada em `Animated.spring` (escala tátil `0.96`–`0.97` e interpolação de forma/raio) acionada em `onPressIn` / `onPressOut`.
   - Respeitar `AccessibilityInfo.isReduceMotionEnabled()`: quando ativo, não executa molas intermediárias.
3. **Evolução dos Componentes Compartilhados (`src/view/components/`)**:
   - `FilledButton` e `OutlinedButton`: feedback de mola espacial e metamorfose sutil de forma ao pressionar, mantendo altura de `52 dp` e alvo de toque mínimo de `48 dp`.
   - `Chip`: transição elástica entre estado não selecionado (`borderRadius: 8`) e selecionado (`borderRadius: 16` squircle expressivo) com animação de escala no ícone de confirmação (`check`).
   - `NavigationBar`: substituir `Animated.timing` linear de `200ms` na pílula ativa (`ActiveIndicator`) por `Animated.spring` espacial (`spatialStandard`), dando o salto fluido característico do M3 Expressive ao trocar entre *Início*, *Explorar*, *Estante*, *Conversas* e *Perfil*.
   - `Dialog`: entrada da caixa de diálogo com escala elástica sutil (`0.92 → 1.0`) combinada ao fade do scrim.
4. **Fora do escopo**:
   - Alterar regras de negócio, casos de uso, repositórios ou contratos do Supabase (mudança estritamente na camada `View`).
   - Substituir a paleta de cores da marca IpêBook ou remover o suporte ao tema claro/escuro.

## Regras de Negócio e IHC
- **RN-01 (Física de Mola)**: Animações espaciais (escala, largura de pílula, abertura de modal) devem usar física de mola (`tokens.spring`) em vez de duração linear fixa.
- **RN-02 (Shape Morphing)**: Chips e botões devem refletir estado de toque ou seleção também pela curvatura dos cantos (`tokens.shapeMorph`), reforçando a percepção tátil.
- **RN-03 (Acessibilidade — Reduzir Movimento)**: Se `AccessibilityInfo.isReduceMotionEnabled()` retornar `true`, as transições devem aplicar o valor final imediatamente sem oscilação elástica.
- **RN-04 (Contraste e Alvos de Toque)**: Todos os componentes devem preservar contraste mínimo de `4.5:1` (`tests/unit/themeContrast.test.ts`) e área mínima de toque de `48x48 dp`.
- **RN-05 (Isolamento MVVM)**: Nenhum arquivo fora de `src/view/` pode ser afetado; `npm run check:architecture` deve passar sem alertas.

## Critérios de Aceite e Verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | `tokens.ts` exporta `spring` (`spatialFast`, `spatialStandard`, `spatialSlow`, `effectsFast`) e `shapeMorph` tipados | `tests/unit/m3ExpressiveTokens.test.ts` |
| CA2 | `useExpressivePress` anima escala/forma e respeita `isReduceMotionEnabled` | `tests/unit/m3ExpressiveTokens.test.ts` |
| CA3 | `Chip` alterna raio expressivo entre selecionado e não selecionado mantendo acessibilidade | `tests/components/chip.test.tsx` |
| CA4 | `NavigationBar` anima a pílula ativa com mola espacial sem quebrar navegação ou badges | `tests/components/navigationBar.test.tsx` |
| CA5 | `FilledButton`, `OutlinedButton` e `Dialog` preservam todos os contratos e testes existentes | `npm test` + `npm run typecheck` + `npm run check:architecture` |
