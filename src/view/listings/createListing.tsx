import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { StepProgress } from "@/view/components/StepProgress";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useFormErrorAnnouncer } from "@/view/useFormErrorAnnouncer";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";
import { CreateListingSuccess } from "@/view/listings/createListingSuccess";
import { CreateListingStep1 } from "@/view/listings/createListingStep1";
import { CreateListingStep2 } from "@/view/listings/createListingStep2";
import { CreateListingStep3 } from "@/view/listings/createListingStep3";

export type CreateListingProps = {
  sessionUserId: string | null;
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
  const errorRef = useFormErrorAnnouncer(state.error);

  const hasDraftContent = Boolean(
    state.title.trim() ||
      state.author.trim() ||
      state.description.trim() ||
      state.photoUrl.trim() ||
      state.neighborhood.trim() ||
      state.category.trim(),
  );

  const handleSubmit = async () => {
    const result = await actions.submit(sessionUserId);
    if (result) {
      setPublished(result);
      onCreated?.();
    }
  };

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
    <SafeAreaView style={styles.page}>
      <TopAppBar title={STEP_TITLES[step]} onBack={handleBack} />
      <ScrollView
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
              onGoToPhotos={() => setStep(2)}
              onContinue={() => setStep(2)}
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
              onContinue={() => setStep(3)}
              onBack={() => setStep(1)}
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
              onSubmit={() => void handleSubmit()}
              onBack={() => setStep(2)}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: tokens.spacing[16], paddingBottom: tokens.spacing[48] },
    content: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      gap: tokens.spacing[16],
    },
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
