import { useMemo, type ReactNode } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ScreenContainerProps = {
  children: ReactNode;
  /** Cabeçalho fixo no topo da tela (ex.: TopAppBar). Não rola com o conteúdo. */
  header?: ReactNode;
  /** Largura máxima da coluna de conteúdo centralizada. Padrão 720 (telas de conteúdo);
   *  use 560 em telas de formulário/foco. (Origem: 03-fundamentos.md.) */
  maxWidth?: number;
  /** Padding lateral da coluna. Padrão `space-4` (16 px), conforme 03-fundamentos.md. */
  paddingHorizontal?: number;
  /** Padding superior da coluna. Padrão `space-2` (8 px). */
  paddingTop?: number;
  /** Padding inferior da coluna. Padrão `space-6` (24 px). */
  paddingBottom?: number;
  /** Se a coluna rola (ScrollView). Padrão `true`. Use `false` em telas com layout próprio. */
  scroll?: boolean;
  /** Bordas respeitadas pelo SafeAreaView. Padrão: todas. */
  edges?: Edge[];
  /** Nós renderizados após a coluna, ainda dentro do SafeAreaView (modais, snackbars, barras
   *  fixas). Não rolam com o conteúdo. */
  overlay?: ReactNode;
  /** Estilo extra aplicado à coluna de conteúdo (ex.: `flexGrow`, `gap`). */
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Container de tela do design system: SafeAreaView com fundo `surface` + coluna de conteúdo
 * centralizada com `maxWidth` e padding padronizados. Centraliza o padrão repetido em todas as
 * telas (`SafeAreaView` > `ScrollView` > coluna `maxWidth`/`alignSelf: center`), garantindo
 * margens laterais consistentes (space-4) e leitura confortável em telas largas/Web.
 * Origem: Adaptado de Material 3 + 03-fundamentos.md (espaçamento e layout responsivo).
 */
export function ScreenContainer({
  children,
  header,
  maxWidth = 720,
  paddingHorizontal = tokens.spacing[16],
  paddingTop = tokens.spacing[8],
  paddingBottom = tokens.spacing[24],
  scroll = true,
  edges,
  overlay,
  contentStyle,
  testID,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const columnStyle: StyleProp<ViewStyle> = [
    styles.content,
    { maxWidth, paddingHorizontal, paddingTop, paddingBottom },
    contentStyle,
  ];

  return (
    <SafeAreaView edges={edges} style={styles.page} testID={testID}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={columnStyle} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={columnStyle}>{children}</View>
      )}
      {overlay}
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.surface },
    content: {
      flexGrow: 1,
      width: "100%",
      alignSelf: "center",
    },
  });
}

export default ScreenContainer;
