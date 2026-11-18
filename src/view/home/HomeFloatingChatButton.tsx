import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type HomeFloatingAddButtonProps = {
  onPress: () => void;
};

/**
 * Botão Flutuante de Anunciar Livro (FAB Material 3 - Estilo Ipêbook)
 * Renderizado no canto inferior direito da Home em telas móveis, acima do dock.
 */
export function HomeFloatingAddButton({ onPress }: HomeFloatingAddButtonProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isHovered, setIsHovered] = useState(false);

  const navBarPaddingBottom = insets.bottom > 0 ? insets.bottom + tokens.spacing[8] : tokens.spacing[12];
  const navBarDockHeight = 80;
  const bottom = navBarPaddingBottom + navBarDockHeight + tokens.spacing[12];

  return (
    <Pressable
      testID="home-floating-add-button"
      accessibilityRole="button"
      accessibilityLabel="Anunciar livro"
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.floatingChatButton,
        { bottom },
        isHovered && styles.floatingChatButtonHovered,
        pressed && styles.floatingChatButtonPressed,
      ]}
    >
      <AppIcon name="add" size={26} color={colors.nature.foliage} />
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  const isWeb = Platform.OS === "web";
  const webFabBg =
    colors.surface === "#FCFAF5" ? "rgba(235, 244, 236, 0.92)" : "rgba(39, 66, 44, 0.90)";

  return StyleSheet.create({
    floatingChatButton: {
      position: "absolute",
      right: tokens.spacing[16],
      width: 56,
      height: 56,
      borderRadius: tokens.radius.card,
      backgroundColor: isWeb ? webFabBg : colors.nature.sprout,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      zIndex: 90,
      ...(isWeb
        ? ({
            cursor: "pointer",
            userSelect: "none",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          } as never)
        : {}),
    },
    floatingChatButtonHovered: {
      transform: [{ scale: 1.05 }],
      elevation: 8,
      shadowOpacity: 0.26,
      shadowRadius: 12,
    },
    floatingChatButtonPressed: {
      transform: [{ scale: 0.94 }],
      opacity: 0.9,
    },
  });
}
