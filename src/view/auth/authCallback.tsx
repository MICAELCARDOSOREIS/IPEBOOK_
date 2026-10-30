import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type AuthCallbackProps = {
  url: string | null;
  onSuccess: () => void;
  onBackToSignIn?: () => void;
};

export default function AuthCallback({ url, onSuccess, onBackToSignIn }: AuthCallbackProps) {
  const [state, actions] = useAuthViewModel();
  const { colors } = useTheme();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mantém as dependências mais recentes sem reexecutar o efeito: cada renderização recria
  // `actions` e `onSuccess`, e reprocessar a URL descartaria o resultado em andamento.
  const latest = useRef({ actions, onSuccess, error: state.error });
  latest.current = { actions, onSuccess, error: state.error };
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

    async function completeAuth(callbackUrl: string) {
      const handle = latest.current.actions.handleAuthCallback;
      if (!handle) return;
      const ok = await handle(callbackUrl);
      if (!mounted.current) return;
      if (ok) {
        latest.current.onSuccess();
      } else {
        setErrorMessage(latest.current.error ?? "Não foi possível concluir o login.");
      }
    }

    completeAuth(url);
  }, [url]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {errorMessage ? (
        <View style={styles.content}>
          <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: tokens.spacing[24],
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: tokens.spacing[16],
    ...tokens.typography.bodyLarge,
  },
  errorText: {
    ...tokens.typography.bodyLarge,
    textAlign: "center",
    marginBottom: tokens.spacing[16],
  },
  link: {
    ...tokens.typography.labelLarge,
    fontWeight: tokens.fontWeight.bold,
  },
});
