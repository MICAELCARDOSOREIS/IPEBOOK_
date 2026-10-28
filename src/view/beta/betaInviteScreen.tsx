import { useMemo, useState } from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { Logotipo } from "@/view/components/Logotipo";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextField } from "@/view/components/TextField";
import { ThemeToggleButton } from "@/view/components/ThemeToggleButton";
import illustration from "@/view/onboarding/ilustracao-classicos.png";
import { PLAY_STORE_URL } from "@/view/playStore";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { WEB_MAX_WIDTH } from "@/view/webLayout";
import { useBetaSignupViewModel, type BetaSignupActions, type BetaSignupState } from "@/viewmodel/useBetaSignupViewModel";

export { PLAY_STORE_URL };

const STEPS: readonly { icon: AppIconName; title: string; text: string }[] = [
  { icon: "mail", title: "Deixe seu Gmail", text: "Use a conta Google do seu celular Android." },
  { icon: "bell", title: "Receba o convite", text: "Quando a nova turma abrir, o convite da Play Store chega no seu e-mail." },
  { icon: "star", title: "Teste por 14 dias", text: "Instale, anuncie, troque e converse. Depois conte o que achou." },
];

export type BetaInviteScreenProps = {
  state: BetaSignupState;
  actions: BetaSignupActions;
  onOpenStore?: () => void;
};

/** Página pública `/beta` (Spec 108), ligada ao caso de uso real. */
export default function BetaInviteRoute() {
  const [state, actions] = useBetaSignupViewModel();
  return <BetaInviteScreen state={state} actions={actions} />;
}

/** Convite para testar o app Android e cadastro do Gmail. */
export function BetaInviteScreen({
  state,
  actions,
  onOpenStore = () => void Linking.openURL(PLAY_STORE_URL).catch(() => {}),
}: BetaInviteScreenProps) {
  const { colors } = useTheme();
  const wide = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const intro = (
    <View style={styles.intro}>
      <View style={styles.pill} accessible accessibilityLabel="Beta do app Android em Piripiri, Piauí">
        <AppIcon name="place" size={14} color={colors.m3.onSurfaceVariant} />
        <Text style={styles.pillText}>Beta Android · Piripiri, PI</Text>
      </View>
      <Text accessibilityRole="header" style={[styles.title, wide && styles.titleWide]}>
        Teste o IpêBook antes de todo mundo.
      </Text>
      <Text style={styles.lead}>
        O app de troca, venda e doação de livros de Piripiri está chegando à Play Store. Precisamos de
        leitores com celular Android para testar e contar o que achou.
      </Text>
      <View style={styles.steps}>
        {STEPS.map((step, index) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.stepIcon}>
              <AppIcon name={step.icon} size={22} color={colors.m3.onPrimaryContainer} />
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{`${index + 1}. ${step.title}`}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const formCard = (
    <View style={[styles.card, wide && styles.cardWide]}>
      {wide ? (
        <Image source={illustration} style={styles.cardIllustration} resizeMode="contain" accessible={false} importantForAccessibility="no" />
      ) : null}
      {state.success ? (
        <View style={styles.success} accessibilityLiveRegion="polite">
          <IconBadge icon="mail" tone="donation" size="large" />
          <Text accessibilityRole="alert" style={styles.cardTitle}>Inscrição recebida!</Text>
          <Text style={styles.cardText}>
            {email.trim() ? `Vamos mandar o convite para ${email.trim().toLowerCase()}.` : "Vamos mandar o convite para seu Gmail."}{" "}
            Fique de olho na caixa de entrada e no spam.
          </Text>
          <OutlinedButton
            label="Inscrever outro e-mail"
            onPress={() => {
              setEmail("");
              setName("");
              actions.reset();
            }}
          />
        </View>
      ) : (
        <>
          <Text style={styles.cardTitle}>Quero participar</Text>
          <Text style={styles.cardText}>Leva menos de um minuto.</Text>
          <TextField
            label="Seu nome (opcional)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!state.loading}
          />
          <TextField
            label="Gmail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!state.loading}
            placeholder="voce@gmail.com"
          />
          {state.error ? (
            <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
          ) : null}
          <FilledButton
            label="Quero testar"
            loading={state.loading}
            loadingLabel="Enviando inscrição"
            onPress={() => void actions.submit(email, name)}
          />
        </>
      )}
      <OutlinedButton label="Ver o IpêBook na Play Store" onPress={onOpenStore} />
      <Text style={styles.footnote}>
        Usamos seu e-mail só para enviar o convite do teste. Política de privacidade em ipebook.app/termos.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.topBar}>
        <View style={[styles.topBarInner, wide && styles.wideWidth]}>
          <Logotipo />
          <ThemeToggleButton />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {wide ? (
          <View style={[styles.wideRow, styles.wideWidth]}>
            <View style={styles.wideIntro}>{intro}</View>
            <View style={styles.wideForm}>{formCard}</View>
          </View>
        ) : (
          <View style={styles.narrow}>
            {intro}
            {formCard}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  const bodyMedium = {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  };
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    topBar: {
      paddingHorizontal: tokens.spacing[24],
      paddingVertical: tokens.spacing[12],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.m3.outlineVariant,
      backgroundColor: colors.background,
    },
    topBarInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", alignSelf: "center" },
    wideWidth: { maxWidth: Math.min(WEB_MAX_WIDTH, 1120), width: "100%", alignSelf: "center" },
    scroll: { flexGrow: 1, paddingHorizontal: tokens.spacing[24], paddingTop: tokens.spacing[24], paddingBottom: tokens.spacing[48] },
    narrow: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[24] },
    wideRow: { flexDirection: "row", alignItems: "flex-start", gap: 64, paddingTop: tokens.spacing[32] },
    wideIntro: { flex: 1.1 },
    wideForm: { flex: 1, maxWidth: 480 },
    intro: { gap: tokens.spacing[20] },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      alignSelf: "flex-start",
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    pillText: { ...tokens.typography.labelMedium, color: colors.m3.onSurfaceVariant },
    title: { fontFamily: fontFamily.brand, fontSize: 34, lineHeight: 42, color: colors.m3.onSurface },
    titleWide: { fontSize: 52, lineHeight: 60 },
    lead: { ...tokens.typography.bodyLarge, fontSize: 18, lineHeight: 28, color: colors.m3.onSurfaceVariant, maxWidth: 560 },
    steps: { gap: tokens.spacing[16], marginTop: tokens.spacing[8] },
    step: { flexDirection: "row", gap: tokens.spacing[16], alignItems: "center" },
    stepIcon: {
      width: tokens.spacing[48],
      height: tokens.spacing[48],
      borderRadius: tokens.radius.medium,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.primaryContainer,
    },
    stepBody: { flex: 1, gap: 2 },
    stepTitle: { ...tokens.typography.titleMedium, fontSize: 16, lineHeight: 22, color: colors.m3.onSurface },
    stepText: { ...bodyMedium, color: colors.m3.onSurfaceVariant },
    card: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: 24,
      padding: tokens.spacing[24],
      gap: tokens.spacing[16],
    },
    cardWide: { padding: tokens.spacing[32] },
    cardIllustration: { width: "100%", height: 150 },
    cardTitle: { ...tokens.typography.titleLarge, color: colors.m3.onSurface },
    cardText: { ...bodyMedium, color: colors.m3.onSurfaceVariant, marginTop: -tokens.spacing[8] },
    success: { gap: tokens.spacing[16], alignItems: "flex-start" },
    error: { ...bodyMedium, color: colors.error },
    footnote: {
      textAlign: "center",
      color: colors.m3.onSurfaceVariant,
      fontSize: tokens.typography.labelMedium.fontSize,
      lineHeight: tokens.typography.labelMedium.lineHeight,
      fontFamily: tokens.typography.labelMedium.fontFamily,
    },
  });
}
