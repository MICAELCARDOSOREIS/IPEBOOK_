import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ShelfTab = "listings" | "proposals" | "concluded";

export type ShelfTabOption = {
  key: ShelfTab;
  label: string;
  badge?: number;
};

export type ShelfTabSheetProps = {
  visible: boolean;
  selected: ShelfTab;
  options: ShelfTabOption[];
  onSelect: (tab: ShelfTab) => void;
  onClose: () => void;
};

/**
 * Folha de seleção de visualização da Estante (Anúncios, Propostas, Concluídos),
 * inspirada no seletor de ordenação do Explorar (`SortSheet.tsx`).
 */
export function ShelfTabSheet({
  visible,
  selected,
  options,
  onSelect,
  onClose,
}: ShelfTabSheetProps) {
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar seleção de abas"
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
            Exibir na estante
          </Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Exibir na estante">
            {options.map((option) => {
              const isSelected = option.key === selected;
              const a11yLabel = option.badge
                ? `${option.label}, ${option.badge} em aberto`
                : option.label;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="radio"
                  accessibilityLabel={a11yLabel}
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => {
                    onSelect(option.key);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    isSelected && styles.rowSelected,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.labelContainer}>
                    <Text style={[styles.rowLabel, isSelected && styles.rowLabelSelected]}>
                      {option.label}
                    </Text>
                    {option.badge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{option.badge}</Text>
                      </View>
                    ) : null}
                  </View>
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
      borderTopLeftRadius: tokens.radius.xxl,
      borderTopRightRadius: tokens.radius.xxl,
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[16],
      gap: tokens.spacing[16],
      maxWidth: 480,
      width: "100%",
      alignSelf: "center",
    },
    sheetWide: { borderRadius: tokens.radius.xxl, paddingBottom: tokens.spacing[24] },
    handle: {
      width: tokens.spacing[32],
      height: 4,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.outlineVariant,
      alignSelf: "center",
      marginBottom: tokens.spacing[4],
    },
    title: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: tokens.accessibility.touchTarget,
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
    },
    rowSelected: { backgroundColor: colors.m3.secondaryContainer },
    rowPressed: {
      backgroundColor: colors.m3.secondaryContainer,
      opacity: 0.92,
      transform: [{ scale: 0.96 }],
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    rowLabel: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    rowLabelSelected: { fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSecondaryContainer },
    badge: {
      backgroundColor: colors.badge.trade.background,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.circle64,
    },
    badgeText: {
      ...tokens.typography.labelSmall,
      color: colors.badge.trade.text,
      fontWeight: tokens.fontWeight.bold,
    },
  });
}
