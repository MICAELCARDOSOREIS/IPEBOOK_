import { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { BookModality } from "@/model/entities/book";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { IosCardSurface } from "@/view/components/IosCardSurface";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";

export const MODALITY_LABEL: Record<BookModality, string> = { sale: "Venda", trade: "Troca", donation: "Doação" };

export const REQUEST_VERB: Record<BookModality, string> = {
  sale: "quer comprar",
  trade: "quer trocar",
  donation: "quer receber",
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Estado vazio das abas (Figma `05.05` e `05.06`): ícone em círculo, manchete em serifa e volta aos anúncios. */
export function ShelfEmptyState({
  icon,
  title,
  body,
  onShowListings,
}: {
  icon: AppIconName;
  title: string;
  body: string;
  onShowListings: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const content = (
    <>
      <View style={styles.emptyIcon}>
        <AppIcon name={icon} size={32} color={colors.m3.onSecondaryContainer} />
      </View>
      <Text accessibilityRole="header" maxFontSizeMultiplier={1.4} style={styles.emptyTitle}>{title}</Text>
      <Text maxFontSizeMultiplier={1.4} style={styles.emptyBody}>{body}</Text>
      <View style={styles.emptyAction}>
        <FilledButton label="Ver meus anúncios" onPress={onShowListings} />
      </View>
    </>
  );

  if (Platform.OS === "ios") {
    return (
      <View style={styles.iosOuter}>
        <IosCardSurface variant="glass" style={styles.emptyState}>
          {content}
        </IosCardSurface>
      </View>
    );
  }

  return <View style={styles.emptyState}>{content}</View>;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    iosOuter: {
      paddingTop: tokens.spacing[24],
      paddingHorizontal: tokens.spacing[16],
    },
    emptyState: {
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingTop: Platform.OS === "ios" ? tokens.spacing[24] : tokens.spacing[40],
      paddingBottom: Platform.OS === "ios" ? tokens.spacing[24] : 0,
      paddingHorizontal: tokens.spacing[16],
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: tokens.radius.circle72,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
      marginBottom: tokens.spacing[8],
    },
    emptyTitle: {
      ...tokens.typography.brandTitle,
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    emptyBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center", maxWidth: 320 },
    emptyAction: { marginTop: tokens.spacing[16], alignSelf: "stretch" },
  });
}
