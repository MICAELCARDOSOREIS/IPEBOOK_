import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Checkbox } from "@/view/components/Checkbox";
import { FilledButton } from "@/view/components/FilledButton";
import { Logotipo } from "@/view/components/Logotipo";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

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
  const [state, actions] = useAuthViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      setTermsError(TERMS_ERROR);
      return;
    }
    setTermsError(null);
    const success = await actions.signUp(email, password, name);
    if (success) onAuthenticated?.();
  };

  return (
    <SafeAreaView style={styles.page}>
      {onBack ? <TopAppBar title="Criar conta" onBack={onBack} /> : null}
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Logotipo />
          <Text accessibilityRole="header" style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Anuncie, troque, venda ou doe livros perto de você.</Text>

          <TextField
            label="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!state.loading}
            placeholder="Como você quer ser chamado"
            maxLength={80}
          />

          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!state.loading}
            placeholder="voce@exemplo.com"
          />

          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!state.loading}
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
            disabled={state.loading}
          />

          {onNavigateToTerms ? (
            <TextButton
              label="Ler os termos de uso e a política de privacidade"
              onPress={() => onNavigateToTerms()}
            />
          ) : null}

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
          ) : null}

          {state.statusMessage ? (
            <Text accessibilityRole="alert" style={styles.status}>{state.statusMessage}</Text>
          ) : null}

          <FilledButton
            label="Criar conta"
            loading={state.loading}
            loadingLabel="Criando conta"
            onPress={() => void handleSubmit()}
          />

          <OutlinedButton label="Já tenho conta" onPress={() => onNavigateToSignIn?.()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flexGrow: 1,
    paddingHorizontal: tokens.spacing[24],
    paddingTop: tokens.spacing[24],
    paddingBottom: tokens.spacing[32],
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: tokens.spacing[16],
  },
  title: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  subtitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    color: colors.secondaryText,
    marginBottom: tokens.spacing[4],
  },
  error: {
    color: colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  status: {
    color: colors.success,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  });
}
