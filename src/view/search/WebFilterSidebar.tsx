import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BOOK_CONDITIONS, BOOK_CONDITION_LABELS } from "@/model/entities/book";
import type { SearchConditionFilter, SearchFilters, SearchModalityFilter } from "@/viewmodel/searchFilters";

import { withPress } from "@/view/pressFeedback";
export type WebFilterSidebarProps = {
  filters: SearchFilters;
  categories: readonly string[];
  hasActiveFilters: boolean;
  onModality: (modality: SearchModalityFilter) => void;
  onCondition: (condition: SearchConditionFilter) => void;
  onCategory: (category: string | "all") => void;
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
  onModality,
  onCondition,
  onCategory,
  onClear,
}: WebFilterSidebarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View accessibilityLabel="Filtros" testID="web-filter-sidebar" style={styles.panel}>
      {/* Rola por conta própria: em janelas baixas a coluna não cabe inteira ao lado dos resultados. */}
      <ScrollView contentContainerStyle={styles.panelContent} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={styles.title}>Filtros</Text>

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
                {selected ? <AppIcon name="check" size={16} color={colors.m3.onSecondaryContainer} /> : null}
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

      {hasActiveFilters ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Limpar todos os filtros de busca" onPress={onClear}>
          <Text style={styles.clear}>Limpar filtros</Text>
        </Pressable>
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
    },
    panelContent: { gap: tokens.spacing[24], padding: tokens.spacing[24] },
    title: { ...tokens.typography.titleBlock, color: colors.m3.onSurface },
    group: { gap: tokens.spacing[4] },
    groupLabel: { ...tokens.typography.labelLarge, color: colors.m3.onSurface, marginBottom: tokens.spacing[6] },
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
    },
    chipSelected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderColor: colors.m3.secondaryContainer,
      borderRadius: tokens.shapeMorph.chipSelected,
      borderWidth: 0,
      paddingLeft: tokens.spacing[8],
    },
    chipText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    chipTextSelected: { color: colors.m3.onSecondaryContainer },
    checkRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12], minHeight: 40 },
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
    checkLabel: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    clear: { ...tokens.typography.labelLarge, color: colors.m3.primary },
  });
}

export default WebFilterSidebar;
