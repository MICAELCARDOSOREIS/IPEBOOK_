import { useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BookCondition, BookModality } from "@/model/entities/book";
import {
  BOOK_CATEGORIES,
  BOOK_CONDITIONS,
  BOOK_CONDITION_LABELS,
  MAX_BOOK_DESCRIPTION_LENGTH,
} from "@/model/entities/book";
import {
  PIRIPIRI_MEETING_POINT_NAMES,
  PIRIPIRI_NEIGHBORHOODS,
  DEFAULT_PIRIPIRI_LOCATION,
} from "@/model/entities/location";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { categoryTone } from "@/view/categoryTone";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { Breadcrumb } from "@/view/components/Breadcrumb";
import { Checkbox } from "@/view/components/Checkbox";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useKeyboardVisible } from "@/view/useKeyboardVisible";
import { WEB_GUTTER } from "@/view/webLayout";
import { TopAppBar } from "@/view/components/TopAppBar";
import { makeEditListingViewModel } from "@/di/container";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

const EDIT_WIDE_MAX_WIDTH = 1080;

export type EditListingProps = {
  bookId: string;
  sessionUserId: string | null;
  onSaved?: () => void;
  onCancel?: () => void;
};

const MODALITIES: { value: BookModality; label: string }[] = [
  { value: "sale", label: "Venda" },
  { value: "trade", label: "Troca" },
  { value: "donation", label: "Doação" },
];

/** Categorias canônicas oferecidas na publicação e edição (ADR 0109). */
const CATEGORIES = BOOK_CATEGORIES;

/** Figma `04.09 · Editar anúncio` (nó `19:242`). */
export default function EditListing({
  bookId,
  sessionUserId,
  onSaved,
  onCancel,
}: EditListingProps) {
  const guardedCancel = useGuardedPress(onCancel);
  const guardedSaved = useGuardedPress(onSaved);
  const [state, actions] = makeEditListingViewModel(bookId, sessionUserId);
  const { colors, resolvedScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  // Web larga: foto e identificação de um lado, descrição e venda do outro.
  const wide = useIsWideWeb();
  const isKeyboardVisible = useKeyboardVisible();
  const scrollRef = useRef<any>(null);
  const authorInputRef = useRef<any>(null);
  const descInputRef = useRef<any>(null);
  const priceInputRef = useRef<any>(null);
  const titleY = useRef(140);
  const authorY = useRef(220);
  const descY = useRef(320);
  const priceY = useRef(460);
  const remainingDescriptionChars = MAX_BOOK_DESCRIPTION_LENGTH - state.description.length;
  const descriptionTooLong = remainingDescriptionChars < 0;

  const displayedCategories = useMemo(() => {
    if (state.category && !(CATEGORIES as readonly string[]).includes(state.category)) {
      return [state.category, ...CATEGORIES];
    }
    return CATEGORIES;
  }, [state.category]);

  const handleFocusField = (yOffset: number) => {
    if (wide) return;
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, yOffset - 24),
        animated: true,
      });
    }, 100);
  };

  const handleSubmit = async () => {
    const result = await actions.submit();
    if (result) guardedSaved();
  };

  if (state.loading) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar contentMaxWidth={wide ? EDIT_WIDE_MAX_WIDTH : 480} title="Editar anúncio" onBack={guardedCancel} />
        <View style={styles.statusContainer}>
          <LoadingState
            label="Carregando anúncio"
            srText="Carregando dados do anúncio…"
            variant="form"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (state.error && !state.book) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar contentMaxWidth={wide ? EDIT_WIDE_MAX_WIDTH : 480} title="Editar anúncio" onBack={guardedCancel} />
        <View style={styles.statusContainer}>
          <Text accessibilityRole="alert" style={styles.errorText}>
            {state.error}
          </Text>
          {onCancel && (
            <View style={styles.backButtonContainer}>
              <FilledButton label="Voltar" onPress={guardedCancel} />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar contentMaxWidth={wide ? EDIT_WIDE_MAX_WIDTH : 480} title="Editar anúncio" onBack={guardedCancel} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: wide
              ? tokens.spacing[48]
              : isKeyboardVisible
                ? 300
                : scrollBottomPadding.withoutBottomBar,
          },
        ]}
        {...standardVerticalScrollProps}
      >
        <View style={[styles.content, wide && styles.contentWide]}>
          {wide ? (
            <Breadcrumb
              items={[
                { label: "Estante", onPress: () => onCancel?.(), accessibilityLabel: "Voltar para Estante" },
                { label: state.title || "Anúncio", onPress: () => onCancel?.() },
                { label: "Editar", isCurrent: true },
              ]}
              style={styles.breadcrumb}
            />
          ) : null}
          <Text style={styles.subtitle}>Atualize as informações do seu livro.</Text>

          <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={[styles.column, wide && styles.columnHalf]}>
          <View style={styles.photoSection}>
            <Text style={styles.sectionLabel}>Foto da capa</Text>
            <View style={styles.photoRow}>
              <AddPhotoCard
                photoUrl={state.photoUrl}
                onPress={() => setShowPhotoInput(true)}
                onRemovePhoto={() => {
                  actions.setPhotoUrl("");
                  setShowPhotoInput(false);
                }}
              />
              {showPhotoInput || state.photoUrl ? (
                <View style={styles.photoInputContainer}>
                  <TextField
                    label="URL da foto da capa"
                    value={state.photoUrl}
                    onChangeText={actions.setPhotoUrl}
                    editable={!state.saving}
                    placeholder="https://exemplo.com/capa.jpg"
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <View style={styles.photoHelper}>
                  <Text style={styles.photoHelperTitle}>Adicione uma foto real</Text>
                  <Text style={styles.photoHelperText}>
                    Anúncios com foto da capa chamam mais atenção na comunidade de Piripiri.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View
            onLayout={(event) => {
              titleY.current = event.nativeEvent.layout.y;
            }}
          >
            <TextField
              label="Título do livro"
              value={state.title}
              onChangeText={actions.setTitle}
              editable={!state.saving}
              placeholder="Ex: Dom Casmurro"
              returnKeyType="next"
              onSubmitEditing={() => authorInputRef.current?.focus()}
              onFocus={() => handleFocusField(titleY.current)}
            />
          </View>

          <View
            onLayout={(event) => {
              authorY.current = event.nativeEvent.layout.y;
            }}
          >
            <TextField
              inputRef={authorInputRef}
              label="Autor do livro"
              value={state.author}
              onChangeText={actions.setAuthor}
              editable={!state.saving}
              placeholder="Ex: Machado de Assis"
              returnKeyType="next"
              onSubmitEditing={() => descInputRef.current?.focus()}
              onFocus={() => handleFocusField(authorY.current)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Categoria</Text>
            <View style={styles.modalityRow} testID="edit-listing-category-row">
              {displayedCategories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  accessibilityLabel={`Categoria ${category}`}
                  tone={categoryTone(category, resolvedScheme)}
                  selected={state.category === category}
                  onPress={() => actions.setCategory(state.category === category ? "" : category)}
                  disabled={state.saving}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Estado de conservação</Text>
            <View style={styles.modalityRow}>
              {BOOK_CONDITIONS.map((condition: BookCondition) => (
                <Chip
                  key={condition}
                  label={BOOK_CONDITION_LABELS[condition]}
                  accessibilityLabel={`Conservação ${BOOK_CONDITION_LABELS[condition]}`}
                  selected={state.condition === condition}
                  onPress={() =>
                    actions.setCondition(state.condition === condition ? null : condition)
                  }
                  disabled={state.saving}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Formato do anúncio</Text>
            <Checkbox
              label="Box ou coleção de livros"
              description="Marque se este anúncio reúne mais de um volume"
              checked={Boolean(state.isBox)}
              onChange={actions.setIsBox}
              disabled={state.saving}
            />
            {state.isBox ? (
              <View style={{ marginTop: tokens.spacing[8], paddingLeft: tokens.spacing[32] }}>
                <TextField
                  label="Quantidade de volumes (opcional)"
                  value={state.boxVolumesCount}
                  onChangeText={actions.setBoxVolumesCount}
                  editable={!state.saving}
                  placeholder="Ex: 3, 5, 7"
                  keyboardType="number-pad"
                  helperText="De 2 a 100 volumes componentes da coleção"
                />
              </View>
            ) : null}
          </View>

          </View>
          <View style={[styles.column, wide && styles.columnHalf]}>
          <View
            onLayout={(event) => {
              descY.current = event.nativeEvent.layout.y;
            }}
          >
            <TextField
              inputRef={descInputRef}
              label="Descrição"
              value={state.description}
              onChangeText={actions.setDescription}
              editable={!state.saving}
              placeholder="Ex: Marcas leves de uso, páginas completas."
              maxLength={MAX_BOOK_DESCRIPTION_LENGTH}
              helperText={`${state.description.length}/${MAX_BOOK_DESCRIPTION_LENGTH}`}
              multiline
              onFocus={() => handleFocusField(descY.current)}
              error={
                descriptionTooLong
                  ? `A descrição deve ter no máximo ${MAX_BOOK_DESCRIPTION_LENGTH} caracteres.`
                  : undefined
              }
            />
          </View>
          <Text style={styles.photoHelperText}>
            {remainingDescriptionChars >= 0
              ? `Restam ${remainingDescriptionChars} caracteres`
              : `Limite excedido em ${Math.abs(remainingDescriptionChars)} caracteres`}
          </Text>

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Modalidade</Text>
            <View style={styles.modalityRow}>
              {MODALITIES.map((m) => (
                <Chip
                  key={m.value}
                  label={m.label}
                  accessibilityLabel={`Modalidade ${m.label}`}
                  tone={colors.badge[m.value]}
                  selected={state.modality === m.value}
                  onPress={() => actions.setModality(m.value)}
                  disabled={state.saving}
                />
              ))}
            </View>
          </View>

          {state.modality === "sale" && (
            <View
              onLayout={(event) => {
                priceY.current = event.nativeEvent.layout.y;
              }}
            >
              <TextField
                inputRef={priceInputRef}
                label="Preço do livro"
                value={state.price}
                onChangeText={actions.setPrice}
                editable={!state.saving}
                keyboardType="decimal-pad"
                placeholder="Ex: 29,90"
                helperText="Informe o valor em reais (R$)"
                returnKeyType="done"
                onFocus={() => handleFocusField(priceY.current)}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Localidade da beta</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>Piripiri, PI (Beta exclusiva)</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Ponto de encontro / Retirada em Piripiri</Text>
            <View style={styles.modalityRow}>
              {["Piripiri (A combinar)", ...PIRIPIRI_MEETING_POINT_NAMES].map((locationName) => {
                const isSelected =
                  state.neighborhood === locationName ||
                  (locationName === "Piripiri (A combinar)" &&
                    (!state.neighborhood || state.neighborhood === "Piripiri" || state.neighborhood === "Centro"));
                return (
                  <Chip
                    key={locationName}
                    label={locationName}
                    accessibilityLabel={`Ponto de encontro ${locationName}`}
                    selected={isSelected}
                    onPress={() =>
                      actions.setNeighborhood(
                        locationName === "Piripiri (A combinar)" ? DEFAULT_PIRIPIRI_LOCATION : locationName,
                      )
                    }
                    disabled={state.saving}
                  />
                );
              })}
            </View>
          </View>

          </View>
          </View>

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {state.error}
            </Text>
          ) : null}

          {state.success ? (
            <Text accessibilityRole="alert" style={styles.successText}>
              Anúncio atualizado com sucesso!
            </Text>
          ) : null}

          <View style={styles.actionsContainer}>
            <FilledButton
              label="Salvar alterações"
              loading={state.saving}
              loadingLabel="Salvando"
              disabled={state.saving}
              onPress={() => void handleSubmit()}
            />

            {onCancel && (
              <View style={styles.cancelContainer}>
                <TextButton
                  label="Cancelar"
                  disabled={state.saving}
                  onPress={guardedCancel}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: tokens.spacing[48],
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  contentWide: { maxWidth: EDIT_WIDE_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_GUTTER },
  breadcrumb: { marginBottom: tokens.spacing[8] },
  columns: { gap: tokens.spacing[16] },
  columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
  column: { gap: tokens.spacing[16] },
  columnHalf: { flex: 1 },
  statusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  statusText: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    textAlign: "center",
  },
  backButtonContainer: {
    marginTop: tokens.spacing[16],
    width: "100%",
    maxWidth: 240,
  },
  subtitle: {
    ...tokens.typography.bodyLarge,
    color: colors.secondaryText,
    marginTop: tokens.spacing[4],
  },
  photoSection: {
    gap: tokens.spacing[8],
  },
  sectionLabel: {
    ...tokens.typography.labelMedium,
    color: colors.secondaryText,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing[12],
  },
  photoInputContainer: {
    flex: 1,
  },
  photoHelper: {
    flex: 1,
    justifyContent: "center",
    gap: tokens.spacing[4],
    paddingTop: tokens.spacing[4],
  },
  photoHelperTitle: {
    ...tokens.typography.bodyMedium,
    fontWeight: tokens.fontWeight.semiBold,
    color: colors.text,
  },
  photoHelperText: {
    ...tokens.typography.labelMedium,
    color: colors.secondaryText,
  },
  field: {
    gap: tokens.spacing[8],
  },
  modalityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[8],
  },
  locationContainer: {
    paddingVertical: tokens.spacing[12],
    paddingHorizontal: tokens.spacing[16],
    backgroundColor: colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.small,
    borderWidth: 1,
    borderColor: colors.action,
  },
  locationText: {
    ...tokens.typography.bodyMedium,
    color: colors.actionDeep,
    fontWeight: tokens.fontWeight.semiBold,
  },
  errorText: {
    ...tokens.typography.bodyMedium,
    color: colors.error,
  },
  successText: {
    ...tokens.typography.bodyMedium,
    color: colors.success,
    fontWeight: tokens.fontWeight.semiBold,
  },
  actionsContainer: {
    marginTop: tokens.spacing[8],
    gap: tokens.spacing[8],
  },
  cancelContainer: {
    opacity: 0.85,
  },
  });
}
