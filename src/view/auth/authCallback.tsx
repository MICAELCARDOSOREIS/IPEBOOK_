import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { fontFamily, tokens } from "@/view/tokens";
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

  useEffect(() => {
    if (!url) return;
    let isMounted = true;

    async function completeAuth() {
      if (!actions.handleAuthCallback || !url) return;
      const ok = await actions.handleAuthCallback(url);
      if (!isMounted) return;
      if (ok) {
        onSuccess();
      } else {
        setErrorMessage(state.error ?? "Não foi possível concluir o login.");
      }
    }

    completeAuth();
    return () => {
      isMounted = false;
    };
  }, [url, actions, onSuccess, state.error]);

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
    fontSize: 16,
    fontFamily: fontFamily.regular,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: tokens.spacing[16],
    fontFamily: fontFamily.regular,
  },
  link: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: fontFamily.medium,
  },
});
