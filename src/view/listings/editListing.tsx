import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BookCondition, BookModality } from "@/model/entities/book";
import {
  BOOK_CONDITIONS,
  BOOK_CONDITION_LABELS,
  MAX_BOOK_DESCRIPTION_LENGTH,
} from "@/model/entities/book";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useEditListingViewModel } from "@/viewmodel/useEditListingViewModel";

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

/** Mesmas categorias oferecidas na publicação (Figma `04.05`). */
const CATEGORIES = ["Literatura", "Infantil", "Didático", "Romance", "Outros"];

/** Figma `04.09 · Editar anúncio` (nó `19:242`). */
export default function EditListing({
  bookId,
  sessionUserId,
  onSaved,
  onCancel,
}: EditListingProps) {
  const [state, actions] = useEditListingViewModel(bookId, sessionUserId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const remainingDescriptionChars = MAX_BOOK_DESCRIPTION_LENGTH - state.description.length;
  const descriptionTooLong = remainingDescriptionChars < 0;

  const handleSubmit = async () => {
    const result = await actions.submit();
    if (result) onSaved?.();
  };

  if (state.loading) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Editar anúncio" onBack={() => onCancel?.()} />
        <View style={styles.statusContainer}>
          <ActivityIndicator color={colors.action} accessibilityLabel="Carregando anúncio" />
          <Text style={styles.statusText}>Carregando dados do anúncio…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state.error && !state.book) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Editar anúncio" onBack={() => onCancel?.()} />
        <View style={styles.statusContainer}>
          <Text accessibilityRole="alert" style={styles.errorText}>
            {state.error}
          </Text>
          {onCancel && (
            <View style={styles.backButtonContainer}>
              <FilledButton label="Voltar" onPress={onCancel} />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Editar anúncio" onBack={() => onCancel?.()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.subtitle}>Atualize as informações do seu livro.</Text>

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

          <TextField
            label="Título do livro"
            value={state.title}
            onChangeText={actions.setTitle}
            editable={!state.saving}
            placeholder="Ex: Dom Casmurro"
          />

          <TextField
            label="Autor do livro"
            value={state.author}
            onChangeText={actions.setAuthor}
            editable={!state.saving}
            placeholder="Ex: Machado de Assis"
          />

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Categoria</Text>
            <View style={styles.modalityRow}>
              {CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  accessibilityLabel={`Categoria ${category}`}
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

          <TextField
            label="Descrição"
            value={state.description}
            onChangeText={actions.setDescription}
            editable={!state.saving}
            placeholder="Ex: Marcas leves de uso, páginas completas."
            maxLength={MAX_BOOK_DESCRIPTION_LENGTH}
            helperText={`${state.description.length}/${MAX_BOOK_DESCRIPTION_LENGTH}`}
            error={
              descriptionTooLong
                ? `A descrição deve ter no máximo ${MAX_BOOK_DESCRIPTION_LENGTH} caracteres.`
                : undefined
            }
          />
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
                  selected={state.modality === m.value}
                  onPress={() => actions.setModality(m.value)}
                  disabled={state.saving}
                />
              ))}
            </View>
          </View>

          {state.modality === "sale" && (
            <TextField
              label="Preço do livro"
              value={state.price}
              onChangeText={actions.setPrice}
              editable={!state.saving}
              keyboardType="decimal-pad"
              placeholder="Ex: 29,90"
              helperText="Informe o valor em reais (R$)"
            />
          )}

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Localidade da beta</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>Piripiri, PI (Beta exclusiva)</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Local de retirada</Text>
            <View style={styles.modalityRow}>
              {PIRIPIRI_NEIGHBORHOODS.map((neighborhood) => (
                <Chip
                  key={neighborhood}
                  label={neighborhood}
                  accessibilityLabel={`Bairro ${neighborhood}`}
                  selected={state.neighborhood === neighborhood}
                  onPress={() =>
                    actions.setNeighborhood(state.neighborhood === neighborhood ? "" : neighborhood)
                  }
                  disabled={state.saving}
                />
              ))}
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
                  onPress={onCancel}
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
  statusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  statusText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
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
    fontSize: tokens.typography.labelMedium.fontSize,
    fontWeight: tokens.typography.labelMedium.fontWeight,
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
    fontWeight: "600",
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
    gap: tokens.spacing[8],
  },
  locationContainer: {
    paddingVertical: tokens.spacing[12],
    paddingHorizontal: tokens.spacing[16],
    backgroundColor: colors.soft,
    borderRadius: tokens.radius.small,
    borderWidth: 1,
    borderColor: colors.action,
  },
  locationText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: colors.actionDeep,
    fontWeight: "600",
  },
  errorText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: colors.error,
  },
  successText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: colors.success,
    fontWeight: "600",
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
