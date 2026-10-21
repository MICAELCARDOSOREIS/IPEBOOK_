import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { tokens } from "@/view/tokens";
import { Avatar } from "@/view/components/Avatar";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { Snackbar } from "@/view/components/Snackbar";
import { TextField } from "@/view/components/TextField";

export type ProfileProps = {
  onNavigateToSignIn?: () => void;
};

export default function Profile({ onNavigateToSignIn }: ProfileProps) {
  const [authState] = useAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [state, actions] = useProfileViewModel(userId);
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!state.profile) return;
    setName(state.profile.name);
    setPhotoUrl(state.profile.photoUrl ?? "");
    setSocialHandle(state.profile.socialHandle ?? "");
  }, [state.profile]);

  useEffect(() => {
    if (!authState.loading && !userId) onNavigateToSignIn?.();
  }, [authState.loading, userId, onNavigateToSignIn]);

  if (authState.loading || !userId) return null;

  async function handleSave() {
    const ok = await actions.update({ name, photoUrl: photoUrl || undefined, socialHandle: socialHandle || undefined });
    if (ok) setSaved(true);
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <View style={styles.mark} accessible={false} />
          <Text accessibilityRole="header" style={styles.title}>Ipebook</Text>
        </View>
        {state.loading ? (
          <LoadingState label="Carregando perfil" />
        ) : state.error && !state.profile ? (
          <ErrorState message={state.error} onRetry={() => actions.update({ name, photoUrl, socialHandle })} />
        ) : (
          <View style={styles.form}>
            <Avatar name={name || "Você"} photoUrl={photoUrl || undefined} size={64} />
            <TextField label="Nome público" value={name} onChangeText={setName} />
            <TextField
              label="Foto (link)"
              value={photoUrl}
              onChangeText={setPhotoUrl}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />
            <TextField label="Rede social" value={socialHandle} onChangeText={setSocialHandle} autoCapitalize="none" />
            {state.error ? <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text> : null}
            <FilledButton
              label="Salvar"
              loading={state.saving}
              loadingLabel="Salvando perfil"
              onPress={() => void handleSave()}
            />
          </View>
        )}
      </ScrollView>
      <Snackbar visible={saved} message="Perfil atualizado" onDismiss={() => setSaved(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24] },
  brand: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12], marginBottom: tokens.spacing[24] },
  mark: { width: 16, height: 36, backgroundColor: tokens.colors.highlight, borderTopRightRadius: tokens.radius.medium },
  title: { fontSize: tokens.typography.displayLarge.fontSize, fontWeight: tokens.typography.displayLarge.fontWeight, color: tokens.colors.action },
  form: { gap: tokens.spacing[16], alignItems: "flex-start" },
  error: { color: tokens.colors.error, fontSize: tokens.typography.bodyMedium.fontSize },
});
