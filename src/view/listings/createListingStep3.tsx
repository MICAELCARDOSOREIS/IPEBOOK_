import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BookCondition } from "@/model/entities/book";
import {
  BOOK_CONDITIONS,
  BOOK_CONDITION_LABELS,
  MAX_BOOK_DESCRIPTION_LENGTH,
} from "@/model/entities/book";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextField } from "@/view/components/TextField";

/** Categorias sugeridas pela etapa de detalhes do Figma (`04.05`). */
export const LISTING_CATEGORIES = ["Literatura", "Infantil", "Didático", "Romance", "Outros"];

export type CreateListingStep3Props = {
  condition: BookCondition | null;
  category: string;
  description: string;
  neighborhood: string;
  loading: boolean;
  error: string | null;
  errorRef?: React.Ref<any>;
  onSetCondition: (condition: BookCondition | null) => void;
  onSetCategory: (category: string) => void;
  onSetDescription: (description: string) => void;
  onSetNeighborhood: (neighborhood: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function CreateListingStep3({
  condition,
  category,
  description,
  neighborhood,
  loading,
  error,
  errorRef,
  onSetCondition,
  onSetCategory,
  onSetDescription,
  onSetNeighborhood,
  onSubmit,
  onBack,
}: CreateListingStep3Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const descriptionTooLong = description.length > MAX_BOOK_DESCRIPTION_LENGTH;

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.sectionLabel}>Conservação</Text>
        <View style={styles.chipRow}>
          {BOOK_CONDITIONS.map((cond: BookCondition) => (
            <Chip
              key={cond}
              label={BOOK_CONDITION_LABELS[cond]}
              accessibilityLabel={`Conservação ${BOOK_CONDITION_LABELS[cond]}`}
              selected={condition === cond}
              onPress={() => onSetCondition(condition === cond ? null : cond)}
              disabled={loading}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.sectionLabel}>Categoria</Text>
        <View style={styles.chipRow}>
          {LISTING_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              accessibilityLabel={`Categoria ${cat}`}
              selected={category === cat}
              onPress={() => onSetCategory(category === cat ? "" : cat)}
              disabled={loading}
            />
          ))}
        </View>
      </View>

      <TextField
        label="Descrição"
        value={description}
        onChangeText={onSetDescription}
        editable={!loading}
        placeholder="Ex: Marcas leves de uso, páginas completas."
        maxLength={MAX_BOOK_DESCRIPTION_LENGTH}
        multiline
        helperText={`${description.length}/${MAX_BOOK_DESCRIPTION_LENGTH}`}
        error={
          descriptionTooLong
            ? `A descrição deve ter no máximo ${MAX_BOOK_DESCRIPTION_LENGTH} caracteres.`
            : undefined
        }
      />

      <View style={styles.field}>
        <Text style={styles.sectionLabel}>Bairro para retirada</Text>
        <View style={styles.chipRow}>
          {PIRIPIRI_NEIGHBORHOODS.map((bairro) => (
            <Chip
              key={bairro}
              label={bairro}
              accessibilityLabel={`Bairro ${bairro}`}
              selected={neighborhood === bairro}
              onPress={() => onSetNeighborhood(neighborhood === bairro ? "" : bairro)}
              disabled={loading}
            />
          ))}
        </View>
        <Text style={styles.hint}>Só o bairro aparece no anúncio.</Text>
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

      <FilledButton
        label="Publicar anúncio"
        loading={loading}
        loadingLabel="Publicando"
        onPress={onSubmit}
      />
      <OutlinedButton
        label="Voltar à etapa anterior"
        disabled={loading}
        onPress={onBack}
      />
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    field: { gap: tokens.spacing[8] },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
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
