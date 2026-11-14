import { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BOOK_CONDITIONS, BOOK_CONDITION_LABELS } from "@/model/entities/book";
import {
  SORT_IDS,
  SORT_LABELS,
  type SearchConditionFilter,
  type SearchFilters,
  type SearchModalityFilter,
  type SearchSortOption,
} from "@/viewmodel/searchFilters";

import { withPress } from "@/view/pressFeedback";
export type WebFilterSidebarProps = {
  filters: SearchFilters;
  categories: readonly string[];
  hasActiveFilters: boolean;
  sortBy?: SearchSortOption;
  onSortChange?: (sortBy: SearchSortOption) => void;
  onModality: (modality: SearchModalityFilter) => void;
  onCondition: (condition: SearchConditionFilter) => void;
  onCategory: (category: string | "all") => void;
  onToggleOnlyBoxes?: (onlyBoxes: boolean) => void;
  onClear: () => void;
};

const MODALITIES = [
  { value: "sale", label: "Venda" },
  { value: "trade", label: "Troca" },
  { value: "donation", label: "Doação" },
] as const;

/** Painel "Filtros" da Web (Figma `34:229`): modalidade, conservação e categoria sem abrir folha. */
export function WebFilterSidebar({
  filters,
  categories,
  hasActiveFilters,
  sortBy,
  onSortChange,
  onModality,
  onCondition,
  onCategory,
  onToggleOnlyBoxes,
  onClear,
}: WebFilterSidebarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View accessibilityLabel="Filtros" testID="web-filter-sidebar" style={styles.panel}>
      {/* Rola por conta própria e fica visível ao rolar os resultados na web. */}
      <ScrollView
        style={styles.panelScroll}
        contentContainerStyle={styles.panelContent}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.headerRow}>
        <Text accessibilityRole="header" style={styles.title}>Filtros</Text>
        {hasActiveFilters ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar todos os filtros de busca"
            onPress={onClear}
            style={withPress(styles.clearButton)}
          >
            <Text style={styles.clear}>Limpar</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Modalidade</Text>
        <View style={styles.chips}>
          {MODALITIES.map((item) => {
            const selected = filters.modality === item.value;
            return (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${item.label}`}
                accessibilityState={{ selected }}
                onPress={() => onModality(selected ? "all" : item.value)}
                style={withPress([styles.chip, selected && styles.chipSelected])}
              >
                {selected ? <AppIcon name="check" size={16} color={colors.nature.onFoliage} /> : null}
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Conservação</Text>
        {BOOK_CONDITIONS.map((cond) => (
          <CheckRow
            key={cond}
            label={BOOK_CONDITION_LABELS[cond]}
            checked={filters.condition === cond}
            onPress={() => onCondition(filters.condition === cond ? "all" : cond)}
          />
        ))}
      </View>

      {categories.length > 0 ? (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Categoria</Text>
          {categories.map((category) => (
            <CheckRow
              key={category}
              label={category}
              checked={filters.category === category}
              onPress={() => onCategory(filters.category === category ? "all" : category)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Formato</Text>
        <CheckRow
          label="Apenas boxes e coleções"
          checked={Boolean(filters.onlyBoxes)}
          onPress={() => onToggleOnlyBoxes?.(!filters.onlyBoxes)}
        />
      </View>

      {onSortChange ? (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Ordenar por</Text>
          <View style={styles.chips}>
            {SORT_IDS.map((opt) => {
              const selected = sortBy === opt;
              return (
                <Pressable
                  key={opt}
                  accessibilityRole="radio"
                  accessibilityLabel={`Ordenar por ${SORT_LABELS[opt]}`}
                  accessibilityState={{ selected }}
                  onPress={() => onSortChange(opt)}
                  style={withPress([styles.chip, selected && styles.chipSelected])}
                >
                  {selected ? <AppIcon name="check" size={16} color={colors.nature.onFoliage} /> : null}
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{SORT_LABELS[opt]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      </ScrollView>
    </View>
  );
}

function CheckRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={withPress(styles.checkRow)}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <AppIcon name="check" size={14} color={colors.m3.onPrimary} /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    panel: {
      width: 280,
      maxHeight: "100%",
      overflow: "hidden",
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
      alignSelf: "flex-start",
      ...(Platform.OS === "web"
        ? ({
            position: "sticky",
            top: tokens.spacing[24],
            maxHeight: "calc(100vh - 112px)",
          } as never)
        : {}),
    },
    panelScroll: {
      ...(Platform.OS === "web" ? ({ overscrollBehavior: "contain" } as never) : {}),
    },
    panelContent: { gap: tokens.spacing[14], padding: tokens.spacing[20] },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[8],
    },
    title: { ...tokens.typography.titleBlock, color: colors.m3.onSurface },
    group: { gap: tokens.spacing[4] },
    groupLabel: { ...tokens.typography.labelLarge, color: colors.m3.onSurface, marginBottom: tokens.spacing[4] },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      height: tokens.spacing[32],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.shapeMorph.chipUnselected,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLowest,
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    chipSelected: {
      backgroundColor: colors.nature.foliage,
      borderColor: colors.nature.foliage,
      borderRadius: tokens.shapeMorph.chipSelected,
      borderWidth: 0,
      paddingLeft: tokens.spacing[8],
    },
    chipText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    chipTextSelected: { color: colors.nature.onFoliage, fontWeight: tokens.fontWeight.semiBold },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: 32,
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    box: {
      width: 18,
      height: 18,
      borderRadius: tokens.radius.extraSmall,
      borderWidth: 2,
      borderColor: colors.m3.onSurfaceVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    boxChecked: { backgroundColor: colors.m3.primary, borderColor: colors.m3.primary },
    checkLabel: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface, flexShrink: 1 },
    clearButton: {
      minHeight: 32,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    clear: { ...tokens.typography.labelLarge, color: colors.m3.primary },
  });
}

export default WebFilterSidebar;
