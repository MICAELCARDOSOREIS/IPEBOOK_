# Plano de Implementação: Material 3 Expressive (Spec 109)

> **Para execução assistida:** Segue o fluxo Spec Kit + Superpowers (`writing-plans`) + MVVM. Cada etapa possui verificação executável com Vitest e TypeScript.

**Objetivo:** Implementar os tokens, o hook de interação tátil por mola (`useExpressivePress`) e a evolução dos componentes principais (`FilledButton`, `OutlinedButton`, `Chip`, `NavigationBar` e `Dialog`) para o padrão **Material 3 Expressive**.

**Arquitetura:** Estritamente contido na camada `View` (`src/view/tokens.ts`, `src/view/useExpressivePress.ts` e `src/view/components/`). Reutiliza a API `Animated` nativa do React Native com física de molas padronizada e detecção de `AccessibilityInfo.isReduceMotionEnabled()`, sem adicionar dependências externas.

**Tech Stack:** React Native 0.88, Expo 58, TypeScript 6, Vitest 5, Testing Library React Native.

**Spec:** [specs/109-m3-expressive/spec.md](spec.md) | **ADR:** [docs/adr/0084-adocao-material-3-expressive.md](../../docs/adr/0084-adocao-material-3-expressive.md)

## Restrições Globais
- Toda documentação, comentários e textos de UI em português.
- Nenhuma alteração em `src/model/`, `src/usecase/`, `src/infra/` ou `src/viewmodel/`.
- Preservar 100% dos contrastes verificados por `tests/unit/themeContrast.test.ts` e alvos de toque de `48 dp`.
- Respeitar `AccessibilityInfo.isReduceMotionEnabled()` em todas as animações de mola.

## Foco de Revisão (Casos Limites)
1. **Redução de movimento ativa no sistema**: quando o usuário ativa "reduzir movimento", `useExpressivePress` e `NavigationBar` devem aplicar o estado final imediatamente sem rodar `Animated.spring`.
2. **Botões e chips desabilitados (`disabled` / `loading`)**: `onPressIn` não deve comprimir nem deformar um botão ou chip desabilitado.
3. **Troca rápida de abas na `NavigationBar`**: o indicador em mola deve interromper a animação anterior e convergir para a nova aba sem travar a opacidade no meio.
4. **Compatibilidade com React Native Web e Android (Waydroid)**: animações de `scale` e `opacity` usam `useNativeDriver: true` (ou fallback seguro em estilo) sem gerar warnings de driver nativo para propriedades de layout.

---

## Estrutura de Arquivos

- **Modificar:** `src/view/tokens.ts` — adicionar `spring` e `shapeMorph` ao objeto `tokens`.
- **Criar:** `src/view/useExpressivePress.ts` — hook reutilizável para animação de pressão com mola (`scale`) e respeito a `reduceMotion`.
- **Modificar:** `src/view/components/FilledButton.tsx` — integrar feedback expressivo de mola e metamorfose de canto ao pressionar.
- **Modificar:** `src/view/components/OutlinedButton.tsx` — integrar feedback expressivo de mola e metamorfose de canto ao pressionar.
- **Modificar:** `src/view/components/Chip.tsx` — aplicar `shapeMorph` (raio `8 dp` quando inativo → `16 dp` quando selecionado ou pressionado) e feedback de mola.
- **Modificar:** `src/view/components/NavigationBar.tsx` — evoluir `ActiveIndicator` de `Animated.timing` linear para `Animated.spring` com `tokens.spring.spatialStandard`.
- **Modificar:** `src/view/components/Dialog.tsx` — adicionar entrada expressiva em mola (`scale` + `opacity`) no cartão do diálogo.
- **Criar:** `tests/unit/m3ExpressiveTokens.test.ts` — testes unitários e de hook para `tokens.spring`, `tokens.shapeMorph` e `useExpressivePress`.
- **Modificar:** `tests/components/navigationBar.test.tsx` — validar o indicador expressivo da barra de navegação.

---

## Etapas de Execução

### Tarefa 1: Tokens M3 Expressive (`spring` e `shapeMorph`) em `src/view/tokens.ts`
- **Interfaces produzidas:**
  - `tokens.spring`: `{ spatialFast, spatialStandard, spatialSlow, effectsFast }` com `{ tension, friction }` (ou `{ stiffness, damping, mass }`).
  - `tokens.shapeMorph`: `{ buttonRest: 9999, buttonPressed: 16, chipUnselected: 8, chipSelected: 16, cardRest: 16, cardPressed: 20 }`.
- **Verificação:** `tests/unit/m3ExpressiveTokens.test.ts`.

### Tarefa 2: Hook `useExpressivePress` em `src/view/useExpressivePress.ts`
- **Interfaces produzidas:**
  - `useExpressivePress(options?: { disabled?: boolean; pressedScale?: number }): { scale: Animated.Value; isPressed: boolean; onPressIn: () => void; onPressOut: () => void }`.
- **Verificação:** Teste cobrindo `onPressIn`, `onPressOut`, `disabled: true` e `reduceMotion`.

### Tarefa 3: Evolução de `FilledButton`, `OutlinedButton` e `Chip`
- **Comportamento:**
  - `FilledButton` e `OutlinedButton`: aplicam `Animated.View` com `transform: [{ scale }]` vindo de `useExpressivePress` e raio dinâmico (`tokens.shapeMorph.buttonPressed` enquanto pressionado, `tokens.shapeMorph.buttonRest` em repouso).
  - `Chip`: raio passa de `tokens.shapeMorph.chipUnselected` (`8 dp`) para `tokens.shapeMorph.chipSelected` (`16 dp`) quando `selected === true`, além da resposta de escala ao toque.
- **Verificação:** `tests/components/` existentes + novos testes de estilo expressivo.

### Tarefa 4: Evolução de `NavigationBar` e `Dialog`
- **Comportamento:**
  - `NavigationBar` (`ActiveIndicator`): usa `Animated.spring` com `tokens.spring.spatialStandard` para expandir a pílula ativa (`scaleX` de `0.35` para `1` com leve elasticidade espacial M3 Expressive).
  - `Dialog`: anima a entrada do cartão com `Animated.spring` (`tokens.spring.spatialSlow`) de `0.92` para `1`.
- **Verificação:** `tests/components/navigationBar.test.tsx` e `tests/components/dialog.test.tsx`.

### Tarefa 5: Validação Completa e Inspeção no Waydroid
- Executar `npm run typecheck`, `npm run check:architecture`, `npm run check:numbering` e as suítes de testes no Vitest.
- Verificar o comportamento visual em tempo real no Waydroid.
