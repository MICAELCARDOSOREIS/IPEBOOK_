import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";

type DraftsCardProps = {
  onPress: () => void;
};

/**
 * Card de destaque para rascunhos salvos na estante (Spec 017).
 * Aparece quando o usuário já tem anúncios publicados, incentivando a continuação
 * de rascunhos sem ocupar o cabeçalho.
 */
export function DraftsCard({ onPress }: DraftsCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Rascunhos salvos. Toque para continuar"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.icon}>
        <AppIcon name="document" size={22} color={colors.m3.onSecondaryContainer} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Rascunhos salvos</Text>
        <Text style={styles.subtitle}>Continue um anúncio que você ainda não publicou.</Text>
      </View>
      <AppIcon name="chevronRight" size={20} color={colors.m3.onSecondaryContainer} />
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      padding: tokens.spacing[14],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.secondaryContainer,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    cardPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.985 }],
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      alignItems: "center",
      justifyContent: "center",
    },
    text: { flex: 1, gap: tokens.spacing[2] },
    title: {
      ...tokens.typography.labelLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSecondaryContainer,
    },
    subtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSecondaryContainer,
      opacity: 0.75,
    },
  });
}
