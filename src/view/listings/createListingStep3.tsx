import { useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  BOOK_CATEGORIES,
  BOOK_CONDITIONS,
  BOOK_CONDITION_LABELS,
  MAX_BOOK_DESCRIPTION_LENGTH,
  type BookCategory,
  type BookCondition,
} from "@/model/entities/book";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { categoryTone } from "@/view/categoryTone";
import { Checkbox } from "@/view/components/Checkbox";
import { Chip } from "@/view/components/Chip";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { TextField } from "@/view/components/TextField";

/** Categorias canônicas sugeridas para publicação (ADR 0109). */
export const LISTING_CATEGORIES = BOOK_CATEGORIES;

export type CreateListingStep3Props = {
  condition: BookCondition | null;
  category: string;
  description: string;
  neighborhood?: string;
  isBox?: boolean;
  boxVolumesCount?: string;
  loading: boolean;
  error: string | null;
  errorRef?: React.Ref<any>;
  onSetCondition: (condition: BookCondition | null) => void;
  onSetCategory: (category: string) => void;
  onSetDescription: (description: string) => void;
  onSetNeighborhood?: (neighborhood: string) => void;
  onSetIsBox?: (isBox: boolean) => void;
  onSetBoxVolumesCount?: (count: string) => void;
  /** Disparado ao focar em um campo de texto, informando nome e coordenada Y no formulário */
  onFocusField?: (fieldName: string, yOffset: number) => void;
};

/**
 * Etapa 3 (`04.05 · Detalhes do livro`, nó `12:360`): conservação e categoria em chips de
 * seleção, formato do anúncio (avulso ou box) e descrição do exemplar.
 */
export function CreateListingStep3({
  condition,
  category,
  description,
  isBox = false,
  boxVolumesCount = "",
  loading,
  error,
  errorRef,
  onSetCondition,
  onSetCategory,
  onSetDescription,
  onSetIsBox,
  onSetBoxVolumesCount,
  onFocusField,
}: CreateListingStep3Props) {
  const { colors, resolvedScheme } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors, wideWeb), [colors, wideWeb]);
  const displayedCategories = useMemo(() => {
    if (category && !(LISTING_CATEGORIES as readonly string[]).includes(category)) {
      return [category, ...LISTING_CATEGORIES];
    }
    return LISTING_CATEGORIES;
  }, [category]);
  const descY = useRef(0);

  const descriptionTooLong = description.length > MAX_BOOK_DESCRIPTION_LENGTH;

  return (
    <View style={styles.container}>
      {/* 1. Conservação do exemplar */}
      <View style={styles.field}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Conservação</Text>
          <Text style={styles.sectionHint}>Como está o exemplar?</Text>
        </View>
        <View style={styles.chipRow}>
          {BOOK_CONDITIONS.map((cond: BookCondition) => (
            <Chip
              key={cond}
              size="regular"
              label={BOOK_CONDITION_LABELS[cond]}
              accessibilityLabel={`Conservação ${BOOK_CONDITION_LABELS[cond]}`}
              selected={condition === cond}
              onPress={() => onSetCondition(condition === cond ? null : cond)}
              disabled={loading}
            />
          ))}
        </View>
      </View>

      {/* 2. Categoria temática */}
      <View style={styles.field}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Categoria</Text>
          <Text style={styles.sectionHint}>Gênero principal da obra</Text>
        </View>
        <View style={styles.chipRow}>
          {displayedCategories.map((cat) => (
            <Chip
              key={cat}
              size="regular"
              label={cat}
              accessibilityLabel={`Categoria ${cat}`}
              tone={categoryTone(cat, resolvedScheme)}
              selected={category === cat}
              onPress={() => onSetCategory(category === cat ? "" : cat)}
              disabled={loading}
            />
          ))}
        </View>
      </View>

      {/* 3. Formato do anúncio (Box ou Coleção) */}
      <View style={styles.boxCard}>
        <Checkbox
          label="Box ou coleção de livros"
          description="Marque se este anúncio reúne mais de um volume"
          checked={Boolean(isBox)}
          onChange={(checked) => onSetIsBox?.(checked)}
          disabled={loading}
        />
        {isBox ? (
          <View style={styles.boxVolumesContainer}>
            <TextField
              label="Quantidade de volumes (opcional)"
              value={boxVolumesCount}
              onChangeText={(text) => onSetBoxVolumesCount?.(text)}
              editable={!loading}
              placeholder="Ex: 3, 5, 7"
              keyboardType="number-pad"
              helperText="De 2 a 100 volumes componentes da coleção"
            />
          </View>
        ) : null}
      </View>

      {/* 4. Descrição detalhada do anúncio */}
      <View
        style={styles.field}
        onLayout={(event) => {
          descY.current = event.nativeEvent.layout.y;
        }}
      >
        <TextField
          label="Descrição"
          value={description}
          onChangeText={onSetDescription}
          editable={!loading}
          placeholder="Ex: Marcas leves de uso, páginas completas, sem grifos."
          maxLength={MAX_BOOK_DESCRIPTION_LENGTH}
          multiline
          helperText={`${description.length}/${MAX_BOOK_DESCRIPTION_LENGTH}`}
          helperTextAlign="right"
          onFocus={() => onFocusField?.("description", descY.current)}
          error={
            descriptionTooLong
              ? `A descrição deve ter no máximo ${MAX_BOOK_DESCRIPTION_LENGTH} caracteres.`
              : undefined
          }
        />
      </View>

      {error ? <InlineErrorCard textRef={errorRef} message={error} /> : null}
    </View>
  );
}

function createStyles(colors: ColorPalette, wideWeb: boolean) {
  return StyleSheet.create({
    container: {
      gap: tokens.spacing[20],
    },
    field: {
      gap: tokens.spacing[8],
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
    },
    sectionLabel: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.text,
    },
    sectionHint: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
    },
    boxCard: {
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[12],
    },
    boxVolumesContainer: {
      paddingLeft: tokens.spacing[8],
      paddingTop: tokens.spacing[4],
    },
  });
}
