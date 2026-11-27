import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { USER_REPORT_REASONS } from "@/model/entities/report";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { LoadingState } from "@/view/components/LoadingState";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { ScrollEdgeScrollView, ScrollEdgeScreen } from "@/view/components/ScrollEdgeScreen";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useGuardedPress } from "@/view/useGuardedPress";
import { scrollBottomPadding, standardVerticalScrollProps } from "@/view/scrollProps";
import { makeAuthViewModel, makeReportUserViewModel } from "@/di/container";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
export type ReportUserProps = {
  userId: string;
  userName?: string;
  onBack: () => void;
  onNavigateToLogin?: () => void;
};

/** "Denunciar pessoa" (Spec 091): motivo, detalhes opcionais e confirmação, no padrão de "Denunciar anúncio". */
export default function ReportUser({ userId, userName, onBack, onNavigateToLogin }: ReportUserProps) {
  const [auth] = makeAuthViewModel();
  const sessionUserId = auth.user?.id ?? null;
  const [state, actions] = makeReportUserViewModel();
  const { colors } = useTheme();
  // Web larga: motivos de um lado, detalhes e envio do outro.
  const wide = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [detailsFocused, setDetailsFocused] = useState(false);

  const guardedBack = useGuardedPress(onBack);
  const guardedNavigateToLoginPress = useGuardedPress(onNavigateToLogin);
  const guardedNavigateToLogin = onNavigateToLogin ? guardedNavigateToLoginPress : undefined;

  if (state.success) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Denunciar pessoa" onBack={guardedBack} />
        <View style={styles.centered}>
          <IconBadge icon="check" tone="action" size="large" />
          <Text accessibilityRole="header" style={styles.title}>Denúncia enviada</Text>
          <Text style={styles.body}>
            Recebemos sua denúncia. A equipe vai analisar o relato em até 24 horas. Obrigado por ajudar a manter a comunidade segura.
          </Text>
          <View style={styles.full}>
            <FilledButton label="Voltar ao perfil" onPress={guardedBack} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (auth.loading) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Denunciar pessoa" onBack={guardedBack} />
        <View style={styles.centered}>
          <LoadingState label="Carregando sessão" variant="form" />
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Denunciar pessoa" onBack={guardedBack} />
        <View style={styles.centered}>
          <IconBadge icon="flag" tone="neutral" size="large" />
          <Text accessibilityRole="header" style={styles.title}>Identificação necessária</Text>
          <Text style={styles.body}>Apenas pessoas com conta podem denunciar, para evitar abusos.</Text>
          {guardedNavigateToLogin ? (
            <View style={styles.full}>
              <FilledButton label="Entrar na minha conta" onPress={guardedNavigateToLogin} />
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  if (sessionUserId && userId === sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Denunciar pessoa" onBack={guardedBack} />
        <View style={styles.centered}>
          <IconBadge icon="flag" tone="neutral" size="large" />
          <Text accessibilityRole="header" style={styles.title}>Não é possível denunciar a própria conta</Text>
          <Text style={styles.body}>A denúncia serve para relatar o comportamento de outra pessoa da comunidade.</Text>
          <View style={styles.full}>
            <FilledButton label="Voltar" onPress={guardedBack} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollEdgeScreen style={styles.page} header={<TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Denunciar pessoa" onBack={guardedBack} />}>
      <ScrollEdgeScrollView
        {...standardVerticalScrollProps}
        contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, wide && styles.contentWide]}>
          <Text style={styles.heading}>{userName ? `O que aconteceu com ${userName}?` : "O que aconteceu?"}</Text>
          <Text style={styles.body}>Sua denúncia é anônima. A equipe analisa em até 24 horas.</Text>

          <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={[styles.column, wide && styles.columnHalf]}>
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
                  style={withPress([styles.reason, selected && styles.reasonSelected])}
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

          </View>
          <View style={[styles.column, wide && styles.columnHalf]}>
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Detalhes (opcional)</Text>
              <Text style={styles.counter}>{`${state.details.length}/500`}</Text>
            </View>
            <TextInput
              accessibilityLabel="Detalhes adicionais da denúncia"
              value={state.details}
              onChangeText={actions.setDetails}
              editable={!state.loading}
              multiline
              textAlignVertical="top"
              maxLength={500}
              placeholder="Descreva o que aconteceu para ajudar nossa análise."
              placeholderTextColor={colors.m3.onSurfaceVariant}
              onFocus={() => setDetailsFocused(true)}
              onBlur={() => setDetailsFocused(false)}
              style={[styles.input, detailsFocused && styles.inputFocused]}
            />
          </View>

          {state.error ? <InlineErrorCard message={state.error} /> : null}

          <FilledButton
            label="Enviar denúncia"
            loading={state.loading}
            loadingLabel="Enviando"
            disabled={state.loading}
            onPress={() => void actions.submit(userId, sessionUserId)}
          />
          </View>
          </View>
        </View>
      </ScrollEdgeScrollView>
    </ScrollEdgeScreen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, minHeight: 0, backgroundColor: colors.background },
    scroll: { padding: tokens.spacing[16] },
    content: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[16] },
    contentWide: { maxWidth: WEB_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_GUTTER },
    columns: { gap: tokens.spacing[16] },
    columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[32] },
    column: { gap: tokens.spacing[16] },
    columnHalf: { flex: 1 },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: tokens.spacing[12], padding: tokens.spacing[24] },
    full: { alignSelf: "stretch" },
    title: { ...tokens.typography.titleMedium, color: colors.m3.onSurface, textAlign: "center" },
    heading: { ...tokens.typography.titleLarge, color: colors.m3.onSurface },
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
    radio: { width: 20, height: 20, borderRadius: tokens.radius.radio, borderWidth: 2, borderColor: colors.m3.outline, alignItems: "center", justifyContent: "center" },
    radioSelected: { borderColor: colors.m3.primary },
    radioDot: { width: 10, height: 10, borderRadius: tokens.radius.dot, backgroundColor: colors.m3.primary },
    reasonTexts: { flex: 1, gap: tokens.spacing[2] },
    reasonLabel: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    reasonHint: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    field: { gap: tokens.spacing[6] },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[8],
    },
    label: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    counter: { ...tokens.typography.labelSmall, color: colors.m3.onSurfaceVariant },
    input: {
      minHeight: 96,
      textAlignVertical: "top",
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : {}),
      borderWidth: 1,
      borderColor: Platform.OS === "ios" ? tokens.ios.separator : colors.m3.outline,
      backgroundColor: Platform.OS === "ios" ? tokens.ios.cell : undefined,
      color: colors.m3.onSurface,
      ...tokens.typography.bodyLarge,
      ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : {}),
    },
    inputFocused: {
      borderColor: Platform.OS === "ios" ? colors.m3.focusRing : colors.action,
      borderWidth: 2,
    },
    error: { ...tokens.typography.bodyMedium, color: colors.error },
  });
}
