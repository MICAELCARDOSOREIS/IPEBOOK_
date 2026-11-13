import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthShell } from "@/view/auth/AuthShell";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { makeAuthViewModel } from "@/di/container";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { Logotipo } from "@/view/components/Logotipo";
import { Manchete } from "@/view/components/Manchete";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useGuardedPress } from "@/view/useGuardedPress";
import { scrollBottomPadding } from "@/view/scrollProps";

export type ForgotPasswordProps = {
  onNavigateToSignIn?: () => void;
  onBack?: () => void;
};

/** Espera antes de liberar o reenvio, igual ao contador do Figma `01.05`. */
const RESEND_SECONDS = 45;

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Figma `01.04 · Recuperar acesso` (nó `6:534`) e `01.05 · Confira seu e-mail` (nó `6:597`). */
export default function ForgotPassword({ onNavigateToSignIn, onBack }: ForgotPasswordProps = {}) {
  const guardedBack = useGuardedPress(onBack);
  const guardedSignIn = useGuardedPress(onNavigateToSignIn);
  const [state, actions] = makeAuthViewModel();
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(true);
  const sending = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!requested || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [requested, secondsLeft]);

  const normalizedEmail = email.trim();

  const sendLink = async (): Promise<boolean> => {
    if (!normalizedEmail) {
      setEmailError("Informe o e-mail da sua conta.");
      return false;
    }
    if (sending.current) return false;
    sending.current = true;
    setEmailError(null);
    setSubmitting(true);
    try {
      const result = await actions.requestPasswordReset(normalizedEmail);
      return Boolean(result && mounted.current);
    } finally {
      sending.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const sent = await sendLink();
    if (sent) {
      setEmail(normalizedEmail);
      setRequested(true);
      setSecondsLeft(RESEND_SECONDS);
    }
  };

  const handleResend = async () => {
    const sent = await sendLink();
    if (sent) setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <AuthShell>
      <ScreenContainer
        maxWidth={560}
        paddingTop={tokens.spacing[16]}
        paddingBottom={scrollBottomPadding.withoutBottomBar}
        header={
          onBack ? (
            <TopAppBar
              alignToWindow={false}
              contentMaxWidth={560}
              title={requested ? "Confira seu e-mail" : "Recuperar acesso"}
              onBack={guardedBack}
            />
          ) : undefined
        }
        contentStyle={[
          styles.content,
          wideWeb && { justifyContent: "center" },
        ]}
      >
        <Logotipo underline />

        {requested ? (
          <>
            <IconBadge icon="mail" tone="donation" size="large" />
            <Text accessibilityRole="header" style={styles.title}>Confira seu e-mail.</Text>
            <Text style={styles.subtitle}>
              Se houver uma conta com{" "}
              {email ? <Text style={styles.emailHighlight}>{email}</Text> : "este endereço"}, você
              vai receber um link para criar uma nova senha.
            </Text>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Não chegou?</Text>
              <Text style={styles.resultHint}>
                Confira a caixa de spam ou verifique se o endereço está correto.
              </Text>
            </View>

            {state.error ? <InlineErrorCard message={state.error} /> : null}

            <FilledButton
              label="Voltar ao login"
              disabled={submitting}
              onPress={guardedSignIn}
            />

            <OutlinedButton
              label="Corrigir e-mail"
              disabled={submitting}
              onPress={() => {
                setRequested(false);
                setSecondsLeft(RESEND_SECONDS);
              }}
            />

            {secondsLeft > 0 ? (
              <Text style={styles.countdown}>
                {`Você pode reenviar o link em ${formatCountdown(secondsLeft)}.`}
              </Text>
            ) : (
              <TextButton
                label="Reenviar link"
                disabled={submitting}
                onPress={() => void handleResend()}
              />
            )}
          </>
        ) : (
          <>
            <Manchete texto="Recupere seu" realce="acesso." />
            <Text style={styles.subtitle}>
              Digite seu e-mail para receber as instruções de redefinição de senha.
            </Text>

            <TextField
              label="E-mail"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit()}
              editable={!submitting}
              placeholder="voce@exemplo.com"
              error={emailError ?? undefined}
            />

            {state.error ? <InlineErrorCard message={state.error} /> : null}

            <FilledButton
              label="Enviar link"
              loading={submitting}
              loadingLabel="Enviando link"
              disabled={submitting}
              onPress={() => void handleSubmit()}
            />

            <OutlinedButton
              label="Voltar ao login"
              disabled={submitting}
              onPress={guardedSignIn}
            />

            <Text style={styles.footnote}>
              Se você lembrar sua senha, faça login normalmente.
            </Text>
          </>
        )}
      </ScreenContainer>
    </AuthShell>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    content: {
      gap: tokens.spacing[16],
    },
    title: {
      ...tokens.typography.displayLarge,
      color: colors.text,
    },
    subtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
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
    countdown: {
      ...tokens.typography.bodyMedium,
      textAlign: "center",
      color: colors.secondaryText,
    },
    footnote: {
      ...tokens.typography.bodyMedium,
      textAlign: "center",
      color: colors.secondaryText,
    },
  });
}
