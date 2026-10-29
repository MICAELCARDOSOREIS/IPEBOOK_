import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";

export type MyListingsEmptyProps = {
  onNavigateToCreateListing?: () => void;
  onNavigateToHelp?: () => void;
};

export function MyListingsEmpty({
  onNavigateToCreateListing,
  onNavigateToHelp,
}: MyListingsEmptyProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.empty}>
      <IconBadge icon="shelf" tone="neutral" size="large" />
      <Text style={styles.emptyHeadline}>Sua estante começa com um livro</Text>
      <Text style={styles.emptyTitle}>
        Anuncie um livro para vender, trocar ou doar na sua região.
      </Text>
      <View style={styles.emptyAction}>
        <FilledButton
          label="Anunciar livro"
          accessibilityLabel="Cadastrar anúncio"
          onPress={() => onNavigateToCreateListing?.()}
        />
      </View>
      {onNavigateToHelp ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Como funciona"
          onPress={onNavigateToHelp}
          style={styles.howItWorksButton}
        >
          <Text style={styles.howItWorksText}>Como funciona</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    empty: { paddingTop: tokens.spacing[48], alignItems: "center", gap: tokens.spacing[12] },
    emptyHeadline: {
      ...tokens.typography.titleLarge,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
      textAlign: "center",
    },
    emptyTitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
    },
    howItWorksButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      marginTop: tokens.spacing[8],
    },
    howItWorksText: {
      ...tokens.typography.labelMedium,
      color: colors.action,
      fontWeight: "600",
    },
    emptyAction: { marginTop: tokens.spacing[16], width: "100%" },
  });
}
