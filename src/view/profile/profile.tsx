import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
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
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { Snackbar } from "@/view/components/Snackbar";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

export type ProfileProps = {
  onNavigateToSignIn?: () => void;
  /** Quando presente, exibe a barra superior com "Editar perfil" (Figma `07.02`). */
  onBack?: () => void;
};

const MAX_NAME_LENGTH = 60;
const MAX_SOCIAL_HANDLE_LENGTH = 60;
const MAX_PHONE_DIGITS = 11;

/**
 * Atalhos exibidos abaixo do campo de bairro. São os seis primeiros da lista oficial,
 * não um ranking de frequência: o rótulo diz "Bairros de Piripiri" para não inventar dado.
 */
const NEIGHBORHOOD_QUICK_PICKS = 6;

type FieldErrors = Partial<Record<"name" | "photoUrl" | "socialHandle" | "phone", string>>;

/**
 * Máscara progressiva de telefone brasileiro no formulário: aplica (XX) XXXXX-XXXX
 * enquanto a pessoa digita. O caso de uso já normaliza para somente dígitos ao salvar.
 */
export function formatPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);
  if (digits.length <= 2) return digits;
  const area = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${area}) ${rest}`;
  if (rest.length <= 8) return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/**
 * Validação preventiva espelhando as regras do domínio (`PublicProfileUseCases.updateProfile`
 * e `UserPreferencesUseCases.updatePreferences`) para exibir o erro no campo correspondente
 * antes de enviar qualquer requisição.
 */
function validateProfileFields(values: {
  name: string;
  photoUrl: string;
  socialHandle: string;
  phone: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  if (!name) {
    errors.name = "Informe um nome público.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `O nome público deve ter até ${MAX_NAME_LENGTH} caracteres.`;
  }

  const photoUrl = values.photoUrl.trim();
  if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
    errors.photoUrl = "A foto deve ser um link (http/https) válido.";
  }

  const socialHandle = values.socialHandle.trim();
  if (socialHandle && socialHandle.length > MAX_SOCIAL_HANDLE_LENGTH) {
    errors.socialHandle = `A rede social deve ter até ${MAX_SOCIAL_HANDLE_LENGTH} caracteres.`;
  }

  const phoneDigits = values.phone.replace(/\D/g, "");
  if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > MAX_PHONE_DIGITS)) {
    errors.phone = "Informe um telefone válido com DDD.";
  }

  return errors;
}

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

  useEffect(() => {
    if (!state.profile) return;
    setName(state.profile.name);
    setPhotoUrl(state.profile.photoUrl ?? "");
    setSocialHandle(state.profile.socialHandle ?? "");
  }, [state.profile]);

  useEffect(() => {
    if (!preferencesState.preferences) return;
    setPhone(preferencesState.preferences.phone ? formatPhoneMask(preferencesState.preferences.phone) : "");
    setNeighborhood(preferencesState.preferences.neighborhood ?? null);
  }, [preferencesState.preferences]);

  useEffect(() => {
    if (!authState.loading && !userId) onNavigateToSignIn?.();
  }, [authState.loading, userId, onNavigateToSignIn]);

  /**
   * Valores carregados servem de linha de base: depois de salvar, os casos de uso devolvem
   * perfil e preferências atualizados e `dirty` volta a ser falso sem código extra.
   */
  const baselinePhone = preferencesState.preferences?.phone
    ? formatPhoneMask(preferencesState.preferences.phone)
    : "";
  const dirty =
    name !== (state.profile?.name ?? "") ||
    photoUrl !== (state.profile?.photoUrl ?? "") ||
    socialHandle !== (state.profile?.socialHandle ?? "") ||
    phone !== baselinePhone ||
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
        header={<TopAppBar title="Editar perfil" onBack={onBack ?? (() => {})} />}
      >
        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>Entre para editar seu perfil</Text>
          <Text style={styles.guestText}>
            Suas informações ficam guardadas na sua conta. Entre ou crie uma para continuar.
          </Text>
          <FilledButton label="Entrar ou criar conta" onPress={onNavigateToSignIn ?? (() => {})} />
        </View>
      </ScreenContainer>
    );
  }

  const loading = state.loading || preferencesState.loading;
  const saving = state.saving || preferencesState.saving;
  const error = state.error ?? preferencesState.error;

  async function handleSave() {
    const errors = validateProfileFields({ name, photoUrl, socialHandle, phone });
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
        socialHandle: socialHandle.trim() || undefined,
      }),
      preferencesActions.update({
        phone: phone || undefined,
        neighborhood: neighborhood ?? undefined,
      }),
    ]);
    if (profileOk && preferencesOk) setSaved(true);
  }

  function handleRetryLoad() {
    actions.reload();
    preferencesActions.reload();
  }

  return (
    <ScreenContainer
      maxWidth={560}
      paddingTop={tokens.spacing[12]}
      paddingBottom={tokens.spacing[32]}
      header={<TopAppBar title="Editar perfil" onBack={requestBack} />}
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
          <ErrorState message={error} onRetry={handleRetryLoad} />
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
                photoUrl={photoUrl.trim() || undefined}
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
                onChangeText={(value) => editField("name", value, setName)}
                placeholder="Seu nome"
                autoCapitalize="words"
                maxLength={MAX_NAME_LENGTH}
                error={fieldErrors.name}
                helperText={fieldErrors.name ? undefined : `${name.trim().length}/${MAX_NAME_LENGTH}`}
                helperTextAlign="right"
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
                accessibilityLabel={
                  neighborhood
                    ? `Bairro selecionado: ${neighborhood}. Toque para alterar`
                    : "Nenhum bairro selecionado. Toque para escolher"
                }
                onPress={() => setIsNeighborhoodModalOpen(true)}
                style={styles.selectorField}
              >
                <View style={styles.selectorContainer}>
                  <View style={styles.notch}>
                    <Text style={styles.floatingLabel}>Bairro</Text>
                  </View>
                  <Text style={neighborhood ? styles.fieldValue : styles.fieldPlaceholder}>
                    {neighborhood ?? "Selecionar bairro"}
                  </Text>
                  <AppIcon
                    name="chevronDown"
                    size={20}
                    color={colors.m3.onSurfaceVariant}
                  />
                </View>
              </Pressable>

              {/* Atalhos de bairro: recolhidos por padrão para um seletor mais limpo; o seletor
                  acima abre a lista completa e o link abaixo revela os primeiros da lista oficial. */}
              {showNeighborhoodPicks ? (
                <View style={styles.neighborhoodChipsArea}>
                  <View style={styles.chipsHeader}>
                    <Text style={styles.sectionLabel}>Bairros de Piripiri</Text>
                    <TextButton
                      label="Recolher"
                      accessibilityLabel="Recolher atalhos de bairros"
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
                    Não achou o seu? Toque em "Selecionar bairro" para ver a lista completa.
                  </Text>
                </View>
              ) : (
                <TextButton
                  label="Ver bairros populares"
                  accessibilityLabel="Mostrar atalhos de bairros populares"
                  onPress={() => setShowNeighborhoodPicks(true)}
                />
              )}

              {/* Mensagem de privacidade (Figma 07.02) */}
              <Text style={styles.privacyHelper}>Seu e-mail fica privado.</Text>

              {/* Telefone/WhatsApp */}
              <TextField
                label="Telefone/WhatsApp"
                accessibilityLabel="Telefone/WhatsApp"
                value={phone}
                onChangeText={(value) => editField("phone", value, (raw) => setPhone(formatPhoneMask(raw)))}
                placeholder="(86) 99999-9999"
                keyboardType="phone-pad"
                maxLength={15}
                error={fieldErrors.phone}
                helperText="Visível apenas para quem negociar com você."
              />

              {/* Rede social */}
              <TextField
                label="Rede social"
                accessibilityLabel="Rede social"
                value={socialHandle}
                onChangeText={(value) => editField("socialHandle", value, setSocialHandle)}
                placeholder="@usuario"
                autoCapitalize="none"
                maxLength={MAX_SOCIAL_HANDLE_LENGTH}
                error={fieldErrors.socialHandle}
              />

              {/* Foto (link) */}
              <TextField
                label="Foto (link)"
                accessibilityLabel="Foto (link)"
                value={photoUrl}
                onChangeText={(value) => editField("photoUrl", value, setPhotoUrl)}
                placeholder="https://..."
                autoCapitalize="none"
                keyboardType="url"
                error={fieldErrors.photoUrl}
                helperText="Um link http/https com a imagem da sua foto."
              />

              {/* Hoje só dá para trocar a foto colando outro link; para removê-la é preciso
                  limpar o campo. O botão abaixo faz isso em um toque. */}
              {photoUrl.trim() ? (
                <TextButton
                  label="Remover foto"
                  accessibilityLabel="Remover foto do perfil"
                  onPress={() => editField("photoUrl", "", setPhotoUrl)}
                />
              ) : null}
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

            {/* 4. Ação Principal Fixa: "Salvar alterações" (Figma 07.02) */}
            <View style={styles.actionContainer}>
              <FilledButton
                label="Salvar alterações"
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
      marginBottom: tokens.spacing[8],
    },
    heroTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 30,
      lineHeight: 38,
      fontWeight: "700",
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
      alignItems: "center",
      justifyContent: "center",
      marginTop: tokens.spacing[8],
      marginBottom: tokens.spacing[24],
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
    fieldPlaceholder: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
    },
    chipsHelper: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    neighborhoodChipsArea: {
      marginTop: tokens.spacing[4],
      gap: tokens.spacing[8],
    },
    chipsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    errorBanner: {
      marginTop: tokens.spacing[16],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.error,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
    },
    errorBannerText: {
      flex: 1,
      color: colors.error,
      ...tokens.typography.bodyMedium,
    },
    actionContainer: {
      marginTop: tokens.spacing[32],
      width: "100%",
    },
    guestCard: {
      gap: tokens.spacing[12],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
      padding: tokens.spacing[24],
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
