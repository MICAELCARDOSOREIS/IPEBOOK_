import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { ImageSource } from "@/model/services/iImagePickerService";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { PhotoSourceSheet } from "@/view/components/PhotoSourceSheet";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { AppIcon } from "@/view/components/AppIcon";

export type CreateListingStep2Props = {
  photoUrl: string;
  photos: readonly string[];
  loading: boolean;
  error: string | null;
  errorRef?: React.Ref<any>;
  onSetPhotoUrl: (url: string) => void;
  onRemovePhoto: (index: number) => void;
  /** Foto nova pela câmera ou galeria (Spec 092); `cover` é a capa, `extra` as demais. */
  onChoosePhoto?: (slot: "cover" | "extra", source: ImageSource) => void;
  uploading?: boolean;
  photoError?: string | null;
};

export function CreateListingStep2({
  photoUrl,
  photos,
  loading,
  error,
  errorRef,
  onSetPhotoUrl,
  onRemovePhoto,
  onChoosePhoto,
  uploading = false,
  photoError,
}: CreateListingStep2Props) {
  const [sheetSlot, setSheetSlot] = useState<"cover" | "extra" | null>(null);
  const [showLinkField, setShowLinkField] = useState(false);
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors, wideWeb), [colors, wideWeb]);

  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>Mostre seu livro.</Text>
      <Text style={styles.subtitle}>
        Uma foto nítida ajuda a conhecer o estado do exemplar. Até 3 fotos.
      </Text>

      {/* `04.04`: capa em destaque à esquerda, lombada e páginas empilhadas à direita. */}
      <View style={wideWeb ? styles.webPhotoGrid : styles.photoGrid}>
        <AddPhotoCard
          label="Foto da capa"
          photoUrl={photoUrl}
          onPress={() => setSheetSlot("cover")}
          onRemovePhoto={() => onSetPhotoUrl("")}
          style={wideWeb ? styles.webCoverSlot : styles.coverSlot}
        />
        <View style={wideWeb ? styles.webSideSlots : styles.sideSlots}>
          <AddPhotoCard
            label="Lombada"
            photoUrl={photos[0]}
            onPress={() => setSheetSlot("extra")}
            onRemovePhoto={() => onRemovePhoto(0)}
            style={wideWeb ? styles.webSideSlot : styles.sideSlot}
          />
          <AddPhotoCard
            label="Páginas"
            photoUrl={photos[1]}
            onPress={() => setSheetSlot("extra")}
            onRemovePhoto={() => onRemovePhoto(1)}
            style={wideWeb ? styles.webSideSlot : styles.sideSlot}
          />
        </View>
      </View>

      {uploading ? (
        <View accessibilityLiveRegion="polite" style={styles.uploadingRow}>
          <ActivityIndicator color={colors.action} accessibilityLabel="Enviando foto" />
          <Text style={styles.tipText}>Enviando a foto…</Text>
        </View>
      ) : null}
      {photoError ? (
        <Text accessibilityRole="alert" style={styles.errorText}>{photoError}</Text>
      ) : null}

      {showLinkField ? (
        <TextField
          label="Endereço da foto da capa"
          value={photoUrl}
          onChangeText={onSetPhotoUrl}
          editable={!loading}
          placeholder="https://exemplo.com/capa.jpg"
          autoCapitalize="none"
          helperText="Cole o link de uma imagem pública, se preferir."
        />
      ) : (
        <TextButton label="Prefiro colar o link de uma imagem" onPress={() => setShowLinkField(true)} />
      )}

      <PhotoSourceSheet
        visible={sheetSlot !== null}
        title={sheetSlot === "cover" ? "Foto da capa" : "Mais uma foto"}
        onChoose={(source) => {
          const slot = sheetSlot;
          setSheetSlot(null);
          if (slot) onChoosePhoto?.(slot, source);
        }}
        onClose={() => setSheetSlot(null)}
      />

      <View style={wideWeb ? styles.webTipBox : styles.tipBox}>
        <View style={styles.tipHeaderRow}>
          <AppIcon name="info" size={18} color={colors.action} />
          <Text style={styles.tipTitle}>Dica de foto</Text>
        </View>
        <Text style={styles.tipText}>
          {wideWeb
            ? "Fotografe em local com boa luz natural. Além da capa inteira, mostre a lombada e o corte das páginas para quem busca em Piripiri conferir a real conservação do livro."
            : "Luz natural, fundo liso e capa inteira no quadro. Fotos da lombada e do corte das páginas ajudam a conferir a conservação do exemplar."}
        </Text>
      </View>

      {error ? (
        <Text
          ref={errorRef}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={styles.errorText}
        >
          {error}
        </Text>
      ) : null}
    </>
  );
}

function createStyles(colors: ColorPalette, wideWeb: boolean) {
  return StyleSheet.create({
    photoGrid: { flexDirection: "row", gap: tokens.spacing[12] },
    webPhotoGrid: {
      flexDirection: "row",
      gap: tokens.spacing[16],
      width: "100%",
    },
    coverSlot: { flex: 2, aspectRatio: undefined, minWidth: 0 },
    webCoverSlot: {
      flex: 1.4,
      aspectRatio: undefined,
      minWidth: 0,
    },
    sideSlots: { flex: 1, gap: tokens.spacing[12] },
    webSideSlots: {
      flex: 1,
      flexDirection: "row",
      gap: tokens.spacing[12],
    },
    sideSlot: { minWidth: 0 },
    webSideSlot: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      ...tokens.typography.displayLarge,
      color: colors.text,
    },
    subtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
    },
    uploadingRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    tipBox: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[16],
      gap: tokens.spacing[4],
    },
    webTipBox: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: tokens.radius.large,
      padding: tokens.spacing[16],
      gap: tokens.spacing[6],
    },
    tipHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    tipTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
    },
    tipText: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
  });
}
