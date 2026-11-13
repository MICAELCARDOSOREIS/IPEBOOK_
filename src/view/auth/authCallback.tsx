import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { makeAuthViewModel } from "@/di/container";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type AuthCallbackProps = {
  url: string | null;
  onSuccess: () => void;
  onBackToSignIn?: () => void;
};

export default function AuthCallback({ url, onSuccess, onBackToSignIn }: AuthCallbackProps) {
  const [state, actions] = makeAuthViewModel();
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  // Mantém as dependências mais recentes sem reexecutar o efeito: cada renderização recria
  // `actions` e `onSuccess`, e reprocessar a URL descartaria o resultado em andamento.
  const latest = useRef({ actions, onSuccess });
  latest.current = { actions, onSuccess };
  const processedUrl = useRef<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!url || processedUrl.current === url) return;
    processedUrl.current = url;
    setFailed(false);

    async function completeAuth(callbackUrl: string) {
      const handle = latest.current.actions.handleAuthCallback;
      if (!handle) return;
      const ok = await handle(callbackUrl);
      if (!mounted.current) return;
      if (ok) {
        latest.current.onSuccess();
      } else {
        setFailed(true);
      }
    }

    completeAuth(url);
  }, [url]);

  // O ViewModel só publica o motivo depois de concluir a tentativa: ler o estado no instante da
  // falha devolveria o valor anterior e esconderia a mensagem real.
  const errorMessage = failed ? (state.error ?? "Não foi possível concluir o login.") : null;

  return (
    <ScreenContainer
      maxWidth={560}
      scroll={false}
      contentStyle={styles.container}
    >
      {errorMessage ? (
        <View style={styles.content}>
          <InlineErrorCard message={errorMessage} style={styles.errorCard} />
          {onBackToSignIn ? (
            <Text
              style={[styles.link, { color: colors.action }]}
              onPress={onBackToSignIn}
            >
              Voltar para o login
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.action} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Concluindo autenticação...
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    padding: tokens.spacing[24],
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[16],
  },
  errorCard: {
    width: "100%",
  },
  loadingText: {
    marginTop: tokens.spacing[16],
    ...tokens.typography.bodyLarge,
  },
  link: {
    ...tokens.typography.labelLarge,
    fontWeight: tokens.fontWeight.bold,
  },
});
