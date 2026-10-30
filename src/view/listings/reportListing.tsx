import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { REPORT_REASONS } from "@/model/entities/report";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useFormErrorAnnouncer } from "@/view/useFormErrorAnnouncer";
import { useReportListingViewModel } from "@/viewmodel/useReportListingViewModel";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
export type ReportListingProps = {
  listingId: string;
  listingTitle?: string;
  sessionUserId: string | null;
  onBack: () => void;
  onNavigateToLogin?: () => void;
};

/**
 * Figma `09.03 · Denunciar anúncio` (`27:1239` / Web `163:2406`) e
 * `09.04 · Denúncia enviada` (`370:6727` / Web `370:17981`).
 */
export default function ReportListing({
  listingId,
  listingTitle,
  sessionUserId,
  onBack,
  onNavigateToLogin,
}: ReportListingProps) {
  const [state, actions] = useReportListingViewModel();
  const { colors } = useTheme();
  // Web larga: coluna mais larga, com o conteúdo dividido em duas colunas.
  const wide = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const errorRef = useFormErrorAnnouncer(state.error);

  if (state.success) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Denunciar anúncio" onBack={onBack} contentMaxWidth={wide ? WEB_MAX_WIDTH : undefined} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.successCard}>
              <IconBadge icon="check" tone="action" size="large" />
              <Text accessibilityRole="header" style={styles.successTitle}>
                Denúncia enviada
              </Text>
              <Text style={styles.successHeadline}>Recebemos sua denúncia.</Text>
              <Text style={styles.successBody}>
                A equipe vai analisar o relato em até 24 horas. Obrigado por ajudar a manter a comunidade IpêBook segura em Piripiri.
              </Text>
              <View style={styles.fullWidthButton}>
                <FilledButton label="Voltar ao anúncio" onPress={onBack} />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Denunciar anúncio" onBack={onBack} contentMaxWidth={wide ? WEB_MAX_WIDTH : undefined} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.authNotice}>
              <IconBadge icon="flag" tone="neutral" size="large" />
              <Text accessibilityRole="header" style={styles.title}>
                Identificação necessária
              </Text>
              <Text style={styles.bodyCenter}>
                Para evitar abusos e manter o respeito na comunidade, apenas pessoas autenticadas podem denunciar anúncios.
              </Text>
              {onNavigateToLogin ? (
                <View style={styles.fullWidthButton}>
                  <FilledButton label="Entrar na minha conta" onPress={onNavigateToLogin} />
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Denunciar anúncio" onBack={onBack} contentMaxWidth={wide ? WEB_MAX_WIDTH : undefined} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, wide && styles.contentWide]}>
          {listingTitle ? (
            <Text style={styles.bookContext}>
              Denunciando: <Text style={styles.bookTitleBold}>{listingTitle}</Text>
            </Text>
          ) : null}

          <View style={styles.heroHeader}>
            <Text style={styles.heroHeadline}>O que aconteceu?</Text>
            <Text style={styles.bookContext}>
              Sua denúncia é anônima. A equipe analisa em até 24 horas.
            </Text>
          </View>

          <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={[styles.column, wide && styles.columnHalf]}>
          <View testID="report-reasons-radiogroup" accessibilityRole="radiogroup" style={styles.reasonList}>
            {REPORT_REASONS.map((option) => {
              const isSelected = state.reason === option.key;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected, selected: isSelected }}
                  accessibilityLabel={option.label}
                  accessibilityHint={option.description}
                  onPress={() => actions.setReason(option.key)}
                  style={withPress([styles.reasonOption, isSelected && styles.reasonOptionSelected])}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.reasonTextContainer}>
                    <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
                      {option.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          </View>
          <View style={[styles.column, wide && styles.columnHalf]}>
          <View style={styles.field}>
            <Text style={styles.inputLabel}>Detalhes (opcional)</Text>
            <TextInput
              accessibilityLabel="Detalhes adicionais da denúncia"
              value={state.details}
              onChangeText={actions.setDetails}
              editable={!state.loading}
              style={styles.textInput}
              placeholder="Descreva o problema com mais detalhes para nos ajudar..."
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {state.error ? (
            <Text
              ref={errorRef}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              style={styles.errorText}
            >
              {state.error}
            </Text>
          ) : null}

          <FilledButton
            label="Enviar denúncia"
            loading={state.loading}
            loadingLabel="Enviando denúncia..."
            onPress={() => void actions.submit(listingId, sessionUserId)}
          />
          </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
  columns: { gap: tokens.spacing[16] },
  columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
  column: { gap: tokens.spacing[16] },
  columnHalf: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: tokens.spacing[48],
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  bookContext: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  heroHeader: {
    gap: tokens.spacing[4],
  },
  heroHeadline: {
    ...tokens.typography.displayLarge,
    color: colors.text,
  },
  successHeadline: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
    textAlign: "center",
  },
  bookTitleBold: {
    fontWeight: tokens.fontWeight.bold,
    color: colors.text,
  },
  title: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
    textAlign: "center",
  },
  bodyCenter: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    textAlign: "center",
  },
  reasonList: {
    gap: tokens.spacing[12],
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: tokens.spacing[8],
    minHeight: tokens.accessibility.touchTarget,
    gap: tokens.spacing[12],
  },
  reasonOptionSelected: {},
  radioCircle: {
    width: tokens.spacing[20],
    height: tokens.spacing[20],
    borderRadius: tokens.radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: tokens.spacing[2],
  },
  radioCircleSelected: {
    borderColor: colors.action,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: tokens.radius.full,
    backgroundColor: colors.action,
  },
  reasonTextContainer: {
    flex: 1,
    gap: tokens.spacing[2],
  },
  reasonLabel: {
    ...tokens.typography.bodyLarge,
    fontWeight: tokens.fontWeight.semiBold,
    color: colors.text,
  },
  reasonLabelSelected: {
    color: colors.action,
  },
  field: {
    gap: tokens.spacing[6],
  },
  inputLabel: {
    ...tokens.typography.labelMedium,
    color: colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.m3.outline,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[12],
    ...tokens.typography.bodyLarge,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: tokens.spacing[64],
    textAlignVertical: "top",
  },
  errorText: {
    ...tokens.typography.bodyMedium,
    color: colors.error,
  },
  successCard: {
    padding: tokens.spacing[24],
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    gap: tokens.spacing[16],
    alignItems: "center",
    marginTop: tokens.spacing[24],
  },
  successTitle: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.action,
    textAlign: "center",
  },
  successBody: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    textAlign: "center",
  },
  authNotice: {
    padding: tokens.spacing[24],
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    gap: tokens.spacing[16],
    alignItems: "center",
    marginTop: tokens.spacing[24],
  },
  fullWidthButton: {
    width: "100%",
  },
  });
}
