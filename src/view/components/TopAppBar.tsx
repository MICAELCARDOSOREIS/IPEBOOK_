import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { useGuardedPress } from "@/view/useGuardedPress";

export type TopAppBarProps = {
  title: string;
  onBack: () => void;
};

/**
 * Barra superior do design system (barra-superior.md), pequena do Material 3 como no Figma
 * (`01.06`, `01.10`, `04.08`): 64 dp de altura, título de 22 dp e botão voltar circular de 40 dp.
 */
export function TopAppBar({ title, onBack }: TopAppBarProps) {
  const guardedBack = useGuardedPress(onBack);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
        onPress={guardedBack}
        style={styles.backButton}
      >
        <AppIcon name="back" size={24} color={colors.m3.onSurface} />
      </Pressable>
      <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>{title}</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    bar: {
      height: tokens.spacing[64],
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[8],
      gap: tokens.spacing[12],
      backgroundColor: colors.surface,
    },
    backButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      flexShrink: 1,
      color: colors.m3.onSurface,
      ...tokens.typography.titleLarge,
      // Figma `01.06`/`01.10`: título da barra superior do Material 3 tem 22 dp.
      fontSize: 22,
      lineHeight: 28,
    },
  });
}

export default TopAppBar;
