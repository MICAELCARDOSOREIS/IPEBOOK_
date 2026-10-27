import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemePreference } from "@/model/entities/themePreference";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

/** Alternador de aparência (Spec 054, ADR 0036): Sistema, Claro ou Escuro, como botão segmentado M3. */
export function ThemePreferenceSelector() {
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <View testID="theme-toggle-radiogroup" accessibilityRole="radiogroup" style={styles.row}>
        {THEME_OPTIONS.map((option, index) => {
          const isSelected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`Tema ${option.label}`}
              accessibilityState={{ checked: isSelected }}
              onPress={() => void setPreference(option.value)}
              style={[
                styles.option,
                index > 0 && styles.optionDivider,
                isSelected && styles.optionSelected,
              ]}
            >
              {isSelected ? <AppIcon name="check" size={18} color={colors.m3.onSecondaryContainer} /> : null}
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: { gap: tokens.spacing[8] },
    row: {
      flexDirection: "row",
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      overflow: "hidden",
    },
    option: {
      flex: 1,
      minHeight: tokens.accessibility.touchTarget,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
    },
    optionDivider: { borderLeftWidth: 1, borderLeftColor: colors.m3.outline },
    optionSelected: { backgroundColor: colors.m3.secondaryContainer },
    optionText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurface,
    },
    optionTextSelected: { color: colors.m3.onSecondaryContainer },
  });
}
