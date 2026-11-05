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
import {
  makeAuthViewModel,
  makeProfilePhotoViewModel,
  makeProfileViewModel,
  makeUserPreferencesViewModel,
} from "@/di/container";
import type { ImageSource } from "@/model/services/iImagePickerService";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import { normalizeInstagramHandle } from "@/model/validators/instagramValidator";
import { sanitizeTextInput } from "@/model/validators/textSanitizer";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { ReaderCard } from "@/view/components/ReaderCard";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Chip } from "@/view/components/Chip";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { useIsWideWeb } from "@/view/useIsWideWeb";
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

/**
 * Atalhos exibidos abaixo do campo de bairro. São os seis primeiros da lista oficial,
 * não um ranking de frequência: a interface chama o grupo de "Acesso rápido".
 */
const NEIGHBORHOOD_QUICK_PICKS = 6;

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
  const { width: viewportWidth } = useWindowDimensions();
  const stackPhotoActions = viewportWidth < 380;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState] = makeAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [photo, photoActions] = makeProfilePhotoViewModel(userId);
  const [state, actions] = makeProfileViewModel(userId);
  const [preferencesState, preferencesActions] = makeUserPreferencesViewModel(userId);

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  /** null = ainda não escolhido. A tela não atribui um bairro que a pessoa não selecionou. */
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isNeighborhoodModalOpen, setIsNeighborhoodModalOpen] = useState(false);
  /** Atalhos de bairro ficam recolhidos por padrão para manter o formulário limpo (Spec 017 polish). */
  const [showNeighborhoodPicks, setShowNeighborhoodPicks] = useState(false);
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
    if (!preferencesState.preferences) return;
    setNeighborhood(preferencesState.preferences.neighborhood ?? null);
  }, [preferencesState.preferences]);

  useEffect(() => {
    if (!authState.loading && !userId) onNavigateToSignIn?.();
  }, [authState.loading, userId, onNavigateToSignIn]);

  /**
   * Valores carregados servem de linha de base: depois de salvar, os casos de uso devolvem
   * perfil e preferências atualizados e `dirty` volta a ser falso sem código extra.
   */
  const dirty =
    name !== (state.profile?.name ?? "") ||
    photoUrl !== (state.profile?.photoUrl ?? "") ||
    socialHandle !== (state.profile?.socialHandle ?? "") ||
    neighborhood !== (preferencesState.preferences?.neighborhood ?? null);

  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const modalOpenRef = useRef(isNeighborhoodModalOpen);
  modalOpenRef.current = isNeighborhoodModalOpen;

  /** Voltar com edição em aberto pergunta antes de descartar; sem edição, sai direto. */
  function requestBack() {
    if (dirty) setDiscardOpen(true);
    else onBack?.();
  }
  const guardedBack = useGuardedPress(requestBack);

  // Volte físico do Android: fecha o modal de bairros, pergunta antes de descartar e, com a
  // tela limpa, deixa o sistema navegar (retorna false).
  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (modalOpenRef.current) {
        setIsNeighborhoodModalOpen(false);
        return true;
      }
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
    const [profileOk, preferencesOk] = await Promise.all([
      actions.update({
        name: trimmedName,
        photoUrl: photoUrl.trim() || undefined,
        socialHandle: normalizeInstagramHandle(socialHandle) ?? undefined,
      }),
      preferencesActions.update({
        neighborhood: neighborhood ?? undefined,
      }),
    ]);
    if (profileOk && preferencesOk) setSaved(true);
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
      paddingBottom={!wide && state.profile ? tokens.spacing[96] : tokens.spacing[32]}
      header={<TopAppBar contentMaxWidth={contentMaxWidth} title="Editar perfil" onBack={guardedBack} />}
      overlay={
        <>
          <NeighborhoodSelectorModal
            visible={isNeighborhoodModalOpen}
            currentNeighborhood={neighborhood ?? ""}
            onSelect={(selected) => {
              setNeighborhood(selected);
              setIsNeighborhoodModalOpen(false);
            }}
            onClose={() => setIsNeighborhoodModalOpen(false)}
          />
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
          {!wide && state.profile && !loading ? (
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
          <LoadingState label="Carregando perfil" />
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
                        subtitle={neighborhood ? `${neighborhood}, Piripiri` : "Piripiri, PI"}
                      />
                    </View>
                  </View>

                  <View style={styles.photoActionsBlock}>
                    <Text style={styles.photoActionsLabel}>Foto de perfil</Text>
                    <View style={[styles.photoActions, stackPhotoActions && styles.photoActionsStacked]}>
                      <View style={styles.photoAction}>
                        <OutlinedButton
                          label="Escolher foto"
                          accessibilityLabel="Escolher foto da galeria"
                          icon={<AppIcon name="photo" size={18} color={colors.m3.primary} />}
                          disabled={photo.uploading}
                          onPress={() => void pickPhoto("library")}
                        />
                      </View>
                      <View style={styles.photoAction}>
                        <OutlinedButton
                          label="Tirar foto"
                          accessibilityLabel="Tirar foto com a câmera"
                          icon={<AppIcon name="camera" size={18} color={colors.m3.primary} />}
                          disabled={photo.uploading}
                          onPress={() => void pickPhoto("camera")}
                        />
                      </View>
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
                  caption="Nome, bairro e Instagram que aparecem no seu perfil público."
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
                    error={fieldErrors.name}
                    helperText={fieldErrors.name ? undefined : `${name.trim().length}/${MAX_NAME_LENGTH}`}
                    helperTextAlign="right"
                  />

                  {/* Bairro */}
                  <View style={styles.fieldWrapper}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        neighborhood
                          ? `Bairro selecionado: ${neighborhood}. Toque para alterar`
                          : "Nenhum bairro selecionado. Toque para escolher"
                      }
                      onPress={() => setIsNeighborhoodModalOpen(true)}
                      style={withPress(styles.selectorField)}
                    >
                      <View style={styles.selectorContainer}>
                        <View style={styles.notch}>
                          <Text style={styles.floatingLabel}>Bairro</Text>
                        </View>
                        <View style={styles.selectorContentRow}>
                          <View style={styles.selectorIconWrap}>
                            <AppIcon
                              name="place"
                              size={18}
                              color={neighborhood ? colors.m3.primary : colors.m3.onSurfaceVariant}
                            />
                          </View>
                          <Text style={neighborhood ? styles.fieldValue : styles.fieldPlaceholder}>
                            {neighborhood ?? "Selecionar bairro"}
                          </Text>
                        </View>
                        <AppIcon
                          name="chevronDown"
                          size={20}
                          color={colors.m3.onSurfaceVariant}
                        />
                      </View>
                    </Pressable>
                  </View>

                  {/* Atalhos de bairro */}
                  {showNeighborhoodPicks ? (
                    <View style={styles.neighborhoodChipsArea}>
                      <View style={styles.chipsHeader}>
                        <Text style={styles.sectionLabel}>Acesso rápido</Text>
                        <TextButton
                          label="Ocultar"
                          accessibilityLabel="Ocultar opções rápidas de bairro"
                          onPress={() => setShowNeighborhoodPicks(false)}
                        />
                      </View>
                      <View style={styles.chipRow}>
                        {PIRIPIRI_NEIGHBORHOODS.slice(0, NEIGHBORHOOD_QUICK_PICKS).map((item) => (
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
                      <Text style={styles.chipsHelper}>
                        Escolha uma opção ou abra a lista completa no campo Bairro.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.quickPicksToggleRow}>
                      <TextButton
                        label="Opções rápidas de bairro"
                        accessibilityLabel="Mostrar opções rápidas de bairro"
                        onPress={() => setShowNeighborhoodPicks(true)}
                      />
                    </View>
                  )}

                  {/* Instagram */}
                  <TextField
                    label="Instagram"
                    accessibilityLabel="Instagram"
                    value={socialHandle}
                    onChangeText={(value) => editField("socialHandle", value, setSocialHandle)}
                    placeholder="@seuperfil"
                    autoCapitalize="none"
                    maxLength={MAX_SOCIAL_HANDLE_LENGTH}
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

            {/* Na web larga, a ação fica no fluxo do formulário; no celular, fica fixa no rodapé. */}
            {wide ? (
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
  const styles = useMemo(() => createStyles(colors), [colors]);
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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    photoActionsBlock: {
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[8],
    },
    photoActionsLabel: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
      fontWeight: tokens.fontWeight.semiBold,
    },
    photoActions: { flexDirection: "row", gap: tokens.spacing[12] },
    photoActionsStacked: { flexDirection: "column" },
    photoAction: { flex: 1 },
    removePhotoRow: {
      alignSelf: "flex-start",
      paddingTop: tokens.spacing[4],
    },
    formSection: {
      gap: tokens.spacing[14],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLow,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.5,
      elevation: 1,
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
      gap: tokens.spacing[20],
    },
    heroSection: {
      paddingBottom: tokens.spacing[4],
      gap: tokens.spacing[4],
    },
    columns: { gap: tokens.spacing[16] },
    columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
    column: { gap: tokens.spacing[16] },
    columnHalf: { flex: 1 },
    heroTitle: {
      ...tokens.typography.brandHeadline,
      color: colors.brandBrown,
      // A serifada da marca tem sobrehang à esquerda; um leve respiro evita que a primeira
      // letra encoste e seja recortada pela viewport do ScrollView.
      paddingLeft: tokens.spacing[4],
      paddingRight: tokens.spacing[8],
    },
    heroSubtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[6],
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
    fieldWrapper: {
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
      paddingVertical: tokens.spacing[8],
      backgroundColor: "transparent",
    },
    selectorContentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      flex: 1,
    },
    selectorIconWrap: {
      width: 28,
      height: 28,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHighest,
      alignItems: "center",
      justifyContent: "center",
    },
    notch: {
      position: "absolute",
      top: -8,
      left: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.extraSmall,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    floatingLabel: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    fieldValue: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
    },
    fieldPlaceholder: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
    },
    quickPicksToggleRow: {
      alignSelf: "flex-start",
      marginTop: -tokens.spacing[4],
    },
    chipsHelper: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    neighborhoodChipsArea: {
      marginTop: tokens.spacing[4],
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerHighest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    chipsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionLabel: {
      ...tokens.typography.labelMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurfaceVariant,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
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
    },
    stickyActionContent: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
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
