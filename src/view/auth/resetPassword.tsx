import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilledButton } from "@/view/components/FilledButton";
import { TextField } from "@/view/components/TextField";
import { tokens } from "@/view/tokens";
import { useResetPasswordViewModel } from "@/viewmodel/useResetPasswordViewModel";

export type ResetPasswordProps = {
  link: string | null;
  onNavigateToSignIn?: () => void;
};

export default function ResetPassword({ link, onNavigateToSignIn }: ResetPasswordProps) {
  const [state, actions] = useResetPasswordViewModel();
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Definir nova senha</Text>
        {state.success ? (
          <Text accessibilityRole="alert" style={styles.message}>Senha atualizada. Entre com a nova senha.</Text>
        ) : (
          <>
            <TextField
              label="Nova senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!state.loading}
              helperText="Mínimo de 8 caracteres."
            />
            {state.error ? <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text> : null}
            <FilledButton
              label="Salvar nova senha"
              loading={state.loading}
              loadingLabel="Salvando senha"
              onPress={() => void actions.submit(link, password)}
            />
          </>
        )}
        <Pressable accessibilityRole="button" onPress={onNavigateToSignIn} style={styles.linkButton}>
          <Text style={styles.link}>Voltar para o login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center", padding: tokens.spacing[24], paddingTop: tokens.spacing[48], gap: tokens.spacing[16] },
  title: { fontSize: tokens.typography.displayLarge.fontSize, fontWeight: tokens.typography.displayLarge.fontWeight, color: tokens.colors.action },
  message: { color: tokens.colors.success, fontSize: tokens.typography.bodyMedium.fontSize },
  error: { color: tokens.colors.error, fontSize: tokens.typography.bodyMedium.fontSize },
  linkButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center" },
  link: { color: tokens.colors.action, fontSize: tokens.typography.bodyMedium.fontSize, fontWeight: "600" },
});
