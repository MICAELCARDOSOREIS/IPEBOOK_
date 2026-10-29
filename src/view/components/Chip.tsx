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
};

/** Chip de filtro do design system (chip.md): pílula de 32 px, check quando selecionado. */
export function Chip({ label, selected, onPress, disabled = false, accessibilityLabel }: ChipProps) {
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
      height: 32,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[12],
      justifyContent: "center",
    },
    selected: { backgroundColor: colors.soft },
    unselected: { borderWidth: 1, borderColor: colors.border },
    disabled: { opacity: 0.38 },
    label: { color: colors.secondaryText, ...tokens.typography.labelMedium },
    labelSelected: { color: colors.action },
    labelDisabled: { color: colors.disabledText },
  });
}

export default Chip;
