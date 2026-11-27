import { Platform, type ScrollViewProps } from "react-native";
import { tokens } from "@/view/tokens";

/**
 * No Android/iOS recolhe o teclado virtual ao arrastar (`on-drag`).
 * Na Web, o `ScrollView` do `react-native-web` dispara `blurTextInput()` em qualquer
 * evento `scroll` (inclusive `scrollIntoView` e navegação por Tab), removendo o foco
 * do campo enquanto o usuário digita — por isso fica `"none"` na Web.
 */
export function resolveVerticalKeyboardDismissMode(
  os: string = Platform.OS,
): NonNullable<ScrollViewProps["keyboardDismissMode"]> {
  return os === "web" ? "none" : "on-drag";
}

/**
 * Propriedades padronizadas para listas e áreas de rolagem vertical (ScrollView e FlatList).
 *
 * Garante:
 * 1. `keyboardDismissMode: "on-drag"` no mobile (`"none"` na Web para não desfocar campos ao rolar).
 * 2. `keyboardShouldPersistTaps: "handled"` — toques em botões e cards são registrados imediatamente.
 * 3. `showsVerticalScrollIndicator: false` — elimina barras de rolagem cinzas nativas sobrepostas aos cards.
 * 4. `overScrollMode: "never"` — firmeza e consistência na rolagem Android.
 */
export const standardVerticalScrollProps = {
  keyboardDismissMode: resolveVerticalKeyboardDismissMode(),
  keyboardShouldPersistTaps: "handled",
  showsVerticalScrollIndicator: false,
  overScrollMode: "never",
} as const satisfies Partial<ScrollViewProps>;

/**
 * Propriedades padronizadas para carrosséis e linhas de rolagem horizontal.
 */
export const standardHorizontalScrollProps = {
  keyboardShouldPersistTaps: "handled",
  showsHorizontalScrollIndicator: false,
  overScrollMode: "never",
} as const satisfies Partial<ScrollViewProps>;

/**
 * Espaçamentos de rodapé padronizados para garantir que o último item da lista nunca
 * fique colado no fim da tela ou encoberto pela barra inferior de navegação.
 */
export const scrollBottomPadding = {
  /** Telas com barra inferior de navegação flutuante ativa no mobile (cápsula flutuante + margem segura) */
  withBottomBar: 128,
  /** Telas com barra inferior de navegação e botão flutuante de mensagens (FAB) */
  withBottomBarAndFab: 192,
  /** Espaço livre para o FAB dentro das abas que já recebem o inseto do UIKit. */
  nativeTabWithFab: tokens.spacing[80],
  /** Telas secundárias sem barra inferior de navegação */
  withoutBottomBar: tokens.spacing[32],
} as const;
