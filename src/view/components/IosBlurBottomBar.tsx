import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { Platform, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Barra inferior fixa com BlurView flutuante sobre o rodapé no iOS e fallback sólido. */
export function IosBlurBottomBar({ children, style, innerStyle, testID }: Props) {
  const { colors } = useTheme();
  const isIos = Platform.OS === "ios";
  const opaqueIos = useOpaqueIosSurfaces();
  const iosGlass = isIos && !opaqueIos;
  const styles = createStyles(colors);

  return (
    <SafeAreaView
      edges={["bottom"]}
      testID={testID}
      style={[
        styles.bar,
        style,
        isIos && styles.iosPosition,
        isIos && (iosGlass ? styles.iosGlass : styles.iosOpaque),
      ]}
    >
      {iosGlass ? (
        <BlurView
          tint="systemThinMaterialLight"
          intensity={75}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={[styles.inner, innerStyle]}>{children}</View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    bar: {
      width: "100%",
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.book.paperEdge,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    iosPosition: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },
    iosGlass: {
      backgroundColor: "transparent",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: tokens.ios.separator,
      overflow: "hidden",
    },
    iosOpaque: {
      backgroundColor: colors.m3.surfaceContainer,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: tokens.ios.separator,
    },
    inner: {
      width: "100%",
      alignSelf: "center",
    },
  });
}
