import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { REPORT_REASONS, type ReportReason } from "@/model/entities/report";
import { FilledButton } from "@/view/components/FilledButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { useReportListingViewModel } from "@/viewmodel/useReportListingViewModel";

export type ReportListingProps = {
  listingId: string;
  listingTitle?: string;
  sessionUserId: string | null;
  onBack: () => void;
  onNavigateToLogin?: () => void;
};

export default function ReportListing({
  listingId,
  listingTitle,
  sessionUserId,
  onBack,
  onNavigateToLogin,
}: ReportListingProps) {
  const [state, actions] = useReportListingViewModel();

  if (state.success) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Denúncia" onBack={onBack} />
        <View style={styles.content}>
          <View style={styles.successCard}>
            <Text accessibilityRole="header" style={styles.successTitle}>
              Denúncia enviada
            </Text>
            <Text style={styles.successBody}>
              Obrigado por ajudar a manter a comunidade Ipebook segura em Piripiri. Nossa moderação analisará este anúncio em até 24 horas e tomará as medidas necessárias.
            </Text>
            <FilledButton label="Voltar ao anúncio" onPress={onBack} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Denúncia" onBack={onBack} />
        <View style={styles.content}>
          <View style={styles.authNotice}>
            <Text accessibilityRole="header" style={styles.title}>
              Identificação necessária
            </Text>
            <Text style={styles.body}>
              Para evitar abusos e manter o respeito na comunidade, apenas pessoas autenticadas podem denunciar anúncios.
            </Text>
            {onNavigateToLogin ? (
              <FilledButton label="Entrar na minha conta" onPress={onNavigateToLogin} />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Denunciar anúncio" onBack={onBack} />
      <View style={styles.content}>
        {listingTitle ? (
          <Text style={styles.bookContext}>
            Denunciando: <Text style={styles.bookTitleBold}>{listingTitle}</Text>
          </Text>
        ) : null}

        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Por que você está denunciando este anúncio?
        </Text>

        <View style={styles.reasonList}>
          {REPORT_REASONS.map((option) => {
            const isSelected = state.reason === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={option.label}
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
                  <Text style={styles.reasonDescription}>{option.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.field}>
          <Text style={styles.inputLabel}>Detalhes adicionais (opcional)</Text>
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
          <Text accessibilityRole="alert" style={styles.errorText}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  bookContext: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
  },
  bookTitleBold: {
    fontWeight: "700",
    color: tokens.colors.text,
  },
  title: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "700",
    color: tokens.colors.text,
  },
  sectionTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "600",
    color: tokens.colors.text,
  },
  body: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
    lineHeight: 22,
  },
  reasonList: {
    gap: tokens.spacing[12],
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: tokens.spacing[12],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
    minHeight: tokens.accessibility.touchTarget,
    gap: tokens.spacing[12],
  },
  reasonOptionSelected: {
    borderColor: tokens.colors.action,
    backgroundColor: tokens.colors.background,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    borderRadius: 5,
    backgroundColor: tokens.colors.action,
  },
  reasonTextContainer: {
    flex: 1,
    gap: 2,
  },
  reasonLabel: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontWeight: "600",
    color: tokens.colors.text,
  },
  reasonLabelSelected: {
    color: tokens.colors.action,
  },
  reasonDescription: {
    fontSize: tokens.typography.labelMedium.fontSize,
    color: tokens.colors.secondaryText,
    lineHeight: 18,
  },
  field: {
    gap: tokens.spacing[6],
  },
  inputLabel: {
    fontSize: tokens.typography.labelMedium.fontSize,
    fontWeight: tokens.typography.labelMedium.fontWeight,
    color: tokens.colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[12],
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.surface,
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.error,
  },
  successCard: {
    padding: tokens.spacing[24],
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: tokens.spacing[16],
    alignItems: "center",
    marginTop: tokens.spacing[24],
  },
  successTitle: {
    fontSize: tokens.typography.titleLarge.fontSize,
    fontWeight: "700",
    color: tokens.colors.action,
    textAlign: "center",
  },
  successBody: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
    textAlign: "center",
    lineHeight: 24,
  },
  authNotice: {
    padding: tokens.spacing[24],
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: tokens.spacing[16],
    alignItems: "center",
    marginTop: tokens.spacing[24],
  },
});
