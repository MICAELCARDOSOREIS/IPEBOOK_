import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { IErrorReporter } from "@/model/services/iErrorReporter";
import { ErrorState } from "@/view/components/ErrorState";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";
import { appErrorReporter } from "@/viewmodel/errorReporting";

export { startErrorReporting } from "@/viewmodel/errorReporting";

export type AppErrorFallbackProps = {
  error: Error;
  retry: () => void;
  reporter?: IErrorReporter;
};

/** Tela mostrada quando uma tela quebra (Spec 104): avisa sem detalhes técnicos e envia o erro ao Sentry. */
export function AppErrorFallback({ error, retry, reporter = appErrorReporter }: AppErrorFallbackProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    reporter.captureException(error, { origem: "tela" });
  }, [error, reporter]);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Algo deu errado nesta tela</Text>
        <Text style={styles.body}>A equipe do IpêBook já foi avisada. Tente de novo; se continuar, volte mais tarde.</Text>
        <ErrorState message="Não foi possível mostrar esta tela." onRetry={retry} />
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, justifyContent: "center", padding: tokens.spacing[24], gap: tokens.spacing[16], maxWidth: 560, width: "100%", alignSelf: "center" },
    title: { ...tokens.typography.titleLarge, color: colors.text },
    body: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
  });
}
