import { BlurView } from "expo-blur";
import { type ComponentProps, createContext, type ReactNode, type Ref, useCallback, useContext, useEffect, useState } from "react";
import { FlatList, type FlatListProps, Platform, ScrollView, type ScrollViewProps, SectionList, type SectionListProps, StyleSheet, View } from "react-native";
import { type Edge, SafeAreaView, type SafeAreaViewProps, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens } from "@/view/tokens";
import { useReduceTransparency } from "@/view/useReduceTransparency";

const ScrollEdgeHeaderContext = createContext(false);

export function useScrollEdgeHeader(): boolean {
  return useContext(ScrollEdgeHeaderContext);
}

type ScrollEdgeProps = Pick<
  ScrollViewProps,
  | "automaticallyAdjustContentInsets"
  | "automaticallyAdjustsScrollIndicatorInsets"
  | "contentContainerStyle"
  | "contentInsetAdjustmentBehavior"
  | "onScroll"
  | "scrollEventThrottle"
>;

type Props = Omit<SafeAreaViewProps, "edges"> & {
  edges?: readonly Edge[];
  header: ReactNode;
  scrolling?: boolean;
  overlay?: ReactNode;
};

const allEdges: Edge[] = ["top", "bottom", "left", "right"];
const ScrollEdgeContext = createContext<((props: ScrollEdgeProps) => ScrollEdgeProps) | null>(null);

function useScrollEdge(props: ScrollEdgeProps): ScrollEdgeProps | undefined {
  const applyScrollEdge = useContext(ScrollEdgeContext);
  return applyScrollEdge?.(props);
}

export function ScrollEdgeScrollView(props: ComponentProps<typeof ScrollView>) {
  return <ScrollView {...props} {...useScrollEdge(props)} />;
}

export function ScrollEdgeFlatList<Item>({ ref, ...props }: FlatListProps<Item> & { ref?: Ref<FlatList<Item>> }) {
  return <FlatList {...props} {...useScrollEdge(props)} ref={ref} />;
}

export function ScrollEdgeSectionList<Item, Section>({ ref, ...props }: SectionListProps<Item, Section> & { ref?: Ref<SectionList<Item, Section>> }) {
  return <SectionList {...props} {...useScrollEdge(props)} ref={ref} />;
}

/** Mantém a área segura e o cabeçalho sobre a rolagem vertical do iOS. */
export function ScrollEdgeScreen({ header, scrolling = true, overlay, children, edges, ...pageProps }: Props) {
  const edgeToEdge = Platform.OS === "ios" && scrolling;
  const hasHeader = edgeToEdge && Boolean(header);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const reduceTransparency = useReduceTransparency();
  const [scrolled, setScrolled] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState<number>();
  const activeEdges = edges ?? allEdges;
  const topInset = activeEdges.includes("top") ? insets.top : 0;
  const bottomInset = activeEdges.includes("bottom") ? insets.bottom : 0;
  const headerHeight = (measuredHeight ?? tokens.spacing[64]) + topInset;
  const topSpace = hasHeader ? headerHeight : topInset;
  const showBlur = scrolled && !reduceTransparency;

  useEffect(() => {
    if (!hasHeader) {
      setScrolled(false);
      setMeasuredHeight(undefined);
    }
  }, [hasHeader]);

  const scrollProps = useCallback(({ contentContainerStyle, onScroll, scrollEventThrottle }: ScrollEdgeProps): ScrollEdgeProps => {
    const flatStyle = StyleSheet.flatten(contentContainerStyle);
    const padTop = flatStyle?.paddingTop ?? flatStyle?.paddingVertical ?? flatStyle?.padding;
    const padBottom = flatStyle?.paddingBottom ?? flatStyle?.paddingVertical ?? flatStyle?.padding;
    return {
      contentContainerStyle: [
        contentContainerStyle,
        {
          paddingTop: topSpace + (typeof padTop === "number" ? padTop : 0),
          ...(bottomInset > 0
            ? { paddingBottom: bottomInset + (typeof padBottom === "number" ? padBottom : 0) }
            : {}),
        },
      ],
      automaticallyAdjustContentInsets: false,
      automaticallyAdjustsScrollIndicatorInsets: false,
      contentInsetAdjustmentBehavior: "never",
      onScroll: (event) => {
        if (hasHeader) {
          setScrolled(event.nativeEvent.contentOffset.y > 0);
        }
        onScroll?.(event);
      },
      scrollEventThrottle: scrollEventThrottle ?? 32,
    };
  }, [topSpace, bottomInset, hasHeader]);

  return (
    <SafeAreaView
      {...pageProps}
      edges={edgeToEdge ? activeEdges.filter((edge) => edge !== "top" && edge !== "bottom") : edges}
    >
      {hasHeader ? null : header}
      <ScrollEdgeContext.Provider value={edgeToEdge ? scrollProps : null}>{children}</ScrollEdgeContext.Provider>
      {hasHeader ? (
        <View
          style={[
            styles.header,
            { paddingTop: topInset, backgroundColor: showBlur ? "transparent" : colors.surface },
            scrolled && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tokens.ios.separator },
          ]}
        >
          {showBlur ? (
            <BlurView
              testID="top-app-bar-scroll-blur"
              tint="systemThinMaterialLight"
              intensity={75}
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View
            style={{
              paddingLeft: activeEdges.includes("left") ? insets.left : 0,
              paddingRight: activeEdges.includes("right") ? insets.right : 0,
            }}
            onLayout={({ nativeEvent }) => setMeasuredHeight(nativeEvent.layout.height)}
          >
            <ScrollEdgeHeaderContext.Provider value>{header}</ScrollEdgeHeaderContext.Provider>
          </View>
        </View>
      ) : null}
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 },
});
