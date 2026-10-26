import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopAppBar } from "@/view/components/TopAppBar";
import { ThemePreferenceSelector } from "@/view/components/ThemePreferenceSelector";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type SettingsProps = {
  onBack: () => void;
};

/**
 * Tela de configurações do aplicativo (Spec 073).
 * Agrupa preferências de aparência e futuras configurações em um local dedicado,
 * acessível a partir de Meu perfil.
 */
export function Settings({ onBack }: SettingsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Configurações" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Seção Aparência (Spec 073 FR-003, ADR 0036) */}
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionHeader}>
              Aparência
            </Text>
            <Text style={styles.sectionDescription}>
              Escolha como o aplicativo aparece para você.
            </Text>
            <ThemePreferenceSelector />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Settings;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    content: {
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      padding: tokens.spacing[24],
      gap: tokens.spacing[24],
    },
    section: { gap: tokens.spacing[12] },
    sectionHeader: {
      ...tokens.typography.titleMedium,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
    },
    sectionDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
  });
}
