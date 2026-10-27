import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { ImageSource } from "@/model/services/iImagePickerService";
import { AppIcon } from "@/view/components/AppIcon";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";

export type PhotoSourceSheetProps = {
  visible: boolean;
  title?: string;
  onChoose: (source: ImageSource) => void;
  onClose: () => void;
};

/** Folha inferior "Tirar foto" ou "Escolher da galeria", igual à escolha da foto de perfil. */
export function PhotoSourceSheet({ visible, title = "Adicionar foto", onChoose, onClose }: PhotoSourceSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar ao tocar fora" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={styles.sheet}>
          <View accessible={false} importantForAccessibility="no" style={styles.handle} />
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Tirar foto com a câmera" onPress={() => onChoose("camera")} style={styles.row}>
            <AppIcon name="camera" size={22} color={colors.m3.primary} />
            <Text style={styles.rowText}>Tirar foto</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Escolher foto da galeria" onPress={() => onChoose("library")} style={styles.row}>
            <AppIcon name="photo" size={22} color={colors.m3.primary} />
            <Text style={styles.rowText}>Escolher da galeria</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: tokens.spacing[24],
      paddingBottom: tokens.spacing[24],
      gap: tokens.spacing[4],
    },
    handle: { alignSelf: "center", width: 32, height: 4, borderRadius: 2, marginTop: tokens.spacing[12], backgroundColor: colors.m3.onSurfaceVariant, opacity: 0.4 },
    title: { ...tokens.typography.titleMedium, color: colors.m3.onSurface, paddingVertical: tokens.spacing[8] },
    row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[16], minHeight: 56 },
    rowText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    cancel: { minHeight: tokens.accessibility.touchTarget, alignItems: "center", justifyContent: "center" },
    cancelText: { ...tokens.typography.labelLarge, color: colors.m3.primary },
  });
}
