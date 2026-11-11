import { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthShell } from "@/view/auth/AuthShell";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { makeAuthViewModel } from "@/di/container";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Checkbox } from "@/view/components/Checkbox";
import { FilledButton } from "@/view/components/FilledButton";
import { GoogleLogo } from "@/view/components/GoogleLogo";
import { IconBadge } from "@/view/components/IconBadge";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { Logotipo } from "@/view/components/Logotipo";
import { Manchete } from "@/view/components/Manchete";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { TextButton } from "@/view/components/TextButton";
import { TextField, type TextInputInstance } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useGuardedPress } from "@/view/useGuardedPress";
import { scrollBottomPadding } from "@/view/scrollProps";

export type SignUpProps = {
  onAuthenticated?: () => void;
  onNavigateToSignIn?: () => void;
  onNavigateToTerms?: () => void;
  onBack?: () => void;
};

const TERMS_ERROR = "É preciso aceitar os termos de uso para criar a conta.";

/** Figma `01.03 · Criar conta` (nó `336:118`). */
export default function SignUp({
  onAuthenticated,
  onNavigateToSignIn,
  onNavigateToTerms,
  onBack,
}: SignUpProps = {}) {
  const guardedBack = useGuardedPress(onBack);
  const guardedAuthenticated = useGuardedPress(onAuthenticated);
  const guardedSignIn = useGuardedPress(onNavigateToSignIn);
  const guardedTerms = useGuardedPress(onNavigateToTerms);
  const [state, actions] = makeAuthViewModel();
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailInputRef = useRef<TextInputInstance>(null);
  const passwordInputRef = useRef<TextInputInstance>(null);
  const busy = submitting || googleLoading;

  const handleGoogleSignIn = async () => {
    if (busy) return;
    setGoogleLoading(true);
    try {
      const success = await actions.signInWithGoogle?.();
      if (success) guardedAuthenticated();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (busy) return;
    if (!acceptedTerms) {
      setTermsError(TERMS_ERROR);
      return;
    }
    setTermsError(null);
    setSubmitting(true);
    try {
      const success = await actions.signUp(email, password, name);
      if (success) guardedAuthenticated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <ScreenContainer
        maxWidth={560}
        paddingTop={tokens.spacing[16]}
        paddingBottom={scrollBottomPadding.withoutBottomBar}
        header={onBack ? <TopAppBar contentMaxWidth={560} title="Criar conta" onBack={guardedBack} /> : undefined}
        contentStyle={[
          styles.content,
          wideWeb && { justifyContent: "center" },
        ]}
      >
        <Logotipo underline />

        {state.statusMessage ? (
          <View style={styles.confirmationBlock}>
            <IconBadge icon="mail" tone="action" size="large" />
            <Manchete texto="Quase lá!" realce="Confirme seu e-mail." />
            <Text style={styles.subtitle}>
              Enviamos um link de ativação para{" "}
              {email ? <Text style={styles.emailHighlight}>{email}</Text> : "seu e-mail"}.
              Toque no link recebido para confirmar sua conta e começar a trocar livros em Piripiri.
            </Text>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Não encontrou a mensagem?</Text>
              <Text style={styles.resultHint}>
                Verifique a pasta de spam, lixo eletrônico ou a aba de promoções do seu provedor.
              </Text>
            </View>

            <FilledButton
              label="Ir para o login"
              onPress={guardedSignIn}
            />
          </View>
        ) : (
          <>
            <Manchete texto="Crie sua" realce="conta." />
            <Text style={styles.subtitle}>Anuncie, troque, venda ou doe livros perto de você.</Text>

            <OutlinedButton
              label="Continuar com Google"
              accessibilityLabel="Continuar com Google"
              icon={<GoogleLogo size={20} />}
              loading={googleLoading}
              disabled={busy}
              onPress={() => void handleGoogleSignIn()}
            />

            <View accessibilityRole="none" style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou crie com e-mail</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextField
              label="Nome completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus?.()}
              editable={!busy}
              placeholder="Como você quer ser chamado"
              maxLength={80}
            />

            <TextField
              inputRef={emailInputRef}
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus?.()}
              editable={!busy}
              placeholder="voce@exemplo.com"
            />

            <TextField
              inputRef={passwordInputRef}
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit()}
              editable={!busy}
              helperText="Mínimo de 8 caracteres."
            />

            <Checkbox
              label="Aceito os termos de uso"
              description="e a política de privacidade."
              checked={acceptedTerms}
              onChange={(checked) => {
                setAcceptedTerms(checked);
                if (checked) setTermsError(null);
              }}
              error={termsError}
              disabled={busy}
            />

            {onNavigateToTerms ? (
              <TextButton
                label="Ler os termos de uso e a política de privacidade"
                disabled={busy}
                onPress={guardedTerms}
              />
            ) : null}

            {state.error ? <InlineErrorCard message={state.error} /> : null}

            <FilledButton
              label="Criar conta"
              loading={submitting}
              loadingLabel="Criando conta"
              disabled={busy}
              onPress={() => void handleSubmit()}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Já tem uma conta?</Text>
              <TextButton label="Já tenho conta" disabled={busy} onPress={guardedSignIn} />
            </View>
          </>
        )}
      </ScreenContainer>
    </AuthShell>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    content: {
      gap: tokens.spacing[12],
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[6],
      marginTop: tokens.spacing[8],
    },
    footerPrompt: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      marginVertical: tokens.spacing[4],
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    subtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
      marginBottom: tokens.spacing[4],
    },
    confirmationBlock: {
      gap: tokens.spacing[16],
      alignItems: "flex-start",
    },
    emailHighlight: {
      color: colors.text,
      fontFamily: tokens.typography.bodyLarge.fontFamily,
      fontWeight: tokens.fontWeight.semiBold,
    },
    resultBox: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
      gap: tokens.spacing[6],
      width: "100%",
    },
    resultLabel: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.bold,
    },
    resultHint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: tokens.lineHeight[20],
    },
  });
}
