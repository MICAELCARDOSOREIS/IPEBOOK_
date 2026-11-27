import { useMemo } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { triggerHaptic } from "@/view/haptics";

import { withPress } from "@/view/pressFeedback";
export type AddPhotoCardProps = {
  label?: string;
  onPress: () => void;
  photoUrl?: string;
  onRemovePhoto?: () => void;
  /** Ajuste de proporção, como a capa em destaque de `04.04` (Spec 043, RN-07). */
  style?: StyleProp<ViewStyle>;
};

function buildPreviewAccessibilityLabel(label: string): string {
  const lower = label.trim().toLowerCase();
  if (lower === "verso") return "Pré-visualização do verso";
  return `Pré-visualização da ${lower}`;
}

function buildShortSideLabel(label: string): string {
  const trimmed = label.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "foto da capa") return "Capa";
  if (lower === "foto do verso") return "Verso";
  if (lower === "foto da lombada") return "Lombada";
  return trimmed;
}

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
    const shortLabel = buildShortSideLabel(label);
    return (
      <View style={[styles.card, styles.cardFilled, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Alterar ${label.toLowerCase()}`}
          accessibilityHint="Toque para substituir esta foto"
          onPress={onPress}
          style={styles.previewPressable}
        >
          <Image
            source={{ uri: photoUrl }}
            accessibilityLabel={buildPreviewAccessibilityLabel(label)}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.changeBadge}>
            <AppIcon name="camera" color={colors.surface} size={12} />
            <Text numberOfLines={1} style={styles.changeBadgeText}>
              {shortLabel}
            </Text>
          </View>
        </Pressable>
        {onRemovePhoto ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remover ${label.toLowerCase()}`}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={onRemovePhoto}
            style={withPress(styles.removeButton)}
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
      onPress={() => {
        if (Platform.OS === "ios") triggerHaptic("light");
        onPress();
      }}
      style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}
    >
      <View style={styles.addIconCircle}>
        <AppIcon name="add" color={colors.action} size={22} />
      </View>
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
      gap: tokens.spacing[6],
      borderRadius: tokens.radius.large,
      ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : {}),
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: Platform.OS === "ios" ? tokens.ios.separator : colors.m3.outlineVariant,
      backgroundColor: Platform.OS === "ios" ? tokens.ios.cell : colors.surface,
      overflow: "hidden",
      position: "relative",
    },
    cardFilled: {
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
    },
    cardPressed: {
      borderRadius: tokens.shapeMorph.cardPressed,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderColor: colors.action,
      transform: [{ scale: 0.98 }],
    },
    addIconCircle: {
      width: 38,
      height: 38,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.nature.sprout,
      alignItems: "center",
      justifyContent: "center",
    },
    previewImage: {
      ...StyleSheet.absoluteFill,
      borderRadius: tokens.radius.large,
    },
    previewPressable: {
      flex: 1,
      width: "100%",
      height: "100%",
      position: "relative",
    },
    changeBadge: {
      position: "absolute",
      bottom: tokens.spacing[6],
      left: tokens.spacing[6],
      maxWidth: "85%",
      backgroundColor: "rgba(0, 0, 0, 0.68)",
      borderRadius: tokens.radius.full,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 3,
    },
    changeBadgeText: {
      ...tokens.typography.labelSmall,
      color: colors.surface,
      fontSize: 11,
      fontWeight: tokens.fontWeight.semiBold,
      flexShrink: 1,
    },
    removeButton: {
      position: "absolute",
      top: tokens.spacing[6],
      right: tokens.spacing[6],
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      borderRadius: tokens.radius.full,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    label: {
      ...tokens.typography.labelMedium,
      color: colors.action,
      fontWeight: tokens.fontWeight.medium,
      textAlign: "center",
      paddingHorizontal: tokens.spacing[6],
    },
  });
}

export default AddPhotoCard;
