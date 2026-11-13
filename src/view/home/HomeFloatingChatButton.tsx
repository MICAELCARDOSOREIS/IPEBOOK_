import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type HomeFloatingChatButtonProps = {
  badgeCount?: number;
  onPress: () => void;
};

/**
 * Botão Flutuante de Mensagens/Conversas (FAB Material 3 - Estilo Ipêbook)
 * Renderizado no canto inferior direito da Home em telas móveis, posicionado
 * com respiro harmônico acima da barra de navegação flutuante, com acabamento
 * translúcido em vidro, borda sutil e state layer de hover.
 */
export function HomeFloatingChatButton({
  badgeCount = 0,
  onPress,
}: HomeFloatingChatButtonProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isHovered, setIsHovered] = useState(false);

  // Posiciona o botão flutuante com respiro harmônico de 12px acima do topo real da barra de navegação flutuante
  // (dock de ~80dp com padding inferior de acordo com safe area)
  const navBarPaddingBottom = insets.bottom > 0 ? insets.bottom + tokens.spacing[8] : tokens.spacing[12];
  const navBarDockHeight = 80;
  const bottom = navBarPaddingBottom + navBarDockHeight + tokens.spacing[12];

  return (
    <Pressable
      testID="home-floating-chat-button"
      accessibilityRole="button"
      accessibilityLabel={
        badgeCount > 0
          ? `Abrir mensagens flutuante, ${badgeCount} ${badgeCount === 1 ? "nova" : "novas"}`
          : "Abrir mensagens flutuante"
      }
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
      <AppIcon name="chat" size={26} color={colors.nature.foliage} />
      {badgeCount > 0 ? (
        <View style={styles.floatingChatBadge} testID="home-floating-chat-badge">
          <Text style={styles.floatingChatBadgeText}>
            {badgeCount > 9 ? "9+" : badgeCount}
          </Text>
        </View>
      ) : null}
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
    floatingChatBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[4],
      borderWidth: 2,
      borderColor: colors.surface,
    },
    floatingChatBadgeText: {
      ...tokens.typography.badgeMicro,
      color: colors.badge.completed.text,
      fontWeight: "700",
    },
  });
}
