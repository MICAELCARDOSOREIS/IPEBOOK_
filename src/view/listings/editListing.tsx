import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ImageSource } from "@/model/services/iImagePickerService";
import type { BookCondition, BookModality } from "@/model/entities/book";
import {
  BOOK_CATEGORIES,
  BOOK_CONDITIONS,
  BOOK_CONDITION_LABELS,
  MAX_BOOK_DESCRIPTION_LENGTH,
} from "@/model/entities/book";
import {
  PIRIPIRI_MEETING_POINT_NAMES,
  DEFAULT_PIRIPIRI_LOCATION,
} from "@/model/entities/location";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { categoryTone } from "@/view/categoryTone";
import { formatPrice } from "@/view/formatPrice";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { AppIcon } from "@/view/components/AppIcon";
import { Breadcrumb } from "@/view/components/Breadcrumb";
import { Checkbox } from "@/view/components/Checkbox";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { OpenAppSettingsButton } from "@/view/components/OpenAppSettingsButton";
import { PermissionPromptDialog } from "@/view/components/PermissionPromptDialog";
import { hasPhotoPermission } from "@/view/listings/photoPermission";
import { PhotoSourceSheet } from "@/view/components/PhotoSourceSheet";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useKeyboardVisible } from "@/view/useKeyboardVisible";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";
import { TopAppBar } from "@/view/components/TopAppBar";
import { makeEditListingViewModel, makeListingPhotoViewModel, makeNetworkStatus } from "@/di/container";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

const EDIT_WIDE_MAX_WIDTH = WEB_MAX_WIDTH;

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
  const [photoState, photoActions] = makeListingPhotoViewModel(sessionUserId);
  const { isOnline } = makeNetworkStatus();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [sheetSlot, setSheetSlot] = useState<{ slot: "cover" | "extra"; index?: number } | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<{
    slot: "cover" | "extra";
    index?: number;
    source: ImageSource;
  } | null>(null);
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
  const parsedPrice = Number(state.price.trim().replace(",", "."));
  const priceHelperText =
    state.price.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0
      ? `Será exibido como ${formatPrice(parsedPrice)}`
      : "Informe o valor em reais (R$)";
  const sectionFieldBg = colors.m3.surfaceContainerLow;

  const displayedCategories = useMemo(() => {
    if (state.category && !(CATEGORIES as readonly string[]).includes(state.category)) {
      return [state.category, ...CATEGORIES];
    }
    return CATEGORIES;
  }, [state.category]);

  const handleFocusField = (yOffset: number) => {
    // Na Web o próprio navegador gerencia rolagem e foco sem competir com scrollTo.
    if (wide || Platform.OS === "web") return;
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

  const handleRemoveExtraPhoto = (index: number) => {
    if (actions.setPhotoAt) actions.setPhotoAt(index, "");
    else actions.removePhoto(index);
  };

  const handleChoosePhoto = (slot: "cover" | "extra", source: ImageSource, slotIndex?: number) => {
    const side =
      slot === "cover" ? "cover" : slotIndex === 0 ? "spine" : slotIndex === 1 ? "back" : undefined;
    void photoActions.choose(source, side).then((url) => {
      if (!url) return;
      if (slot === "cover") actions.setPhotoUrl(url);
      else if (slotIndex !== undefined && actions.setPhotoAt) actions.setPhotoAt(slotIndex, url);
      else actions.addPhoto(url);
    });
  };

  const bookSide =
    sheetSlot?.slot === "cover"
      ? "cover"
      : sheetSlot?.index === 0
        ? "spine"
        : sheetSlot?.index === 1
          ? "back"
          : undefined;
  const photoTitle =
    bookSide === "spine" ? "Foto da lombada" : bookSide === "back" ? "Foto do verso" : "Foto da capa";

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
          {isOnline ? (
            <ErrorState message={state.error} onRetry={() => void actions.load()} />
          ) : (
            <OfflineState onRetry={() => void actions.load()} />
          )}
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
    <SafeAreaView edges={wide ? ["top", "left", "right", "bottom"] : ["top", "left", "right"]} style={styles.page}>
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
                : scrollBottomPadding.withBottomBar,
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
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fotos do livro</Text>
              <Text style={styles.sectionHint}>Toque para trocar ou no X para remover</Text>
            </View>
            <View style={styles.photoGrid}>
              <AddPhotoCard
                label="Foto da capa"
                photoUrl={state.photoUrl || undefined}
                onPress={() => setSheetSlot({ slot: "cover" })}
                onRemovePhoto={() => {
                  actions.setPhotoUrl("");
                  setShowPhotoInput(false);
                }}
                style={styles.coverSlot}
              />
              <View style={styles.sideSlots}>
                <AddPhotoCard
                  label="Lombada"
                  photoUrl={state.photos[0] || undefined}
                  onPress={() => setSheetSlot({ slot: "extra", index: 0 })}
                  onRemovePhoto={() => handleRemoveExtraPhoto(0)}
                  style={styles.sideSlot}
                />
                <AddPhotoCard
                  label="Verso"
                  photoUrl={state.photos[1] || undefined}
                  onPress={() => setSheetSlot({ slot: "extra", index: 1 })}
                  onRemovePhoto={() => handleRemoveExtraPhoto(1)}
                  style={styles.sideSlot}
                />
              </View>
            </View>
            {photoState.uploading ? (
              <View accessibilityLiveRegion="polite" style={styles.uploadingRow}>
                <ActivityIndicator color={colors.action} accessibilityLabel="Enviando foto" />
                <Text style={styles.photoHelperText}>Enviando a foto…</Text>
              </View>
            ) : null}
            {photoState.error ? (
              <View style={styles.photoErrorBlock}>
                <InlineErrorCard message={photoState.error} />
                {Platform.OS === "ios" && photoState.permissionDenied ? <OpenAppSettingsButton /> : null}
              </View>
            ) : null}
            {showPhotoInput ? (
              <View style={styles.photoUrlBlock}>
                <TextField
                  label="URL da foto da capa"
                  labelBackgroundColor={sectionFieldBg}
                  value={state.photoUrl}
                  onChangeText={actions.setPhotoUrl}
                  editable={!state.saving}
                  placeholder="https://exemplo.com/capa.jpg"
                  autoCapitalize="none"
                />
                <View style={styles.photoLinkToggleRow}>
                  <TextButton
                    label="Ocultar link da capa"
                    disabled={state.saving}
                    onPress={() => setShowPhotoInput(false)}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.photoLinkToggleRow}>
                <TextButton
                  label={state.photoUrl ? "Editar link da capa" : "Prefiro colar o link da capa"}
                  disabled={state.saving}
                  onPress={() => setShowPhotoInput(true)}
                />
              </View>
            )}
          </View>

          <PhotoSourceSheet
            visible={sheetSlot !== null}
            title={photoTitle}
            bookSide={bookSide}
            onChoose={(source) => {
              const slot = sheetSlot;
              setSheetSlot(null);
              if (!slot) return;
              void hasPhotoPermission(source).then((granted) => {
                if (granted) {
                  handleChoosePhoto(slot.slot, source, slot.index);
                } else {
                  setPendingPhoto({ ...slot, source });
                }
              });
            }}
            onClose={() => setSheetSlot(null)}
          />

          <PermissionPromptDialog
            permission="photos"
            status={pendingPhoto ? "explain" : "idle"}
            onAllow={() => {
              const pending = pendingPhoto;
              setPendingPhoto(null);
              if (pending) handleChoosePhoto(pending.slot, pending.source, pending.index);
            }}
            onLater={() => setPendingPhoto(null)}
            onDismiss={() => setPendingPhoto(null)}
          />

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sobre o livro</Text>
              <Text style={styles.sectionHint}>Título, autor e estado do exemplar</Text>
            </View>

            <View
              onLayout={(event) => {
                titleY.current = event.nativeEvent.layout.y;
              }}
            >
              <TextField
                label="Título do livro"
                labelBackgroundColor={sectionFieldBg}
                value={state.title}
                onChangeText={actions.setTitle}
                editable={!state.saving}
                placeholder="Ex: Dom Casmurro"
                returnKeyType="next"
                onSubmitEditing={() => authorInputRef.current?.focus?.()}
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
                labelBackgroundColor={sectionFieldBg}
                value={state.author}
                onChangeText={actions.setAuthor}
                editable={!state.saving}
                placeholder="Ex: Machado de Assis"
                returnKeyType="next"
                onSubmitEditing={() => descInputRef.current?.focus?.()}
                onFocus={() => handleFocusField(authorY.current)}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.sectionLabel}>Categoria</Text>
                <Text style={styles.fieldHint}>{state.category || "Opcional"}</Text>
              </View>
              <View style={styles.categoryRow} testID="edit-listing-category-row">
                {displayedCategories.map((category) => (
                  <Chip
                    key={category}
                    size="compact"
                    label={category}
                    accessibilityLabel={`Categoria ${category}`}
                    tone={categoryTone(category)}
                    selected={state.category === category}
                    onPress={() => actions.setCategory(state.category === category ? "" : category)}
                    disabled={state.saving}
                  />
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.sectionLabel}>Estado de conservação</Text>
                <Text style={styles.fieldHint}>Opcional</Text>
              </View>
              <View style={styles.modalityRow}>
                {BOOK_CONDITIONS.map((condition: BookCondition) => (
                  <Chip
                    key={condition}
                    size="compact"
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
                <View style={styles.boxVolumesField}>
                  <TextField
                    label="Volumes (opcional)"
                    labelBackgroundColor={sectionFieldBg}
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

          </View>
          <View style={[styles.column, wide && styles.columnHalf]}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Descrição e detalhes</Text>
              <Text style={styles.sectionHint}>Conte sobre marcas de uso, edição ou grifos</Text>
            </View>
            <View
              onLayout={(event) => {
                descY.current = event.nativeEvent.layout.y;
              }}
            >
              <TextField
                inputRef={descInputRef}
                label="Descrição"
                labelBackgroundColor={sectionFieldBg}
                value={state.description}
                onChangeText={actions.setDescription}
                editable={!state.saving}
                placeholder="Ex: Marcas leves de uso, páginas completas."
                maxLength={MAX_BOOK_DESCRIPTION_LENGTH}
                multiline
                onFocus={() => handleFocusField(descY.current)}
                error={
                  descriptionTooLong
                    ? `A descrição deve ter no máximo ${MAX_BOOK_DESCRIPTION_LENGTH} caracteres.`
                    : undefined
                }
              />
            </View>
            <View style={styles.descriptionFooterRow}>
              <Text style={[styles.photoHelperText, descriptionTooLong && styles.descriptionCounterError]}>
                {remainingDescriptionChars >= 0
                  ? `Restam ${remainingDescriptionChars} caracteres`
                  : `Limite excedido em ${Math.abs(remainingDescriptionChars)} caracteres`}
              </Text>
              <Text style={[styles.photoHelperText, descriptionTooLong && styles.descriptionCounterError]}>
                {`${state.description.length}/${MAX_BOOK_DESCRIPTION_LENGTH}`}
              </Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Negociação e retirada</Text>
              <Text style={styles.sectionHint}>Como quer circular este livro em Piripiri</Text>
            </View>

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
                  labelBackgroundColor={sectionFieldBg}
                  value={state.price}
                  onChangeText={actions.setPrice}
                  editable={!state.saving}
                  keyboardType="decimal-pad"
                  iosKeyboardDone
                  placeholder="Ex: 29,90"
                  helperText={priceHelperText}
                  returnKeyType="done"
                  onFocus={() => handleFocusField(priceY.current)}
                />
              </View>
            )}

            <View style={styles.field}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.sectionLabel}>Ponto de encontro em Piripiri</Text>
                <Text style={styles.fieldHint}>Opcional</Text>
              </View>
              <View style={styles.modalityRow}>
                {PIRIPIRI_MEETING_POINT_NAMES.map((locationName) => {
                  const isSelected = state.neighborhood === locationName;
                  return (
                    <Chip
                      key={locationName}
                      label={locationName}
                      accessibilityLabel={`Ponto de encontro ${locationName}`}
                      selected={isSelected}
                      onPress={() =>
                        actions.setNeighborhood(isSelected ? DEFAULT_PIRIPIRI_LOCATION : locationName)
                      }
                      disabled={state.saving}
                    />
                  );
                })}
              </View>
              <View style={styles.cityInfoRow}>
                <AppIcon name="place" size={15} color={colors.secondaryText} />
                <Text style={styles.cityInfoText}>Retirada presencial em Piripiri, PI</Text>
              </View>
            </View>
          </View>

          {wide ? (
            <>
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
            </>
          ) : null}
          </View>
          </View>
        </View>
      </ScrollView>

      {!wide && !isKeyboardVisible ? (
        <SafeAreaView edges={["bottom"]} style={styles.actionBar} testID="edit-listing-action-bar">
          <View style={styles.actionBarInner}>
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

            <View style={styles.actionBarRow}>
              {onCancel ? (
                <View style={styles.actionBarCancel}>
                  <TextButton
                    label="Cancelar"
                    disabled={state.saving}
                    onPress={guardedCancel}
                  />
                </View>
              ) : null}
              <View style={styles.actionBarPrimary}>
                <FilledButton
                  label="Salvar alterações"
                  loading={state.saving}
                  loadingLabel="Salvando"
                  disabled={state.saving}
                  onPress={() => void handleSubmit()}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      ) : null}
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
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: tokens.spacing[16],
    paddingTop: tokens.spacing[12],
    paddingBottom: tokens.spacing[24],
    gap: tokens.spacing[14],
  },
  contentWide: { maxWidth: EDIT_WIDE_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_GUTTER },
  breadcrumb: { marginBottom: tokens.spacing[4] },
  columns: { gap: tokens.spacing[14] },
  columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
  column: { gap: tokens.spacing[14] },
  columnHalf: { flex: 1 },
  sectionCard: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: colors.book.paperEdge,
    padding: tokens.spacing[16],
    gap: tokens.spacing[14],
  },
  sectionHeader: {
    gap: tokens.spacing[2],
  },
  sectionTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: fontFamily.semiBold,
    color: colors.text,
  },
  sectionHint: {
    ...tokens.typography.footnote,
    color: colors.secondaryText,
  },
  fieldHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: tokens.spacing[8],
  },
  fieldHint: {
    ...tokens.typography.labelMedium,
    color: colors.secondaryText,
  },
  boxVolumesField: {
    marginTop: tokens.spacing[8],
    paddingLeft: tokens.spacing[24],
  },
  descriptionFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[4],
    marginTop: -tokens.spacing[6],
  },
  descriptionCounterError: {
    color: colors.error,
  },
  cityInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[6],
    paddingTop: tokens.spacing[4],
  },
  cityInfoText: {
    ...tokens.typography.footnote,
    color: colors.secondaryText,
  },
  actionBar: {
    width: "100%",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.book.paperEdge,
    shadowColor: colors.m3.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBarInner: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: tokens.spacing[16],
    paddingTop: tokens.spacing[12],
    paddingBottom: tokens.spacing[12],
    gap: tokens.spacing[8],
  },
  actionBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[10],
  },
  actionBarCancel: {
    flexShrink: 0,
  },
  actionBarPrimary: {
    flex: 1,
  },
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
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  sectionLabel: {
    ...tokens.typography.labelLarge,
    fontFamily: fontFamily.semiBold,
    color: colors.text,
  },
  photoGrid: {
    flexDirection: "row",
    gap: tokens.spacing[12],
  },
  coverSlot: {
    flex: 2,
    aspectRatio: undefined,
    minWidth: 0,
  },
  sideSlots: {
    flex: 1,
    gap: tokens.spacing[12],
  },
  sideSlot: {
    minWidth: 0,
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
  },
  photoErrorBlock: {
    gap: tokens.spacing[8],
  },
  photoUrlBlock: {
    gap: tokens.spacing[4],
    marginTop: tokens.spacing[4],
  },
  photoLinkToggleRow: {
    alignItems: "flex-start",
  },
  photoHelperText: {
    ...tokens.typography.labelMedium,
    color: colors.secondaryText,
  },
  field: {
    gap: tokens.spacing[8],
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[6],
  },
  modalityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[8],
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
