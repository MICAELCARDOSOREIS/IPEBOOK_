import { useMemo } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { useExpressivePress } from "@/view/useExpressivePress";

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** `compact` (32 dp) nas fileiras da Home e do Explorar; `regular` (40 dp) nos grupos de escolha de tela cheia (`02.03`, `04.05`). */
  size?: "compact" | "regular";
  /** Cor própria da opção (ex.: modalidade): fundo e texto quando selecionada; um ponto da cor quando não. */
  tone?: { background: string; text: string };
};

/** Chip de filtro M3 Expressive (chip.md): alterna curvatura entre 8 dp (inativo) e 16 dp (selecionado/pressionado). */
export function Chip({ label, selected, onPress, disabled = false, accessibilityLabel, size = "compact", tone }: ChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({ disabled, pressedScale: 0.95 });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ checked: selected, disabled }}
        disabled={disabled}
        hitSlop={8}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.chip,
          size === "regular" ? styles.chipRegular : styles.chipCompact,
          selected ? styles.selected : styles.unselected,
          isPressed && !disabled ? styles.pressedShape : null,
          selected && tone ? { backgroundColor: tone.background } : null,
          tone || selected ? styles.withDot : null,
          disabled && styles.disabled,
        ]}
      >
        {selected ? <AppIcon name="check" size={18} color={tone?.text ?? colors.m3.onSecondaryContainer} /> : null}
        {tone && !selected ? <View style={[styles.dot, { backgroundColor: tone.background, borderColor: tone.text }]} /> : null}
        <Text
          style={[
            styles.label,
            selected && styles.labelSelected,
            selected && tone ? { color: tone.text } : null,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    chip: {
      borderRadius: tokens.shapeMorph.chipUnselected,
      justifyContent: "center",
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    // Figma `02.01`/`02.02`: 32 dp nas fileiras rápidas; `02.03`/`04.05`: 40 dp nos grupos de escolha.
    chipCompact: { height: tokens.spacing[32], paddingHorizontal: tokens.spacing[16] },
    chipRegular: { height: tokens.spacing[40], paddingHorizontal: tokens.spacing[20] },
    selected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderWidth: 0,
      borderRadius: tokens.shapeMorph.chipSelected,
    },
    pressedShape: {
      borderRadius: tokens.shapeMorph.chipSelected,
    },
    unselected: { borderWidth: 1, borderColor: colors.m3.outlineVariant },
    withDot: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    dot: { width: 10, height: 10, borderRadius: tokens.radius.dot, borderWidth: 1 },
    disabled: { opacity: 0.38 },
    label: { color: colors.m3.onSurfaceVariant, ...tokens.typography.labelLarge },
    labelSelected: { color: colors.m3.onSecondaryContainer },
    labelDisabled: { color: colors.disabledText },
  });
}

export default Chip;
