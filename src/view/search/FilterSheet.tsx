import { useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon } from "@/view/components/AppIcon";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { categoryTone } from "@/view/categoryTone";
import {
  CONDITION_FILTER_LABELS,
  MODALITY_FILTER_LABELS,
  PRICE_FILTER_LABELS,
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
const SORT_IDS: readonly SearchSortOption[] = ["recent", "title", "price_asc", "price_desc"];

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
 * "Filtrar livros" (Figma `02.03`): tela cheia com modalidade, categoria, conservação, preço e
 * ordenação. As escolhas ficam num rascunho (`draftFilters`) e só valem ao tocar em
 * "Mostrar N livros", o que permite desistir da edição voltando pela barra superior.
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
  const { colors, resolvedScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const categories = useMemo(() => {
    const list = [...availableCategories];
    // Uma categoria aplicada pode ter saído do catálogo; mantê-la evita perder o filtro em edição.
    if (draftFilters.category !== "all" && !list.includes(draftFilters.category)) {
      list.unshift(draftFilters.category);
    }
    return list;
  }, [availableCategories, draftFilters.category]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      // App em tela cheia: sem isto o Android pinta faixas cinza sob a barra de status e a de navegação.
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      accessibilityViewIsModal
      aria-modal
    >
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Filtrar livros" onBack={onClose} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
                    modality === "all" ? "Filtrar por todas as modalidades" : `Filtrar por ${MODALITY_FILTER_LABELS[modality]}`
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
                    tone={categoryTone(category, resolvedScheme)}
                    selected={draftFilters.category === category}
                    onPress={() => onChange({ category })}
                  />
                ))}
              </View>
            </View>
          ) : null}

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
            <TextButton label="Limpar" accessibilityLabel="Limpar filtros" onPress={onReset} />
            <View style={styles.footerPrimary}>
              <FilledButton
                label={resultCount === 0 ? "Ver resultados" : `Mostrar ${resultCount} ${resultCount === 1 ? "livro" : "livros"}`}
                accessibilityLabel={`Mostrar ${resultCount} ${resultCount === 1 ? "livro" : "livros"}`}
                onPress={onApply}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: {
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[24],
      gap: tokens.spacing[24],
    },
    // Figma `02.03`: manchete editorial em Source Serif, logo abaixo da barra superior.
    heading: {
      fontFamily: fontFamily.brand,
      fontSize: 24,
      lineHeight: 30,
      color: colors.text,
      letterSpacing: -0.3,
    },
    section: {
      gap: tokens.spacing[12],
      paddingBottom: tokens.spacing[20],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.m3.outlineVariant,
    },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      color: colors.m3.onSurface,
    },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", columnGap: tokens.spacing[8], rowGap: tokens.spacing[8] },
    radioGroup: { gap: tokens.spacing[4] },
    radioRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: tokens.accessibility.touchTarget,
    },
    radioLabel: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    footer: {
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[12],
      paddingBottom: tokens.spacing[8],
      gap: tokens.spacing[8],
      backgroundColor: colors.m3.surfaceContainer,
    },
    footerRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    footerPrimary: { flex: 1 },
    emptyHint: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center" },
  });
}

export default FilterSheet;
