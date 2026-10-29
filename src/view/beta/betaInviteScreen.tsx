import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { GoogleLogo } from "@/view/components/GoogleLogo";
import { IconBadge } from "@/view/components/IconBadge";
import { Logotipo } from "@/view/components/Logotipo";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextField } from "@/view/components/TextField";
import { ThemeToggleButton } from "@/view/components/ThemeToggleButton";
import illustration from "@/view/onboarding/ilustracao-classicos.png";
import { BETA_GROUP_URL, PLAY_STORE_URL, TESTING_OPT_IN_URL } from "@/view/playStore";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { WEB_MAX_WIDTH } from "@/view/webLayout";
import { useAuthViewModel, type AuthActions, type AuthState } from "@/viewmodel/useAuthViewModel";
import { useBetaSignupViewModel, type BetaSignupActions, type BetaSignupState } from "@/viewmodel/useBetaSignupViewModel";
import { setAuthReturnTo } from "@/view/auth/authReturnTo";

export { PLAY_STORE_URL };

type InstallStep = { icon: AppIconName; title: string; text: string; action: string; url: string | null };

function installSteps(groupUrl: string | null): readonly InstallStep[] {
  return [
    { icon: "person", title: "Entre no grupo de testadores", text: "Abra com a conta Google do seu celular Android e toque em \"Participar do grupo\".", action: "Entrar no grupo", url: groupUrl },
    { icon: "checkCircle", title: "Aceite o convite do teste", text: "Toque em \"Quero participar\" na página do Google Play.", action: "Aceitar convite", url: TESTING_OPT_IN_URL },
    { icon: "star", title: "Instale e use por 14 dias", text: "Anuncie, troque, converse e depois conte o que achou.", action: "Instalar na Play Store", url: PLAY_STORE_URL },
  ];
}

export type BetaInviteScreenProps = {
  state: BetaSignupState;
  actions: BetaSignupActions;
  authState?: AuthState;
  authActions?: AuthActions;
  onOpenStore?: () => void;
  /** Abre os links dos passos; nos testes, um espião. */
  onOpenUrl?: (url: string) => void;
  /** Grupo do Google dos testadores; `null` enquanto não existir. */
  groupUrl?: string | null;
};

/** Página pública `/beta` (Spec 108), ligada ao caso de uso real. */
export default function BetaInviteRoute() {
  const [state, actions] = useBetaSignupViewModel();
  const [authState, authActions] = useAuthViewModel();
  return <BetaInviteScreen state={state} actions={actions} authState={authState} authActions={authActions} />;
}

/** Convite para testar o app Android e cadastro do Gmail. */
export function BetaInviteScreen({
  state,
  actions,
  authState,
  authActions,
  onOpenStore = () => void Linking.openURL(PLAY_STORE_URL).catch(() => {}),
  onOpenUrl = (url) => void Linking.openURL(url).catch(() => {}),
  groupUrl = BETA_GROUP_URL,
}: BetaInviteScreenProps) {
  const steps = installSteps(groupUrl);
  const { colors } = useTheme();
  const wide = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Quando o usuário está conectado com o Google, grava sua inscrição automaticamente se ainda não feito.
  const registeredUserRef = useRef<string | null>(null);
  useEffect(() => {
    const currentUserEmail = authState?.user?.email;
    if (currentUserEmail && registeredUserRef.current !== currentUserEmail) {
      registeredUserRef.current = currentUserEmail;
      void actions.submit(currentUserEmail, authState?.user?.name ?? "");
    }
  }, [authState?.user?.email, authState?.user?.name, actions]);

  const handleGoogleSignIn = async () => {
    setAuthReturnTo("/beta");
    setGoogleLoading(true);
    try {
      await authActions?.signInWithGoogle?.();
    } finally {
      setGoogleLoading(false);
    }
  };

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
      <Text style={styles.sectionTitle}>Como instalar</Text>
      <View style={styles.steps}>
        {steps.map((step, index) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.stepIcon}>
              <AppIcon name={step.icon} size={22} color={colors.m3.onPrimaryContainer} />
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{`${index + 1}. ${step.title}`}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
              <View style={styles.stepAction}>
                {step.url ? (
                  <OutlinedButton label={step.action} onPress={() => onOpenUrl(step.url as string)} />
                ) : (
                  <Text style={styles.soon}>{`${step.action}: abre em breve`}</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.notice} accessibilityRole="summary">
        <AppIcon name="info" size={20} color={colors.m3.onSurfaceVariant} />
        <Text style={styles.noticeText}>
          A liberação pode levar alguns minutos. Se a Play Store disser que o app não está disponível
          para você, confira se entrou com o mesmo Gmail do grupo, espere um pouco e tente de novo.
        </Text>
      </View>
    </View>
  );

  const formCard = (
    <View style={[styles.card, wide && styles.cardWide]}>
      {wide ? (
        <Image source={illustration} style={styles.cardIllustration} resizeMode="contain" accessible={false} importantForAccessibility="no" />
      ) : null}
      {authState?.user ? (
        <View style={styles.connectedCard} accessibilityLiveRegion="polite">
          <View style={styles.connectedHeader}>
            <IconBadge icon="checkCircle" tone="action" size="medium" />
            <View style={styles.connectedHeaderText}>
              <Text accessibilityRole="alert" style={styles.cardTitle}>Conta conectada!</Text>
              <Text style={styles.connectedSubtitle}>Pronto para testar o aplicativo</Text>
            </View>
          </View>
          <View style={styles.connectedBadge}>
            <AppIcon name="person" size={18} color={colors.m3.primary} />
            <View style={styles.connectedEmailContainer}>
              {authState.user.name ? (
                <Text style={styles.connectedName}>{authState.user.name}</Text>
              ) : null}
              <Text style={styles.connectedEmail}>{authState.user.email}</Text>
            </View>
          </View>
          <Text style={styles.cardNote}>
            Sua conta Google foi registrada no teste. Toque no botão abaixo para abrir a Play Store em português e aceitar o convite.
          </Text>
          <FilledButton
            label="Abrir teste na Play Store"
            onPress={() => onOpenUrl(TESTING_OPT_IN_URL)}
          />
          {groupUrl ? (
            <OutlinedButton
              label="Entrar no grupo de testadores"
              onPress={() => onOpenUrl(groupUrl)}
            />
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Usar outra conta Google"
            onPress={() => void authActions?.signOut?.()}
            style={styles.switchAccount}
          >
            <Text style={styles.switchAccountText}>Usar outra conta Google</Text>
          </Pressable>
        </View>
      ) : state.success ? (
        <View style={styles.success} accessibilityLiveRegion="polite">
          <IconBadge icon="mail" tone="action" size="medium" />
          <Text accessibilityRole="alert" style={styles.cardTitle}>Inscrição recebida!</Text>
          <Text style={styles.cardText}>
            {email.trim() ? `Anotamos ${email.trim().toLowerCase()}.` : "Anotamos seu Gmail."}{" "}
            Para instalar agora, siga os passos de "Como instalar" ou abra a Play Store abaixo.
          </Text>
          <FilledButton
            label="Abrir teste na Play Store"
            onPress={() => onOpenUrl(TESTING_OPT_IN_URL)}
          />
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
          <Text style={styles.cardTitle}>Participe do teste</Text>
          <Text style={styles.cardText}>Conecte seu Gmail com 1 toque para se inscrever e liberar o download na Play Store.</Text>
          <OutlinedButton
            label="Continuar com Google"
            accessibilityLabel="Continuar com Google"
            icon={<GoogleLogo size={20} />}
            loading={googleLoading}
            disabled={authState?.loading}
            onPress={() => void handleGoogleSignIn()}
          />
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou digite seu Gmail</Text>
            <View style={styles.dividerLine} />
          </View>
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
            label="Quero receber avisos"
            loading={state.loading}
            loadingLabel="Enviando inscrição"
            onPress={() => void actions.submit(email, name)}
          />
          <OutlinedButton label="Ver o IpêBook na Play Store" onPress={onOpenStore} />
        </>
      )}
      <Text style={styles.footnote}>
        Usamos seu e-mail só para o teste fechado. Política de privacidade em ipebook.app/termos.
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
    sectionTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface, marginTop: tokens.spacing[8] },
    steps: { gap: tokens.spacing[20] },
    step: { flexDirection: "row", gap: tokens.spacing[16], alignItems: "flex-start" },
    stepAction: { marginTop: tokens.spacing[8], alignSelf: "flex-start", minWidth: 220 },
    soon: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant, paddingVertical: tokens.spacing[8] },
    notice: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "flex-start",
    },
    noticeText: { flex: 1, ...bodyMedium, color: colors.m3.onSurfaceVariant },
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
    connectedCard: { gap: tokens.spacing[16], alignItems: "stretch" },
    connectedHeader: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    connectedHeaderText: { flex: 1, gap: 2 },
    connectedSubtitle: { ...tokens.typography.labelMedium, color: colors.m3.onSurfaceVariant },
    connectedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: tokens.radius.medium,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.m3.outlineVariant,
      alignSelf: "stretch",
    },
    connectedEmailContainer: { flex: 1 },
    connectedName: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    connectedEmail: {
      ...bodyMedium,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurfaceVariant,
    },
    cardNote: {
      ...bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    switchAccount: {
      paddingVertical: tokens.spacing[8],
      alignSelf: "center",
    },
    switchAccountText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.primary,
      textDecorationLine: "underline",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      marginVertical: tokens.spacing[4],
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.m3.outlineVariant,
    },
    dividerText: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
    },
    footnote: {
      textAlign: "center",
      color: colors.m3.onSurfaceVariant,
      fontSize: tokens.typography.labelMedium.fontSize,
      lineHeight: tokens.typography.labelMedium.lineHeight,
      fontFamily: tokens.typography.labelMedium.fontFamily,
    },
  });
}
