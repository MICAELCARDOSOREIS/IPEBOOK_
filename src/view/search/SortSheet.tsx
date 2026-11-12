import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AppIcon } from "@/view/components/AppIcon";
import { Chip } from "@/view/components/Chip";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import {
  MODALITY_FILTER_LABELS,
  SORT_IDS,
  SORT_LABELS,
  type SearchModalityFilter,
  type SearchSortOption,
} from "@/viewmodel/searchFilters";

export type SortSheetProps = {
  visible: boolean;
  selected: SearchSortOption;
  onSelect: (sortBy: SearchSortOption) => void;
  onClose: () => void;
  selectedModality?: SearchModalityFilter;
  onSelectModality?: (modality: SearchModalityFilter) => void;
};

/**
 * Folha de ordenação e filtro rápido aberta pelo rótulo do resumo (Figma `02.04`).
 * Permite filtrar diretamente por modalidade (Venda, Troca, Doação) e ordenar os resultados.
 */
export function SortSheet({
  visible,
  selected,
  onSelect,
  onClose,
  selectedModality,
  onSelectModality,
}: SortSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const wideWeb = useIsWideWeb();

  return (
    <Modal
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      transparent
      animationType={wideWeb ? "fade" : "slide"}
      onRequestClose={onClose}
      accessibilityViewIsModal
      aria-modal
    >
      <View style={[styles.scrim, wideWeb && styles.scrimWide]}>
        <Pressable accessibilityRole="none" accessibilityLabel="Fechar ordenação e filtros" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, wideWeb && styles.sheetWide, { paddingBottom: wideWeb ? tokens.spacing[24] : tokens.spacing[16] + insets.bottom }]}>
          {wideWeb ? null : <View style={styles.handle} />}

          {onSelectModality ? (
            <View style={styles.sectionModality}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>Filtrar por modalidade</Text>
              <View style={styles.modalityChipsRow}>
                {(["all", "sale", "trade", "donation"] as const).map((mod) => {
                  const isSelected = (selectedModality ?? "all") === mod;
                  const label = mod === "all" ? "Todas" : MODALITY_FILTER_LABELS[mod];
                  const tone =
                    mod === "all"
                      ? { background: colors.nature.foliage, text: colors.nature.onFoliage }
                      : colors.badge[mod];
                  return (
                    <Chip
                      key={mod}
                      size="regular"
                      label={label}
                      accessibilityLabel={`Filtrar por ${label}`}
                      selected={isSelected}
                      tone={tone}
                      onPress={() => {
                        onSelectModality(mod);
                        onClose();
                      }}
                    />
                  );
                })}
              </View>
              <View style={styles.divider} />
            </View>
          ) : null}

          <Text accessibilityRole="header" style={styles.title}>Ordenar por</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Ordenar por">
            {SORT_IDS.map((option) => {
              const isSelected = option === selected;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityLabel={SORT_LABELS[option]}
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    isSelected && styles.rowSelected,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Text style={[styles.rowLabel, isSelected && styles.rowLabelSelected]}>{SORT_LABELS[option]}</Text>
                  <AppIcon
                    name={isSelected ? "radioOn" : "radioOff"}
                    size={24}
                    color={isSelected ? colors.m3.primary : colors.m3.outline}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: colors.m3.scrim },
    scrimWide: { justifyContent: "center", alignItems: "center", padding: tokens.spacing[24] },
    sheet: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderTopLeftRadius: tokens.radius.extraLarge,
      borderTopRightRadius: tokens.radius.extraLarge,
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[12],
      gap: tokens.spacing[8],
      elevation: 3,
    },
    sheetWide: {
      width: "100%",
      maxWidth: 440,
      borderRadius: tokens.radius.extraLarge,
    },
    handle: {
      alignSelf: "center",
      width: 32,
      height: 4,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.outlineVariant,
      marginBottom: tokens.spacing[4],
    },
    sectionModality: {
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[4],
    },
    sectionTitle: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurfaceVariant,
      fontWeight: tokens.fontWeight.semiBold,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    modalityChipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.m3.outlineVariant,
      marginVertical: tokens.spacing[4],
    },
    title: { ...tokens.typography.titleMedium, color: colors.m3.onSurface, marginBottom: tokens.spacing[4] },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.shapeMorph.chipUnselected,
    },
    rowSelected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderRadius: tokens.shapeMorph.chipSelected,
    },
    rowPressed: {
      transform: [{ scale: 0.98 }],
      borderRadius: tokens.shapeMorph.chipSelected,
    },
    rowLabel: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    rowLabelSelected: { color: colors.m3.primary, fontFamily: tokens.typography.labelLarge.fontFamily },
  });
}

export default SortSheet;
