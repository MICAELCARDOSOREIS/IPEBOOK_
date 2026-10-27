import { type ReactNode, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { IpeMark } from "@/view/components/IpeMark";

export type ReaderCardProps = {
  name: string;
  /** Linha de apoio: avaliação e bairro, por exemplo. */
  subtitle: string;
  photoUrl?: string;
  /** Título da faixa superior; padrão "Cartão de leitor". */
  eyebrow?: string;
  /** Número impresso e em código de barras (ver `readerCardNumber`); sem ele o cartão não mostra a faixa de código. */
  cardNumber?: string;
  /** "out/2026": desde quando a pessoa é leitora da comunidade. */
  memberSince?: string;
  /** Conteúdo extra abaixo da linha de apoio, como o Instagram do Meu perfil (Spec 081). */
  footer?: ReactNode;
};

/** Larguras (1 a 3) e espaços das barras, derivados dos dígitos: decorativo, mas estável para o mesmo número. */
function barcodeBars(cardNumber: string): number[] {
  const bars: number[] = [2, 1];
  for (const char of cardNumber.replace(/\D/g, "").padEnd(6, "0")) {
    const digit = Number(char);
    bars.push((digit % 3) + 1, ((digit + 1) % 2) + 1, (digit % 2) + 1, ((digit + 2) % 3) + 1);
  }
  bars.push(1, 2);
  return bars;
}

/**
 * "Cartão de leitor" como uma carteirinha de biblioteca (Spec 078, redesenhado na Spec 092): faixa superior
 * marrom com o nome da biblioteca e o ipê, foto 3x4 com moldura âmbar, campos com rótulo (leitor, número,
 * desde) e código de barras no rodapé. Sem foto, o ipê ocupa a moldura.
 */
export function ReaderCard({
  name,
  subtitle,
  photoUrl,
  eyebrow = "Cartão de leitor",
  cardNumber,
  memberSince,
  footer,
}: ReaderCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const bars = useMemo(() => (cardNumber ? barcodeBars(cardNumber) : []), [cardNumber]);

  return (
    <View accessible={!footer} accessibilityLabel={`Cartão de leitor de ${name}`} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>{eyebrow}</Text>
          <Text style={styles.headerSub}>Biblioteca Comunitária de Piripiri</Text>
        </View>
        <IpeMark size={32} />
      </View>

      <View style={styles.body}>
        <View style={styles.photoFrame}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} accessible={false} resizeMode="cover" style={styles.photo} />
          ) : (
            <IpeMark size={52} />
          )}
        </View>

        <View style={styles.fields}>
          <View>
            <Text style={styles.label}>Leitor(a)</Text>
            <Text style={styles.name} numberOfLines={2}>
              {name}
            </Text>
          </View>
          {cardNumber || memberSince ? (
            <View style={styles.pairRow}>
              {cardNumber ? (
                <View style={styles.pairItem}>
                  <Text style={styles.label}>Nº do cartão</Text>
                  <Text style={styles.value}>{cardNumber}</Text>
                </View>
              ) : null}
              {memberSince ? (
                <View style={styles.pairItem}>
                  <Text style={styles.label}>Leitor desde</Text>
                  <Text style={styles.value}>{memberSince}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          {footer}
        </View>
      </View>

      {cardNumber ? (
        <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.barcodeArea}>
          <View style={styles.barcode}>
            {bars.map((width, index) =>
              index % 2 === 0 ? (
                <View key={index} style={[styles.bar, { width: width * 2 }]} />
              ) : (
                <View key={index} style={{ width: width * 2 }} />
              ),
            )}
          </View>
          <Text style={styles.barcodeNumber}>{cardNumber}</Text>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: colors.ipe.container,
      borderWidth: 1,
      borderColor: colors.ipe.trunk,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      backgroundColor: colors.ipe.trunk,
    },
    headerTexts: { flex: 1, gap: 2 },
    headerTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "700",
      letterSpacing: 0.4,
      color: colors.ipe.container,
    },
    headerSub: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: colors.ipe.container,
      opacity: 0.85,
    },
    body: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
    },
    photoFrame: {
      width: 72,
      height: 92,
      borderRadius: 10,
      borderWidth: 3,
      borderColor: colors.ipe.bloom,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.ipe.container,
    },
    photo: { width: "100%", height: "100%" },
    fields: { flex: 1, gap: tokens.spacing[4] },
    label: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: colors.ipe.onContainer,
      opacity: 0.7,
    },
    name: {
      fontFamily: fontFamily.brand,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "700",
      color: colors.ipe.onContainer,
    },
    pairRow: { flexDirection: "row", gap: tokens.spacing[16] },
    pairItem: { flexShrink: 1 },
    value: { ...tokens.typography.labelLarge, color: colors.ipe.onContainer },
    subtitle: { ...tokens.typography.bodyMedium, color: colors.ipe.onContainer },
    barcodeArea: {
      alignItems: "center",
      gap: 2,
      marginHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[4],
      paddingBottom: tokens.spacing[8],
      borderTopWidth: 1,
      borderTopColor: colors.ipe.trunk,
      borderStyle: "dashed",
    },
    barcode: { flexDirection: "row", height: 24, alignItems: "stretch" },
    bar: { backgroundColor: colors.ipe.onContainer },
    barcodeNumber: {
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 3,
      color: colors.ipe.onContainer,
      opacity: 0.8,
    },
  });
}
