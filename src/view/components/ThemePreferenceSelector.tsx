import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemePreference } from "@/model/entities/themePreference";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

/** Alternador de aparência (Spec 054, ADR 0036): Sistema, Claro ou Escuro. */
export function ThemePreferenceSelector() {
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Aparência</Text>
      <View testID="theme-toggle-radiogroup" accessibilityRole="radiogroup" style={styles.row}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`Tema ${option.label}`}
              accessibilityState={{ checked: isSelected }}
              onPress={() => void setPreference(option.value)}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
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
    label: { ...tokens.typography.labelMedium, color: colors.secondaryText },
    row: { flexDirection: "row", gap: tokens.spacing[8] },
    option: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.small,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    optionSelected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderColor: colors.m3.secondaryContainer,
    },
    optionText: {
      ...tokens.typography.bodyMedium,
      fontFamily: tokens.typography.labelMedium.fontFamily,
      fontWeight: "500",
      color: colors.m3.onSurfaceVariant,
    },
    optionTextSelected: { color: colors.m3.onSecondaryContainer },
  });
}
