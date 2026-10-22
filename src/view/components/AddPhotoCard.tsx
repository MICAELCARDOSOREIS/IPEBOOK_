import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";

export type AddPhotoCardProps = {
  label?: string;
  onPress: () => void;
  photoUrl?: string;
  onRemovePhoto?: () => void;
  /** Ajuste de proporção, como a capa em destaque de `04.04` (Spec 043, RN-07). */
  style?: StyleProp<ViewStyle>;
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
  style,
}: AddPhotoCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (photoUrl) {
    return (
      <View style={[styles.card, style]}>
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
            <AppIcon name="close" color={colors.surface} size={16} />
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
      style={[styles.card, style]}
    >
      <AppIcon name="add" color={colors.action} size={28} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      aspectRatio: 1,
      minWidth: tokens.accessibility.touchTarget * 2,
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.surface,
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
    label: { color: colors.action, ...tokens.typography.bodyMedium, textAlign: "center" },
  });
}

export default AddPhotoCard;
