import { Pressable, StyleSheet, Text } from "react-native";
import { tokens } from "@/view/tokens";
import { AppIcon } from "@/view/components/AppIcon";

export type AddPhotoCardProps = {
  label?: string;
  onPress: () => void;
};

/**
 * Cartão de adicionar foto (Anunciar livro, etapa 1): quadrado ao lado dos campos de
 * título/autor, com "+" e rótulo empilhados ao centro (conferido contra o screenshot real da
 * tela 04.01 no Figma em 2026-10-15 — não é uma faixa de largura total).
 */
export function AddPhotoCard({ label = "Foto da capa", onPress }: AddPhotoCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Adicionar ${label.toLowerCase()}`}
      onPress={onPress}
      style={styles.card}
    >
      <AppIcon name="add" color={tokens.colors.action} size={28} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    minWidth: tokens.accessibility.touchTarget * 2,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[8],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    backgroundColor: tokens.colors.surface,
  },
  label: { color: tokens.colors.action, ...tokens.typography.bodyMedium, textAlign: "center" },
});

export default AddPhotoCard;
