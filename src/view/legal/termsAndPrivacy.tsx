import { type ComponentRef, useMemo, useRef, useState } from "react";
import { Platform, Pressable, type PressableProps, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEGAL_LAST_UPDATED, PRIVACY_POLICY, TERMS_OF_USE } from "@/model/legalContent";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { SegmentedControl } from "@/view/components/SegmentedControl";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { WEB_GUTTER, WEB_MAX_WIDTH, useWebColumns, webColumnWidth } from "@/view/webLayout";
import { withPress } from "@/view/pressFeedback";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

const TERMS_WIDE_MAX_WIDTH = WEB_MAX_WIDTH;

const legalTabs = [
  { key: "terms", label: "Termos de Uso" },
  { key: "privacy", label: "Privacidade (LGPD)" },
] as const;
type LegalTab = (typeof legalTabs)[number]["key"];

export type TermsAndPrivacyProps = {
  onBack?: () => void;
  initialTab?: LegalTab;
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
  const guardedBack = useGuardedPress(onBack);
  const guardedDeleteAccount = useGuardedPress(onNavigateToDeleteAccount);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const tabRefs = useRef<Partial<Record<LegalTab, ComponentRef<typeof Pressable> | null>>>({});
  const isWeb = Platform.OS === "web";
  const inactiveTab = activeTab === "terms" ? "privacy" : "terms";
  // Web larga: coluna mais larga, com as cláusulas em duas colunas.
  const wide = useIsWideWeb();
  const columns = useWebColumns(2, 3);
  const columnWidth =
    isWeb
      ? ({ width: `calc((100% - ${(columns - 1) * 16}px) / ${columns})` as unknown as `${number}%` })
      : { width: webColumnWidth(columns) };
  const sections = activeTab === "terms" ? TERMS_OF_USE : PRIVACY_POLICY;

  function handleTabKey(event: Parameters<NonNullable<PressableProps["onKeyDown"]>>[0], tab: LegalTab) {
    const key = (event.nativeEvent as unknown as KeyboardEvent).key;
    let nextTab: LegalTab;
    switch (key) {
      case "ArrowLeft":
      case "ArrowRight":
        nextTab = tab === "terms" ? "privacy" : "terms";
        break;
      case "Home":
        nextTab = "terms";
        break;
      case "End":
        nextTab = "privacy";
        break;
      case " ":
      case "Enter":
        nextTab = tab;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus?.();
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Termos e privacidade" onBack={guardedBack} contentMaxWidth={wide ? TERMS_WIDE_MAX_WIDTH : undefined} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}
        {...standardVerticalScrollProps}
      >
        <View style={[styles.content, wide && styles.contentWide]}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>Informação clara para você.</Text>
            <Text style={styles.heroSubtitle}>
              Consulte os documentos que orientam o uso do IpêBook.
            </Text>
          </View>
          {Platform.OS === "ios" && !wide ? (
            <SegmentedControl
              testID="terms-privacy-tablist"
              accessibilityLabel="Documentos do IpêBook"
              value={activeTab}
              onChange={setActiveTab}
              options={legalTabs.map(({ key, label }) => ({ value: key, label }))}
            />
          ) : (
            <View
              testID="terms-privacy-tablist"
              accessibilityRole="tablist"
              accessibilityLabel="Documentos do IpêBook"
              style={styles.tabs}
            >
              {legalTabs.map(({ key, label }) => {
                const selected = activeTab === key;
                return (
                  <Pressable
                    key={key}
                    ref={(tab) => { tabRefs.current[key] = tab; }}
                    accessibilityRole="tab"
                    accessibilityLabel={label}
                    accessibilityState={{ selected }}
                    nativeID={isWeb ? `legal-tab-${key}` : undefined}
                    aria-controls={isWeb ? `legal-panel-${key}` : undefined}
                    aria-selected={isWeb ? selected : undefined}
                    tabIndex={isWeb ? (selected ? 0 : -1) : undefined}
                    onKeyDown={isWeb ? (event) => handleTabKey(event, key) : undefined}
                    onPress={() => setActiveTab(key)}
                    style={withPress([styles.tab, selected && styles.activeTab])}
                  >
                    <Text style={[styles.tabText, selected && styles.activeTabText]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {isWeb && (
            <View
              nativeID={`legal-panel-${inactiveTab}`}
              role="tabpanel"
              aria-labelledby={`legal-tab-${inactiveTab}`}
              style={styles.inactivePanel}
            />
          )}
          <View
            nativeID={isWeb ? `legal-panel-${activeTab}` : undefined}
            role={isWeb ? "tabpanel" : undefined}
            aria-labelledby={isWeb ? `legal-tab-${activeTab}` : undefined}
            tabIndex={isWeb ? 0 : undefined}
            style={[styles.cardList, wide && styles.cardListWide]}
          >
            <Text style={[styles.updatedDate, wide && styles.fullRow]}>{`Última atualização: ${LEGAL_LAST_UPDATED}`}</Text>
            {sections.map((section) => (
              <View key={section.title} style={[styles.sectionCard, wide && columnWidth]}>
                <Text accessibilityRole="header" aria-level={2} style={styles.sectionTitle}>
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
                <Text accessibilityRole="header" aria-level={2} style={styles.sectionTitle}>
                  Portabilidade e Exclusão (LGPD — Art. 18)
                </Text>
                <Text style={styles.paragraph}>
                  Você pode baixar uma cópia estruturada (JSON) dos seus anúncios, pedidos, favoritos e alertas ou solicitar a exclusão definitiva da sua conta a qualquer momento.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Abrir gerenciamento de exportação e exclusão dos meus dados"
                  onPress={guardedDeleteAccount}
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
    padding: tokens.spacing[16],
  },
  contentWide: { maxWidth: TERMS_WIDE_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_GUTTER },
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
    borderBottomColor: colors.book.paperEdge,
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
  inactivePanel: { display: "none" },
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
