import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** `compact` (32 dp) nas fileiras da Home e do Explorar; `regular` (40 dp) nos grupos de escolha de tela cheia (`02.03`, `04.05`). */
  size?: "compact" | "regular";
};

/** Chip de filtro do design system (chip.md): contêiner de 32 dp com raio de 8 dp, como no Figma `02.01`. */
export function Chip({ label, selected, onPress, disabled = false, accessibilityLabel, size = "compact" }: ChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={[
        styles.chip,
        size === "regular" ? styles.chipRegular : styles.chipCompact,
        selected ? styles.selected : styles.unselected,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected, disabled && styles.labelDisabled]}>
        {selected ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    chip: {
      borderRadius: tokens.radius.small,
      justifyContent: "center",
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    // Figma `02.01`/`02.02`: 32 dp nas fileiras rápidas; `02.03`/`04.05`: 40 dp nos grupos de escolha.
    chipCompact: { height: tokens.spacing[32], paddingHorizontal: tokens.spacing[16] },
    chipRegular: { height: tokens.spacing[40], paddingHorizontal: tokens.spacing[20] },
    selected: { backgroundColor: colors.m3.secondaryContainer, borderWidth: 0 },
    unselected: { borderWidth: 1, borderColor: colors.m3.outlineVariant },
    disabled: { opacity: 0.38 },
    label: { color: colors.m3.onSurfaceVariant, ...tokens.typography.labelLarge },
    labelSelected: { color: colors.m3.onSecondaryContainer },
    labelDisabled: { color: colors.disabledText },
  });
}

export default Chip;
