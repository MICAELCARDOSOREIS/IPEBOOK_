import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BookModality } from "@/model/entities/book";
import { tokens } from "@/view/tokens";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { StepProgress } from "@/view/components/StepProgress";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";

export type CreateListingProps = {
  sessionUserId: string | null;
  onCreated?: () => void;
  onCancel?: () => void;
};

const MODALITIES: { value: BookModality; label: string }[] = [
  { value: "sale", label: "Venda" },
  { value: "trade", label: "Troca" },
  { value: "donation", label: "Doação" },
];

/**
 * Tela de publicação de anúncio reescrita sobre o design system do Ipebook (Issue #90).
 * Utiliza TopAppBar, StepProgress, TextField, Chip e FilledButton com conformidade IHC/M3.
 */
export default function CreateListing({ sessionUserId, onCreated, onCancel }: CreateListingProps) {
  const [state, actions] = useCreateListingViewModel();
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  const handleSubmit = async () => {
    const result = await actions.submit(sessionUserId);
    if (result) onCreated?.();
  };

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Anunciar livro" onBack={() => onCancel?.()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <StepProgress
            currentStep={1}
            totalSteps={1}
            stepLabel="Dados do anúncio"
          />

          <Text style={styles.subtitle}>Preencha os dados do livro que deseja anunciar.</Text>

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
                    editable={!state.loading}
                    placeholder="https://exemplo.com/capa.jpg"
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <View style={styles.photoHelper}>
                  <Text style={styles.photoHelperTitle}>Adicione uma foto real</Text>
                  <Text style={styles.photoHelperText}>
                    Anúncios com foto da capa chamam mais atenção e inspiram confiança na comunidade de Piripiri.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TextField
            label="Título do livro"
            value={state.title}
            onChangeText={actions.setTitle}
            editable={!state.loading}
            placeholder="Ex: Dom Casmurro"
          />

          <TextField
            label="Autor do livro"
            value={state.author}
            onChangeText={actions.setAuthor}
            editable={!state.loading}
            placeholder="Ex: Machado de Assis"
          />

          <TextField
            label="Categoria (opcional)"
            accessibilityLabel="Categoria do livro"
            value={state.category}
            onChangeText={actions.setCategory}
            editable={!state.loading}
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
                  disabled={state.loading}
                />
              ))}
            </View>
          </View>

          {state.modality === "sale" && (
            <TextField
              label="Preço do livro"
              value={state.price}
              onChangeText={actions.setPrice}
              editable={!state.loading}
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
            editable={!state.loading}
            placeholder="Ex: Centro, Paciência, Petecas, Floresta..."
          />

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {state.error}
            </Text>
          ) : null}

          {state.success ? (
            <Text accessibilityRole="alert" style={styles.successText}>
              Anúncio cadastrado com sucesso!
            </Text>
          ) : null}

          <View style={styles.actionsContainer}>
            <FilledButton
              label="Cadastrar anúncio"
              loading={state.loading}
              loadingLabel="Cadastrando"
              disabled={state.loading}
              onPress={() => void handleSubmit()}
            />

            {onCancel && (
              <View style={styles.cancelContainer}>
                <FilledButton
                  label="Cancelar"
                  disabled={state.loading}
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
    fontSize: 13,
    lineHeight: 18,
    color: tokens.colors.secondaryText,
  },
  field: {
    gap: tokens.spacing[8],
  },
  modalityRow: {
    flexDirection: "row",
    gap: tokens.spacing[8],
    flexWrap: "wrap",
  },
  locationContainer: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[12],
    borderRadius: tokens.radius.small,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
  },
  locationText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.text,
    fontWeight: "500",
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    marginTop: tokens.spacing[4],
  },
  successText: {
    color: tokens.colors.success,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontWeight: "600",
    marginTop: tokens.spacing[4],
  },
  actionsContainer: {
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[8],
  },
  cancelContainer: {
    opacity: 0.85,
  },
});
