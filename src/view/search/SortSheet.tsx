import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { BottomSheet } from "@/view/components/BottomSheet";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { triggerHaptic } from "@/view/haptics";
import {
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
 * Folha de ordenação aberta pelo rótulo do resumo (Figma `02.04`: "Mais recentes"). A ordenação
 * fica fora dos filtros: mudar a ordem não restringe resultados nem aparece nos chips aplicados.
 * Utiliza o componente unificado `BottomSheet` com Liquid Glass no iOS e Material 3 no Android/Web.
 */
export function SortSheet({ visible, selected, onSelect, onClose }: SortSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isIos = Platform.OS === "ios";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Ordenar por"
      testID="sort-sheet"
    >
      <View accessibilityRole="radiogroup" accessibilityLabel="Ordenar por" style={styles.list}>
        {SORT_IDS.map((option) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityLabel={SORT_LABELS[option]}
              accessibilityState={{ checked: isSelected }}
              onPress={() => {
                if (isIos) {
                  triggerHaptic("selection");
                }
                onSelect(option);
                onClose();
              }}
              style={({ pressed }) => [
                styles.row,
                isSelected && styles.rowSelected,
                pressed && styles.rowPressed,
              ]}
            >
              <Text style={[styles.rowLabel, isSelected && styles.rowLabelSelected]}>
                {SORT_LABELS[option]}
              </Text>
              <AppIcon
                name={isSelected ? "radioOn" : "radioOff"}
                size={22}
                color={isSelected ? colors.m3.primary : colors.m3.outline}
              />
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    list: {
      gap: tokens.spacing[4],
    },
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
    rowLabel: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
    },
    rowLabelSelected: {
      color: colors.m3.primary,
      fontFamily: tokens.typography.labelLarge.fontFamily,
    },
  });
}
