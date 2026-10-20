import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PRIVACY_POLICY, TERMS_OF_USE } from "@/model/legalContent";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";

export type TermsAndPrivacyProps = {
  onBack?: () => void;
  initialTab?: "terms" | "privacy";
  onNavigateToDeleteAccount?: () => void;
};

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
      <View style={styles.content}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[16] },
  tabs: {
    flexDirection: "row",
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: tokens.spacing[16],
  },
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing[8],
    alignItems: "center",
    borderRadius: tokens.radius.full,
  },
  activeTab: {
    backgroundColor: tokens.colors.action,
  },
  tabText: {
    fontSize: tokens.typography.labelMedium.fontSize,
    fontWeight: "600",
    color: tokens.colors.secondaryText,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  updatedDate: {
    fontSize: 12,
    color: tokens.colors.secondaryText,
    fontStyle: "italic",
    marginBottom: tokens.spacing[8],
  },
  cardList: {
    gap: tokens.spacing[12],
  },
  sectionCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: tokens.spacing[8],
  },
  sectionTitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    fontWeight: "bold",
    color: tokens.colors.text,
  },
  paragraph: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: 22,
    color: tokens.colors.text,
  },
  deleteAccountLink: {
    paddingVertical: tokens.spacing[16],
    alignItems: "center",
  },
  deleteAccountText: {
    fontSize: tokens.typography.labelMedium.fontSize,
    color: tokens.colors.error,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
