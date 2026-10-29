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
import passo1Img from "@/view/beta/passo-1.png";
import passo2Img from "@/view/beta/passo-2.png";
import passo3Img from "@/view/beta/passo-3.png";
import passo4Img from "@/view/beta/passo-4.png";
import { BETA_GROUP_URL, PLAY_STORE_URL, TESTING_OPT_IN_URL } from "@/view/playStore";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useAuthViewModel, type AuthActions, type AuthState } from "@/viewmodel/useAuthViewModel";
import { useBetaSignupViewModel, type BetaSignupActions, type BetaSignupState } from "@/viewmodel/useBetaSignupViewModel";
import { setAuthReturnTo } from "@/view/auth/authReturnTo";

export { PLAY_STORE_URL };

type HighlightCard = {
  icon: AppIconName;
  title: string;
  text: string;
  bg: string;
  fg: string;
};

function getHighlights(colors: ColorPalette): readonly HighlightCard[] {
  return [
    {
      icon: "swap",
      title: "Troca, venda e doação",
      text: "Cadastre livros pelo código ISBN em segundos e negocie sem taxas.",
      bg: colors.m3.primaryContainer,
      fg: colors.m3.onPrimaryContainer,
    },
    {
      icon: "place",
      title: "Encontros em Piripiri",
      text: "Combine a entrega em locais públicos da cidade com confirmação por QR Code.",
      bg: colors.m3.tertiaryContainer,
      fg: colors.m3.onTertiaryContainer,
    },
    {
      icon: "star",
      title: "Leitores fundadores",
      text: "Inaugure a estante da comunidade e ajude a testar as novidades antes do lançamento.",
      bg: colors.m3.doacaoContainer,
      fg: colors.m3.onDoacaoContainer,
    },
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
  const { colors } = useTheme();
  const highlights = useMemo(() => getHighlights(colors), [colors]);
  const wide = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

  const helpSteps = [
    {
      number: "1",
      title: "Entre no grupo de testadores",
      description:
        "Abra o grupo oficial do IpêBook no Google Grupos e clique em \"Participar do grupo\" no topo ou no centro da página.",
      image: passo1Img,
      actionLabel: groupUrl ? "Abrir grupo de testadores" : null,
      onAction: groupUrl ? () => onOpenUrl(groupUrl) : null,
    },
    {
      number: "2",
      title: "Confirme sua participação no grupo",
      description:
        "Na janela que abrir, clique no botão azul \"Participar do grupo\" no canto inferior direito para confirmar sua entrada.",
      image: passo2Img,
      actionLabel: null,
      onAction: null,
    },
    {
      number: "3",
      title: "Torne-se um testador no Google Play",
      description:
        "Depois de entrar no grupo, abra a página de convite do Google Play e toque no botão azul \"Torne-se um testador\".",
      image: passo3Img,
      actionLabel: "Abrir convite no Google Play",
      onAction: () => onOpenUrl(TESTING_OPT_IN_URL),
    },
    {
      number: "4",
      title: "Baixe o aplicativo na Play Store",
      description:
        "Pronto! Na tela de confirmação (\"Você é um testador\"), toque no link azul \"baixe-o no Google Play\" para instalar o IpêBook no seu Android.",
      image: passo4Img,
      actionLabel: "Ir para a Play Store",
      onAction: onOpenStore,
    },
  ];

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
        O app comunitário de troca, venda e doação de livros de Piripiri está chegando à Play Store.
        Conecte sua conta Google ao lado, explore a estante da cidade e conte o que achou.
      </Text>
      <View style={[styles.highlightGrid, wide && styles.highlightGridWide]}>
        {highlights.map((item) => (
          <View key={item.title} style={[styles.highlightCard, { backgroundColor: item.bg }]}>
            <AppIcon name={item.icon} size={24} color={item.fg} />
            <Text style={[styles.highlightTitle, { color: item.fg }]}>{item.title}</Text>
            <Text style={[styles.highlightText, { color: item.fg }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showHelp }}
        accessibilityLabel={showHelp ? "Ocultar ajuda de como instalar" : "Como instalar? Veja o passo a passo com fotos"}
        onPress={() => setShowHelp((prev) => !prev)}
        style={styles.helpButton}
      >
        <View style={styles.helpButtonLeft}>
          <View style={styles.helpIconCircle}>
            <AppIcon name="info" size={20} color={colors.m3.onPrimaryContainer} />
          </View>
          <View style={styles.helpButtonTextCol}>
            <Text style={styles.helpButtonTitle}>
              {showHelp ? "Ocultar guia de instalação" : "Precisa de ajuda para instalar?"}
            </Text>
            <Text style={styles.helpButtonSubtitle}>
              {showHelp
                ? "Toque para recolher as imagens do passo a passo"
                : "Toque aqui para ver as telas marcadas com o que fazer em cada etapa"}
            </Text>
          </View>
        </View>
        <AppIcon
          name={showHelp ? "chevronUp" : "chevronDown"}
          size={20}
          color={colors.m3.onSurfaceVariant}
        />
      </Pressable>

      {showHelp ? (
        <View style={styles.helpGuide} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.helpGuideHeader}>
            Como liberar e baixar o IpêBook (passo a passo)
          </Text>
          {helpSteps.map((step) => (
            <View key={step.number} style={styles.helpStepCard}>
              <View style={styles.helpStepHeader}>
                <View style={styles.helpStepBadge}>
                  <Text style={styles.helpStepBadgeText}>{step.number}</Text>
                </View>
                <View style={styles.helpStepTextCol}>
                  <Text style={styles.helpStepTitle}>{step.title}</Text>
                  <Text style={styles.helpStepDesc}>{step.description}</Text>
                </View>
              </View>
              <Image
                source={step.image}
                style={styles.helpStepImage}
                resizeMode="contain"
                accessibilityLabel={`Imagem demonstrativa do passo ${step.number}: ${step.title}`}
              />
              {step.actionLabel && step.onAction ? (
                <View style={styles.helpStepAction}>
                  <OutlinedButton label={step.actionLabel} onPress={step.onAction} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
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

          <Text style={styles.connectedNote}>
            Sua conta Google foi registrada no teste do IpêBook. Entre no grupo de testadores e abra o teste na Google Play Store abaixo.
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
            Abra a Play Store abaixo para participar do teste no seu Android.
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
    intro: { gap: tokens.spacing[24] },
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
    titleWide: { fontSize: 54, lineHeight: 62 },
    lead: { ...tokens.typography.bodyLarge, fontSize: 18, lineHeight: 28, color: colors.m3.onSurfaceVariant, maxWidth: 820 },
    highlightGrid: {
      gap: tokens.spacing[16],
      marginTop: tokens.spacing[8],
    },
    highlightGridWide: {
      flexDirection: "row",
      gap: tokens.spacing[20],
    },
    highlightCard: {
      flex: 1,
      borderRadius: 20,
      padding: tokens.spacing[20],
      gap: tokens.spacing[12],
    },
    highlightTitle: {
      fontFamily: fontFamily.semiBold,
      fontSize: 17,
      lineHeight: 24,
    },
    highlightText: {
      ...bodyMedium,
      lineHeight: 21,
      opacity: 0.9,
    },
    helpButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[20],
      paddingVertical: tokens.spacing[16],
      borderRadius: 20,
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.m3.outlineVariant,
      cursor: "pointer" as never,
    },
    helpButtonLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      flex: 1,
    },
    helpIconCircle: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    helpButtonTextCol: {
      flex: 1,
      gap: 2,
    },
    helpButtonTitle: {
      fontFamily: fontFamily.semiBold,
      fontSize: 16,
      lineHeight: 22,
      color: colors.m3.onSurface,
    },
    helpButtonSubtitle: {
      ...bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    helpGuide: {
      gap: tokens.spacing[20],
      padding: tokens.spacing[24],
      borderRadius: 24,
      backgroundColor: colors.m3.surfaceContainer,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.m3.outlineVariant,
    },
    helpGuideHeader: {
      ...tokens.typography.titleLarge,
      color: colors.m3.onSurface,
    },
    helpStepCard: {
      gap: tokens.spacing[16],
      padding: tokens.spacing[20],
      borderRadius: 20,
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.m3.outlineVariant,
    },
    helpStepHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[12],
    },
    helpStepBadge: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    helpStepBadgeText: {
      fontFamily: fontFamily.semiBold,
      fontSize: 15,
      color: colors.m3.onPrimary,
    },
    helpStepTextCol: {
      flex: 1,
      gap: tokens.spacing[4],
    },
    helpStepTitle: {
      fontFamily: fontFamily.semiBold,
      fontSize: 17,
      lineHeight: 24,
      color: colors.m3.onSurface,
    },
    helpStepDesc: {
      ...bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    helpStepImage: {
      width: "100%",
      height: 320,
      borderRadius: tokens.radius.medium,
      backgroundColor: "#FFFFFF",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.m3.outlineVariant,
    },
    helpStepAction: {
      alignSelf: "flex-start",
    },
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
    connectedNote: {
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
