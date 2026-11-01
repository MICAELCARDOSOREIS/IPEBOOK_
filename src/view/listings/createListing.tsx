import { useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book } from "@/model/entities/book";
import { BOOK_CONDITION_LABELS } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { BookCover } from "@/view/components/BookCover";
import { AppIcon } from "@/view/components/AppIcon";
import { Tag } from "@/view/components/Tag";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { FilledButton } from "@/view/components/FilledButton";
import { StepProgress } from "@/view/components/StepProgress";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useFormErrorAnnouncer } from "@/view/useFormErrorAnnouncer";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";
import { useListingPhotoViewModel } from "@/viewmodel/useListingPhotoViewModel";
import {
  validateListingBasics,
  type ListingBasicsErrors,
} from "@/viewmodel/listingBasicsValidation";
import { CreateListingSuccess } from "@/view/listings/createListingSuccess";
import { CreateListingStep1 } from "@/view/listings/createListingStep1";
import { CreateListingStep2 } from "@/view/listings/createListingStep2";
import { CreateListingStep3 } from "@/view/listings/createListingStep3";

export type CreateListingProps = {
  sessionUserId: string | null;
  /** Rascunho no servidor a retomar (Spec 017), vindo da rota `/rascunhos`. */
  initialDraftId?: string;
  onCreated?: () => void;
  onCancel?: () => void;
  onViewMyListings?: () => void;
  onGoHome?: () => void;
};

const TOTAL_STEPS = 3;

const STEP_TITLES: Record<number, string> = {
  1: "Anunciar livro",
  2: "Fotos do livro",
  3: "Detalhes do livro",
};

const STEP_LABELS: Record<number, string> = {
  1: "Livro",
  2: "Fotos",
  3: "Detalhes",
};

/**
 * Fluxo de publicação em três etapas, conforme o Figma `04.01 · Anunciar — etapa 1` (nó
 * `12:210`), `04.04 · Mostre seu livro` (nó `28:685`) e `04.05 · Detalhes do livro` (nó
 * `12:360`), terminando em `04.07 · Anúncio publicado` (nó `12:418`).
 */
export default function CreateListing({
  sessionUserId,
  initialDraftId,
  onCreated,
  onCancel,
  onViewMyListings,
  onGoHome,
}: CreateListingProps) {
  const [state, actions] = useCreateListingViewModel();
  const [photoState, photoActions] = useListingPhotoViewModel(sessionUserId);
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors, wideWeb), [colors, wideWeb]);
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState<Book | null>(null);
  // Erros da etapa 1 só aparecem depois da primeira tentativa de avançar.
  const [basicsTouched, setBasicsTouched] = useState(false);
  const errorRef = useFormErrorAnnouncer(state.error);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const isMountedRef = useRef(false);

  const hasDraftContent = Boolean(
    state.isbn.trim() ||
      state.title.trim() ||
      state.author.trim() ||
      state.description.trim() ||
      state.photoUrl.trim() ||
      state.neighborhood.trim() ||
      state.category.trim() ||
      state.price.trim() ||
      state.photos.length > 0 ||
      state.condition !== null,
  );

  useEffect(() => {
    if (initialDraftId) {
      let active = true;
      void actions.loadServerDraft(initialDraftId).then((step) => {
        if (active && step) {
          setStep(step);
        }
      });
      return () => {
        active = false;
      };
    }
    void actions.loadDraft();
  }, [initialDraftId]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (hasDraftContent && !published && !state.success) {
      void actions.saveDraft();
    }
  }, [
    hasDraftContent,
    published,
    state.success,
    state.isbn,
    state.title,
    state.author,
    state.category,
    state.modality,
    state.price,
    state.neighborhood,
    state.condition,
    state.description,
    state.photoUrl,
    state.photos,
    actions,
  ]);

  const basicsErrors: ListingBasicsErrors = basicsTouched
    ? validateListingBasics({
        title: state.title,
        author: state.author,
        modality: state.modality,
        price: state.price,
      })
    : {};

  // Cada etapa começa do topo, senão a nova tela abre no meio do conteúdo anterior.
  useEffect(() => {
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  }, [step]);

  // No Android, o botão/gesto Voltar recua uma etapa em vez de abandonar o anúncio.
  useEffect(() => {
    if (published || step === 1) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setStep((current) => current - 1);
      return true;
    });
    return () => sub.remove();
  }, [published, step]);

  const handleGoToStep2 = () => {
    const errors = validateListingBasics({
      title: state.title,
      author: state.author,
      modality: state.modality,
      price: state.price,
    });
    if (Object.keys(errors).length > 0) {
      setBasicsTouched(true);
      scrollRef.current?.scrollTo?.({ y: 0, animated: true });
      return;
    }
    void actions.saveDraft();
    setStep(2);
  };

  const handleGoToStep3 = () => {
    void actions.saveDraft();
    setStep(3);
  };

  const handleSubmit = async () => {
    const result = await actions.submit(sessionUserId);
    if (result) {
      setPublished(result);
      onCreated?.();
    }
  };

  const handleSaveForLater = async () => {
    const saved = await actions.saveForLater(sessionUserId, step);
    if (saved) {
      onCancel?.();
    }
  };

  // Com a barra de ações fixa, o erro da submissão fica no fim do conteúdo rolável.
  useEffect(() => {
    if (published || !state.error) return;
    // `scrollToEnd` pode não existir no ambiente de teste do ScrollView.
    scrollRef.current?.scrollToEnd?.({ animated: true });
  }, [published, state.error]);

  if (published) {
    return (
      <CreateListingSuccess
        published={published}
        onViewMyListings={onViewMyListings}
        onGoHome={onGoHome}
      />
    );
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      return;
    }
    onCancel?.();
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <TopAppBar contentMaxWidth={wideWeb ? 1040 : undefined} title={STEP_TITLES[step]} onBack={handleBack} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={wideWeb ? styles.wideLayout : undefined}>
        <View style={styles.content}>
          {wideWeb ? (
            <View style={styles.webStepperCard}>
              <View style={styles.webStepperRow}>
                {/* 1. Livro */}
                <View style={[styles.webStepItem, step >= 1 && styles.webStepItemActive]}>
                  <View
                    style={[
                      styles.webStepBadge,
                      step > 1 ? styles.webStepBadgeDone : step === 1 ? styles.webStepBadgeActive : styles.webStepBadgePending,
                    ]}
                  >
                    {step > 1 ? (
                      <AppIcon name="check" size={14} color="#FFF" />
                    ) : (
                      <Text style={[styles.webStepBadgeText, step === 1 && styles.webStepBadgeTextActive]}>1</Text>
                    )}
                  </View>
                  <View style={styles.webStepTextCol}>
                    <Text style={[styles.webStepTitle, step === 1 && styles.webStepTitleActive]}>1. Livro</Text>
                    <Text style={styles.webStepSubtitle}>Título e modalidade</Text>
                  </View>
                </View>

                <View style={[styles.webStepConnector, step > 1 && styles.webStepConnectorDone]} />

                {/* 2. Fotos */}
                <View style={[styles.webStepItem, step >= 2 && styles.webStepItemActive]}>
                  <View
                    style={[
                      styles.webStepBadge,
                      step > 2 ? styles.webStepBadgeDone : step === 2 ? styles.webStepBadgeActive : styles.webStepBadgePending,
                    ]}
                  >
                    {step > 2 ? (
                      <AppIcon name="check" size={14} color="#FFF" />
                    ) : (
                      <Text style={[styles.webStepBadgeText, step === 2 && styles.webStepBadgeTextActive]}>2</Text>
                    )}
                  </View>
                  <View style={styles.webStepTextCol}>
                    <Text style={[styles.webStepTitle, step === 2 && styles.webStepTitleActive]}>2. Fotos</Text>
                    <Text style={styles.webStepSubtitle}>Capa e páginas</Text>
                  </View>
                </View>

                <View style={[styles.webStepConnector, step > 2 && styles.webStepConnectorDone]} />

                {/* 3. Detalhes */}
                <View style={[styles.webStepItem, step >= 3 && styles.webStepItemActive]}>
                  <View
                    style={[
                      styles.webStepBadge,
                      step === 3 ? styles.webStepBadgeActive : styles.webStepBadgePending,
                    ]}
                  >
                    <Text style={[styles.webStepBadgeText, step === 3 && styles.webStepBadgeTextActive]}>3</Text>
                  </View>
                  <View style={styles.webStepTextCol}>
                    <Text style={[styles.webStepTitle, step === 3 && styles.webStepTitleActive]}>3. Detalhes</Text>
                    <Text style={styles.webStepSubtitle}>Estado e bairro</Text>
                  </View>
                </View>
              </View>

              {/* Barra de progresso contínuo e acessibilidade para leitores e testes */}
              <View style={styles.webProgressTrackArea}>
                <View style={styles.webProgressTrack}>
                  <View testID="step-progress-fill" style={[styles.webProgressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
                </View>
                <Text style={styles.webStepAccessibilityLabel}>{`Etapa ${step} de ${TOTAL_STEPS}`}</Text>
              </View>
            </View>
          ) : (
            <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} stepLabel={STEP_LABELS[step]} />
          )}

          {hasDraftContent ? (
            <View style={styles.draftBanner}>
              <Text style={styles.draftBannerText}>Rascunho salvo neste aparelho</Text>
              <TextButton
                label="Limpar rascunho"
                onPress={() => {
                  actions.reset();
                  setBasicsTouched(false);
                  setStep(1);
                }}
              />
            </View>
          ) : null}

          <View style={wideWeb ? styles.formCardWeb : undefined}>
            {step === 1 ? (
              <CreateListingStep1
                isbn={state.isbn}
                lookingUpIsbn={state.lookingUpIsbn}
                isbnFeedback={state.isbnFeedback}
                onSetIsbn={actions.setIsbn}
                onLookupIsbn={() => void actions.lookupIsbn()}
                onScanBarcode={(code) => void actions.handleBarcodeScanned(code)}
                modality={state.modality}
                title={state.title}
                author={state.author}
                price={state.price}
                photoUrl={state.photoUrl}
                loading={state.loading}
                error={state.error}
                errorRef={errorRef}
                onSetModality={actions.setModality}
                onSetTitle={actions.setTitle}
                onSetAuthor={actions.setAuthor}
                onSetPrice={actions.setPrice}
                onSetPhotoUrl={actions.setPhotoUrl}
                fieldErrors={basicsErrors}
                onGoToPhotos={() => setStep(2)}
              />
            ) : null}

            {step === 2 ? (
              <CreateListingStep2
                photoUrl={state.photoUrl}
                photos={state.photos}
                loading={state.loading}
                error={state.error}
                errorRef={errorRef}
                onSetPhotoUrl={actions.setPhotoUrl}
                onRemovePhoto={actions.removePhoto}
                uploading={photoState.uploading}
                photoError={photoState.error}
                onChoosePhoto={(slot, source) => {
                  void photoActions.choose(source).then((url) => {
                    if (!url) return;
                    if (slot === "cover") actions.setPhotoUrl(url);
                    else actions.addPhoto(url);
                  });
                }}
              />
            ) : null}

            {step === 3 ? (
              <CreateListingStep3
                condition={state.condition}
                category={state.category}
                description={state.description}
                neighborhood={state.neighborhood}
                isBox={state.isBox}
                boxVolumesCount={state.boxVolumesCount}
                loading={state.loading}
                error={state.error}
                errorRef={errorRef}
                onSetCondition={actions.setCondition}
                onSetCategory={actions.setCategory}
                onSetDescription={actions.setDescription}
                onSetNeighborhood={actions.setNeighborhood}
                onSetIsBox={actions.setIsBox}
                onSetBoxVolumesCount={actions.setBoxVolumesCount}
              />
            ) : null}
          </View>
        </View>
        {wideWeb ? (
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <View style={styles.previewLiveBadge}>
                <View style={styles.previewLiveDot} />
                <Text style={styles.previewLiveText}>PRÉVIA EM TEMPO REAL</Text>
              </View>
              <Text style={styles.previewHint}>Como os leitores em Piripiri verão seu anúncio</Text>
            </View>
            <View style={styles.previewBook}>
              <BookCover id="previa" title={state.title.trim() || "Título do livro"} author={state.author.trim() || undefined} photoUrl={state.photoUrl || undefined} variant="detail" />
              <Text style={styles.previewTitle}>{state.title.trim() || "Título do livro"}</Text>
              <Text style={styles.previewAuthor}>{state.author.trim() || "Autor"}</Text>
              <View style={styles.previewLocationRow}>
                <AppIcon name="place" size={14} color={colors.secondaryText} />
                <Text style={styles.previewLocationText}>
                  {state.neighborhood.trim() ? `${state.neighborhood.trim()}, Piripiri` : "Piripiri (retirada local)"}
                </Text>
              </View>
              <View style={styles.previewMeta}>
                <Text style={styles.previewPrice}>
                  {state.modality === "sale"
                    ? (state.price.trim() ? `R$ ${state.price.trim()}` : "R$ —")
                    : state.modality === "trade"
                      ? "Para trocar"
                      : "Gratuito"}
                </Text>
                <Tag variant={state.modality} />
                {state.isBox ? (
                  <Tag
                    variant="box"
                    label={state.boxVolumesCount ? `Box (${state.boxVolumesCount} vols)` : "Box"}
                  />
                ) : null}
                {state.category.trim() ? (
                  <Tag variant="available" label={state.category.trim()} />
                ) : null}
              </View>
              {state.condition ? (
                <View style={styles.previewConditionRow}>
                  <AppIcon name="conservation" size={14} color={colors.secondaryText} />
                  <Text style={styles.previewConditionText}>
                    {BOOK_CONDITION_LABELS[state.condition]}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.previewNoteBox}>
              <View style={styles.previewNoteHeader}>
                <View style={styles.previewLockBadge}>
                  <AppIcon name="lock" size={12} color={colors.action} />
                </View>
                <Text style={styles.previewNoteTitle}>Privacidade e Segurança</Text>
              </View>
              <Text style={styles.previewNote}>
                Privacidade garantida: Só o bairro aparece no anúncio. Seu endereço, nome completo e e-mail ficam protegidos.
              </Text>
            </View>
          </View>
        ) : null}
        </View>
      </ScrollView>

      {/* Barra de ação */}
      <SafeAreaView edges={["bottom"]} style={styles.actionBar}>
        <View style={styles.actionBarInner}>
          {wideWeb ? (
            <View style={styles.webActionRow}>
              <View style={styles.webSecondaryActions}>
                <TextButton
                  label="Salvar para depois"
                  disabled={state.loading}
                  onPress={() => void handleSaveForLater()}
                />
              </View>
              <View style={styles.webPrimaryActions}>
                {step > 1 ? (
                  <TextButton
                    label="Voltar à etapa anterior"
                    disabled={state.loading}
                    onPress={() => setStep(step - 1)}
                  />
                ) : null}
                <View style={styles.webPrimaryButtonWrapper}>
                  {step === 1 ? (
                    <FilledButton label="Continuar" onPress={handleGoToStep2} />
                  ) : null}

                  {step === 2 ? <FilledButton label="Usar estas fotos" onPress={handleGoToStep3} /> : null}

                  {step === 3 ? (
                    <FilledButton
                      label="Publicar anúncio"
                      loading={state.loading}
                      loadingLabel="Publicando"
                      onPress={() => void handleSubmit()}
                    />
                  ) : null}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.actionButtonsCol}>
              {step === 1 ? (
                <FilledButton label="Continuar" onPress={handleGoToStep2} />
              ) : null}

              {step === 2 ? <FilledButton label="Usar estas fotos" onPress={handleGoToStep3} /> : null}

              {step === 3 ? (
                <FilledButton
                  label="Publicar anúncio"
                  loading={state.loading}
                  loadingLabel="Publicando"
                  onPress={() => void handleSubmit()}
                />
              ) : null}

              {/* Ações secundárias lado a lado */}
              <View style={styles.secondaryRow}>
                {step > 1 ? (
                  <TextButton label="Voltar à etapa anterior" disabled={state.loading} onPress={() => setStep(step - 1)} />
                ) : null}
                <TextButton
                  label="Salvar para depois"
                  disabled={state.loading}
                  onPress={() => void handleSaveForLater()}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette, wideWeb: boolean) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      padding: tokens.spacing[16],
      paddingBottom: wideWeb ? 160 : tokens.spacing[32],
    },
    wideLayout: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: tokens.spacing[40],
      width: "100%",
      maxWidth: 1040,
      alignSelf: "center",
      paddingTop: tokens.spacing[16],
    },
    webStepperCard: {
      width: "100%",
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[12],
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    webStepperRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    webStepItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      opacity: 0.7,
    },
    webStepItemActive: {
      opacity: 1,
    },
    webStepBadge: {
      width: 28,
      height: 28,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    webStepBadgePending: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    webStepBadgeActive: {
      backgroundColor: colors.action,
    },
    webStepBadgeDone: {
      backgroundColor: colors.actionDeep,
    },
    webStepBadgeText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.bold,
    },
    webStepBadgeTextActive: {
      color: "#FFFFFF",
    },
    webStepTextCol: {
      gap: 2,
    },
    webStepTitle: {
      ...tokens.typography.labelLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.secondaryText,
    },
    webStepTitleActive: {
      color: colors.text,
      fontWeight: tokens.fontWeight.bold,
    },
    webStepSubtitle: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      fontSize: 11,
    },
    webStepConnector: {
      flex: 1,
      height: 2,
      backgroundColor: colors.m3.outlineVariant,
      marginHorizontal: tokens.spacing[12],
    },
    webStepConnectorDone: {
      backgroundColor: colors.action,
    },
    webProgressTrackArea: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: tokens.spacing[4],
    },
    webProgressTrack: {
      flex: 1,
      height: 4,
      backgroundColor: colors.m3.secondaryContainer,
      borderRadius: tokens.radius.full,
      overflow: "hidden",
      marginRight: tokens.spacing[12],
    },
    webProgressFill: {
      height: 4,
      backgroundColor: colors.action,
      borderRadius: tokens.radius.full,
    },
    webStepAccessibilityLabel: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      fontSize: 12,
    },
    formCardWeb: {
      width: "100%",
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderRadius: tokens.radius.xl,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[24],
      gap: tokens.spacing[18],
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    previewCard: {
      width: 360,
      maxWidth: "38%",
      flexShrink: 0,
      gap: tokens.spacing[16],
      padding: tokens.spacing[20],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      position: wideWeb ? ("sticky" as "relative") : "relative",
      top: tokens.spacing[24],
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 1,
    },
    previewCardHeader: {
      gap: tokens.spacing[6],
    },
    previewLiveBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.soft,
      paddingVertical: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      alignSelf: "flex-start",
    },
    previewLiveDot: {
      width: 7,
      height: 7,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.action,
    },
    previewLiveText: {
      ...tokens.typography.labelSmall,
      color: colors.actionDeep,
      fontWeight: tokens.fontWeight.bold,
      fontSize: 10,
      letterSpacing: 0.8,
    },
    previewHint: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
    },
    previewLabel: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    previewBook: {
      gap: tokens.spacing[8],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    previewTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.m3.onSurface,
    },
    previewAuthor: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    previewLocationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
    },
    previewLocationText: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      fontSize: 12,
    },
    previewMeta: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[2],
    },
    previewPrice: {
      ...tokens.typography.labelLarge,
      fontWeight: tokens.fontWeight.bold,
      color: colors.m3.onSurface,
    },
    previewConditionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
    },
    previewConditionText: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      fontSize: 11,
    },
    previewNoteBox: {
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[12],
      gap: tokens.spacing[6],
    },
    previewNoteHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    previewLockBadge: {
      width: 20,
      height: 20,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.soft,
      alignItems: "center",
      justifyContent: "center",
    },
    previewNoteTitle: {
      ...tokens.typography.labelSmall,
      color: colors.actionDeep,
      fontWeight: tokens.fontWeight.bold,
      fontSize: 11,
    },
    previewNote: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      lineHeight: 16,
      fontSize: 11,
    },
    content: {
      width: wideWeb ? 640 : "100%",
      maxWidth: wideWeb ? 640 : 560,
      alignSelf: "center",
      gap: tokens.spacing[16],
    },
    actionBar: {
      width: "100%",
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 4,
    },
    actionBarInner: {
      width: "100%",
      maxWidth: wideWeb ? 1040 : 560,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[12],
      paddingBottom: tokens.spacing[12],
    },
    webActionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    webSecondaryActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    webPrimaryActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    webPrimaryButtonWrapper: {
      minWidth: 200,
    },
    actionButtonsCol: {
      width: wideWeb ? 640 : "100%",
      gap: tokens.spacing[8],
    },
    secondaryRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: tokens.spacing[8] },
    draftBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    draftBannerText: {
      ...tokens.typography.labelMedium,
      color: colors.actionDeep,
      fontWeight: tokens.fontWeight.semiBold,
    },
  });
}
