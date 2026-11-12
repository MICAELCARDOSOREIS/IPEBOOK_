import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { withPress } from "@/view/pressFeedback";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";

export type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  testID?: string;
};

/**
 * Estado de erro padronizado e acolhedor (Spec 131 / ADR 0102).
 * Exibido em formato de cartão centralizado quando uma operação ou busca falha.
 */
export function ErrorState({
  message,
  onRetry,
  retryLabel = "Tentar novamente",
  testID = "error-state-card",
}: ErrorStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <AppIcon name="error" size={24} color={colors.error} />
        </View>
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.message}
        >
          {message}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          onPress={onRetry}
          style={withPress(styles.retry)}
        >
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      width: "100%",
      paddingVertical: tokens.spacing[24],
      paddingHorizontal: tokens.spacing[16],
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      width: "100%",
      maxWidth: 480,
      alignItems: "center",
      gap: tokens.spacing[16],
      padding: tokens.spacing[24],
      backgroundColor: colors.book.pageCard,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.errorContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    message: {
      ...tokens.typography.bodyMedium,
      color: colors.text,
      textAlign: "center",
      lineHeight: 22,
    },
    retry: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[24],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.action,
      marginTop: tokens.spacing[4],
    },
    retryText: {
      ...tokens.typography.labelLarge,
      color: colors.nature.onFoliage,
      fontWeight: tokens.fontWeight.semiBold,
    },
  });
}

export default ErrorState;
