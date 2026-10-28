import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FilledButton } from "@/view/components/FilledButton";
import { Logotipo } from "@/view/components/Logotipo";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { accessibility, fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AppIcon } from "@/view/components/AppIcon";
import { AboutSections } from "@/view/onboarding/aboutSections";
import { ThemeToggleButton } from "@/view/components/ThemeToggleButton";
import illustration from "./ilustracao-classicos.png";
import { WEB_MAX_WIDTH } from "@/view/webLayout";

export type WelcomeProps = {
  onStart: () => void;
  onSignIn: () => void;
  /** Links do rodapé da página na web larga. */
  onHelp?: () => void;
  onTerms?: () => void;
  /** Spec 108: no site, os botões chamam para o teste do app em vez de entrar ou criar conta. */
  betaInvite?: boolean;
};

/**
 * Boas-vindas do primeiro acesso (Figma `01.01`, Android `324:38` / Web `146:457`).
 * Ver issue #98 e ADR 0022. O catálogo exige conta (Spec 092): sem sessão, a tela só
 * oferece criar conta ou entrar — não há acesso de visitante.
 */
export default function Welcome({ onStart, onSignIn, onHelp, onTerms, betaInvite = false }: WelcomeProps) {
  const labels = betaInvite
    ? { header: "Quero testar", start: "Quero testar o app", signIn: "Ver na Play Store" }
    : { header: "Criar conta", start: "Começar agora", signIn: "Já tenho conta" };
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const wideWeb = useIsWideWeb();

  // Web larga (Figma `01.01` Web `146:457`): cabeçalho, chamada em duas colunas, três modalidades e rodapé.
  if (wideWeb) {
    const cards = [
      { label: "Venda", icon: "bookmark", tone: colors.m3.primaryContainer, on: colors.m3.onPrimaryContainer, text: "Defina o preço em reais e combine a entrega no seu bairro." },
      { label: "Troca", icon: "swap", tone: colors.m3.tertiaryContainer, on: colors.m3.onTertiaryContainer, text: "Ofereça um livro da sua estante e explique as condições." },
      { label: "Doação", icon: "heart", tone: colors.m3.doacaoContainer, on: colors.m3.onDoacaoContainer, text: "Doe para quem vai ler. Sem cobrança pelo exemplar." },
    ] as const;
    return (
      <ScrollView style={styles.wideRoot} contentContainerStyle={styles.wideContent}>
        <View style={styles.wideHeader}>
          <Logotipo />
          <View style={styles.wideHeaderActions}>
            {betaInvite ? null : (
              <Pressable accessibilityRole="button" accessibilityLabel="Entrar" onPress={onSignIn}>
                <Text style={styles.wideLink}>Entrar</Text>
              </Pressable>
            )}
            {betaInvite ? <ThemeToggleButton /> : null}
            <Pressable accessibilityRole="button" accessibilityLabel={labels.header} onPress={onStart} style={styles.wideCta}>
              <Text style={styles.wideCtaText}>{labels.header}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.wideHero}>
          <View style={styles.wideHeroText}>
            <View style={styles.location} accessible accessibilityLabel="Beta exclusiva em Piripiri, PI">
              <AppIcon name="place" size={14} color={colors.m3.onSurfaceVariant} />
              <Text style={styles.locationText}>Piripiri · Piauí</Text>
            </View>
            <View>
              <Text accessibilityRole="header" style={styles.wideTitle}>Uma boa história</Text>
              <Text style={styles.wideTitle}>merece continuar.</Text>
            </View>
            <Text style={styles.wideLead}>
              Encontre, troque, venda ou doe livros com quem mora perto de você. Sem taxas e com encontro em local público.
            </Text>
            <View style={styles.wideActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={labels.start} onPress={onStart} style={styles.wideCta}>
                <Text style={styles.wideCtaText}>{labels.start}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={labels.signIn} onPress={onSignIn} style={styles.wideOutlined}>
                <Text style={styles.wideOutlinedText}>{labels.signIn}</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.widePanel}>
            <Image source={illustration} style={styles.wideIllustration} resizeMode="contain" accessible={false} importantForAccessibility="no" />
          </View>
        </View>

        <View style={styles.wideCards}>
          {cards.map((card) => (
            <View key={card.label} style={[styles.wideCard, { backgroundColor: card.tone }]}>
              <AppIcon name={card.icon} size={24} color={card.on} />
              <Text style={[styles.wideCardTitle, { color: card.on }]}>{card.label}</Text>
              <Text style={[styles.wideCardText, { color: card.on }]}>{card.text}</Text>
            </View>
          ))}
        </View>

        <AboutSections onStart={onStart} onSignIn={onSignIn} onHelp={onHelp} onTerms={onTerms} betaInvite={betaInvite} />
      </ScrollView>
    );
  }

  return (
    <ScreenContainer
      maxWidth={560}
      paddingTop={tokens.spacing[24]}
      paddingBottom={tokens.spacing[32]}
      edges={["top", "bottom"]}
      contentStyle={{ gap: tokens.spacing[16] }}
    >
      <View style={styles.header}>
        <Logotipo />
        <View style={styles.location} accessible accessibilityLabel="Beta exclusiva em Piripiri, PI">
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>PIRIPIRI · PIAUÍ</Text>
        </View>
        {betaInvite ? <ThemeToggleButton /> : null}
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
        {([["Venda", colors.badge.sale], ["Troca", colors.badge.trade], ["Doação", colors.badge.donation]] as const).map(([label, tone]) => (
          <Text
            key={label}
            style={[styles.modality, { backgroundColor: tone.background, borderColor: tone.background, color: tone.text }]}
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <FilledButton label={betaInvite ? labels.start : "Começar"} onPress={onStart} />
        <OutlinedButton label={labels.signIn} onPress={onSignIn} />
      </View>
    </ScreenContainer>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  wideRoot: { flex: 1, backgroundColor: colors.background },
  wideContent: { width: "100%", maxWidth: WEB_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 80, paddingTop: 16, paddingBottom: 32, gap: 64 },
  wideHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56 },
  wideHeaderActions: { flexDirection: "row", alignItems: "center", gap: 24 },
  wideLink: { ...tokens.typography.labelLarge, color: colors.m3.primary },
  wideCta: { height: 52, paddingHorizontal: 32, borderRadius: tokens.radius.full, alignItems: "center", justifyContent: "center", backgroundColor: colors.m3.primary },
  wideCtaText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimary },
  wideOutlined: { height: 52, paddingHorizontal: 32, borderRadius: tokens.radius.full, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.m3.outline },
  wideOutlinedText: { ...tokens.typography.labelLarge, color: colors.m3.primary },
  wideHero: { flexDirection: "row", alignItems: "center", gap: 48 },
  wideHeroText: { flex: 1, gap: 24, alignItems: "flex-start" },
  wideTitle: { fontFamily: fontFamily.brand, fontSize: 56, lineHeight: 64, color: colors.m3.onSurface },
  wideLead: { ...tokens.typography.bodyLarge, fontSize: 19, lineHeight: 30, color: colors.m3.onSurfaceVariant, maxWidth: 480 },
  wideActions: { flexDirection: "row", gap: 16 },
  widePanel: { flex: 1, maxWidth: 560, height: 420, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: colors.m3.primaryContainer },
  wideIllustration: { width: "90%", height: "90%" },
  wideCards: { flexDirection: "row", gap: 24 },
  wideCard: { flex: 1, gap: 8, padding: 24, borderRadius: tokens.radius.large },
  wideCardTitle: { fontFamily: fontFamily.medium, fontSize: 20, lineHeight: 28, fontWeight: "600" },
  wideCardText: { ...tokens.typography.bodyLarge },
  wideFooter: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
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
    backgroundColor: colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.full,
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[6],
  },
  locationDot: {
    width: tokens.spacing[6],
    height: tokens.spacing[6],
    borderRadius: tokens.radius.full,
    backgroundColor: colors.action,
  },
  locationText: {
    ...tokens.typography.labelMedium,
    color: colors.m3.onSurfaceVariant,
  },
  title: {
    fontFamily: fontFamily.brand,
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    color: colors.m3.onSurface,
  },
  highlight: {
    alignSelf: "flex-start",
    backgroundColor: colors.m3.tertiaryContainer,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[6],
  },
  illustration: { width: "100%", height: 300 },
  subtitle: {
    ...tokens.typography.bodyLarge,
    color: colors.m3.onSurfaceVariant,
  },
  modalities: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  modality: {
    ...tokens.typography.bodyMedium,
    fontFamily: fontFamily.medium,
    color: colors.m3.onSurfaceVariant,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[8],
  },
  actions: { gap: tokens.spacing[12], marginTop: tokens.spacing[16] },
  });
}
