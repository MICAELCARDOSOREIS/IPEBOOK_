import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, fontFamily, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { FilledButton } from "@/view/components/FilledButton";
import { AppIcon } from "@/view/components/AppIcon";

export type MyListingsEmptyProps = {
  onNavigateToCreateListing?: () => void;
  onNavigateToHelp?: () => void;
};

/**
 * Estado vazio da estante alinhado ao Figma `05.02 · Estante vazia` (`25:430`).
 */
export function MyListingsEmpty({
  onNavigateToCreateListing,
  onNavigateToHelp,
}: MyListingsEmptyProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconContainer}>
        <AppIcon name="shelf" size={44} color={colors.m3.onSecondaryContainer} />
      </View>
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
    empty: {
      paddingTop: tokens.spacing[32],
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
    },
    emptyIconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.m3.secondaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: tokens.spacing[8],
    },
    emptyHeadline: {
      fontFamily: fontFamily.brand,
      fontSize: 24,
      lineHeight: 30,
      color: colors.text,
      textAlign: "center",
    },
    emptyTitle: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 320,
    },
    howItWorksButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      marginTop: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
    },
    howItWorksText: {
      ...tokens.typography.labelLarge,
      color: colors.action,
      fontWeight: "600",
    },
    emptyAction: { marginTop: tokens.spacing[16], width: "100%", maxWidth: 320 },
  });
}
