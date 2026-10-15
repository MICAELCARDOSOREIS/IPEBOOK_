import { Pressable, StyleSheet, Text } from "react-native";
import { tokens } from "@/view/tokens";
import { AppIcon } from "@/view/components/AppIcon";

export type AddPhotoCardProps = {
  label?: string;
  onPress: () => void;
};

/**
 * Cartão de adicionar foto (Anunciar livro, etapa 1). Ainda não tem arquivo próprio em
 * design-system/04-componentes/ — usa os mesmos tokens do Cartão de informação
 * (surface-container-low, radius-medium) com borda tracejada para indicar a ação de upload.
 */
export function AddPhotoCard({ label = "Adicionar foto", onPress }: AddPhotoCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.card}
    >
      <AppIcon name="photo" color={tokens.colors.action} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: tokens.accessibility.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[8],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.soft,
    paddingVertical: tokens.spacing[16],
    paddingHorizontal: tokens.spacing[16],
  },
  label: { color: tokens.colors.action, ...tokens.typography.bodyMedium },
});

export default AddPhotoCard;
