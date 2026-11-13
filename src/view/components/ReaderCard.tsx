import { type ReactNode, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";

export type ReaderCardProps = {
  name: string;
  /** Linha de apoio: avaliação e bairro, por exemplo. */
  subtitle: string;
  photoUrl?: string;
  /** Rótulo pequeno acima do nome; omitido, o cartão mostra só o nome. */
  eyebrow?: string;
  /** Conteúdo extra abaixo da linha de apoio, como o Instagram do Meu perfil (Spec 081). */
  footer?: ReactNode;
  /** Fase do Ciclo do Ipê (ex.: "Semente", "Broto", "Florada do Ipê", "Ipê Frondoso"). */
  cycleStage?: string;
};

/**
 * Prévia de como a pessoa aparece na comunidade (Spec 078): foto com anel da florada, nome em serifa e a
 * linha de apoio. O anel substitui a moldura ilustrada do ipê, que competia com a foto.
 */
export function ReaderCard({
  name,
  subtitle,
  photoUrl,
  eyebrow,
  footer,
  cycleStage,
}: ReaderCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View accessible={!footer} accessibilityLabel={`Cartão de leitor de ${name}`} style={styles.card}>
      <View style={styles.avatarRing}>
        <Avatar name={name} photoUrl={photoUrl} size={72} />
      </View>
      <View style={styles.text}>
        {eyebrow || cycleStage ? (
          <View style={styles.eyebrowRow}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {cycleStage ? (
              <View style={styles.cycleBadge}>
                <Text style={styles.cycleBadgeText}>{cycleStage}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        {footer}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: 96,
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
    },
    avatarRing: {
      padding: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      borderWidth: 2,
      borderColor: colors.ipe.bloom,
      backgroundColor: colors.ipe.container,
    },
    text: { flex: 1, minWidth: 0, gap: tokens.spacing[2] },
    eyebrowRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    cycleBadge: {
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.container,
      borderWidth: 1,
      borderColor: colors.ipe.bloom,
    },
    cycleBadgeText: {
      ...tokens.typography.labelSmall,
      fontWeight: tokens.fontWeight.bold,
      color: colors.ipe.onContainer,
    },
    eyebrow: {
      ...tokens.typography.labelSmall,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.ipe.onContainer,
    },
    name: {
      ...tokens.typography.titleLarge,
      fontFamily: fontFamily.brand,
      fontWeight: tokens.fontWeight.bold,
      color: colors.brandBrown,
    },
    subtitle: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
  });
}
