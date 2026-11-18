import { useMemo, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { standardVerticalScrollProps } from "@/view/scrollProps";

export type ScreenContainerProps = {
  children: ReactNode;
  /** Cabeçalho fixo no topo da tela (ex.: TopAppBar). Não rola com o conteúdo. */
  header?: ReactNode;
  /** Controle de puxar para atualizar (RefreshControl). */
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /** Largura máxima da coluna de conteúdo centralizada. Padrão 720 (telas de conteúdo);
   *  use 560 em telas de formulário/foco. Passe `null` para desativar o limite (ex.: na Web larga). */
  maxWidth?: number | null;
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
  /** Se ativa KeyboardAvoidingView no iOS para proteger botões e campos de formulário (Apple HIG / Spec 137). */
  keyboardAvoiding?: boolean;
  /** Offset vertical extra para o KeyboardAvoidingView no iOS quando há header fixo. */
  keyboardVerticalOffset?: number;
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
  refreshControl,
  maxWidth = 720,
  paddingHorizontal = tokens.spacing[16],
  paddingTop = tokens.spacing[8],
  paddingBottom = tokens.spacing[24],
  scroll = true,
  edges,
  overlay,
  contentStyle,
  testID,
  keyboardAvoiding = false,
  keyboardVerticalOffset = 0,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const columnStyle: StyleProp<ViewStyle> = [
    styles.content,
    {
      ...(maxWidth !== null && maxWidth !== undefined ? { maxWidth } : {}),
      paddingHorizontal,
      paddingTop,
      paddingBottom,
    },
    contentStyle,
  ];

  const body = scroll ? (
    <ScrollView
      {...standardVerticalScrollProps}
      style={styles.scroll}
      contentContainerStyle={columnStyle}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.scroll, columnStyle]}>{children}</View>
  );

  const mainContent =
    Platform.OS === "ios" && keyboardAvoiding ? (
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.keyboardView}
      >
        {body}
      </KeyboardAvoidingView>
    ) : (
      body
    );

  return (
    <SafeAreaView edges={edges} style={styles.page} testID={testID}>
      {header}
      {mainContent}
      {overlay}
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.surface, position: "relative", minHeight: 0 },
    keyboardView: { flex: 1, width: "100%" },
    scroll: { flex: 1, width: "100%" },
    content: {
      flexGrow: 1,
      width: "100%",
      alignSelf: "center",
      minHeight: 0,
    },
  });
}

export default ScreenContainer;
