import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BookModality } from "@/model/entities/book";
import { tokens } from "@/view/tokens";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
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

export default function EditListing({
  bookId,
  sessionUserId,
  onSaved,
  onCancel,
}: EditListingProps) {
  const [state, actions] = useEditListingViewModel(bookId, sessionUserId);
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  const handleSubmit = async () => {
    const result = await actions.submit();
    if (result) onSaved?.();
  };

  if (state.loading) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Editar anúncio" onBack={() => onCancel?.()} />
        <View style={styles.statusContainer}>
          <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando anúncio" />
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
          <Text style={styles.subtitle}>Atualize as informações do seu anúncio.</Text>

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

          <TextField
            label="Categoria (opcional)"
            accessibilityLabel="Categoria do livro"
            value={state.category}
            onChangeText={actions.setCategory}
            editable={!state.saving}
            placeholder="Ex: Romance, Ficção, Didático..."
            maxLength={60}
          />

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

          <TextField
            label="Bairro em Piripiri (opcional)"
            accessibilityLabel="Bairro do livro em Piripiri"
            value={state.neighborhood}
            onChangeText={actions.setNeighborhood}
            editable={!state.saving}
            placeholder="Ex: Centro, Paciência, Petecas, Floresta..."
          />

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
                <FilledButton
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

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: tokens.colors.background,
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
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  backButtonContainer: {
    marginTop: tokens.spacing[16],
    width: "100%",
    maxWidth: 240,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: tokens.colors.secondaryText,
    marginTop: tokens.spacing[4],
  },
  photoSection: {
    gap: tokens.spacing[8],
  },
  sectionLabel: {
    fontSize: tokens.typography.labelMedium.fontSize,
    fontWeight: tokens.typography.labelMedium.fontWeight,
    color: tokens.colors.secondaryText,
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
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.text,
  },
  photoHelperText: {
    fontSize: 12,
    lineHeight: 16,
    color: tokens.colors.secondaryText,
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
    backgroundColor: tokens.colors.soft,
    borderRadius: tokens.radius.small,
    borderWidth: 1,
    borderColor: tokens.colors.action,
  },
  locationText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.actionDeep,
    fontWeight: "600",
  },
  errorText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.error,
  },
  successText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.success,
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
