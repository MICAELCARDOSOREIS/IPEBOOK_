import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@/view/tokens";

import { withPress } from "@/view/pressFeedback";
/** Uma página da galeria: se a foto não carregar, avisa em vez de deixar a tela preta. */
function GalleryPhoto({ uri, position, width, height }: { uri: string; position: number; width: number; height: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[styles.photoPage, { width, height }]}>
      {failed ? (
        <Text accessibilityRole="alert" style={styles.failedText}>
          Não foi possível carregar esta foto.
        </Text>
      ) : (
        <Image
          source={{ uri }}
          accessibilityLabel={`Foto ${position} do anúncio`}
          resizeMode="contain"
          onError={() => setFailed(true)}
          style={{ width, height }}
        />
      )}
    </View>
  );
}

export type PhotoGalleryProps = {
  photos: readonly string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
};

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length - 1));
}

/**
 * Galeria de fotos do anúncio em tela cheia, com swipe horizontal (mobile) e
 * navegação por teclado (Web), equivalente ao padrão Esc já usado em `Dialog.tsx`
 * (Spec 018, Spec 038 / Issue #143).
 */
export function PhotoGallery({ photos, initialIndex = 0, visible, onClose }: PhotoGalleryProps) {
  const [index, setIndex] = useState(clampIndex(initialIndex, photos.length));
  const listRef = useRef<FlatList<string> | null>(null);
  // Largura e altura em pixels: porcentagem dentro de uma lista horizontal nativa resolve para 0 e a
  // foto não aparecia (tela preta, só "Foto 1 de 1"). Parte da janela e passa a medir a área real.
  const window = useWindowDimensions();
  const [area, setArea] = useState<{ width: number; height: number } | null>(null);
  const pageWidth = area?.width ?? window.width;
  const pageHeight = area?.height ?? window.height * 0.7;
  const handleAreaLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) setArea({ width, height });
  };

  const goTo = (nextIndex: number) => {
    const clamped = clampIndex(nextIndex, photos.length);
    setIndex(clamped);
    listRef.current?.scrollToIndex?.({ index: clamped, animated: true });
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    if (!layoutMeasurement.width) return;
    setIndex(clampIndex(Math.round(contentOffset.x / layoutMeasurement.width), photos.length));
  };

  const isWeb = Platform.OS === "web" && typeof document !== "undefined";

  useEffect(() => {
    if (!isWeb || !visible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      if (typeof document !== "undefined") document.removeEventListener("keydown", handleKeyDown, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb, visible, index, onClose]);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent={false} statusBarTranslucent navigationBarTranslucent>
      <SafeAreaView style={styles.page}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar galeria de fotos" onPress={onClose} style={withPress(styles.closeButton)}>
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>
          <Text style={styles.counter}>{`Foto ${index + 1} de ${photos.length}`}</Text>
        </View>
        <View style={styles.photoArea} onLayout={handleAreaLayout}>
          <FlatList
            ref={listRef}
            testID="photo-gallery-list"
            data={photos as string[]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(uri, itemIndex) => `${uri}-${itemIndex}`}
            initialScrollIndex={clampIndex(initialIndex, photos.length)}
            getItemLayout={(_, itemIndex) => ({ length: pageWidth, offset: pageWidth * itemIndex, index: itemIndex })}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            renderItem={({ item, index: itemIndex }) => (
              <GalleryPhoto uri={item} position={itemIndex + 1} width={pageWidth} height={pageHeight} />
            )}
          />
        </View>
        <View style={styles.navRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Foto anterior"
            accessibilityState={{ disabled: index <= 0 }}
            disabled={index <= 0}
            onPress={() => goTo(index - 1)}
            style={withPress([styles.navButton, index <= 0 ? styles.navButtonDisabled : null])}
          >
            <Text style={styles.navText}>‹ Anterior</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próxima foto"
            accessibilityState={{ disabled: index >= photos.length - 1 }}
            disabled={index >= photos.length - 1}
            onPress={() => goTo(index + 1)}
            style={withPress([styles.navButton, index >= photos.length - 1 ? styles.navButtonDisabled : null])}
          >
            <Text style={styles.navText}>Próxima ›</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default PhotoGallery;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: tokens.spacing[16],
  },
  closeButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center" },
  closeText: { ...tokens.typography.bodyMedium, color: "#FFFFFF", fontWeight: tokens.fontWeight.bold },
  counter: { ...tokens.typography.bodyMedium, color: "#FFFFFF" },
  photoArea: { flex: 1 },
  photoPage: { alignItems: "center", justifyContent: "center" },
  failedText: { ...tokens.typography.bodyMedium, color: "#FFFFFF", textAlign: "center", padding: tokens.spacing[24] },
  navRow: { flexDirection: "row", justifyContent: "space-between", padding: tokens.spacing[16] },
  navButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[12] },
  navButtonDisabled: { opacity: 0.4 },
  navText: { ...tokens.typography.bodyMedium, color: "#FFFFFF", fontWeight: tokens.fontWeight.bold },
});
