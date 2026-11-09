import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type HomeFloatingChatButtonProps = {
  badgeCount?: number;
  onPress: () => void;
};

/**
 * Botão Flutuante de Mensagens/Conversas (FAB Material 3 - Estilo Ipêbook)
 * Renderizado no canto inferior direito da Home em telas móveis.
 */
export function HomeFloatingChatButton({
  badgeCount = 0,
  onPress,
}: HomeFloatingChatButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      testID="home-floating-chat-button"
      accessibilityRole="button"
      accessibilityLabel={
        badgeCount > 0
          ? `Abrir mensagens flutuante, ${badgeCount} ${badgeCount === 1 ? "nova" : "novas"}`
          : "Abrir mensagens flutuante"
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.floatingChatButton,
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
  return StyleSheet.create({
    floatingChatButton: {
      position: "absolute",
      bottom: 104,
      right: tokens.spacing[16],
      width: 56,
      height: 56,
      borderRadius: tokens.radius.card,
      backgroundColor: colors.nature.sprout,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      zIndex: 40,
      ...(Platform.OS === "web"
        ? ({
            cursor: "pointer",
            userSelect: "none",
          } as never)
        : {}),
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
