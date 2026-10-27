import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { USER_REPORT_REASONS } from "@/model/entities/report";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useReportUserViewModel } from "@/viewmodel/useReportUserViewModel";

export type ReportUserProps = {
  userId: string;
  userName?: string;
  onBack: () => void;
  onNavigateToLogin?: () => void;
};

/** "Denunciar pessoa" (Spec 091): motivo, detalhes opcionais e confirmação, no padrão de "Denunciar anúncio". */
export default function ReportUser({ userId, userName, onBack, onNavigateToLogin }: ReportUserProps) {
  const [auth] = useAuthViewModel();
  const sessionUserId = auth.user?.id ?? null;
  const [state, actions] = useReportUserViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (state.success) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Denunciar pessoa" onBack={onBack} />
        <View style={styles.centered}>
          <IconBadge icon="check" tone="action" size="large" />
          <Text accessibilityRole="header" style={styles.title}>Denúncia enviada</Text>
          <Text style={styles.body}>
            Recebemos sua denúncia. A equipe vai analisar o relato em até 24 horas. Obrigado por ajudar a manter a comunidade segura.
          </Text>
          <View style={styles.full}>
            <FilledButton label="Voltar ao perfil" onPress={onBack} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Denunciar pessoa" onBack={onBack} />
        <View style={styles.centered}>
          <IconBadge icon="flag" tone="neutral" size="large" />
          <Text accessibilityRole="header" style={styles.title}>Identificação necessária</Text>
          <Text style={styles.body}>Apenas pessoas com conta podem denunciar, para evitar abusos.</Text>
          {onNavigateToLogin ? (
            <View style={styles.full}>
              <FilledButton label="Entrar na minha conta" onPress={onNavigateToLogin} />
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Denunciar pessoa" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.heading}>{userName ? `O que aconteceu com ${userName}?` : "O que aconteceu?"}</Text>
          <Text style={styles.body}>Sua denúncia é anônima. A equipe analisa em até 24 horas.</Text>

          <View accessibilityRole="radiogroup" style={styles.reasons}>
            {USER_REPORT_REASONS.map((option) => {
              const selected = state.reason === option.key;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, selected }}
                  accessibilityLabel={option.label}
                  accessibilityHint={option.description}
                  onPress={() => actions.setReason(option.key)}
                  style={[styles.reason, selected && styles.reasonSelected]}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.reasonTexts}>
                    <Text style={styles.reasonLabel}>{option.label}</Text>
                    <Text style={styles.reasonHint}>{option.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Detalhes (opcional)</Text>
          <TextInput
            accessibilityLabel="Detalhes adicionais da denúncia"
            value={state.details}
            onChangeText={actions.setDetails}
            editable={!state.loading}
            multiline
            maxLength={500}
            placeholder="Conte o que aconteceu, se quiser."
            placeholderTextColor={colors.m3.onSurfaceVariant}
            style={styles.input}
          />

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
          ) : null}

          <FilledButton
            label="Enviar denúncia"
            loading={state.loading}
            loadingLabel="Enviando"
            onPress={() => void actions.submit(userId, sessionUserId)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: tokens.spacing[16] },
    content: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[16] },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: tokens.spacing[12], padding: tokens.spacing[24] },
    full: { alignSelf: "stretch" },
    title: { ...tokens.typography.titleMedium, color: colors.m3.onSurface, textAlign: "center" },
    heading: { ...tokens.typography.titleMedium, fontSize: 22, lineHeight: 28, color: colors.m3.onSurface },
    body: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    reasons: { gap: tokens.spacing[8] },
    reason: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: 64,
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    reasonSelected: { borderColor: colors.m3.primary, backgroundColor: colors.m3.secondaryContainer },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.m3.outline, alignItems: "center", justifyContent: "center" },
    radioSelected: { borderColor: colors.m3.primary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.m3.primary },
    reasonTexts: { flex: 1, gap: 2 },
    reasonLabel: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    reasonHint: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    label: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    input: {
      minHeight: 96,
      textAlignVertical: "top",
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      color: colors.m3.onSurface,
      ...tokens.typography.bodyLarge,
    },
    error: { ...tokens.typography.bodyMedium, color: colors.error },
  });
}
