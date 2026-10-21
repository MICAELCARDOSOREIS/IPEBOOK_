import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens } from "@/view/tokens";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { Logotipo } from "@/view/components/Logotipo";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

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
  const [state, actions] = useAuthViewModel();
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const mounted = useRef(true);

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

  const handleSubmit = async () => {
    const result = await actions.requestPasswordReset(email);
    if (result && mounted.current) {
      setRequested(true);
      setSecondsLeft(RESEND_SECONDS);
    }
  };

  const handleResend = async () => {
    const result = await actions.requestPasswordReset(email);
    if (result && mounted.current) setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <SafeAreaView style={styles.page}>
      {onBack ? (
        <TopAppBar
          title={requested ? "Confira seu e-mail" : "Recuperar acesso"}
          onBack={onBack}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Logotipo />

          {requested ? (
            <>
              <IconBadge icon="mail" tone="donation" />
              <Text accessibilityRole="header" style={styles.title}>Confira seu e-mail.</Text>
              <Text style={styles.subtitle}>
                Se houver uma conta com{" "}
                {email ? <Text style={styles.emailHighlight}>{email}</Text> : "este endereço"}, você
                vai receber um link para criar uma nova senha.
              </Text>

              <View style={styles.resultBox}>
                <Text accessibilityRole="alert" style={styles.resultLabel}>Não chegou?</Text>
                <Text style={styles.resultHint}>
                  Confira a caixa de spam ou verifique se o endereço está correto.
                </Text>
              </View>

              <FilledButton label="Voltar ao login" onPress={() => onNavigateToSignIn?.()} />

              <OutlinedButton
                label="Corrigir e-mail"
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
                  disabled={state.loading}
                  onPress={() => void handleResend()}
                />
              )}
            </>
          ) : (
            <>
              <Text accessibilityRole="header" style={styles.title}>Recupere seu acesso.</Text>
              <Text style={styles.subtitle}>
                Digite seu e-mail para receber as instruções de redefinição de senha.
              </Text>

              <TextField
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!state.loading}
                placeholder="voce@exemplo.com"
              />

              {state.error ? (
                <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
              ) : null}

              <FilledButton
                label="Enviar link"
                loading={state.loading}
                loadingLabel="Enviando link"
                onPress={() => void handleSubmit()}
              />

              <OutlinedButton label="Voltar ao login" onPress={() => onNavigateToSignIn?.()} />

              <Text style={styles.footnote}>
                Se você lembrar sua senha, faça login normalmente.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[24],
  },
  content: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
    ...(Platform.OS === "web"
      ? {
          boxShadow: tokens.elevation.level1,
        }
      : {
          elevation: 1,
        }),
  },
  title: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  subtitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    color: tokens.colors.secondaryText,
  },
  emailHighlight: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    fontWeight: "600",
  },
  resultBox: {
    backgroundColor: tokens.colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  resultLabel: {
    color: tokens.colors.text,
    fontSize: tokens.typography.titleMedium.fontSize,
    lineHeight: tokens.typography.titleMedium.lineHeight,
    fontFamily: tokens.typography.titleMedium.fontFamily,
    fontWeight: tokens.typography.titleMedium.fontWeight,
  },
  resultHint: {
    color: tokens.colors.secondaryText,
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  countdown: {
    textAlign: "center",
    color: tokens.colors.secondaryText,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  footnote: {
    textAlign: "center",
    color: tokens.colors.secondaryText,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  error: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
});
