import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemePreference } from "@/model/entities/themePreference";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";

const THEME_OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: "system", label: "Sistema", description: "Acompanha a aparência do seu aparelho." },
  { value: "light", label: "Claro", description: "Usa fundos claros no aplicativo." },
];

/** Seletor de aparência (Spec 054, ADR 0036): opções explicadas em linhas de seleção acessíveis. */
export function ThemePreferenceSelector() {
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <View
        testID="theme-toggle-radiogroup"
        accessibilityRole="radiogroup"
        accessibilityLabel="Tema do aplicativo"
        style={styles.row}
      >
        {THEME_OPTIONS.map((option) => {
          const isSelected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`Tema ${option.label}`}
              accessibilityHint={option.description}
              accessibilityState={{ checked: isSelected }}
              onPress={() => void setPreference(option.value)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={styles.optionCopy}>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
                <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                  {option.description}
                </Text>
              </View>
              <AppIcon
                name={isSelected ? "radioOn" : "radioOff"}
                size={22}
                color={isSelected ? colors.m3.primary : colors.m3.onSurfaceVariant}
              />
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
      gap: tokens.spacing[8],
    },
    option: {
      minHeight: tokens.accessibility.touchTarget,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    optionSelected: {
      borderColor: colors.m3.primary,
      backgroundColor: colors.m3.primaryContainer,
    },
    optionPressed: {
      opacity: 0.86,
      transform: [{ scale: 0.99 }],
    },
    optionCopy: { flex: 1, gap: tokens.spacing[2] },
    optionText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurface,
    },
    optionTextSelected: { color: colors.m3.onPrimaryContainer },
    optionDescription: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
    },
    optionDescriptionSelected: { color: colors.m3.onPrimaryContainer },
  });
}
