import { BlurView } from "expo-blur";
import { useRef } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ImageSource } from "@/model/services/iImagePickerService";
import { AppIcon } from "@/view/components/AppIcon";
import { type FocusableElement, useModalFocusTrap } from "@/view/components/Dialog";
import { triggerHaptic } from "@/view/haptics";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useReduceTransparency } from "@/view/useReduceTransparency";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";

import { withPress } from "@/view/pressFeedback";
export type PhotoSourceSheetProps = {
  visible: boolean;
  title?: string;
  bookSide?: keyof typeof bookPhotoTips;
  onChoose: (source: ImageSource) => void;
  onClose: () => void;
};

const bookPhotoTips = {
  cover: "Alinhe a capa de frente e deixe as quatro bordas visíveis. Use um fundo liso e evite reflexos sobre o título.",
  spine: "Coloque a lombada na vertical e enquadre do topo à base. Deixe o título e as marcas de uso visíveis.",
  back: "Fotografe a contracapa de frente, com todas as bordas no quadro. Evite reflexos sobre o texto.",
};

const photoSourceStylesCache = new WeakMap<ColorPalette, ReturnType<typeof createStyles>>();
function getPhotoSourceStyles(colors: ColorPalette) {
  let cached = photoSourceStylesCache.get(colors);
  if (!cached) {
    cached = createStyles(colors);
    photoSourceStylesCache.set(colors, cached);
  }
  return cached;
}

/** Folha inferior "Tirar foto" ou "Escolher da galeria", igual à escolha da foto de perfil. */
export function PhotoSourceSheet(props: PhotoSourceSheetProps) {
  if (!props.visible) return null;
  return <PhotoSourceSheetContent {...props} />;
}

function PhotoSourceSheetContent({ visible, title = "Adicionar foto", bookSide, onChoose, onClose }: PhotoSourceSheetProps) {
  const { colors } = useTheme();
  const isIos = Platform.OS === "ios";
  const reduceTransparency = useReduceTransparency();
  const iosGlass = isIos && !reduceTransparency;
  const styles = getPhotoSourceStyles(colors);
  const insets = useSafeAreaInsets();
  const wideWeb = useIsWideWeb();
  const cameraRef = useRef<FocusableElement | null>(null);
  const libraryRef = useRef<FocusableElement | null>(null);
  const cancelRef = useRef<FocusableElement | null>(null);

  useModalFocusTrap(visible, () => [cameraRef.current, libraryRef.current, cancelRef.current], onClose);

  return (
    <Modal accessibilityViewIsModal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={[styles.scrim, wideWeb && styles.scrimWide]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar ao tocar fora" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View
          style={[
            styles.sheet,
            isIos && (iosGlass ? styles.iosGlassSheet : styles.iosOpaqueSheet),
            wideWeb && styles.sheetWide,
            { paddingBottom: wideWeb ? tokens.spacing[24] : tokens.spacing[16] + insets.bottom },
          ]}
        >
          {iosGlass && !wideWeb ? (
            <View pointerEvents="none" style={styles.iosBlurClip}>
              <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
            </View>
          ) : null}
          {wideWeb ? null : <View accessible={false} importantForAccessibility="no" style={styles.handle} />}
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {bookSide ? (
            <View style={styles.guide}>
              <View accessible={false} aria-hidden style={styles.guideFrame}>
                <View style={[styles.guideBook, bookSide === "spine" && styles.guideSpine]} />
              </View>
              <View style={styles.guideCopy}>
                <Text style={styles.guideTitle}>Como enquadrar</Text>
                <Text style={styles.guideText}>{bookPhotoTips[bookSide]}</Text>
              </View>
            </View>
          ) : null}
          <Pressable
            ref={cameraRef as never}
            accessibilityRole="button"
            accessibilityLabel="Tirar foto com a câmera"
            onPress={() => {
              if (isIos) triggerHaptic("light");
              onChoose("camera");
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <AppIcon name="camera" size={22} color={colors.m3.primary} />
            <Text style={styles.rowText}>Tirar foto</Text>
          </Pressable>
          <Pressable
            ref={libraryRef as never}
            accessibilityRole="button"
            accessibilityLabel="Escolher foto da galeria"
            onPress={() => {
              if (isIos) triggerHaptic("light");
              onChoose("library");
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <AppIcon name="photo" size={22} color={colors.m3.primary} />
            <Text style={styles.rowText}>Escolher da galeria</Text>
          </Pressable>
          <Pressable ref={cancelRef as never} accessibilityRole="button" accessibilityLabel="Cancelar" onPress={onClose} style={withPress(styles.cancel)}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    scrim: { flex: 1, backgroundColor: colors.m3.scrim, justifyContent: "flex-end" },
    scrimWide: { justifyContent: "center", alignItems: "center", padding: tokens.spacing[24] },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: tokens.radius.xxl,
      borderTopRightRadius: tokens.radius.xxl,
      paddingHorizontal: tokens.spacing[24],
      paddingBottom: tokens.spacing[24],
      gap: tokens.spacing[4],
    },
    sheetWide: {
      width: "100%",
      maxWidth: 440,
      borderRadius: tokens.radius.xxl,
    },
    handle: { alignSelf: "center", width: 32, height: 4, borderRadius: tokens.radius.hairline, marginTop: tokens.spacing[12], backgroundColor: colors.m3.onSurfaceVariant, opacity: 0.4 },
    title: { ...tokens.typography.titleMedium, color: colors.m3.onSurface, paddingVertical: tokens.spacing[8] },
    guide: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      padding: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.medium,
    },
    guideFrame: {
      width: 52,
      height: 66,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.m3.onSurfaceVariant,
      borderRadius: tokens.radius.small,
    },
    guideBook: {
      width: 32,
      height: 50,
      borderRadius: tokens.radius.micro,
      borderWidth: 2,
      borderColor: colors.m3.primary,
    },
    guideSpine: { width: 12 },
    guideCopy: { flex: 1, gap: tokens.spacing[4] },
    guideTitle: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    guideText: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: 56,
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
    },
    rowPressed: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      transform: [{ scale: 0.96 }],
    },
    rowText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    cancel: { minHeight: tokens.accessibility.touchTarget, alignItems: "center", justifyContent: "center" },
    cancelText: { ...tokens.typography.labelLarge, color: colors.m3.primary },
    iosGlassSheet: {
      borderCurve: "continuous",
      backgroundColor: tokens.glass.fill,
      borderTopWidth: 1,
      borderColor: tokens.glass.stroke,
      overflow: "hidden",
    },
    iosOpaqueSheet: {
      borderCurve: "continuous",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderTopWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    iosBlurClip: {
      ...StyleSheet.absoluteFill,
      borderTopLeftRadius: tokens.radius.xxl,
      borderTopRightRadius: tokens.radius.xxl,
      overflow: "hidden",
    },
  });
}
