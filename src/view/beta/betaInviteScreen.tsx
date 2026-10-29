import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
  /** Navega de volta para a tela inicial / home. */
  onNavigateHome?: () => void;
};

export type BetaInviteRouteProps = {
  onNavigateHome?: () => void;
};

/** Página pública `/beta` (Spec 108), ligada ao caso de uso real. */
export default function BetaInviteRoute({ onNavigateHome }: BetaInviteRouteProps = {}) {
  const [state, actions] = useBetaSignupViewModel();
  const [authState, authActions] = useAuthViewModel();
  return (
    <BetaInviteScreen
      state={state}
      actions={actions}
      authState={authState}
      authActions={authActions}
      onNavigateHome={onNavigateHome}
    />
  );
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
  onNavigateHome = () => {},
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
              <Text style={styles.connectedSubtitle}>E-mail registrado no IpêBook</Text>
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

          <Text style={styles.connectedInstructions}>
            Para o Google Play liberar o download no seu Android, siga os 2 passos:
          </Text>

          <View style={styles.connectedStep}>
            <View style={styles.connectedStepHeader}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.connectedStepTitle}>Entre no grupo de testadores</Text>
            </View>
            <Text style={styles.connectedStepText}>
              Exigência da Play Store: abra o grupo com esta conta Google e toque em "Participar do grupo".
            </Text>
            {groupUrl ? (
              <OutlinedButton
                label="Entrar no grupo de testadores"
                onPress={() => onOpenUrl(groupUrl)}
              />
            ) : null}
          </View>

          <View style={styles.connectedStep}>
            <View style={styles.connectedStepHeader}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.connectedStepTitle}>Aceite o convite na Play Store</Text>
            </View>
            <Text style={styles.connectedStepText}>
              Depois de entrar no grupo, abra o convite no Google Play e toque em "Aceitar convite" ou "Tornar-se um testador".
            </Text>
            <FilledButton
              label="Abrir teste na Play Store"
              onPress={() => onOpenUrl(TESTING_OPT_IN_URL)}
            />
          </View>

          <View style={styles.syncNotice}>
            <AppIcon name="info" size={18} color={colors.m3.onSurfaceVariant} />
            <Text style={styles.syncNoticeText}>
              A liberação pelo Google Play pode levar de 5 a 15 minutos após você entrar no grupo. Se a loja disser que o app não está disponível, aguarde alguns minutos e tente abrir o passo 2 novamente.
            </Text>
          </View>

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
            Para o Google Play liberar o download no seu Android, siga os passos abaixo:
          </Text>
          {groupUrl ? (
            <OutlinedButton
              label="1. Entrar no grupo de testadores"
              onPress={() => onOpenUrl(groupUrl)}
            />
          ) : null}
          <FilledButton
            label="2. Abrir teste na Play Store"
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
      <View style={[styles.topBar, wide && styles.topBarWide]}>
        <View style={styles.topBarInner}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Ir para a página inicial do IpêBook"
            onPress={onNavigateHome}
            style={styles.logoPressable}
          >
            <Logotipo />
          </Pressable>
          <View style={styles.topBarActions}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Voltar para a página inicial"
              onPress={onNavigateHome}
              style={styles.homeLink}
            >
              <AppIcon name="home" size={18} color={colors.m3.onSurfaceVariant} />
              <Text style={styles.homeLinkText}>Início</Text>
            </Pressable>
            <ThemeToggleButton />
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, wide && styles.scrollWide]}
        keyboardShouldPersistTaps="handled"
      >
        {wide ? (
          <View style={styles.wideRow}>
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
      paddingHorizontal: tokens.spacing[20],
      paddingVertical: tokens.spacing[16],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.m3.outlineVariant,
      backgroundColor: colors.background,
    },
    topBarWide: {
      paddingHorizontal: tokens.spacing[64],
    },
    topBarInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    logoPressable: {
      alignSelf: "center",
      cursor: "pointer" as never,
    },
    topBarActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    homeLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      cursor: "pointer" as never,
    },
    homeLinkText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurface,
      fontFamily: fontFamily.medium,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[24],
      paddingBottom: tokens.spacing[48],
    },
    scrollWide: {
      paddingHorizontal: tokens.spacing[64],
      paddingTop: tokens.spacing[32],
    },
    narrow: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[24] },
    wideRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 64,
      width: "100%",
    },
    wideIntro: { flex: 1.3, maxWidth: 920 },
    wideForm: { flex: 1, maxWidth: 560, minWidth: 440 },
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
    lead: { ...tokens.typography.bodyLarge, fontSize: 18, lineHeight: 28, color: colors.m3.onSurfaceVariant, maxWidth: 820 },
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
    success: { gap: tokens.spacing[16], alignItems: "stretch" },
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
    connectedInstructions: {
      ...bodyMedium,
      color: colors.m3.onSurface,
      fontFamily: fontFamily.medium,
    },
    connectedStep: {
      gap: tokens.spacing[8],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainer,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.m3.outlineVariant,
    },
    connectedStepHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    stepNumberBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.m3.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumberText: {
      color: colors.m3.onPrimary,
      fontFamily: fontFamily.semiBold,
      fontSize: 12,
      lineHeight: 14,
    },
    connectedStepTitle: {
      ...tokens.typography.titleMedium,
      fontSize: 15,
      lineHeight: 20,
      color: colors.m3.onSurface,
      fontFamily: fontFamily.medium,
    },
    connectedStepText: {
      ...bodyMedium,
      fontSize: 13,
      lineHeight: 18,
      color: colors.m3.onSurfaceVariant,
    },
    syncNotice: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[8],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainer,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.m3.outlineVariant,
    },
    syncNoticeText: {
      flex: 1,
      ...bodyMedium,
      fontSize: 12,
      lineHeight: 17,
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
