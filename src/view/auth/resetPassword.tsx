import { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthShell } from "@/view/auth/AuthShell";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { TextButton } from "@/view/components/TextButton";
import { TextField, type TextInputInstance } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { makeResetPasswordViewModel } from "@/di/container";
import { useGuardedPress } from "@/view/useGuardedPress";
import { scrollBottomPadding } from "@/view/scrollProps";

export type ResetPasswordProps = {
  link: string | null;
  onNavigateToSignIn?: () => void;
  onNavigateToForgotPassword?: () => void;
  onBack?: () => void;
};

/**
 * Figma `01.06 · Nova senha` (nó `254:3595`), `01.09 · Senha atualizada` (nó `254:4006`) e
 * `01.08 · Link expirado` (Issue #97).
 */
export default function ResetPassword({
  link,
  onNavigateToSignIn,
  onNavigateToForgotPassword,
  onBack,
}: ResetPasswordProps) {
  const guardedBack = useGuardedPress(onBack);
  const guardedSignIn = useGuardedPress(onNavigateToSignIn);
  const guardedForgotPassword = useGuardedPress(onNavigateToForgotPassword);
  const [state, actions] = makeResetPasswordViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const confirmPasswordInputRef = useRef<TextInputInstance>(null);

  const handleSubmit = async () => {
    setValidationError(null);
    if (!password) {
      setValidationError("Informe a nova senha.");
      return;
    }
    if (password.length < 8) {
      setValidationError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (!confirmPassword) {
      setValidationError("Confirme a nova senha.");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("As senhas não coincidem.");
      return;
    }
    await actions.submit(link, password);
  };

  const errorMessage = validationError ?? state.error;

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
              title={state.success ? "Senha atualizada" : state.linkExpired ? "Link expirado" : "Nova senha"}
              onBack={guardedBack}
            />
          ) : undefined
        }
        contentStyle={styles.content}
      >
        {state.linkExpired ? (
          <>
            <IconBadge icon="error" tone="error" size="large" />
            <Text accessibilityRole="header" style={styles.title}>Link expirado.</Text>
            <Text style={styles.subtitle}>
              Esse link de recuperação não é mais válido. Solicite um novo link para continuar.
            </Text>
            <InlineErrorCard message="Link de recuperação inválido ou expirado." />
            <FilledButton
              label="Solicitar novo link"
              onPress={guardedForgotPassword}
            />
          </>
        ) : state.success ? (
          <>
            <IconBadge icon="check" tone="action" size="large" />
            <Text accessibilityRole="header" style={styles.title}>
              Tudo certo com seu acesso.
            </Text>
            <Text style={styles.subtitle}>
              Sua nova senha foi salva. Entre novamente para continuar.
            </Text>
            <View style={styles.successBox}>
              <Text accessibilityRole="alert" style={styles.message}>
                Senha atualizada. Entre com a nova senha.
              </Text>
            </View>
            <FilledButton
              label="Ir para o login"
              onPress={guardedSignIn}
            />
          </>
        ) : (
          <>
            <Text accessibilityRole="header" style={styles.title}>Um novo começo.</Text>
            <Text style={styles.subtitle}>Escolha uma senha com pelo menos 8 caracteres.</Text>
            <TextField
              label="Nova senha"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (validationError) setValidationError(null);
              }}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus?.()}
              editable={!state.loading}
              helperText="Use uma senha que você não usa em outro lugar."
            />

            <TextField
              inputRef={confirmPasswordInputRef}
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (validationError) setValidationError(null);
              }}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit()}
              editable={!state.loading}
            />

            {errorMessage ? <InlineErrorCard message={errorMessage} /> : null}

            <FilledButton
              label="Salvar nova senha"
              loading={state.loading}
              loadingLabel="Salvando senha"
              onPress={() => void handleSubmit()}
            />

            <TextButton label="Voltar ao login" disabled={state.loading} onPress={guardedSignIn} />
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
      color: colors.action,
    },
    subtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
      marginBottom: tokens.spacing[4],
    },
    successBox: {
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      padding: tokens.spacing[16],
    },
    message: {
      ...tokens.typography.bodyMedium,
      color: colors.success,
      fontWeight: tokens.fontWeight.medium,
    },
  });
}
