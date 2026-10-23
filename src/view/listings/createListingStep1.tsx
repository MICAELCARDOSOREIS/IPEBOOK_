import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BookModality } from "@/model/entities/book";
import type { IsbnFeedback } from "@/viewmodel/useCreateListingViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { TextField } from "@/view/components/TextField";

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
  onGoToPhotos: () => void;
  onContinue: () => void;
};

export function CreateListingStep1({
  isbn,
  lookingUpIsbn,
  isbnFeedback,
  onSetIsbn,
  onLookupIsbn,
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
  onGoToPhotos,
  onContinue,
}: CreateListingStep1Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <View style={styles.isbnCard}>
        <View style={styles.isbnHeader}>
          <IconBadge icon="photo" tone="action" />
          <View style={styles.isbnTexts}>
            <Text style={styles.isbnTitle}>Buscar livro por ISBN</Text>
            <Text style={styles.hint}>Preenche título e autor automaticamente.</Text>
          </View>
        </View>

        <View style={styles.isbnInputRow}>
          <View style={styles.isbnFieldWrapper}>
            <TextField
              label="Código ISBN"
              value={isbn ?? ""}
              onChangeText={onSetIsbn ?? (() => {})}
              placeholder="Ex: 9788535914849"
              keyboardType="numeric"
              editable={!loading && !lookingUpIsbn}
            />
          </View>
          <FilledButton
            label={lookingUpIsbn ? "Buscando..." : "Buscar"}
            accessibilityLabel="Buscar dados do livro pelo ISBN"
            loading={lookingUpIsbn}
            onPress={() => onLookupIsbn?.()}
          />
        </View>

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
              selected={modality === item.value}
              onPress={() => onSetModality(item.value)}
              disabled={loading}
            />
          ))}
        </View>
      </View>

      <View style={styles.photoRow}>
        <AddPhotoCard
          photoUrl={photoUrl}
          onPress={onGoToPhotos}
          onRemovePhoto={() => onSetPhotoUrl("")}
        />
        <View style={styles.photoTexts}>
          <TextField
            label="Título"
            value={title}
            onChangeText={onSetTitle}
            editable={!loading}
            placeholder="Ex: Dom Casmurro"
          />
          <TextField
            label="Autor"
            value={author}
            onChangeText={onSetAuthor}
            editable={!loading}
            placeholder="Ex: Machado de Assis"
          />
        </View>
      </View>

      {modality === "sale" ? (
        <TextField
          label="Preço (R$)"
          value={price}
          onChangeText={onSetPrice}
          editable={!loading}
          keyboardType="decimal-pad"
          placeholder="Ex: 25,00"
        />
      ) : null}

      <Text style={styles.hint}>
        Foto leve, com boa luz. Conservação e bairro vêm na próxima etapa.
      </Text>

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

      <FilledButton label="Continuar" onPress={onContinue} />
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    field: { gap: tokens.spacing[8] },
    isbnCard: {
      gap: tokens.spacing[12],
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
    isbnInputRow: {
      flexDirection: "row",
      gap: tokens.spacing[8],
      alignItems: "flex-end",
    },
    isbnFieldWrapper: {
      flex: 1,
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
      fontWeight: "600",
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
    photoRow: { flexDirection: "row", gap: tokens.spacing[12], alignItems: "flex-start" },
    photoTexts: { flex: 1, gap: tokens.spacing[12] },
    sectionLabel: {
      fontSize: tokens.typography.titleMedium.fontSize,
      lineHeight: tokens.typography.titleMedium.lineHeight,
      fontFamily: tokens.typography.titleMedium.fontFamily,
      fontWeight: tokens.typography.titleMedium.fontWeight,
      color: colors.text,
    },
    hint: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      lineHeight: tokens.typography.bodyMedium.lineHeight,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
      color: colors.secondaryText,
    },
    errorText: {
      color: colors.error,
      fontSize: tokens.typography.bodyMedium.fontSize,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
    },
  });
}
