import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { AppIcon } from "@/view/components/AppIcon";

export type AddPhotoCardProps = {
  label?: string;
  onPress: () => void;
  photoUrl?: string;
  onRemovePhoto?: () => void;
};

/**
 * Cartão de adicionar foto (Anunciar livro, etapa 1): quadrado ao lado dos campos de
 * título/autor, com "+" e rótulo empilhados ao centro (conferido contra o screenshot real da
 * tela 04.01 no Figma em 2026-10-15 — não é uma faixa de largura total).
 * Suporta exibir a foto selecionada com opção de remoção.
 */
export function AddPhotoCard({
  label = "Foto da capa",
  onPress,
  photoUrl,
  onRemovePhoto,
}: AddPhotoCardProps) {
  if (photoUrl) {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: photoUrl }}
          accessibilityLabel={`Pré-visualização da ${label.toLowerCase()}`}
          style={styles.previewImage}
          resizeMode="cover"
        />
        {onRemovePhoto ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remover ${label.toLowerCase()}`}
            onPress={onRemovePhoto}
            style={styles.removeButton}
          >
            <AppIcon name="close" color={tokens.colors.surface} size={16} />
          </Pressable>
        ) : null}
      </View>
    );
  }

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
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    ...StyleSheet.absoluteFill,
  },
  removeButton: {
    position: "absolute",
    top: tokens.spacing[4],
    right: tokens.spacing[4],
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: tokens.radius.full,
    padding: tokens.spacing[4],
    minWidth: 24,
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: tokens.colors.action, ...tokens.typography.bodyMedium, textAlign: "center" },
});

export default AddPhotoCard;
