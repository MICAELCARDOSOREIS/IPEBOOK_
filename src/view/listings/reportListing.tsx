import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { REPORT_REASONS } from "@/model/entities/report";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { useFormErrorAnnouncer } from "@/view/useFormErrorAnnouncer";
import { useReportListingViewModel } from "@/viewmodel/useReportListingViewModel";

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
  const errorRef = useFormErrorAnnouncer(state.error);

  if (state.success) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Denunciar anúncio" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.successCard}>
              <IconBadge icon="check" tone="action" />
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
        <TopAppBar title="Denunciar anúncio" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.authNotice}>
              <IconBadge icon="flag" tone="neutral" />
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
      <TopAppBar title="Denunciar anúncio" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
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
                  style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
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

          <View style={styles.field}>
            <Text style={styles.inputLabel}>Detalhes (opcional)</Text>
            <TextInput
              accessibilityLabel="Detalhes adicionais da denúncia"
              value={state.details}
              onChangeText={actions.setDetails}
              editable={!state.loading}
              style={styles.textInput}
              placeholder="Descreva o problema com mais detalhes para nos ajudar..."
              placeholderTextColor={tokens.colors.secondaryText}
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
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  bookContext: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  heroHeader: {
    gap: tokens.spacing[4],
  },
  heroHeadline: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  successHeadline: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
    textAlign: "center",
  },
  bookTitleBold: {
    fontWeight: "700",
    color: tokens.colors.text,
  },
  title: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
    textAlign: "center",
  },
  bodyCenter: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
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
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: tokens.colors.action,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.action,
  },
  reasonTextContainer: {
    flex: 1,
    gap: 2,
  },
  reasonLabel: {
    ...tokens.typography.bodyLarge,
    fontWeight: "600",
    color: tokens.colors.text,
  },
  reasonLabelSelected: {
    color: tokens.colors.action,
  },
  field: {
    gap: tokens.spacing[6],
  },
  inputLabel: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: tokens.colors.m3.outline,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[12],
    ...tokens.typography.bodyLarge,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.surface,
    minHeight: tokens.spacing[64],
    textAlignVertical: "top",
  },
  errorText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.error,
  },
  successCard: {
    padding: tokens.spacing[24],
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    gap: tokens.spacing[16],
    alignItems: "center",
    marginTop: tokens.spacing[24],
  },
  successTitle: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.action,
    textAlign: "center",
  },
  successBody: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  authNotice: {
    padding: tokens.spacing[24],
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    gap: tokens.spacing[16],
    alignItems: "center",
    marginTop: tokens.spacing[24],
  },
  fullWidthButton: {
    width: "100%",
  },
});
