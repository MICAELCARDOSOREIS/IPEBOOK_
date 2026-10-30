import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BookModality } from "@/model/entities/book";
import type { IsbnFeedback } from "@/viewmodel/useCreateListingViewModel";
import type { ListingBasicsErrors } from "@/viewmodel/listingBasicsValidation";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { Chip } from "@/view/components/Chip";
import { AppIcon } from "@/view/components/AppIcon";
import { IconBadge } from "@/view/components/IconBadge";
import { TextField } from "@/view/components/TextField";
import { BarcodeScannerModal } from "@/view/components/BarcodeScannerModal";

import { withPress } from "@/view/pressFeedback";
const MODALITIES: { value: BookModality; label: string }[] = [
  { value: "sale", label: "Venda" },
  { value: "trade", label: "Troca" },
  { value: "donation", label: "Doação" },
];

export type CreateListingStep1Props = {
  isbn?: string;
  lookingUpIsbn?: boolean;
  isbnFeedback?: IsbnFeedback | null;
  onSetIsbn?: (value: string) => void;
  onLookupIsbn?: () => void;
  onScanBarcode?: (code: string) => void;
  modality: BookModality;
  title: string;
  author: string;
  price: string;
  photoUrl: string;
  loading: boolean;
  error: string | null;
  errorRef?: React.Ref<any>;
  onSetModality: (modality: BookModality) => void;
  onSetTitle: (title: string) => void;
  onSetAuthor: (author: string) => void;
  onSetPrice: (price: string) => void;
  onSetPhotoUrl: (url: string) => void;
  fieldErrors?: ListingBasicsErrors;
  onGoToPhotos: () => void;
};

export function CreateListingStep1({
  isbn,
  lookingUpIsbn,
  isbnFeedback,
  onSetIsbn,
  onLookupIsbn,
  onScanBarcode,
  modality,
  title,
  author,
  price,
  photoUrl,
  loading,
  error,
  errorRef,
  onSetModality,
  onSetTitle,
  onSetAuthor,
  onSetPrice,
  onSetPhotoUrl,
  fieldErrors = {},
  onGoToPhotos,
}: CreateListingStep1Props) {
  const { colors } = useTheme();
  const [scannerVisible, setScannerVisible] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <View style={styles.isbnCard}>
        {/* Uma linha só, tocável inteira: o ISBN é um atalho, os campos do livro continuam logo abaixo. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir leitor de código de barras pela câmera"
          accessibilityState={{ disabled: Boolean(loading || lookingUpIsbn) }}
          disabled={loading || lookingUpIsbn}
          onPress={() => setScannerVisible(true)}
          style={withPress(styles.isbnHeader)}
        >
          <IconBadge icon="camera" tone="action" />
          <View style={styles.isbnTexts}>
            <Text style={styles.isbnTitle}>{lookingUpIsbn ? "Buscando o livro..." : "Escanear código de barras"}</Text>
            <Text style={styles.hint}>Título e autor entram sozinhos.</Text>
          </View>
          <AppIcon name="chevronRight" size={24} color={colors.m3.onSurfaceVariant} />
        </Pressable>

        <BarcodeScannerModal
          visible={scannerVisible}
          onClose={() => setScannerVisible(false)}
          onScan={(scannedCode) => {
            onScanBarcode?.(scannedCode);
          }}
        />

        {isbnFeedback ? (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[
              styles.isbnFeedback,
              isbnFeedback.type === "success"
                ? styles.isbnFeedbackSuccess
                : isbnFeedback.type === "error"
                  ? styles.isbnFeedbackError
                  : styles.isbnFeedbackInfo,
            ]}
          >
            <Text
              style={[
                styles.isbnFeedbackText,
                isbnFeedback.type === "success"
                  ? styles.isbnFeedbackTextSuccess
                  : isbnFeedback.type === "error"
                    ? styles.isbnFeedbackTextError
                    : styles.isbnFeedbackTextInfo,
              ]}
            >
              {isbnFeedback.message}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.dividerText}>ou preencha manualmente</Text>

      <View style={styles.field}>
        <Text style={styles.sectionLabel}>Modalidade</Text>
        <View style={styles.chipRow}>
          {MODALITIES.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              accessibilityLabel={`Modalidade ${item.label}`}
              tone={colors.badge[item.value]}
              selected={modality === item.value}
              onPress={() => onSetModality(item.value)}
              disabled={loading}
            />
          ))}
        </View>
      </View>

      {/* Título e autor ocupam a largura toda: ao lado da foto sobrava uma coluna estreita para digitar. */}
      <View style={styles.photoRow}>
        <AddPhotoCard
          photoUrl={photoUrl}
          onPress={onGoToPhotos}
          onRemovePhoto={() => onSetPhotoUrl("")}
        />
        <View style={styles.photoTexts}>
          <Text style={styles.sectionLabel}>Foto de capa</Text>
          <Text style={styles.hint}>Foto leve, com boa luz. Você pode ajustar na próxima etapa.</Text>
        </View>
      </View>

      <TextField
        label="Título"
        value={title}
        onChangeText={onSetTitle}
        editable={!loading}
        placeholder="Ex: Dom Casmurro"
        error={fieldErrors.title}
      />
      <TextField
        label="Autor"
        value={author}
        onChangeText={onSetAuthor}
        editable={!loading}
        placeholder="Ex: Machado de Assis"
        error={fieldErrors.author}
      />

      {modality === "sale" ? (
        <TextField
          label="Preço (R$)"
          value={price}
          onChangeText={onSetPrice}
          editable={!loading}
          keyboardType="decimal-pad"
          placeholder="Ex: 25,00"
          error={fieldErrors.price}
        />
      ) : null}

      <Text style={styles.hint}>Conservação e bairro vêm nas próximas etapas.</Text>

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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    field: { gap: tokens.spacing[8] },
    isbnCard: {
      gap: tokens.spacing[8],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    isbnHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    isbnTexts: { flex: 1, gap: tokens.spacing[4] },
    isbnTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
    },
    scanActionRow: {
      width: "100%",
    },
    isbnFeedback: {
      padding: tokens.spacing[8],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
    },
    isbnFeedbackSuccess: {
      backgroundColor: colors.soft,
      borderColor: colors.action,
    },
    isbnFeedbackInfo: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderColor: colors.m3.outlineVariant,
    },
    isbnFeedbackError: {
      backgroundColor: colors.errorContainer,
      borderColor: colors.error,
    },
    isbnFeedbackText: {
      ...tokens.typography.bodyMedium,
    },
    isbnFeedbackTextSuccess: {
      color: colors.actionDeep,
      fontWeight: tokens.fontWeight.semiBold,
    },
    isbnFeedbackTextInfo: {
      color: colors.secondaryText,
    },
    isbnFeedbackTextError: {
      color: colors.error,
    },
    dividerText: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
      textAlign: "center",
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    photoRow: { flexDirection: "row", gap: tokens.spacing[12], alignItems: "center" },
    photoTexts: { flex: 1, gap: tokens.spacing[4] },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      color: colors.text,
    },
    hint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
  });
}
