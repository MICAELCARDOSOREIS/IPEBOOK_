import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import {
  makeAuthViewModel,
  makeProfilePhotoViewModel,
  makeProfileViewModel,
  makeUserPreferencesViewModel,
} from "@/di/container";
import type { ImageSource } from "@/model/services/iImagePickerService";
import { normalizeInstagramHandle } from "@/model/validators/instagramValidator";
import { sanitizeTextInput } from "@/model/validators/textSanitizer";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { ReaderCard } from "@/view/components/ReaderCard";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useKeyboardVisible } from "@/view/useKeyboardVisible";
import { Snackbar } from "@/view/components/Snackbar";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { WEB_GUTTER } from "@/view/webLayout";
import { withPress } from "@/view/pressFeedback";
import { useGuardedPress } from "@/view/useGuardedPress";
export type ProfileProps = {
  onNavigateToSignIn?: () => void;
  /** Quando presente, exibe a barra superior com "Editar perfil" (Figma `07.02`). */
  onBack?: () => void;
};

const MAX_NAME_LENGTH = 60;
const MAX_SOCIAL_HANDLE_LENGTH = 60;

type FieldErrors = Partial<Record<"name" | "photoUrl" | "socialHandle", string>>;

/**
 * Validação preventiva espelhando as regras do domínio (`PublicProfileUseCases.updateProfile`
 * e `UserPreferencesUseCases.updatePreferences`) para exibir o erro no campo correspondente
 * antes de enviar qualquer requisição. A regra do @perfil é a única do domínio
 * (`normalizeInstagramHandle`), também aplicada na escrita e na exibição.
 */
function validateProfileFields(values: {
  name: string;
  photoUrl: string;
  socialHandle: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const name = sanitizeTextInput(values.name);
  if (!name) {
    errors.name = "Informe um nome público.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `O nome público deve ter até ${MAX_NAME_LENGTH} caracteres.`;
  }

  const photoUrl = values.photoUrl.trim();
  if (photoUrl && !/^https:\/\//i.test(photoUrl)) {
    errors.photoUrl = "A foto deve ser um link https válido.";
  }

  if (values.socialHandle.trim() && !normalizeInstagramHandle(values.socialHandle)) {
    errors.socialHandle = "Use só letras, números, ponto e _ (até 30), sem link.";
  }

  return errors;
}

/**
 * Tela de Edição de Perfil alinhada fielmente ao Figma `07.02 · Editar perfil` (`145:2408`)
 * e ao padrão do Design System v1.8.0 (ScreenContainer, M3 Outlined fields, tokens centralizados).
 */
export default function Profile({ onNavigateToSignIn, onBack }: ProfileProps) {
  const guardedSignIn = useGuardedPress(onNavigateToSignIn);
  const { colors } = useTheme();
  // Web larga: coluna mais larga, com cartão e foto de um lado e dados e contato do outro.
  const wide = useIsWideWeb();
  const insets = useSafeAreaInsets();
  const isKeyboardVisible = useKeyboardVisible();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);
  const [authState] = makeAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [photo, photoActions] = makeProfilePhotoViewModel(userId);
  const [state, actions] = makeProfileViewModel(userId);
  const [preferencesState, preferencesActions] = makeUserPreferencesViewModel(userId);

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [discardOpen, setDiscardOpen] = useState(false);
  /** true quando o toque em Salvar encontrou erros em linha (anuncia o resumo no TalkBack). */
  const [blockedSave, setBlockedSave] = useState(false);

  /** Edita um campo e limpa o erro em linha correspondente assim que a pessoa corrige o valor. */
  function editField(field: keyof FieldErrors, value: string, apply: (next: string) => void) {
    apply(value);
    setFieldErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));
    setBlockedSave(false);
  }

  async function pickPhoto(source: ImageSource) {
    const url = await photoActions.choose(source);
    if (url) editField("photoUrl", url, setPhotoUrl);
  }

  useEffect(() => {
    if (!state.profile) return;
    setName(state.profile.name);
    setPhotoUrl(state.profile.photoUrl ?? "");
    setSocialHandle(state.profile.socialHandle ?? "");
  }, [state.profile]);

  useEffect(() => {
    if (!authState.loading && !userId) onNavigateToSignIn?.();
  }, [authState.loading, userId, onNavigateToSignIn]);

  /**
   * Valores carregados servem de linha de base: depois de salvar, os casos de uso devolvem
   * perfil atualizado e `dirty` volta a ser falso sem código extra.
   */
  const dirty =
    name !== (state.profile?.name ?? "") ||
    photoUrl !== (state.profile?.photoUrl ?? "") ||
    socialHandle !== (state.profile?.socialHandle ?? "");

  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  /** Voltar com edição em aberto pergunta antes de descartar; sem edição, sai direto. */
  function requestBack() {
    if (dirty) setDiscardOpen(true);
    else onBack?.();
  }
  const guardedBack = useGuardedPress(requestBack);

  // Volte físico do Android: pergunta antes de descartar e, com a tela limpa, deixa o sistema navegar.
  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (dirtyRef.current) {
        setDiscardOpen(true);
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, []);

  if (authState.loading) {
    return (
      <ScreenContainer maxWidth={560} paddingTop={tokens.spacing[12]}>
        <LoadingState label="Carregando sessão" />
      </ScreenContainer>
    );
  }

  if (!userId) {
    return (
      <ScreenContainer
        maxWidth={560}
        paddingTop={tokens.spacing[12]}
        paddingBottom={tokens.spacing[32]}
        header={<TopAppBar contentMaxWidth={560} title="Editar perfil" onBack={guardedBack} />}
      >
        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>Entre para editar seu perfil</Text>
          <Text style={styles.guestText}>
            Suas informações ficam guardadas na sua conta. Entre ou crie uma para continuar.
          </Text>
          <FilledButton label="Entrar ou criar conta" onPress={guardedSignIn} />
        </View>
      </ScreenContainer>
    );
  }

  const loading = state.loading || preferencesState.loading;
  const saving = state.saving || preferencesState.saving;
  const error = state.error ?? preferencesState.error;

  async function handleSave() {
    const errors = validateProfileFields({ name, photoUrl, socialHandle });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setBlockedSave(true);
      return;
    }
    setBlockedSave(false);

    const trimmedName = name.trim();
    const profileOk = await actions.update({
      name: trimmedName,
      photoUrl: photoUrl.trim() || undefined,
      socialHandle: normalizeInstagramHandle(socialHandle) ?? undefined,
    });
    if (profileOk) setSaved(true);
  }

  function handleRetryLoad() {
    actions.reload();
    preferencesActions.reload();
  }

  const contentMaxWidth = wide ? 1040 : 560;

  return (
    <ScreenContainer
      maxWidth={contentMaxWidth}
      paddingHorizontal={wide ? WEB_GUTTER : undefined}
      paddingTop={tokens.spacing[12]}
      paddingBottom={!wide && state.profile ? tokens.spacing[96] + insets.bottom : tokens.spacing[32]}
      header={<TopAppBar contentMaxWidth={contentMaxWidth} title="Editar perfil" onBack={guardedBack} />}
      overlay={
        <>
          <Dialog
            visible={discardOpen}
            title="Descartar alterações?"
            message="As mudanças feitas ainda não foram salvas."
            confirmLabel="Descartar"
            cancelLabel="Continuar editando"
            destructive
            onConfirm={() => {
              setDiscardOpen(false);
              onBack?.();
            }}
            onCancel={() => setDiscardOpen(false)}
          />
          {!wide && state.profile && !loading && !isKeyboardVisible ? (
            <View pointerEvents="box-none" style={styles.stickyActionContainer}>
              <View style={styles.stickyActionContent}>
                <FilledButton
                  label="Salvar alterações"
                  loading={saving}
                  loadingLabel="Salvando perfil"
                  onPress={() => void handleSave()}
                />
              </View>
            </View>
          ) : null}
          <Snackbar
            visible={saved}
            message="Perfil atualizado"
            onDismiss={() => setSaved(false)}
          />
        </>
      }
    >
      {/* O desvio do teclado é da raiz única (KeyboardAwareRoot, Spec 088). */}
      <View style={styles.keyboardView}>
        {loading ? (
          <LoadingState label="Carregando perfil" variant="form" />
        ) : error && !state.profile ? (
          <ErrorState message={error} onRetry={handleRetryLoad} />
        ) : (
          <View style={styles.formContainer}>
            {/* 1. Manchete Editorial (Figma 07.02) */}
            <View style={styles.heroSection}>
              <Text accessibilityRole="header" style={styles.heroTitle}>
                Seu perfil, do seu jeito.
              </Text>
              <Text style={styles.heroSubtitle}>
                Atualize como você aparece para a comunidade.
              </Text>
            </View>

            <View style={[styles.columns, wide && styles.columnsWide]}>
              {/* Coluna 1: Cartão e Foto */}
              <View style={[styles.column, wide && styles.columnHalf]}>
                <FormSection
                  icon="person"
                  title="Cartão do leitor"
                  caption="Seu cartão aparece nos anúncios e nas trocas da comunidade."
                >
                  <View style={styles.avatarSection}>
                    <View style={styles.previewHeaderRow}>
                      <Text style={styles.previewLabel}>Prévia do cartão</Text>
                      <View style={styles.previewBadge}>
                        <AppIcon name="visibility" size={12} color={colors.brandBrown} />
                        <Text style={styles.previewBadgeText}>Ao vivo</Text>
                      </View>
                    </View>
                    <View style={styles.cardPreviewContainer}>
                      <ReaderCard
                        name={name.trim() || "Você"}
                        photoUrl={photoUrl.trim() || undefined}
                        subtitle={preferencesState.preferences?.neighborhood ? `${preferencesState.preferences.neighborhood}, Piripiri` : "Piripiri, PI"}
                      />
                    </View>
                  </View>

                  <View style={styles.photoActionsBlock}>
                    <Text style={styles.photoActionsLabel}>Foto de perfil</Text>
                    <View style={styles.photoActions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Escolher foto da galeria"
                        disabled={photo.uploading || saving}
                        onPress={() => void pickPhoto("library")}
                        style={({ pressed }) => [
                          styles.photoButton,
                          pressed && styles.photoButtonPressed,
                          (photo.uploading || saving) && styles.photoButtonDisabled,
                        ]}
                      >
                        <AppIcon name="photo" size={18} color={colors.m3.primary} />
                        <Text numberOfLines={1} style={styles.photoButtonText}>
                          Escolher foto
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tirar foto com a câmera"
                        disabled={photo.uploading || saving}
                        onPress={() => void pickPhoto("camera")}
                        style={({ pressed }) => [
                          styles.photoButton,
                          pressed && styles.photoButtonPressed,
                          (photo.uploading || saving) && styles.photoButtonDisabled,
                        ]}
                      >
                        <AppIcon name="camera" size={18} color={colors.m3.primary} />
                        <Text numberOfLines={1} style={styles.photoButtonText}>
                          Tirar foto
                        </Text>
                      </Pressable>
                    </View>
                    {photo.uploading ? <LoadingState label="Enviando foto" /> : null}
                    {photo.error ? (
                      <Text accessibilityRole="alert" style={styles.errorText}>
                        {photo.error}
                      </Text>
                    ) : null}
                    {photoUrl.trim() && !photo.uploading ? (
                      <View style={styles.removePhotoRow}>
                        <TextButton
                          label="Remover foto"
                          accessibilityLabel="Remover foto do perfil"
                          disabled={saving}
                          onPress={() => editField("photoUrl", "", setPhotoUrl)}
                        />
                      </View>
                    ) : null}
                  </View>
                </FormSection>
              </View>

              {/* Coluna 2: Dados Comunitários */}
              <View style={[styles.column, wide && styles.columnHalf]}>
                <FormSection
                  icon="shelf"
                  title="Sobre você"
                  caption="Nome e Instagram que aparecem no seu perfil público."
                >
                  {/* Nome */}
                  <TextField
                    label="Nome público"
                    accessibilityLabel="Nome público"
                    value={name}
                    onChangeText={(value) => editField("name", value, setName)}
                    placeholder="Seu nome"
                    autoCapitalize="words"
                    maxLength={MAX_NAME_LENGTH}
                    editable={!saving}
                    returnKeyType="next"
                    error={fieldErrors.name}
                    helperText={fieldErrors.name ? undefined : `${name.trim().length}/${MAX_NAME_LENGTH}`}
                    helperTextAlign="right"
                  />

                  {/* Instagram */}
                  <TextField
                    label="Instagram"
                    accessibilityLabel="Instagram"
                    value={socialHandle}
                    onChangeText={(value) => editField("socialHandle", value, setSocialHandle)}
                    placeholder="@seuperfil"
                    autoCapitalize="none"
                    maxLength={MAX_SOCIAL_HANDLE_LENGTH}
                    editable={!saving}
                    returnKeyType="done"
                    onSubmitEditing={() => void handleSave()}
                    error={fieldErrors.socialHandle}
                    helperText={fieldErrors.socialHandle ? undefined : "Opcional. Informe seu usuário, com ou sem @."}
                  />
                </FormSection>
              </View>
            </View>

            {/* Resumo acessível: o foco não pula para o campo com erro, então a região viva
                informa no leitor de tela que há itens destacados. */}
            {blockedSave ? (
              <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorText}>
                Confira os campos destacados para salvar.
              </Text>
            ) : null}

            {/* Mensagem de erro de carregamento/salvamento: banner discreto com nova tentativa,
                sem transformar um erro pontual de preferências em tela bloqueante. */}
            {error ? (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <Text style={styles.errorBannerText}>{error}</Text>
                <TextButton
                  label="Tentar novamente"
                  accessibilityLabel="Tentar novamente carregar perfil e preferências"
                  onPress={handleRetryLoad}
                />
              </View>
            ) : null}

            {/* Na web larga ou no celular com teclado ativo, a ação fica no fluxo do formulário. */}
            {wide || isKeyboardVisible ? (
              <View style={styles.actionContainer}>
                <FilledButton
                  label="Salvar alterações"
                  loading={saving}
                  loadingLabel="Salvando perfil"
                  onPress={() => void handleSave()}
                />
              </View>
            ) : null}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

/** Seção do formulário: cartão `surface-container-low` com ícone, título e legenda (Spec 078). */
function FormSection({
  icon,
  title,
  caption,
  children,
}: {
  icon: AppIconName;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);
  return (
    <View style={styles.formSection}>
      <View style={styles.formSectionHeader}>
        <View style={styles.formSectionIcon}>
          <AppIcon name={icon} size={18} color={colors.ipe.onContainer} />
        </View>
        <View style={styles.formSectionTitles}>
          <Text accessibilityRole="header" style={styles.formSectionTitle}>
            {title}
          </Text>
          <Text style={styles.formSectionCaption}>{caption}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function createStyles(colors: ColorPalette, insets?: EdgeInsets) {
  return StyleSheet.create({
    photoActionsBlock: {
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[4],
    },
    photoActionsLabel: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
      fontWeight: tokens.fontWeight.semiBold,
    },
    photoActions: {
      flexDirection: "row",
      gap: tokens.spacing[10],
      alignItems: "center",
    },
    photoButton: {
      flex: 1,
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.surface,
      paddingHorizontal: tokens.spacing[12],
    },
    photoButtonPressed: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      transform: [{ scale: 0.98 }],
    },
    photoButtonDisabled: {
      opacity: 0.5,
    },
    photoButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.medium,
    },
    removePhotoRow: {
      alignSelf: "flex-start",
      paddingTop: tokens.spacing[2],
    },
    formSection: {
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      elevation: 1,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    formSectionHeader: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[12] },
    formSectionIcon: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.card,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.ipe.container,
    },
    formSectionTitles: { flex: 1, gap: tokens.spacing[2] },
    formSectionTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface, fontWeight: tokens.fontWeight.semiBold },
    formSectionCaption: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    keyboardView: {
      width: "100%",
    },
    formContainer: {
      width: "100%",
      gap: tokens.spacing[16],
    },
    heroSection: {
      paddingBottom: tokens.spacing[2],
      gap: tokens.spacing[2],
    },
    columns: { gap: tokens.spacing[16] },
    columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
    column: { gap: tokens.spacing[16] },
    columnHalf: { flex: 1 },
    heroTitle: {
      ...tokens.typography.brandHeadline,
      color: colors.brandBrown,
      paddingLeft: tokens.spacing[4],
      paddingRight: tokens.spacing[8],
      fontSize: 26,
      lineHeight: 32,
    },
    heroSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[2],
      paddingLeft: tokens.spacing[4],
    },
    avatarSection: {
      gap: tokens.spacing[8],
    },
    previewHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    previewBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      backgroundColor: colors.ipe.container,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.full,
    },
    previewBadgeText: {
      ...tokens.typography.labelSmall,
      color: colors.brandBrown,
      fontWeight: tokens.fontWeight.medium,
    },
    previewLabel: { ...tokens.typography.labelMedium, color: colors.m3.onSurfaceVariant, fontWeight: tokens.fontWeight.semiBold },
    cardPreviewContainer: {
      width: "100%",
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
      marginTop: tokens.spacing[8],
    },
    errorBanner: {
      marginTop: tokens.spacing[16],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.error,
      backgroundColor: colors.errorContainer,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[14],
    },
    errorBannerText: {
      flex: 1,
      color: colors.m3.onErrorContainer,
      ...tokens.typography.bodyMedium,
    },
    actionContainer: {
      marginTop: tokens.spacing[8],
      width: "100%",
    },
    stickyActionContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      backgroundColor: colors.surface,
      elevation: 4,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    stickyActionContent: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[10],
      paddingBottom: Math.max(insets?.bottom ?? 0, tokens.spacing[12]),
    },
    guestCard: {
      gap: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLow,
      padding: tokens.spacing[24],
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.5,
      elevation: 1,
    },
    guestTitle: {
      ...tokens.typography.titleLarge,
      color: colors.m3.onSurface,
    },
    guestText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
  });
}
