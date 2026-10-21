import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PRIVACY_POLICY, TERMS_OF_USE } from "@/model/legalContent";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";

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
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);
  const sections = activeTab === "terms" ? TERMS_OF_USE : PRIVACY_POLICY;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Termos e Privacidade" onBack={() => onBack?.()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
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
              style={[styles.tab, activeTab === "terms" && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === "terms" && styles.activeTabText]}>
                Termos de Uso
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "privacy" }}
              onPress={() => setActiveTab("privacy")}
              style={[styles.tab, activeTab === "privacy" && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === "privacy" && styles.activeTabText]}>
                Privacidade (LGPD)
              </Text>
            </Pressable>
          </View>

          <View style={styles.cardList}>
            <Text style={styles.updatedDate}>Última atualização: 15 de outubro de 2026</Text>
            {sections.map((section) => (
              <View key={section.title} style={styles.sectionCard}>
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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Solicitar exclusão da minha conta e dados"
                onPress={onNavigateToDeleteAccount}
                style={styles.deleteAccountLink}
              >
                <Text style={styles.deleteAccountText}>
                  Deseja excluir sua conta? Solicitar exclusão definitiva de dados (LGPD)
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
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
  heroHeader: {
    gap: tokens.spacing[4],
    marginBottom: tokens.spacing[16],
  },
  heroTitle: {
    ...tokens.typography.displayLarge,
    color: tokens.colors.text,
  },
  heroSubtitle: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.secondaryText,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.m3.outlineVariant,
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
    borderBottomColor: tokens.colors.action,
  },
  tabText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  activeTabText: {
    color: tokens.colors.action,
    fontWeight: "600",
  },
  updatedDate: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.secondaryText,
    fontStyle: "italic",
    marginBottom: tokens.spacing[8],
  },
  cardList: {
    gap: tokens.spacing[12],
  },
  sectionCard: {
    backgroundColor: tokens.colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    gap: tokens.spacing[8],
  },
  sectionTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  paragraph: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.text,
  },
  deleteAccountLink: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingVertical: tokens.spacing[16],
    alignItems: "center",
  },
  deleteAccountText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.error,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
