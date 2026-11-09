import type { ScrollViewProps } from "react-native";
import { tokens } from "@/view/tokens";

/**
 * Propriedades padronizadas para listas e áreas de rolagem vertical (ScrollView e FlatList).
 *
 * Garante:
 * 1. `keyboardDismissMode: "on-drag"` — o teclado é recolhido suavemente ao rolar a página.
 * 2. `keyboardShouldPersistTaps: "handled"` — toques em botões e cards são registrados imediatamente.
 * 3. `showsVerticalScrollIndicator: false` — elimina barras de rolagem cinzas nativas sobrepostas aos cards.
 * 4. `overScrollMode: "never"` — firmeza e consistência na rolagem Android.
 */
export const standardVerticalScrollProps = {
  keyboardDismissMode: "on-drag",
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
  withBottomBar: 104,
  /** Telas secundárias sem barra inferior de navegação */
  withoutBottomBar: tokens.spacing[32],
} as const;
