import { useMemo } from "react";
import * as Linking from "expo-linking";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { SUPPORT_EMAIL } from "@/view/supportContact";

export type AboutSectionsProps = {
  onStart: () => void;
  onSignIn: () => void;
  onHelp?: () => void;
  onTerms?: () => void;
};

const STEPS = [
  { title: "Anuncie ou procure", text: "Cadastre um livro com foto ou escaneie o código de barras. Ou busque por título, autor, categoria e bairro." },
  { title: "Combine pelo chat", text: "Peça o livro, converse com a pessoa e defina se é venda, troca ou doação." },
  { title: "Encontre-se com segurança", text: "Escolha um ponto seguro de Piripiri, confirme o encontro e avalie a experiência." },
] as const;

const SAFETY = [
  "Encontros em pontos seguros e públicos da cidade",
  "Avaliações entre leitores e perfis com histórico",
  "Bloqueio e denúncia a qualquer momento",
  "Sem taxas: o IpêBook não cobra pelas negociações",
] as const;

/**
 * Seções da página que apresenta o app na web (Spec 092): como funciona, segurança, chamada final para
 * Criar conta e Entrar, e rodapé com Ajuda, Termos e contato. Vem depois da chamada principal da boas-vindas.
 */
export function AboutSections({ onStart, onSignIn, onHelp, onTerms }: AboutSectionsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Como funciona</Text>
        <View style={styles.steps}>
          {STEPS.map((step, index) => (
            <View key={step.title} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.safety}>
        <View style={styles.safetyText}>
          <Text accessibilityRole="header" style={styles.safetyTitle}>Feito para a comunidade de Piripiri.</Text>
          <Text style={styles.safetyLead}>
            Livros circulam melhor quando quem negocia se sente seguro. Por isso o app cuida do encontro, não só do anúncio.
          </Text>
        </View>
        <View style={styles.safetyList}>
          {SAFETY.map((item) => (
            <View key={item} style={styles.safetyItem}>
              <AppIcon name="check" size={20} color={colors.m3.onPrimaryContainer} />
              <Text style={styles.safetyItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.finalCta}>
        <Text accessibilityRole="header" style={styles.finalTitle}>Pronto para dar nova vida a um livro?</Text>
        <View style={styles.finalActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Criar conta grátis" onPress={onStart} style={styles.cta}>
            <Text style={styles.ctaText}>Criar conta</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Já tenho conta, entrar" onPress={onSignIn} style={styles.outlined}>
            <Text style={styles.outlinedText}>Entrar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>IpêBook · Piripiri, Piauí</Text>
        <View style={styles.footerLinks}>
          {onHelp ? (
            <Pressable accessibilityRole="link" accessibilityLabel="Ajuda e perguntas frequentes" onPress={onHelp}>
              <Text style={styles.footerLink}>Ajuda</Text>
            </Pressable>
          ) : null}
          {onTerms ? (
            <Pressable accessibilityRole="link" accessibilityLabel="Termos e privacidade" onPress={onTerms}>
              <Text style={styles.footerLink}>Termos e privacidade</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Falar com a equipe: ${SUPPORT_EMAIL}`}
            onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          >
            <Text style={styles.footerLink}>{SUPPORT_EMAIL}</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: { gap: 32 },
    sectionTitle: { fontFamily: fontFamily.brand, fontSize: 36, lineHeight: 44, color: colors.m3.onSurface },
    steps: { flexDirection: "row", gap: 24 },
    step: { flex: 1, gap: 8, padding: 24, borderRadius: tokens.radius.large, backgroundColor: colors.m3.surfaceContainerLow },
    stepNumber: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.m3.primary },
    stepNumberText: { ...tokens.typography.titleMedium, color: colors.m3.onPrimary },
    stepTitle: { fontFamily: fontFamily.medium, fontSize: 20, lineHeight: 28, fontWeight: "600", color: colors.m3.onSurface },
    stepText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurfaceVariant },
    safety: { flexDirection: "row", gap: 48, padding: 40, borderRadius: 28, backgroundColor: colors.m3.primaryContainer, alignItems: "center" },
    safetyText: { flex: 1, gap: 12 },
    safetyTitle: { fontFamily: fontFamily.brand, fontSize: 32, lineHeight: 40, color: colors.m3.onPrimaryContainer },
    safetyLead: { ...tokens.typography.bodyLarge, color: colors.m3.onPrimaryContainer },
    safetyList: { flex: 1, gap: 16 },
    safetyItem: { flexDirection: "row", alignItems: "center", gap: 12 },
    safetyItemText: { ...tokens.typography.bodyLarge, flex: 1, color: colors.m3.onPrimaryContainer },
    finalCta: { alignItems: "center", gap: 24, paddingVertical: 24 },
    finalTitle: { fontFamily: fontFamily.brand, fontSize: 36, lineHeight: 44, textAlign: "center", color: colors.m3.onSurface },
    finalActions: { flexDirection: "row", gap: 16 },
    cta: { height: 52, paddingHorizontal: 32, borderRadius: tokens.radius.full, alignItems: "center", justifyContent: "center", backgroundColor: colors.m3.primary },
    ctaText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimary },
    outlined: { height: 52, paddingHorizontal: 32, borderRadius: tokens.radius.full, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.m3.outline },
    outlinedText: { ...tokens.typography.labelLarge, color: colors.m3.primary },
    footer: { gap: 12, paddingTop: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.m3.outlineVariant },
    footerBrand: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    footerLinks: { flexDirection: "row", gap: 24, flexWrap: "wrap" },
    footerLink: { ...tokens.typography.labelLarge, color: colors.m3.primary },
  });
}
