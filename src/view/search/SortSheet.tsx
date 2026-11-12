import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
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
 */
export function SortSheet({ visible, selected, onSelect, onClose }: SortSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const wideWeb = useIsWideWeb();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      accessibilityViewIsModal
      aria-modal
    >
      <View style={[styles.scrim, wideWeb && styles.scrimWide]}>
        <Pressable
          accessibilityRole="none"
          accessibilityLabel="Fechar ordenação"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            wideWeb && styles.sheetWide,
            { paddingBottom: wideWeb ? tokens.spacing[24] : tokens.spacing[16] + insets.bottom },
          ]}
        >
          {wideWeb ? null : <View style={styles.handle} />}
          <Text accessibilityRole="header" style={styles.title}>
            Ordenar por
          </Text>
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
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    scrim: {
      flex: 1,
      backgroundColor: colors.m3.scrim,
      justifyContent: "flex-end",
    },
    scrimWide: {
      justifyContent: "center",
      alignItems: "center",
      padding: tokens.spacing[24],
    },
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
      maxWidth: 380,
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
    title: {
      ...tokens.typography.titleMedium,
      color: colors.m3.onSurface,
      marginBottom: tokens.spacing[4],
    },
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
