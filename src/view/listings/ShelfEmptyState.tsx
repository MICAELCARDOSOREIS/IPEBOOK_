import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BookModality } from "@/model/entities/book";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
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
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <AppIcon name={icon} size={32} color={colors.m3.onSecondaryContainer} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      <View style={styles.emptyAction}>
        <FilledButton label="Ver meus anúncios" onPress={onShowListings} />
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    emptyState: {
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[40],
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
