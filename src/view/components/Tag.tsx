import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

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

const VARIANT_CONFIG: Record<
  TagVariant,
  { background: string; text: string; defaultLabel: string }
> = {
  sale: {
    background: tokens.colors.badge.sale.background,
    text: tokens.colors.badge.sale.text,
    defaultLabel: "Venda",
  },
  venda: {
    background: tokens.colors.badge.sale.background,
    text: tokens.colors.badge.sale.text,
    defaultLabel: "Venda",
  },
  trade: {
    background: tokens.colors.badge.trade.background,
    text: tokens.colors.badge.trade.text,
    defaultLabel: "Troca",
  },
  troca: {
    background: tokens.colors.badge.trade.background,
    text: tokens.colors.badge.trade.text,
    defaultLabel: "Troca",
  },
  donation: {
    background: tokens.colors.badge.donation.background,
    text: tokens.colors.badge.donation.text,
    defaultLabel: "Doação",
  },
  doacao: {
    background: tokens.colors.badge.donation.background,
    text: tokens.colors.badge.donation.text,
    defaultLabel: "Doação",
  },
  reserved: {
    background: tokens.colors.badge.reserved.background,
    text: tokens.colors.badge.reserved.text,
    defaultLabel: "Reservado",
  },
  reservado: {
    background: tokens.colors.badge.reserved.background,
    text: tokens.colors.badge.reserved.text,
    defaultLabel: "Reservado",
  },
  completed: {
    background: tokens.colors.badge.completed.background,
    text: tokens.colors.badge.completed.text,
    defaultLabel: "Concluído",
  },
  concluido: {
    background: tokens.colors.badge.completed.background,
    text: tokens.colors.badge.completed.text,
    defaultLabel: "Concluído",
  },
  paused: {
    background: tokens.colors.disabledBackground,
    text: tokens.colors.disabledText,
    defaultLabel: "Pausado",
  },
  pausado: {
    background: tokens.colors.disabledBackground,
    text: tokens.colors.disabledText,
    defaultLabel: "Pausado",
  },
  available: {
    background: tokens.colors.soft,
    text: tokens.colors.action,
    defaultLabel: "Disponível",
  },
  disponivel: {
    background: tokens.colors.soft,
    text: tokens.colors.action,
    defaultLabel: "Disponível",
  },
};

/**
 * Componente Tag do Design System do IpêBook (design-system/04-componentes/tag.md).
 * Etiqueta não-interativa indicando modalidade ou status com cores canônicas e alto contraste.
 */
export function Tag({ variant, label, accessibilityLabel }: TagProps) {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.sale;
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
