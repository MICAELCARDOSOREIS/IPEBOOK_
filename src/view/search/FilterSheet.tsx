import { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/view/components/BottomSheet";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { TextButton } from "@/view/components/TextButton";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { triggerHaptic } from "@/view/haptics";
import { categoryTone } from "@/view/categoryTone";
import {
  CONDITION_FILTER_LABELS,
  MODALITY_FILTER_LABELS,
  PRICE_FILTER_LABELS,
  SORT_IDS,
  SORT_LABELS,
  type SearchConditionFilter,
  type SearchFilters,
  type SearchModalityFilter,
  type SearchPriceRange,
  type SearchSortOption,
} from "@/viewmodel/searchFilters";

const MODALITY_IDS: readonly SearchModalityFilter[] = ["all", "sale", "trade", "donation"];
const PRICE_IDS: readonly SearchPriceRange[] = ["all", "free", "under20", "under50"];
const CONDITION_IDS: readonly SearchConditionFilter[] = ["all", "new", "good", "marked", "worn"];

export type FilterSheetProps = {
  visible: boolean;
  /** Seleções em edição: só passam a valer no toque em "Mostrar N livros". */
  draftFilters: SearchFilters;
  sortBy: SearchSortOption;
  availableCategories: readonly string[];
  /** Quantidade de livros que o rascunho atual exibiria. */
  resultCount: number;
  onChange: (patch: Partial<SearchFilters>) => void;
  onSortChange: (sortBy: SearchSortOption) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

/**
 * "Filtrar livros" (Figma `02.03` / Apple HIG Spec 137, Issue #229):
 * Folha inferior (BottomSheet) unificada com drag handle superior, gesto de arraste (swipe-down)
 * para fechar, acabamento Liquid Glass no iOS e botões de ação ("Limpar" e "Aplicar")
 * fixados no rodapé logo acima do Home Indicator.
 */
export function FilterSheet({
  visible,
  draftFilters,
  sortBy,
  availableCategories,
  resultCount,
  onChange,
  onSortChange,
  onApply,
  onReset,
  onClose,
}: FilterSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isIos = Platform.OS === "ios";
  const categories = useMemo(() => {
    const list = [...availableCategories];
    if (draftFilters.category !== "all" && !list.includes(draftFilters.category)) {
      list.unshift(draftFilters.category);
    }
    return list;
  }, [availableCategories, draftFilters.category]);

  if (!visible) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filtrar livros"
      testID="filter-sheet"
      showCloseButton
      style={styles.sheet}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text accessibilityRole="header" style={styles.heading}>
            Uma leitura do seu jeito.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Modalidade</Text>
            <View style={styles.chipsRow}>
              {MODALITY_IDS.map((modality) => (
                <Chip
                  key={modality}
                  size="regular"
                  label={MODALITY_FILTER_LABELS[modality]}
                  accessibilityLabel={
                    modality === "all"
                      ? "Filtrar por todas as modalidades"
                      : `Filtrar por ${MODALITY_FILTER_LABELS[modality]}`
                  }
                  tone={modality === "all" ? undefined : colors.badge[modality]}
                  selected={draftFilters.modality === modality}
                  onPress={() => onChange({ modality })}
                />
              ))}
            </View>
          </View>

          {categories.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Categoria</Text>
              <View style={styles.chipsRow}>
                <Chip
                  size="compact"
                  label="Todas"
                  accessibilityLabel="Filtrar por todas as categorias"
                  selected={draftFilters.category === "all"}
                  onPress={() => onChange({ category: "all" })}
                />
                {categories.map((category) => (
                  <Chip
                    key={category}
                    size="compact"
                    label={category}
                    accessibilityLabel={`Filtrar por categoria ${category}`}
                    tone={categoryTone(category)}
                    selected={draftFilters.category === category}
                    onPress={() => onChange({ category })}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Formato</Text>
            <View style={styles.chipsRow}>
              <Chip
                size="regular"
                label="Todos"
                accessibilityLabel="Todos os formatos"
                selected={!draftFilters.onlyBoxes}
                onPress={() => onChange({ onlyBoxes: false })}
              />
              <Chip
                size="regular"
                label="Boxes e coleções"
                accessibilityLabel="Apenas boxes e coleções"
                selected={Boolean(draftFilters.onlyBoxes)}
                onPress={() => onChange({ onlyBoxes: true })}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Condição do livro</Text>
            <View style={styles.chipsRow}>
              {CONDITION_IDS.map((condition) => (
                <Chip
                  key={condition}
                  size="regular"
                  label={CONDITION_FILTER_LABELS[condition]}
                  accessibilityLabel={CONDITION_FILTER_LABELS[condition]}
                  selected={draftFilters.condition === condition}
                  onPress={() => onChange({ condition })}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preço</Text>
            <View style={styles.chipsRow}>
              {PRICE_IDS.map((priceRange) => (
                <Chip
                  key={priceRange}
                  size="regular"
                  label={PRICE_FILTER_LABELS[priceRange]}
                  accessibilityLabel={`Filtrar por ${PRICE_FILTER_LABELS[priceRange]}`}
                  selected={draftFilters.priceRange === priceRange}
                  onPress={() => onChange({ priceRange })}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ordenar por</Text>
            <View style={styles.chipsRow}>
              {SORT_IDS.map((option) => (
                <Chip
                  key={option}
                  size="regular"
                  label={SORT_LABELS[option]}
                  accessibilityLabel={`Ordenar por ${SORT_LABELS[option]}`}
                  selected={sortBy === option}
                  onPress={() => onSortChange(option)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {resultCount === 0 ? (
            <Text accessibilityRole="alert" style={styles.emptyHint}>
              Nenhum livro com essas escolhas. Tire algum filtro para ver mais.
            </Text>
          ) : null}
          <View style={styles.footerRow}>
            <TextButton
              label="Limpar"
              accessibilityLabel="Limpar filtros"
              onPress={() => {
                if (isIos) triggerHaptic("light");
                onReset();
              }}
            />
            <View style={styles.footerPrimary}>
              <FilledButton
                label={
                  resultCount === 0
                    ? "Ver resultados"
                    : `Mostrar ${resultCount} ${resultCount === 1 ? "livro" : "livros"}`
                }
                accessibilityLabel={`Mostrar ${resultCount} ${resultCount === 1 ? "livro" : "livros"}`}
                onPress={() => {
                  if (isIos) triggerHaptic("selection");
                  onApply();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    sheet: {
      height: "85%",
      maxHeight: 760,
    },
    container: {
      flex: 1,
      minHeight: 0,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingBottom: tokens.spacing[16],
      gap: tokens.spacing[20],
    },
    heading: {
      ...tokens.typography.brandTitle,
      color: colors.text,
      letterSpacing: tokens.letterSpacing.brandSubtle,
    },
    section: {
      gap: tokens.spacing[12],
      paddingBottom: tokens.spacing[16],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.m3.outlineVariant,
    },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      color: colors.m3.onSurface,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: tokens.spacing[8],
      rowGap: tokens.spacing[8],
    },
    footer: {
      paddingTop: tokens.spacing[12],
      paddingBottom: tokens.spacing[4],
      gap: tokens.spacing[8],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    footerPrimary: {
      flex: 1,
    },
    emptyHint: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      textAlign: "center",
    },
  });
}

export default FilterSheet;
