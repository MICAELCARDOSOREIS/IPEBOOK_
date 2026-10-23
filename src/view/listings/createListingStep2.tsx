import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextField } from "@/view/components/TextField";

export type CreateListingStep2Props = {
  photoUrl: string;
  photos: readonly string[];
  loading: boolean;
  error: string | null;
  errorRef?: React.Ref<any>;
  onSetPhotoUrl: (url: string) => void;
  onRemovePhoto: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function CreateListingStep2({
  photoUrl,
  photos,
  loading,
  error,
  errorRef,
  onSetPhotoUrl,
  onRemovePhoto,
  onContinue,
  onBack,
}: CreateListingStep2Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>Mostre seu livro.</Text>
      <Text style={styles.subtitle}>
        Uma foto nítida ajuda a conhecer o estado do exemplar. Até 3 fotos.
      </Text>

      {/* `04.04`: capa em destaque à esquerda, lombada e páginas empilhadas à direita. */}
      <View style={styles.photoGrid}>
        <AddPhotoCard
          label="Foto da capa"
          photoUrl={photoUrl}
          onPress={() => undefined}
          onRemovePhoto={() => onSetPhotoUrl("")}
          style={styles.coverSlot}
        />
        <View style={styles.sideSlots}>
          <AddPhotoCard
            label="Lombada"
            photoUrl={photos[0]}
            onPress={() => undefined}
            onRemovePhoto={() => onRemovePhoto(0)}
            style={styles.sideSlot}
          />
          <AddPhotoCard
            label="Páginas"
            photoUrl={photos[1]}
            onPress={() => undefined}
            onRemovePhoto={() => onRemovePhoto(1)}
            style={styles.sideSlot}
          />
        </View>
      </View>

      <TextField
        label="Endereço da foto da capa"
        value={photoUrl}
        onChangeText={onSetPhotoUrl}
        editable={!loading}
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

      {error ? (
        <Text
          ref={errorRef}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={styles.errorText}
        >
          {error}
        </Text>
      ) : null}

      <FilledButton label="Usar estas fotos" onPress={onContinue} />
      <OutlinedButton label="Voltar à etapa anterior" onPress={onBack} />
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    photoGrid: { flexDirection: "row", gap: tokens.spacing[12] },
    coverSlot: { flex: 2, aspectRatio: undefined, minWidth: 0 },
    sideSlots: { flex: 1, gap: tokens.spacing[12] },
    sideSlot: { minWidth: 0 },
    title: {
      fontSize: tokens.typography.displayLarge.fontSize,
      lineHeight: tokens.typography.displayLarge.lineHeight,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
    },
    subtitle: {
      fontSize: tokens.typography.bodyLarge.fontSize,
      lineHeight: tokens.typography.bodyLarge.lineHeight,
      fontFamily: tokens.typography.bodyLarge.fontFamily,
      color: colors.secondaryText,
    },
    tipBox: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[16],
      gap: tokens.spacing[4],
    },
    tipTitle: {
      fontSize: tokens.typography.titleMedium.fontSize,
      fontFamily: tokens.typography.titleMedium.fontFamily,
      fontWeight: tokens.typography.titleMedium.fontWeight,
      color: colors.text,
    },
    tipText: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      lineHeight: tokens.typography.bodyMedium.lineHeight,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
      color: colors.secondaryText,
    },
    errorText: {
      color: colors.error,
      fontSize: tokens.typography.bodyMedium.fontSize,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
    },
  });
}
