import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { spacing, radius, typography, accessibility } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";

export type BarcodeScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

/**
 * Modal com leitor de código de barras físico via expo-camera (Spec 059 / ADR 0042).
 * Focado na leitura de códigos de barras de livros (EAN-13, EAN-8, UPC-A, UPC-E).
 */
export function BarcodeScannerModal({
  visible,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const scanLockRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setHasScanned(false);
      scanLockRef.current = false;
      if (!permission?.granted) {
        requestPermission().catch(() => {});
      }
    }
  }, [visible, permission?.granted, requestPermission]);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanLockRef.current || hasScanned) return;
    if (result.data) {
      scanLockRef.current = true;
      setHasScanned(true);
      onScan(result.data);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Barra Superior */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Escanear ISBN</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar leitor de código de barras"
            onPress={onClose}
            hitSlop={12}
            style={styles.closeButton}
          >
            <AppIcon name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Conteúdo: Câmera ou Telas de Permissão */}
        {!permission ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.action} />
            <Text style={[styles.statusText, { color: colors.secondaryText }]}>
              Iniciando câmera...
            </Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.permissionContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.soft }]}>
              <AppIcon name="camera" size={40} color={colors.action} />
            </View>
            <Text style={[styles.permissionTitle, { color: colors.text }]}>
              Permissão de Câmera Necessária
            </Text>
            <Text style={[styles.permissionMessage, { color: colors.secondaryText }]}>
              Para ler o código de barras no verso do livro e preencher os dados automaticamente, precisamos de acesso à câmera do seu dispositivo.
            </Text>
            <View style={styles.permissionActions}>
              <FilledButton
                label="Permitir Câmera"
                onPress={() => requestPermission()}
                accessibilityLabel="Solicitar permissão de câmera"
              />
              <View style={styles.buttonSpacer} />
              <OutlinedButton
                label="Digitar ISBN Manualmente"
                onPress={onClose}
                accessibilityLabel="Fechar e digitar ISBN manualmente"
              />
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
              }}
              onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
            />

            {/* Overlay com Moldura de Foco / Mira */}
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.overlayDark} />
              <View style={styles.overlayCenterRow}>
                <View style={styles.overlayDark} />
                <View style={[styles.reticle, { borderColor: colors.highlight }]}>
                  <View style={[styles.reticleCornerTL, { borderColor: colors.highlight }]} />
                  <View style={[styles.reticleCornerTR, { borderColor: colors.highlight }]} />
                  <View style={[styles.reticleCornerBL, { borderColor: colors.highlight }]} />
                  <View style={[styles.reticleCornerBR, { borderColor: colors.highlight }]} />
                  <View style={[styles.laserLine, { backgroundColor: colors.error }]} />
                </View>
                <View style={styles.overlayDark} />
              </View>
              <View style={[styles.overlayDark, styles.overlayBottom]}>
                <Text style={styles.instructionText}>
                  Aponte para o código de barras no verso do livro
                </Text>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[16],
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.titleMedium,
  },
  closeButton: {
    minWidth: accessibility.touchTarget,
    minHeight: accessibility.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[16],
    padding: spacing[24],
  },
  statusText: {
    ...typography.bodyLarge,
    textAlign: "center",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[24],
  },
  permissionTitle: {
    ...typography.titleLarge,
    textAlign: "center",
    marginBottom: spacing[8],
  },
  permissionMessage: {
    ...typography.bodyLarge,
    textAlign: "center",
    marginBottom: spacing[24],
  },
  permissionActions: {
    width: "100%",
    maxWidth: 320,
  },
  buttonSpacer: {
    height: spacing[12],
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  overlayDark: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  overlayCenterRow: {
    flexDirection: "row",
    height: 180,
  },
  reticle: {
    width: 280,
    height: 180,
    borderWidth: 1,
    borderRadius: radius.medium,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  reticleCornerTL: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  reticleCornerTR: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  reticleCornerBL: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  reticleCornerBR: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  laserLine: {
    width: "90%",
    height: 2,
    opacity: 0.8,
  },
  overlayBottom: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
  instructionText: {
    ...typography.bodyLarge,
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
