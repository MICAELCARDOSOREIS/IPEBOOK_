import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import { tokens } from "@/view/tokens";
import { Avatar } from "@/view/components/Avatar";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { Snackbar } from "@/view/components/Snackbar";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

export type ProfileProps = {
  onNavigateToSignIn?: () => void;
  /** Quando presente, exibe a barra superior com "Editar perfil" (Figma `07.02`). */
  onBack?: () => void;
};

export default function Profile({ onNavigateToSignIn, onBack }: ProfileProps) {
  const [authState] = useAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [state, actions] = useProfileViewModel(userId);
  const [preferencesState, preferencesActions] = useUserPreferencesViewModel(userId);
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!state.profile) return;
    setName(state.profile.name);
    setPhotoUrl(state.profile.photoUrl ?? "");
    setSocialHandle(state.profile.socialHandle ?? "");
  }, [state.profile]);

  useEffect(() => {
    if (!preferencesState.preferences) return;
    setPhone(preferencesState.preferences.phone ?? "");
    setNeighborhood(preferencesState.preferences.neighborhood ?? "");
  }, [preferencesState.preferences]);

  useEffect(() => {
    if (!authState.loading && !userId) onNavigateToSignIn?.();
  }, [authState.loading, userId, onNavigateToSignIn]);

  if (authState.loading || !userId) return null;

  const loading = state.loading || preferencesState.loading;
  const saving = state.saving || preferencesState.saving;
  const error = state.error ?? preferencesState.error;

  async function handleSave() {
    const [profileOk, preferencesOk] = await Promise.all([
      actions.update({ name, photoUrl: photoUrl || undefined, socialHandle: socialHandle || undefined }),
      preferencesActions.update({ phone: phone || undefined, neighborhood: neighborhood || undefined }),
    ]);
    if (profileOk && preferencesOk) setSaved(true);
  }

  return (
    <SafeAreaView style={styles.page}>
      {onBack ? (
        <TopAppBar title="Editar perfil" onBack={onBack} />
      ) : (
        <View style={styles.brand}>
          <View style={styles.mark} accessible={false} />
          <Text accessibilityRole="header" style={styles.title}>Ipebook</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <LoadingState label="Carregando perfil" />
        ) : error && !state.profile ? (
          <ErrorState message={error} onRetry={() => void handleSave()} />
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
            <TextField
              label="Telefone/WhatsApp"
              value={phone}
              onChangeText={setPhone}
              placeholder="(86) 99999-9999"
              keyboardType="phone-pad"
            />
            <View style={styles.field}>
              <Text style={styles.sectionLabel}>Bairro padrão</Text>
              <View style={styles.chipRow}>
                {PIRIPIRI_NEIGHBORHOODS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    accessibilityLabel={`Bairro ${item}`}
                    selected={neighborhood === item}
                    onPress={() => setNeighborhood(neighborhood === item ? "" : item)}
                  />
                ))}
              </View>
            </View>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <FilledButton
              label="Salvar"
              loading={saving}
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
  form: { gap: tokens.spacing[16], alignItems: "flex-start", width: "100%" },
  error: { color: tokens.colors.error, fontSize: tokens.typography.bodyMedium.fontSize },
  field: { gap: tokens.spacing[6], width: "100%" },
  sectionLabel: { fontSize: tokens.typography.labelSmall.fontSize, fontWeight: "600", color: tokens.colors.secondaryText },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
});
