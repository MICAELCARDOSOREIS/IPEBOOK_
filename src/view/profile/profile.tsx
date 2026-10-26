import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon } from "@/view/components/AppIcon";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { Snackbar } from "@/view/components/Snackbar";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

export type ProfileProps = {
  onNavigateToSignIn?: () => void;
  /** Quando presente, exibe a barra superior com "Editar perfil" (Figma `07.02`). */
  onBack?: () => void;
};

/**
 * Tela de Edição de Perfil alinhada fielmente ao Figma `07.02 · Editar perfil` (`145:2408`)
 * e ao padrão do Design System v1.8.0 (ScreenContainer, M3 Outlined fields, tokens centralizados).
 */
export default function Profile({ onNavigateToSignIn, onBack }: ProfileProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState] = useAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [state, actions] = useProfileViewModel(userId);
  const [preferencesState, preferencesActions] = useUserPreferencesViewModel(userId);

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("Centro");
  const [saved, setSaved] = useState(false);
  const [isNeighborhoodModalOpen, setIsNeighborhoodModalOpen] = useState(false);

  useEffect(() => {
    if (!state.profile) return;
    setName(state.profile.name);
    setPhotoUrl(state.profile.photoUrl ?? "");
    setSocialHandle(state.profile.socialHandle ?? "");
  }, [state.profile]);

  useEffect(() => {
    if (!preferencesState.preferences) return;
    setPhone(preferencesState.preferences.phone ?? "");
    if (preferencesState.preferences.neighborhood) {
      setNeighborhood(preferencesState.preferences.neighborhood);
    }
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
      actions.update({
        name,
        photoUrl: photoUrl || undefined,
        socialHandle: socialHandle || undefined,
      }),
      preferencesActions.update({
        phone: phone || undefined,
        neighborhood: neighborhood || undefined,
      }),
    ]);
    if (profileOk && preferencesOk) setSaved(true);
  }

  return (
    <ScreenContainer
      maxWidth={560}
      paddingTop={tokens.spacing[12]}
      paddingBottom={tokens.spacing[32]}
      header={<TopAppBar title="Editar perfil" onBack={onBack ?? (() => {})} />}
      overlay={
        <>
          <NeighborhoodSelectorModal
            visible={isNeighborhoodModalOpen}
            currentNeighborhood={neighborhood}
            onSelect={(selected) => {
              setNeighborhood(selected);
              setIsNeighborhoodModalOpen(false);
            }}
            onClose={() => setIsNeighborhoodModalOpen(false)}
          />
          <Snackbar
            visible={saved}
            message="Perfil atualizado"
            onDismiss={() => setSaved(false)}
          />
        </>
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {loading ? (
          <LoadingState label="Carregando perfil" />
        ) : error && !state.profile ? (
          <ErrorState message={error} onRetry={() => void handleSave()} />
        ) : (
          <View style={styles.formContainer}>
            {/* 1. Manchete Editorial (Figma 07.02) */}
            <View style={styles.heroSection}>
              <Text accessibilityRole="header" style={styles.heroTitle}>
                Seu jeito de ler.
              </Text>
              <Text style={styles.heroSubtitle}>
                Atualize as informações que aparecem no seu perfil.
              </Text>
            </View>

            {/* 2. Avatar Centralizado em Destaque (Figma 07.02) */}
            <View style={styles.avatarSection}>
              <Avatar
                name={name || "Você"}
                photoUrl={photoUrl || undefined}
                size={88}
              />
            </View>

            {/* 3. Campos Principais do Formulário */}
            <View style={styles.fieldsGroup}>
              {/* Nome */}
              <TextField
                label="Nome"
                accessibilityLabel="Nome público"
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                autoCapitalize="words"
              />

              {/* Cidade (Campo fixo / informativo M3 desabilitado) */}
              <TextField
                label="Cidade"
                value="Piripiri, PI"
                onChangeText={() => {}}
                editable={false}
                accessibilityLabel="Cidade: Piripiri, PI"
              />

              {/* Bairro (Campo interativo contornado com seletor no Figma 07.02) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Bairro selecionado: ${neighborhood}. Toque para alterar`}
                onPress={() => setIsNeighborhoodModalOpen(true)}
                style={styles.selectorField}
              >
                <View style={styles.selectorContainer}>
                  <View style={styles.notch}>
                    <Text style={styles.floatingLabel}>Bairro</Text>
                  </View>
                  <Text style={styles.fieldValue}>{neighborhood}</Text>
                  <AppIcon
                    name="chevronDown"
                    size={20}
                    color={colors.m3.onSurfaceVariant}
                  />
                </View>
              </Pressable>

              {/* Chips rápidos de bairro mais frequentes */}
              <View style={styles.neighborhoodChipsArea}>
                <Text style={styles.sectionLabel}>Bairros mais frequentes</Text>
                <View style={styles.chipRow}>
                  {PIRIPIRI_NEIGHBORHOODS.slice(0, 6).map((item) => (
                    <Chip
                      key={item}
                      size="compact"
                      label={item}
                      accessibilityLabel={`Bairro ${item}`}
                      selected={neighborhood === item}
                      onPress={() => setNeighborhood(item)}
                    />
                  ))}
                </View>
              </View>

              {/* Mensagem de privacidade (Figma 07.02) */}
              <Text style={styles.privacyHelper}>Seu e-mail fica privado.</Text>

              {/* Telefone/WhatsApp */}
              <TextField
                label="Telefone/WhatsApp"
                accessibilityLabel="Telefone/WhatsApp"
                value={phone}
                onChangeText={setPhone}
                placeholder="(86) 99999-9999"
                keyboardType="phone-pad"
              />

              {/* Rede social */}
              <TextField
                label="Rede social"
                accessibilityLabel="Rede social"
                value={socialHandle}
                onChangeText={setSocialHandle}
                placeholder="@usuario"
                autoCapitalize="none"
              />

              {/* Foto (link) */}
              <TextField
                label="Foto (link)"
                accessibilityLabel="Foto (link)"
                value={photoUrl}
                onChangeText={setPhotoUrl}
                placeholder="https://..."
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Mensagem de erro de salvamento */}
            {error ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            ) : null}

            {/* 4. Ação Principal Fixa: "Salvar alterações" (Figma 07.02) */}
            <View style={styles.actionContainer}>
              <FilledButton
                label="Salvar alterações"
                accessibilityLabel="Salvar"
                loading={saving}
                loadingLabel="Salvando perfil"
                onPress={() => void handleSave()}
              />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    keyboardView: {
      width: "100%",
    },
    formContainer: {
      width: "100%",
    },
    heroSection: {
      marginBottom: tokens.spacing[16],
    },
    heroTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "700",
      color: colors.brandBrown,
    },
    heroSubtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[6],
    },
    avatarSection: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: tokens.spacing[16],
    },
    fieldsGroup: {
      gap: tokens.spacing[16],
      width: "100%",
    },
    selectorField: {
      width: "100%",
    },
    selectorContainer: {
      minHeight: tokens.spacing[56],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: tokens.radius.extraSmall,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      paddingHorizontal: tokens.spacing[16],
      backgroundColor: "transparent",
    },
    notch: {
      position: "absolute",
      top: -8,
      left: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.extraSmall,
      backgroundColor: colors.surface,
    },
    floatingLabel: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    fieldValue: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
    },
    neighborhoodChipsArea: {
      marginTop: tokens.spacing[4],
      gap: tokens.spacing[8],
    },
    sectionLabel: {
      ...tokens.typography.labelMedium,
      fontWeight: "600",
      color: colors.m3.onSurfaceVariant,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
    },
    privacyHelper: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[4],
    },
    errorText: {
      color: colors.error,
      fontSize: tokens.typography.bodyMedium.fontSize,
      marginTop: tokens.spacing[8],
    },
    actionContainer: {
      marginTop: tokens.spacing[32],
      width: "100%",
    },
  });
}
