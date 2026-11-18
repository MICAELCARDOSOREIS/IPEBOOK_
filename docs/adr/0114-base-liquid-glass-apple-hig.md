# ADR 0114 — Base Liquid Glass e Componentes Apple HIG no iOS Nativo

- **Status:** Aceito
- **Data:** 17 de novembro de 2026
- **Autores:** Maria Clara Almeida Martins (`pessoa:maria-clara`), Eric Vinícius dos Santos Oliveira (`pessoa:eric`), Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia e Design IpêBook
- **Contexto técnico:** Estabelecimento da infraestrutura do Design System para suporte a iOS Nativo no padrão Apple Human Interface Guidelines (HIG) e linguagem visual Liquid Glass (iOS 26), com preservação integral de Android (MD3) e Web.
- **Relacionado a:** ADR 0008 (Diretrizes Visuais por Plataforma), ADR 0036 (Tema Escuro), ADR 0106 (Padronização com ScreenContainer), ADR 0108 (PWA no iPhone/Safari).
- **Issue:** #227 (parte da #225)
- **Spec:** [137](../../specs/137-ios-nativo-apple-hig/spec.md)

---

## Contexto

Com a expansão da plataforma IpêBook para o ambiente **iOS Nativo** (Expo 58 / React Native), fez-se necessário estruturar a camada de Design System para atender às diretrizes do **Apple Human Interface Guidelines (HIG)** e à linguagem visual **Liquid Glass (iOS 26)** prevista no [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md), mantendo o Android estritamente em **Material Design 3** e a Web em seu layout próprio de duas colunas.

Os requisitos fundamentais desta etapa incluem:
1. **Tokens de Vidro (Liquid Glass):** Integrar `glass.fill`, `glass.stroke` e `glass.fillDark` aos temas claro e escuro a partir de `design-system/tokens.json`.
2. **Respeito ao Home Indicator e Safe Areas:** Garantir que o dock flutuante (`NavigationBar`) e telas de conteúdo (`ScreenContainer`) respeitem milimetricamente o Home Indicator do iPhone sem invadir a área de gestos do sistema.
3. **Prevenção de Oclusão por Teclado:** Suporte a `KeyboardAvoidingView` no `ScreenContainer` para telas de formulário e foco no iOS.
4. **Alvos de Toque Apple HIG:** Botões de cabeçalho (`TopAppBar`) e ações com dimensão mínima de 44×44 pt e feedback tátil leve (*Haptics*).
5. **Componente Unificado de Folha Inferior (`BottomSheet`):** Folhas modais com cantos contínuos (28 dp), *drag handle* superior e acabamento translúcido no iOS.
6. **Acessibilidade Mandatória (Reduzir Transparência):** Implementação de fallback automático para superfícies opacas quando o usuário ativar a opção de acessibilidade "Reduzir Transparência" no iOS (`AccessibilityInfo.isReduceTransparencyEnabled`).

---

## Decisão

1. **Tokens de Liquid Glass em `src/view/tokens.ts`:**
   - Adicionados os valores contratuais de `design-system/tokens.json`:
     - Tema claro: `fill` (`rgba(252, 250, 245, 0.58)`), `stroke` (`rgba(255, 255, 255, 0.75)`), `fillDark` (`rgba(30, 30, 30, 0.42)`).
     - Tema escuro: `fill` (`rgba(40, 37, 34, 0.55)`), `stroke` (`rgba(255, 255, 255, 0.15)`), `fillDark` (`rgba(30, 30, 30, 0.50)`).

2. **Hook de Acessibilidade `useReduceTransparency`:**
   - Criação de `src/view/useReduceTransparency.ts`, que consulta `AccessibilityInfo.isReduceTransparencyEnabled()` e escuta eventos de alteração (`reduceTransparencyChanged`) no iOS.
   - Quando ativado, os componentes retornam automaticamente de Liquid Glass para superfícies opacas sólidas (`m3.surfaceContainer` / `surface`), garantindo conformidade com a WCAG 2.1 AA.

3. **Utilitário de Feedback Tátil `triggerHaptic`:**
   - Criação de `src/view/haptics.ts` com suporte a feedbacks táteis Apple HIG (`light`, `medium`, `heavy`, `selection`, `success`, `error`), com fallback defensivo para no-op em outras plataformas ou na ausência do módulo nativo.

4. **Componentes Base Adaptados:**
   - **`ScreenContainer`:** Adicionadas props `keyboardAvoiding` e `keyboardVerticalOffset`, envolvendo o conteúdo em `KeyboardAvoidingView` (`behavior="padding"`) exclusivamente no iOS quando requisitado.
   - **`NavigationBar`:** No iOS, o dock aplica `colors.glass.fill` e `colors.glass.stroke`, com fallback para sólido quando `useReduceTransparency()` for verdadeiro, e aciona `triggerHaptic("selection")` ao trocar de aba.
   - **`TopAppBar`:** Botão voltar com alvo de toque `44×44 pt` no iOS (`hitSlop={8}`) e micro-haptic ao pressionar.
   - **`BottomSheet`:** Componente unificado do design system com *drag handle*, cantos arredondados contínuos de 28 dp, foco acessível (`useModalFocusTrap`) e suporte a Liquid Glass no iOS.

5. **Isolamento de Plataforma:**
   - Todas as variações são condicionadas a `Platform.OS === 'ios'`. Android (Material Design 3) e Web permanecem 100% inalterados em tokens e comportamento.

---

## Consequências

- **Positivas:**
  - Base sólida, modular e reutilizável para todas as telas do iPhone que serão migradas nas issues subsequentes (Descoberta, Publicação, Conversas, Perfil).
  - Conformidade nativa com o Apple HIG e suporte exemplar à acessibilidade (Reduzir Transparência).
  - Regressão zero para Android e Web.
