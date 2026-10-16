import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BookModality } from "@/model/entities/book";
import { tokens } from "@/view/tokens";
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

export default function CreateListing({ sessionUserId, onCreated, onCancel }: CreateListingProps) {
  const [state, actions] = useCreateListingViewModel();

  const handleSubmit = async () => {
    const result = await actions.submit(sessionUserId);
    if (result) onCreated?.();
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Anunciar livro</Text>
        <Text style={styles.subtitle}>Preencha os dados do livro que deseja anunciar.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            accessibilityLabel="Título do livro"
            value={state.title}
            onChangeText={actions.setTitle}
            editable={!state.loading}
            style={styles.input}
            placeholder="Ex: Dom Casmurro"
            placeholderTextColor={tokens.colors.secondaryText}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Autor</Text>
          <TextInput
            accessibilityLabel="Autor do livro"
            value={state.author}
            onChangeText={actions.setAuthor}
            editable={!state.loading}
            style={styles.input}
            placeholder="Ex: Machado de Assis"
            placeholderTextColor={tokens.colors.secondaryText}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoria (opcional)</Text>
          <TextInput accessibilityLabel="Categoria do livro" value={state.category}
            onChangeText={actions.setCategory} editable={!state.loading}
            style={styles.input} placeholder="Ex: Romance" maxLength={60}
            placeholderTextColor={tokens.colors.secondaryText} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Modalidade</Text>
          <View style={styles.modalityRow}>
            {MODALITIES.map((m) => (
              <Pressable
                key={m.value}
                accessibilityRole="button"
                accessibilityState={{ selected: state.modality === m.value }}
                accessibilityLabel={`Modalidade ${m.label}`}
                onPress={() => actions.setModality(m.value)}
                disabled={state.loading}
                style={[
                  styles.modalityChip,
                  state.modality === m.value && styles.modalityChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.modalityText,
                    state.modality === m.value && styles.modalityTextSelected,
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {state.modality === "sale" && (
          <View style={styles.field}>
            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput
              accessibilityLabel="Preço do livro"
              value={state.price}
              onChangeText={actions.setPrice}
              editable={!state.loading}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="Ex: 29,90"
              placeholderTextColor={tokens.colors.secondaryText}
            />
          </View>
        )}

        {state.error ? (
          <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
        ) : null}

        {state.success ? (
          <Text accessibilityRole="alert" style={styles.successText}>Anúncio cadastrado com sucesso!</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: state.loading }}
          disabled={state.loading}
          onPress={() => void handleSubmit()}
          style={styles.button}
        >
          {state.loading ? (
            <ActivityIndicator color={tokens.colors.surface} accessibilityLabel="Cadastrando" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar anúncio</Text>
          )}
        </Pressable>

        {onCancel && (
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            disabled={state.loading}
            style={styles.linkButton}
          >
            <Text style={styles.link}>Cancelar</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: tokens.spacing[24],
    paddingTop: tokens.spacing[48],
    gap: tokens.spacing[16],
  },
  title: {
    fontSize: tokens.typography.displayLarge.fontSize,
    fontWeight: tokens.typography.displayLarge.fontWeight,
    color: tokens.colors.action,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.colors.secondaryText,
    marginBottom: tokens.spacing[12],
  },
  field: { gap: tokens.spacing[6] },
  label: {
    fontSize: tokens.typography.labelMedium.fontSize,
    color: tokens.colors.secondaryText,
  },
  input: {
    minHeight: tokens.accessibility.touchTarget,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[12],
    color: tokens.colors.text,
    backgroundColor: tokens.colors.surface,
  },
  modalityRow: { flexDirection: "row", gap: tokens.spacing[8] },
  modalityChip: {
    minHeight: tokens.accessibility.touchTarget,
    paddingHorizontal: tokens.spacing[16],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: tokens.radius.small,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
  },
  modalityChipSelected: {
    backgroundColor: tokens.colors.action,
    borderColor: tokens.colors.action,
  },
  modalityText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.text,
    fontWeight: "500",
  },
  modalityTextSelected: {
    color: tokens.colors.surface,
    fontWeight: "600",
  },
  error: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
  },
  successText: {
    color: tokens.colors.success,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontWeight: "600",
  },
  button: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.colors.action,
    marginTop: tokens.spacing[8],
  },
  buttonText: { color: tokens.colors.surface, fontSize: 16, fontWeight: "600" },
  linkButton: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: tokens.colors.action,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontWeight: "600",
  },
});
