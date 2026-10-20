import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@/view/tokens";

export type PhotoGalleryProps = {
  photos: readonly string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
};

/** Galeria de fotos do anúncio em tela cheia, com navegação entre fotos (Spec 018). */
export function PhotoGallery({ photos, initialIndex = 0, visible, onClose }: PhotoGalleryProps) {
  const [index, setIndex] = useState(initialIndex);
  const current = photos[Math.min(index, photos.length - 1)];

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent={false}>
      <SafeAreaView style={styles.page}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar galeria de fotos" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>
          <Text style={styles.counter}>{`${Math.min(index, photos.length - 1) + 1} de ${photos.length}`}</Text>
        </View>
        <View style={styles.photoArea}>
          <Image
            source={{ uri: current }}
            accessibilityLabel={`Foto ${index + 1} do anúncio`}
            resizeMode="contain"
            style={styles.photo}
          />
        </View>
        <View style={styles.navRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Foto anterior"
            accessibilityState={{ disabled: index <= 0 }}
            disabled={index <= 0}
            onPress={() => setIndex((current) => Math.max(0, current - 1))}
            style={[styles.navButton, index <= 0 ? styles.navButtonDisabled : null]}
          >
            <Text style={styles.navText}>‹ Anterior</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próxima foto"
            accessibilityState={{ disabled: index >= photos.length - 1 }}
            disabled={index >= photos.length - 1}
            onPress={() => setIndex((current) => Math.min(photos.length - 1, current + 1))}
            style={[styles.navButton, index >= photos.length - 1 ? styles.navButtonDisabled : null]}
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
  closeText: { color: "#FFFFFF", fontWeight: "bold", fontSize: tokens.typography.bodyMedium.fontSize },
  counter: { color: "#FFFFFF", fontSize: tokens.typography.bodyMedium.fontSize },
  photoArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%" },
  navRow: { flexDirection: "row", justifyContent: "space-between", padding: tokens.spacing[16] },
  navButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[12] },
  navButtonDisabled: { opacity: 0.4 },
  navText: { color: "#FFFFFF", fontWeight: "bold", fontSize: tokens.typography.bodyMedium.fontSize },
});
