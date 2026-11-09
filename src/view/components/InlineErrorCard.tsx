import { useMemo } from "react";
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";

export type InlineErrorCardProps = {
  message: string;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Card padronizado de erro inline para formulários e ações (Spec 131 / ADR 0102).
 * Elimina textos vermelhos soltos e integra o feedback de erro harmonicamente ao tema.
 */
export function InlineErrorCard({
  message,
  icon = "error",
  style,
  testID = "inline-error-card",
}: InlineErrorCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!message) return null;

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.container, style]}
    >
      <AppIcon name={icon} size={18} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
      backgroundColor: colors.errorContainer,
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.error,
    },
    message: {
      flex: 1,
      ...tokens.typography.bodyMedium,
      color: colors.text,
      fontWeight: "500",
    },
  });
}

export default InlineErrorCard;
