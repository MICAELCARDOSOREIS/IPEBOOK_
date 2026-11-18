# Folha Inferior (Bottom Sheet)

> [!NOTE]
> **IMPLEMENTADO (Spec 137, ADR 0114 e ADR 0115)**: Implementado e ativo em `src/view/components/BottomSheet.tsx`, fornecendo superfície de folha modal acessível, adaptada ao Apple HIG com Liquid Glass no iOS e Material 3 no Android e Web.

Origem no sistema base: Material 3 (Bottom Sheets) / Apple HIG (Sheets). Situação: **Adaptado**.

## Quando usar

- Apresentar opções contextuais, filtros rápidos ou opções de ordenação deslizando da parte inferior sem tirar a pessoa completamente do contexto da tela anterior.
- Modais em telas móveis que se beneficiam de fechamento por toque no fundo ou gesto de arraste.

## Quando não usar

- Confirmações críticas ou ações destrutivas irreversíveis (use [dialogo.md](dialogo.md)).
- Conteúdos com formulários extensos que demandam navegação por múltiplas etapas (use uma tela dedicada com [barra-superior.md](barra-superior.md)).

## Anatomia

1. **Alça de arraste (*Drag handle*):** Pílula centralizada de 36 × 4 dp (`tokens.spacing[36]` × `tokens.spacing[4]`) com raio total, oculta em visualização desktop ampla (`wideWeb`).
2. **Cabeçalho:** Título opcional em tipografia de subtítulo ou corpo em destaque, com botão fechar opcional.
3. **Área de conteúdo:** Conteúdo contextual ou lista de opções rolável com altura máxima limitada a 90% da viewport.
4. **Superfície:** Cantos superiores arredondados contínuos de 28 dp (`tokens.radius.xxl`, `borderCurve: "continuous"` no iOS) e acabamento translúcido no iOS ou tonal M3 no Android.
5. **Véu de fundo (*Scrim*):** `rgba(0, 0, 0, 0.4)` bloqueando toques na área de trás e permitindo fechar ao tocar fora.

## Variantes por plataforma

| Plataforma | Superfície | Borda / Efeito | Comportamento de Teclado |
| --- | --- | --- | --- |
| **Android (M3)** | `colors.m3.surfaceContainerLow` | Sem borda, elevação tonal | Nativo |
| **Web** | `colors.m3.surfaceContainerLow` | Centralizado em telas grandes com cantos totais | Tecla Esc fecha a folha |
| **iOS (Apple HIG)** | `tokens.glass.fill` + `BlurView` nativo | `tokens.glass.stroke` (1 pt), `borderCurve: "continuous"` | `KeyboardAvoidingView` interno com `behavior="padding"` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| **Fechado** | Não renderizado | Não interativo | Foco retorna ao elemento disparador |
| **Aberto** | Superfície com raio de 28 dp sobre `scrim` | Bloqueia toques fora da folha | Foco capturado dentro da folha (`useModalFocusTrap`), `aria-modal="true"` |
| **Reduzir Transparência (iOS)** | `colors.m3.surfaceContainer` sólido | Desativa desfoque e transparência | Garante contraste e legibilidade conforme WCAG 2.1 AA |

## Acessibilidade

- Foco capturado e contido dentro da folha aberta através de `useModalFocusTrap`.
- Fechamento imediato com a tecla `Esc` na Web e pelo botão Voltar no Android.
- `aria-modal="true"` e `accessibilityViewIsModal={true}` configurados no modal para impedir leitura de elementos em segundo plano pelo leitor de tela (TalkBack / VoiceOver).
- Fechamento seguro com debounce anti-clique duplo via `useGuardedPress`.

## Código

```tsx
import { Text, View } from "react-native";
import { BottomSheet } from "@/view/components/BottomSheet";
import { tokens } from "@/view/tokens";

export function ExemploFolha({ visivel, aoFechar }: { visivel: boolean; aoFechar: () => void }) {
  return (
    <BottomSheet visible={visivel} onClose={aoFechar} title="Opções de visualização" showCloseButton>
      <View style={{ padding: tokens.spacing[16] }}>
        <Text style={{ ...tokens.typography.bodyLarge }}>Conteúdo da folha modal</Text>
      </View>
    </BottomSheet>
  );
}
```
