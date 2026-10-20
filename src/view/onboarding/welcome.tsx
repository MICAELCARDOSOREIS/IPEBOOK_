import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilledButton } from "@/view/components/FilledButton";
import { Logotipo } from "@/view/components/Logotipo";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";
import { accessibility, fontFamily, tokens } from "@/view/tokens";
import illustration from "./ilustracao-classicos.png";

export type WelcomeProps = {
  onStart: () => void;
  onSignIn: () => void;
  onExplore: () => void;
};

/**
 * Boas-vindas do primeiro acesso (Figma `01.01`, Android `324:38` / Web `146:457`).
 * Ver issue #98 e ADR 0022.
 */
export default function Welcome({ onStart, onSignIn, onExplore }: WelcomeProps) {
  return (
    <SafeAreaView style={styles.page} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Logotipo />
            <View style={styles.location} accessible accessibilityLabel="Beta exclusiva em Piripiri, PI">
              <View style={styles.locationDot} />
              <Text style={styles.locationText}>PIRIPIRI · PIAUÍ</Text>
            </View>
          </View>

          <Text accessibilityRole="header" style={styles.title}>Uma boa história</Text>
          <View style={styles.highlight}>
            <Text style={styles.title}>merece continuar.</Text>
          </View>

          <Image
            source={illustration}
            style={styles.illustration}
            resizeMode="contain"
            accessible={false}
            importantForAccessibility="no"
          />

          <Text style={styles.subtitle}>Livros de quem mora perto de você.</Text>

          <View style={styles.modalities} accessible accessibilityLabel="Modalidades: venda, troca e doação">
            {["Venda", "Troca", "Doação"].map((label) => (
              <Text key={label} style={styles.modality}>{label}</Text>
            ))}
          </View>

          <View style={styles.actions}>
            <FilledButton label="Começar" onPress={onStart} />
            <OutlinedButton label="Já tenho conta" onPress={onSignIn} />
            <TextButton label="Explorar livros sem entrar" onPress={onExplore} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.surface },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: tokens.spacing[24],
    paddingTop: tokens.spacing[24],
    paddingBottom: tokens.spacing[32],
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: tokens.spacing[16],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: accessibility.touchTarget,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[6],
    backgroundColor: tokens.colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.full,
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[6],
  },
  locationDot: {
    width: tokens.spacing[6],
    height: tokens.spacing[6],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.action,
  },
  locationText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.m3.onSurfaceVariant,
  },
  title: {
    fontFamily: fontFamily.brand,
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    color: tokens.colors.m3.onSurface,
  },
  highlight: {
    alignSelf: "flex-start",
    backgroundColor: tokens.colors.m3.tertiaryContainer,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[6],
  },
  illustration: { width: "100%", height: 300 },
  subtitle: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.m3.onSurfaceVariant,
  },
  modalities: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  modality: {
    ...tokens.typography.bodyMedium,
    fontFamily: fontFamily.medium,
    color: tokens.colors.m3.onSurfaceVariant,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[8],
  },
  actions: { gap: tokens.spacing[12], marginTop: tokens.spacing[16] },
});
