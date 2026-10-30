import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEGAL_LAST_UPDATED, PRIVACY_POLICY, TERMS_OF_USE } from "@/model/legalContent";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { WEB_MAX_WIDTH, WEB_GUTTER, useWebColumns, webColumnWidth } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
export type TermsAndPrivacyProps = {
  onBack?: () => void;
  initialTab?: "terms" | "privacy";
  onNavigateToDeleteAccount?: () => void;
};

/**
 * Figma `07.14 · Termos e privacidade` (`254:6585` / Web `370:17221`),
 * `07.15 · Termos de uso` (`254:6734` / Web `370:17261`) e
 * `07.16 · Política de privacidade` (`254:6865` / Web `370:17301`).
 */
export default function TermsAndPrivacy({
  onBack,
  initialTab = "terms",
  onNavigateToDeleteAccount,
}: TermsAndPrivacyProps = {}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);
  // Web larga: coluna mais larga, com as cláusulas em duas colunas.
  const wide = useIsWideWeb();
  const columns = useWebColumns(2, 3);
  const columnWidth = { width: webColumnWidth(columns) };
  const sections = activeTab === "terms" ? TERMS_OF_USE : PRIVACY_POLICY;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Termos e privacidade" onBack={() => onBack?.()} contentMaxWidth={wide ? WEB_MAX_WIDTH : undefined} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, wide && styles.contentWide]}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>Informação clara para você.</Text>
            <Text style={styles.heroSubtitle}>
              Consulte os documentos que orientam o uso do IpêBook.
            </Text>
          </View>
          <View testID="terms-privacy-tablist" accessibilityRole="tablist" style={styles.tabs}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "terms" }}
              onPress={() => setActiveTab("terms")}
              style={withPress([styles.tab, activeTab === "terms" && styles.activeTab])}
            >
              <Text style={[styles.tabText, activeTab === "terms" && styles.activeTabText]}>
                Termos de Uso
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "privacy" }}
              onPress={() => setActiveTab("privacy")}
              style={withPress([styles.tab, activeTab === "privacy" && styles.activeTab])}
            >
              <Text style={[styles.tabText, activeTab === "privacy" && styles.activeTabText]}>
                Privacidade (LGPD)
              </Text>
            </Pressable>
          </View>

          <View style={[styles.cardList, wide && styles.cardListWide]}>
            <Text style={[styles.updatedDate, wide && styles.fullRow]}>{`Última atualização: ${LEGAL_LAST_UPDATED}`}</Text>
            {sections.map((section) => (
              <View key={section.title} style={[styles.sectionCard, wide && columnWidth]}>
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  {section.title}
                </Text>
                {section.paragraphs.map((p, index) => (
                  <Text key={index} style={styles.paragraph}>
                    {p}
                  </Text>
                ))}
              </View>
            ))}
            {activeTab === "privacy" && onNavigateToDeleteAccount ? (
              <View style={[styles.sectionCard, wide && styles.fullRow]}>
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  Portabilidade e Exclusão (LGPD — Art. 18)
                </Text>
                <Text style={styles.paragraph}>
                  Você pode baixar uma cópia estruturada (JSON) dos seus anúncios, pedidos, favoritos e alertas ou solicitar a exclusão definitiva da sua conta a qualquer momento.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Solicitar exclusão da minha conta e dados"
                  onPress={onNavigateToDeleteAccount}
                  style={withPress(styles.deleteAccountLink)}
                >
                  <Text style={styles.deleteAccountText}>
                    Deseja exportar ou excluir sua conta? Gerenciar dados e exclusão definitiva (LGPD)
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: tokens.spacing[48],
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[16],
  },
  contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
  cardListWide: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", columnGap: tokens.spacing[16], rowGap: tokens.spacing[16] },
  fullRow: { width: "100%" },
  heroHeader: {
    gap: tokens.spacing[4],
    marginBottom: tokens.spacing[16],
  },
  heroTitle: {
    ...tokens.typography.displayLarge,
    color: colors.text,
  },
  heroSubtitle: {
    ...tokens.typography.bodyLarge,
    color: colors.secondaryText,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.m3.outlineVariant,
    marginBottom: tokens.spacing[16],
  },
  tab: {
    flex: 1,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[16],
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.action,
  },
  tabText: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  activeTabText: {
    color: colors.action,
    fontWeight: tokens.fontWeight.semiBold,
  },
  updatedDate: {
    ...tokens.typography.labelMedium,
    color: colors.secondaryText,
    fontStyle: "italic",
    marginBottom: tokens.spacing[8],
  },
  cardList: {
    gap: tokens.spacing[12],
  },
  sectionCard: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    gap: tokens.spacing[8],
  },
  sectionTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  paragraph: {
    ...tokens.typography.bodyMedium,
    color: colors.text,
  },
  deleteAccountLink: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingVertical: tokens.spacing[16],
    alignItems: "center",
  },
  deleteAccountText: {
    ...tokens.typography.labelMedium,
    color: colors.error,
    textDecorationLine: "underline",
    fontWeight: tokens.fontWeight.semiBold,
  },
  });
}
