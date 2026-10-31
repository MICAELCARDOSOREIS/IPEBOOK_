import { type ReactNode, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";
import { IpeMark } from "@/view/components/IpeMark";

export type ReaderCardProps = {
  name: string;
  /** Linha de apoio: avaliação e bairro, por exemplo. */
  subtitle: string;
  photoUrl?: string;
  /** Rótulo pequeno acima do nome; padrão "Cartão de leitor". */
  eyebrow?: string;
  /** Selo do ipê no canto quando há foto; o Meu perfil o esconde para dar espaço ao nome (Spec 081). */
  showMark?: boolean;
  /** Conteúdo extra abaixo da linha de apoio, como o Instagram do Meu perfil (Spec 081). */
  footer?: ReactNode;
  /** Fase do Ciclo do Ipê (ex.: "Semente", "Broto", "Florada do Ipê", "Ipê Frondoso"). */
  cycleStage?: string;
};

/**
 * "Cartão de leitor" (Spec 078): capa de livro em âmbar de ipê, com lombada marrom à esquerda, avatar com
 * anel de flor, nome em serifa e o ipê da marca brotando no canto.
 */
export function ReaderCard({
  name,
  subtitle,
  photoUrl,
  eyebrow = "Cartão de leitor",
  showMark = true,
  footer,
  cycleStage,
}: ReaderCardProps) {
  const withMark = Boolean(photoUrl) && showMark;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View accessible={!footer} accessibilityLabel={`Cartão de leitor de ${name}`} style={styles.card}>
      <View style={styles.spine} />
      {/* Sem foto o próprio avatar já é o ipê; o selo no canto só entra quando há foto. */}
      {withMark ? (
        <View style={styles.mark}>
          <IpeMark size={76} testID="reader-card-ipe" />
        </View>
      ) : null}
      <View style={styles.avatarRing}>
        <Avatar name={name} photoUrl={photoUrl} size={64} />
      </View>
      <View style={[styles.text, withMark ? styles.textWithMark : null]}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          {cycleStage ? (
            <View style={styles.cycleBadge}>
              <Text style={styles.cycleBadgeText}>{cycleStage}</Text>
            </View>
          ) : null}
        </View>
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
      minHeight: 112,
      paddingVertical: tokens.spacing[16],
      paddingLeft: tokens.spacing[24],
      paddingRight: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      overflow: "hidden",
      backgroundColor: colors.ipe.container,
    },
    spine: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 8,
      backgroundColor: colors.ipe.trunk,
    },
    mark: { position: "absolute", right: tokens.spacing[12], top: 0, bottom: 0, justifyContent: "center" },
    avatarRing: {
      padding: tokens.spacing[3],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.bloom,
    },
    text: { flex: 1, gap: tokens.spacing[2] },
    textWithMark: { paddingRight: tokens.spacing[80] },
    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    cycleBadge: {
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.bloom,
    },
    cycleBadgeText: {
      ...tokens.typography.labelSmall,
      fontWeight: tokens.fontWeight.bold,
      color: colors.ipe.onContainer,
    },
    eyebrow: {
      ...tokens.typography.labelSmall,
      fontWeight: tokens.fontWeight.semiBold,
      letterSpacing: tokens.letterSpacing.overline,
      textTransform: "uppercase",
      color: colors.ipe.onContainer,
      opacity: 0.75,
    },
    name: {
      ...tokens.typography.titleLarge,
      fontFamily: fontFamily.brand,
      fontWeight: tokens.fontWeight.bold,
      color: colors.ipe.onContainer,
    },
    subtitle: { ...tokens.typography.bodyMedium, color: colors.ipe.onContainer },
  });
}
