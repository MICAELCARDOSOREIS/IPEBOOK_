import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book, BookCondition, BookModality } from "@/model/entities/book";
import { BOOK_CONDITIONS, BOOK_CONDITION_LABELS, MAX_BOOK_DESCRIPTION_LENGTH } from "@/model/entities/book";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import { tokens } from "@/view/tokens";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { BookCover } from "@/view/components/BookCover";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { StepProgress } from "@/view/components/StepProgress";
import { Tag } from "@/view/components/Tag";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";

export type CreateListingProps = {
  sessionUserId: string | null;
  onCreated?: () => void;
  onCancel?: () => void;
  onViewMyListings?: () => void;
  onGoHome?: () => void;
};

const MODALITIES: { value: BookModality; label: string }[] = [
  { value: "sale", label: "Venda" },
  { value: "trade", label: "Troca" },
  { value: "donation", label: "Doação" },
];

/** Categorias sugeridas pela etapa de detalhes do Figma (`04.05`). */
const CATEGORIES = ["Literatura", "Infantil", "Didático", "Romance", "Outros"];

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
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState<Book | null>(null);

  const handleSubmit = async () => {
    const result = await actions.submit(sessionUserId);
    if (result) {
      setPublished(result);
      onCreated?.();
    }
  };

  if (published) {
    return (
      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <IconBadge icon="check" tone="action" />
            <Text accessibilityRole="header" style={styles.successTitle}>
              Seu livro ganhou um novo começo.
            </Text>
            <Text style={styles.subtitle}>
              O anúncio já aparece para leitores de Piripiri.
            </Text>

            <View style={styles.publishedRow}>
              <BookCover
                id={published.id}
                title={published.title}
                photoUrl={published.photoUrl}
                variant="list"
              />
              <View style={styles.publishedTexts}>
                <Tag variant={published.modality} />
                <Text style={styles.publishedTitle}>{published.title}</Text>
                <Text style={styles.publishedAuthor}>{published.author}</Text>
                {published.price !== undefined ? (
                  <Text style={styles.publishedPrice}>{`R$ ${published.price.toFixed(2)}`}</Text>
                ) : null}
              </View>
            </View>

            <Text style={styles.sectionLabel}>Próximos passos</Text>
            <View style={styles.nextStep}>
              <Text style={styles.nextStepNumber}>1</Text>
              <View style={styles.nextStepTexts}>
                <Text style={styles.nextStepTitle}>Espere o primeiro contato</Text>
                <Text style={styles.nextStepHint}>
                  Você recebe uma notificação quando alguém se interessar.
                </Text>
              </View>
            </View>
            <View style={styles.nextStep}>
              <Text style={styles.nextStepNumber}>2</Text>
              <View style={styles.nextStepTexts}>
                <Text style={styles.nextStepTitle}>Combine em local público</Text>
                <Text style={styles.nextStepHint}>
                  Escolham juntos o ponto, o dia e o horário.
                </Text>
              </View>
            </View>

            <FilledButton
              label="Ver meus anúncios"
              onPress={() => onViewMyListings?.()}
            />
            <TextButton label="Voltar ao início" onPress={() => onGoHome?.()} />
          </View>
        </ScrollView>
      </SafeAreaView>
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

          {step === 1 ? (
            <>
              <View style={styles.isbnCard}>
                <IconBadge icon="photo" tone="action" />
                <View style={styles.isbnTexts}>
                  <Text style={styles.isbnTitle}>Ler ISBN com a câmera</Text>
                  <Text style={styles.hint}>Preenche título e autor automaticamente.</Text>
                </View>
              </View>
              <Text style={styles.dividerText}>ou</Text>

              <View style={styles.field}>
                <Text style={styles.sectionLabel}>Modalidade</Text>
                <View style={styles.chipRow}>
                  {MODALITIES.map((modality) => (
                    <Chip
                      key={modality.value}
                      label={modality.label}
                      accessibilityLabel={`Modalidade ${modality.label}`}
                      selected={state.modality === modality.value}
                      onPress={() => actions.setModality(modality.value)}
                      disabled={state.loading}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.photoRow}>
                <AddPhotoCard
                  photoUrl={state.photoUrl}
                  onPress={() => setStep(2)}
                  onRemovePhoto={() => actions.setPhotoUrl("")}
                />
                <View style={styles.photoTexts}>
                  <TextField
                    label="Título"
                    value={state.title}
                    onChangeText={actions.setTitle}
                    editable={!state.loading}
                    placeholder="Ex: Dom Casmurro"
                  />
                  <TextField
                    label="Autor"
                    value={state.author}
                    onChangeText={actions.setAuthor}
                    editable={!state.loading}
                    placeholder="Ex: Machado de Assis"
                  />
                </View>
              </View>

              {state.modality === "sale" ? (
                <TextField
                  label="Preço (R$)"
                  value={state.price}
                  onChangeText={actions.setPrice}
                  editable={!state.loading}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 25,00"
                />
              ) : null}

              <Text style={styles.hint}>
                Foto leve, com boa luz. Conservação e bairro vêm na próxima etapa.
              </Text>

              {state.error ? (
                <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
              ) : null}

              <FilledButton label="Continuar" onPress={() => setStep(2)} />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text accessibilityRole="header" style={styles.title}>Mostre seu livro.</Text>
              <Text style={styles.subtitle}>
                Uma foto nítida ajuda a conhecer o estado do exemplar. Até 3 fotos.
              </Text>

              <View style={styles.photoGrid}>
                <AddPhotoCard
                  label="Foto da capa"
                  photoUrl={state.photoUrl}
                  onPress={() => undefined}
                  onRemovePhoto={() => actions.setPhotoUrl("")}
                />
                <AddPhotoCard
                  label="Lombada"
                  photoUrl={state.photos[0]}
                  onPress={() => undefined}
                  onRemovePhoto={() => actions.removePhoto(0)}
                />
                <AddPhotoCard
                  label="Páginas"
                  photoUrl={state.photos[1]}
                  onPress={() => undefined}
                  onRemovePhoto={() => actions.removePhoto(1)}
                />
              </View>

              <TextField
                label="Endereço da foto da capa"
                value={state.photoUrl}
                onChangeText={actions.setPhotoUrl}
                editable={!state.loading}
                placeholder="https://exemplo.com/capa.jpg"
                autoCapitalize="none"
                helperText="Capa ilustrativa: a foto real substitui esta prévia."
              />

              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>Dica de foto</Text>
                <Text style={styles.tipText}>
                  Luz natural, fundo liso e a capa inteira no quadro.
                </Text>
              </View>

              {state.error ? (
                <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
              ) : null}

              <FilledButton label="Usar estas fotos" onPress={() => setStep(3)} />
              <OutlinedButton label="Voltar à etapa anterior" onPress={() => setStep(1)} />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <View style={styles.field}>
                <Text style={styles.sectionLabel}>Conservação</Text>
                <View style={styles.chipRow}>
                  {BOOK_CONDITIONS.map((condition: BookCondition) => (
                    <Chip
                      key={condition}
                      label={BOOK_CONDITION_LABELS[condition]}
                      accessibilityLabel={`Conservação ${BOOK_CONDITION_LABELS[condition]}`}
                      selected={state.condition === condition}
                      onPress={() =>
                        actions.setCondition(state.condition === condition ? null : condition)
                      }
                      disabled={state.loading}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.sectionLabel}>Categoria</Text>
                <View style={styles.chipRow}>
                  {CATEGORIES.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      accessibilityLabel={`Categoria ${category}`}
                      selected={state.category === category}
                      onPress={() => actions.setCategory(state.category === category ? "" : category)}
                      disabled={state.loading}
                    />
                  ))}
                </View>
              </View>

              <TextField
                label="Descrição"
                value={state.description}
                onChangeText={actions.setDescription}
                editable={!state.loading}
                placeholder="Ex: Marcas leves de uso, páginas completas."
                maxLength={MAX_BOOK_DESCRIPTION_LENGTH}
                helperText={`${state.description.length}/${MAX_BOOK_DESCRIPTION_LENGTH}`}
              />

              <View style={styles.field}>
                <Text style={styles.sectionLabel}>Bairro para retirada</Text>
                <View style={styles.chipRow}>
                  {PIRIPIRI_NEIGHBORHOODS.map((neighborhood) => (
                    <Chip
                      key={neighborhood}
                      label={neighborhood}
                      accessibilityLabel={`Bairro ${neighborhood}`}
                      selected={state.neighborhood === neighborhood}
                      onPress={() =>
                        actions.setNeighborhood(state.neighborhood === neighborhood ? "" : neighborhood)
                      }
                      disabled={state.loading}
                    />
                  ))}
                </View>
                <Text style={styles.hint}>Só o bairro aparece no anúncio.</Text>
              </View>

              {state.error ? (
                <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
              ) : null}

              <FilledButton
                label="Publicar anúncio"
                loading={state.loading}
                loadingLabel="Publicando"
                onPress={() => void handleSubmit()}
              />
              <OutlinedButton
                label="Voltar à etapa anterior"
                disabled={state.loading}
                onPress={() => setStep(2)}
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  scrollContent: { padding: tokens.spacing[16], paddingBottom: tokens.spacing[48] },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: tokens.spacing[16],
  },
  field: { gap: tokens.spacing[8] },
  isbnCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    padding: tokens.spacing[12],
    borderRadius: tokens.radius.medium,
    backgroundColor: tokens.colors.m3.surfaceContainerLow,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
  },
  isbnTexts: { flex: 1, gap: tokens.spacing[4] },
  isbnTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  dividerText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  photoRow: { flexDirection: "row", gap: tokens.spacing[12], alignItems: "flex-start" },
  photoTexts: { flex: 1, gap: tokens.spacing[12] },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[12] },
  title: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    fontWeight: tokens.typography.displayLarge.fontWeight,
    color: tokens.colors.text,
  },
  successTitle: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    fontWeight: tokens.typography.displayLarge.fontWeight,
    color: tokens.colors.text,
  },
  subtitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    color: tokens.colors.secondaryText,
  },
  sectionLabel: {
    fontSize: tokens.typography.titleMedium.fontSize,
    lineHeight: tokens.typography.titleMedium.lineHeight,
    fontFamily: tokens.typography.titleMedium.fontFamily,
    fontWeight: tokens.typography.titleMedium.fontWeight,
    color: tokens.colors.text,
  },
  hint: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
  },
  tipBox: {
    backgroundColor: tokens.colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  tipTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontFamily: tokens.typography.titleMedium.fontFamily,
    fontWeight: tokens.typography.titleMedium.fontWeight,
    color: tokens.colors.text,
  },
  tipText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  publishedRow: {
    flexDirection: "row",
    gap: tokens.spacing[12],
    alignItems: "center",
  },
  publishedTexts: { flex: 1, gap: tokens.spacing[4] },
  publishedTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    lineHeight: tokens.typography.titleMedium.lineHeight,
    fontFamily: tokens.typography.titleMedium.fontFamily,
    fontWeight: tokens.typography.titleMedium.fontWeight,
    color: tokens.colors.text,
  },
  publishedAuthor: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
  },
  publishedPrice: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    fontWeight: "600",
    color: tokens.colors.action,
  },
  nextStep: { flexDirection: "row", gap: tokens.spacing[12], alignItems: "flex-start" },
  nextStepNumber: {
    width: 28,
    height: 28,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.soft,
    color: tokens.colors.action,
    textAlign: "center",
    lineHeight: 28,
    fontFamily: tokens.typography.labelMedium.fontFamily,
    fontWeight: "600",
  },
  nextStepTexts: { flex: 1, gap: 2 },
  nextStepTitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    fontWeight: "600",
    color: tokens.colors.text,
  },
  nextStepHint: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
  },
});
