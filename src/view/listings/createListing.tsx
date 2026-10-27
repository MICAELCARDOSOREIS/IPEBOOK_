import { useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { FilledButton } from "@/view/components/FilledButton";
import { StepProgress } from "@/view/components/StepProgress";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useFormErrorAnnouncer } from "@/view/useFormErrorAnnouncer";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      <TopAppBar title={STEP_TITLES[step]} onBack={handleBack} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} stepLabel={STEP_LABELS[step]} />

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
            />
          ) : null}

          {step === 3 ? (
            <CreateListingStep3
              condition={state.condition}
              category={state.category}
              description={state.description}
              neighborhood={state.neighborhood}
              loading={state.loading}
              error={state.error}
              errorRef={errorRef}
              onSetCondition={actions.setCondition}
              onSetCategory={actions.setCategory}
              onSetDescription={actions.setDescription}
              onSetNeighborhood={actions.setNeighborhood}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Barra de ação fixa do Figma: nós `12:269`, `28:750` e `12:413` (`surface-container`). O desvio do teclado é da raiz única (Spec 088). */}
      <SafeAreaView edges={["bottom"]} style={styles.actionBar}>
        <View style={styles.actionBarInner}>
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

          {/* Ações secundárias lado a lado: a barra fixa ocupava três linhas e escondia o formulário. */}
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
      </SafeAreaView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: tokens.spacing[16], paddingBottom: tokens.spacing[24] },
    content: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      gap: tokens.spacing[16],
    },
    actionBar: {
      width: "100%",
      backgroundColor: colors.m3.surfaceContainer,
    },
    actionBarInner: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[4],
    },
    secondaryRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
    draftBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.soft,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    draftBannerText: {
      ...tokens.typography.labelMedium,
      color: colors.actionDeep,
      fontWeight: "600",
    },
  });
}
