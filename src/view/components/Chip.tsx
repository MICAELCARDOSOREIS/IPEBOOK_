import { BlurView } from "expo-blur";
import { memo, useMemo } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { contrastRatio } from "@/view/theme/contrastRatio";
import { AppIcon } from "@/view/components/AppIcon";
import { webCheckableProps } from "@/view/pressFeedback";
import { useExpressivePress } from "@/view/useExpressivePress";
import { useReduceTransparency } from "@/view/useReduceTransparency";

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
export const Chip = memo(function Chip({ label, selected, onPress, disabled = false, accessibilityLabel, size = "compact", tone }: ChipProps) {
  const { colors } = useTheme();
  const isIos = Platform.OS === "ios";
  const reduceTransparency = useReduceTransparency();
  const iosGlass = isIos && !reduceTransparency;
  const styles = useMemo(() => getChipStyles(colors), [colors]);
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({ disabled, pressedScale: 0.96 });
  const dotColors = useMemo(() => {
    if (!tone) return undefined;
    const surface = colors.m3.surfaceContainerLowest;
    const border =
      contrastRatio(tone.background, surface) >= contrastRatio(tone.text, surface)
        ? tone.background
        : tone.text;
    return { fill: tone.background, border };
  }, [tone, colors.m3.surfaceContainerLowest]);

  return (
    <Animated.View style={[styles.container, isIos && !disabled && styles.iosShadow, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ checked: selected, disabled }}
        {...webCheckableProps(selected, onPress, disabled)}
        disabled={disabled}
        hitSlop={8}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.chip,
          size === "regular" ? styles.chipRegular : styles.chipCompact,
          selected ? styles.selected : styles.unselected,
          isIos && styles.iosPill,
          isIos && !selected && (iosGlass ? styles.iosUnselectedGlass : styles.iosUnselectedOpaque),
          isIos && selected && styles.iosSelected,
          isPressed && !disabled && !isIos ? styles.pressedShape : null,
          selected && tone ? { backgroundColor: tone.background } : null,
          tone || selected ? styles.withDot : null,
          disabled && styles.disabled,
        ]}
      >
        {iosGlass && !selected && !disabled ? (
          <View pointerEvents="none" style={styles.iosBlurClip}>
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
          </View>
        ) : null}
        {selected ? (
          <AppIcon
            name="check"
            size={18}
            color={tone?.text ?? (isIos ? colors.m3.onSurface : colors.nature.onFoliage)}
          />
        ) : null}
        {dotColors && !selected ? (
          <View style={[styles.dot, { backgroundColor: dotColors.fill, borderColor: dotColors.border }]} />
        ) : null}
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            selected && styles.labelSelected,
            selected && !tone && isIos ? styles.iosLabelSelected : null,
            selected && tone ? { color: tone.text } : null,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

const chipStylesCache = new WeakMap<ColorPalette, ReturnType<typeof createStyles>>();

function getChipStyles(colors: ColorPalette) {
  const cached = chipStylesCache.get(colors);
  if (cached) return cached;
  const created = createStyles(colors);
  chipStylesCache.set(colors, created);
  return created;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      alignSelf: "flex-start",
    },
    chip: {
      borderRadius: tokens.shapeMorph.chipUnselected,
      justifyContent: "center",
      backgroundColor: colors.m3.surfaceContainerLowest,
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    // Figma `02.01`/`02.02`: 32 dp nas fileiras rápidas; `02.03`/`04.05`: 40 dp nos grupos de escolha.
    chipCompact: { height: tokens.spacing[32], paddingHorizontal: tokens.spacing[12] },
    chipRegular: { height: tokens.spacing[40], paddingHorizontal: tokens.spacing[20] },
    iosPill: {
      minHeight: 44,
      borderRadius: tokens.radius.full,
      borderCurve: "continuous",
      overflow: "hidden",
    },
    iosShadow: {
      shadowColor: "#2e2b21",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    iosUnselectedGlass: {
      backgroundColor: tokens.glass.fill,
      borderColor: tokens.glass.stroke,
    },
    iosUnselectedOpaque: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderColor: colors.m3.outlineVariant,
    },
    iosSelected: {
      borderWidth: 1,
      borderColor: colors.m3.focusRing,
      backgroundColor: colors.m3.primaryContainer,
    },
    iosLabelSelected: {
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.medium,
    },
    iosBlurClip: {
      ...StyleSheet.absoluteFill,
      borderRadius: tokens.radius.full,
      overflow: "hidden",
    },
    selected: {
      backgroundColor: colors.nature.foliage,
      borderWidth: 0,
      borderRadius: tokens.shapeMorph.chipSelected,
    },
    pressedShape: {
      borderRadius: tokens.shapeMorph.chipSelected,
    },
    unselected: { borderWidth: 1, borderColor: colors.m3.outline },
    withDot: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[6] },
    dot: { width: 10, height: 10, borderRadius: tokens.radius.dot, borderWidth: 1 },
    disabled: {
      opacity: 0.38,
      ...(Platform.OS === "web" ? ({ cursor: "not-allowed" } as never) : {}),
    },
    label: { color: colors.m3.onSurfaceVariant, ...tokens.typography.labelLarge },
    labelSelected: { color: colors.nature.onFoliage, fontWeight: tokens.fontWeight.medium },
    labelDisabled: { color: colors.disabledText },
  });
}

export default Chip;
