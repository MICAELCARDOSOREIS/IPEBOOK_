import {
  type ComponentRef,
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Keyboard,
  Platform,
  type RefreshControlProps,
  ScrollView,
  type StyleProp,
  StyleSheet,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import type { Edge } from "react-native-safe-area-context";
import { ScrollEdgeScreen, ScrollEdgeScrollView } from "@/view/components/ScrollEdgeScreen";
import { standardVerticalScrollProps } from "@/view/scrollProps";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";

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
  /** A tela fornece a própria lista vertical com cabeçalho fixo. */
  hasScrollableList?: boolean;
  /** Referência opcional ao ScrollView interno (ex.: voltar ao topo ao tocar na aba ativa). */
  scrollRef?: RefObject<ComponentRef<typeof ScrollView> | null>;
  /** Bordas respeitadas pelo SafeAreaView. Padrão: todas. */
  edges?: Edge[];
  /** Nós renderizados após a coluna, ainda dentro do SafeAreaView (modais, snackbars, barras
   *  fixas). Não rolam com o conteúdo. */
  overlay?: ReactNode;
  /** Estilo extra aplicado à coluna de conteúdo (ex.: `flexGrow`, `gap`). */
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

const ScrollFocusedInputContext = createContext<(() => void) | undefined>(undefined);

/**
 * Permite que campos dentro de um `ScreenContainer` rolem para a área visível ao receber foco,
 * inclusive quando o teclado já está aberto no iOS ou Android.
 */
export function useScrollFocusedInput(): (() => void) | undefined {
  return useContext(ScrollFocusedInputContext);
}

/**
 * Container de tela do design system: SafeAreaView com fundo `surface` + coluna de conteúdo
 * centralizada com `maxWidth` e padding padronizados. Centraliza o padrão repetido em todas as
 * telas (`SafeAreaView` > `ScrollView` > coluna `maxWidth`/`alignSelf: center`), garantindo
 * margens laterais consistentes (space-4) e leitura confortável em telas largas/Web.
 * O desvio de teclado no iOS e Android é gerenciado globalmente na raiz por `KeyboardAwareRoot` (Spec 088).
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
  hasScrollableList = false,
  scrollRef,
  edges,
  overlay,
  contentStyle,
  testID,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const internalScrollRef = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setScrollNode = useCallback(
    (node: ComponentRef<typeof ScrollView> | null) => {
      internalScrollRef.current = node;
      if (scrollRef) {
        scrollRef.current = node;
      }
    },
    [scrollRef],
  );

  const scrollFocusedInputIntoView = useCallback(() => {
    if (!scroll || Platform.OS === "web") return;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const scrollNode = internalScrollRef.current as
        | (ComponentRef<typeof ScrollView> & {
            scrollResponderScrollNativeHandleToKeyboard?: (
              nodeHandle: unknown,
              additionalOffset?: number,
              preventNegativeScrollOffset?: boolean,
            ) => void;
          })
        | null;
      const focused = (TextInput as unknown as { State?: { currentlyFocusedInput?: () => unknown } }).State?.currentlyFocusedInput?.();
      if (scrollNode && focused) {
        scrollNode.scrollResponderScrollNativeHandleToKeyboard?.(focused, 96, true);
      }
    }, 80);
  }, [scroll]);

  useEffect(() => {
    if (!scroll || Platform.OS === "web") return undefined;
    const subs = [
      Keyboard.addListener("keyboardDidShow", scrollFocusedInputIntoView),
      ...(Platform.OS === "ios" ? [Keyboard.addListener("keyboardWillShow", scrollFocusedInputIntoView)] : []),
    ];
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      for (const sub of subs) sub.remove();
    };
  }, [scroll, scrollFocusedInputIntoView]);

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

  return (
    <ScrollEdgeScreen edges={edges} style={styles.page} testID={testID} header={header} scrolling={scroll || hasScrollableList} overlay={overlay}>
      <ScrollFocusedInputContext.Provider value={scrollFocusedInputIntoView}>
        {scroll ? (
          <ScrollEdgeScrollView
            ref={setScrollNode}
            {...standardVerticalScrollProps}
            contentContainerStyle={columnStyle}
            style={styles.scroll}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollEdgeScrollView>
        ) : (
          <View style={[styles.scroll, columnStyle]}>{children}</View>
        )}
      </ScrollFocusedInputContext.Provider>
    </ScrollEdgeScreen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.surface, position: "relative", minHeight: 0 },
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
