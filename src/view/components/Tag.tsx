import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type TagVariant =
  | "sale"
  | "trade"
  | "donation"
  | "reserved"
  | "completed"
  | "paused"
  | "available"
  | "venda"
  | "troca"
  | "doacao"
  | "reservado"
  | "concluido"
  | "pausado"
  | "disponivel";

export type TagProps = {
  variant: TagVariant;
  label?: string;
  accessibilityLabel?: string;
};

function createVariantConfig(
  colors: ColorPalette,
): Record<TagVariant, { background: string; text: string; defaultLabel: string }> {
  return {
    sale: {
      background: colors.badge.sale.background,
      text: colors.badge.sale.text,
      defaultLabel: "Venda",
    },
    venda: {
      background: colors.badge.sale.background,
      text: colors.badge.sale.text,
      defaultLabel: "Venda",
    },
    trade: {
      background: colors.badge.trade.background,
      text: colors.badge.trade.text,
      defaultLabel: "Troca",
    },
    troca: {
      background: colors.badge.trade.background,
      text: colors.badge.trade.text,
      defaultLabel: "Troca",
    },
    donation: {
      background: colors.badge.donation.background,
      text: colors.badge.donation.text,
      defaultLabel: "Doação",
    },
    doacao: {
      background: colors.badge.donation.background,
      text: colors.badge.donation.text,
      defaultLabel: "Doação",
    },
    reserved: {
      background: colors.badge.reserved.background,
      text: colors.badge.reserved.text,
      defaultLabel: "Reservado",
    },
    reservado: {
      background: colors.badge.reserved.background,
      text: colors.badge.reserved.text,
      defaultLabel: "Reservado",
    },
    completed: {
      background: colors.badge.completed.background,
      text: colors.badge.completed.text,
      defaultLabel: "Concluído",
    },
    concluido: {
      background: colors.badge.completed.background,
      text: colors.badge.completed.text,
      defaultLabel: "Concluído",
    },
    paused: {
      background: colors.disabledBackground,
      text: colors.disabledText,
      defaultLabel: "Pausado",
    },
    pausado: {
      background: colors.disabledBackground,
      text: colors.disabledText,
      defaultLabel: "Pausado",
    },
    available: {
      background: colors.soft,
      text: colors.action,
      defaultLabel: "Disponível",
    },
    disponivel: {
      background: colors.soft,
      text: colors.action,
      defaultLabel: "Disponível",
    },
  };
}

/**
 * Componente Tag do Design System do IpêBook (design-system/04-componentes/tag.md).
 * Etiqueta não-interativa indicando modalidade ou status com cores canônicas e alto contraste.
 */
export function Tag({ variant, label, accessibilityLabel }: TagProps) {
  const { colors } = useTheme();
  const variantConfig = useMemo(() => createVariantConfig(colors), [colors]);
  const config = variantConfig[variant] ?? variantConfig.sale;
  const displayText = label ?? config.defaultLabel;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? displayText}
      style={[styles.container, { backgroundColor: config.background }]}
    >
      <Text style={[styles.text, { color: config.text }]}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    paddingHorizontal: tokens.spacing[8],
    paddingVertical: 2,
    borderRadius: tokens.radius.full,
  },
  text: {
    fontSize: 11,
    fontWeight: "bold",
  },
});
