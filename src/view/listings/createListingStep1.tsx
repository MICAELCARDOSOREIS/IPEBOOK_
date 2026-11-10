import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BookModality } from "@/model/entities/book";
import type { IsbnFeedback } from "@/viewmodel/useCreateListingViewModel";
import type { ListingBasicsErrors } from "@/viewmodel/listingBasicsValidation";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";
import { Chip } from "@/view/components/Chip";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { IconBadge } from "@/view/components/IconBadge";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { TextField } from "@/view/components/TextField";
import { BarcodeScannerModal } from "@/view/components/BarcodeScannerModal";

import { withPress } from "@/view/pressFeedback";
const MODALITIES: { value: BookModality; label: string; icon: AppIconName; desc: string }[] = [
  { value: "sale", label: "Venda", icon: "category", desc: "Defina um preço justo em R$" },
  { value: "trade", label: "Troca", icon: "swap", desc: "Troque por outros livros" },
  { value: "donation", label: "Doação", icon: "heart", desc: "Compartilhe gratuitamente" },
];

function getModalityTheme(modality: BookModality, colors: ColorPalette) {
  switch (modality) {
    case "sale":
      return {
        accent: colors.action,
        bgSelected: colors.badge.sale.background,
        textSelected: colors.badge.sale.text,
        iconBgSelected: colors.soft,
        iconBgUnselected: colors.soft,
        iconColorSelected: colors.action,
        iconColorUnselected: colors.action,
        radioBorder: colors.action,
        radioInner: colors.action,
      };
    case "trade":
      return {
        accent: colors.gold,
        bgSelected: colors.badge.trade.background,
        textSelected: colors.badge.trade.text,
        iconBgSelected: colors.ipe.container,
        iconBgUnselected: colors.ipe.container,
        iconColorSelected: colors.gold,
        iconColorUnselected: colors.gold,
        radioBorder: colors.gold,
        radioInner: colors.gold,
      };
    case "donation":
      return {
        accent: colors.badge.donation.text,
        bgSelected: colors.badge.donation.background,
        textSelected: colors.badge.donation.text,
        iconBgSelected: colors.ipe.container,
        iconBgUnselected: colors.ipe.container,
        iconColorSelected: colors.badge.donation.text,
        iconColorUnselected: colors.badge.donation.text,
        radioBorder: colors.badge.donation.text,
        radioInner: colors.badge.donation.text,
      };
  }
}

export type CreateListingStep1Props = {
  isbn?: string;
  lookingUpIsbn?: boolean;
  isbnFeedback?: IsbnFeedback | null;
  onSetIsbn?: (value: string) => void;
  onLookupIsbn?: () => void;
  onScanBarcode?: (code: string) => void;
  modality: BookModality;
  title: string;
  author: string;
  price: string;
  photoUrl: string;
  loading: boolean;
  error: string | null;
  errorRef?: React.Ref<any>;
  onSetModality: (modality: BookModality) => void;
  onSetTitle: (title: string) => void;
  onSetAuthor: (author: string) => void;
  onSetPrice: (price: string) => void;
  onSetPhotoUrl: (url: string) => void;
  fieldErrors?: ListingBasicsErrors;
  onGoToPhotos: () => void;
};

export function CreateListingStep1({
  isbn: _isbn,
  lookingUpIsbn,
  isbnFeedback,
  onSetIsbn: _onSetIsbn,
  onLookupIsbn: _onLookupIsbn,
  onScanBarcode,
  modality,
  title,
  author,
  price,
  photoUrl,
  loading,
  error,
  errorRef,
  onSetModality,
  onSetTitle,
  onSetAuthor,
  onSetPrice,
  onSetPhotoUrl,
  fieldErrors = {},
  onGoToPhotos,
}: CreateListingStep1Props) {
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const [scannerVisible, setScannerVisible] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <View style={wideWeb ? styles.webIsbnCard : styles.isbnCard}>
        {wideWeb ? (
          <View style={styles.webIsbnHeader}>
            <View style={styles.webIsbnTextsRow}>
              <IconBadge icon="camera" tone="action" />
              <View style={styles.isbnTexts}>
                <Text style={styles.isbnTitle}>{lookingUpIsbn ? "Buscando o livro..." : "Escanear código de barras"}</Text>
                <Text style={styles.hint}>Aponte o código de barras ou ISBN na câmera para autocompletar os dados.</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir leitor de código de barras pela câmera"
              accessibilityState={{ disabled: Boolean(loading || lookingUpIsbn) }}
              disabled={loading || lookingUpIsbn}
              onPress={() => setScannerVisible(true)}
              style={withPress(styles.webScanButton)}
            >
              <AppIcon name="camera" size={16} color={colors.action} />
              <Text style={styles.webScanButtonText}>Usar câmera</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir leitor de código de barras pela câmera"
            accessibilityState={{ disabled: Boolean(loading || lookingUpIsbn) }}
            disabled={loading || lookingUpIsbn}
            onPress={() => setScannerVisible(true)}
            style={withPress(styles.isbnHeader)}
          >
            <IconBadge icon="camera" tone="action" />
            <View style={styles.isbnTexts}>
              <Text style={styles.isbnTitle}>{lookingUpIsbn ? "Buscando o livro..." : "Escanear código de barras"}</Text>
              <Text style={styles.hint}>Título e autor entram sozinhos.</Text>
            </View>
            <AppIcon name="chevronRight" size={24} color={colors.m3.onSurfaceVariant} />
          </Pressable>
        )}

        <BarcodeScannerModal
          visible={scannerVisible}
          onClose={() => setScannerVisible(false)}
          onScan={(scannedCode) => {
            onScanBarcode?.(scannedCode);
          }}
        />

        {isbnFeedback ? (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[
              styles.isbnFeedback,
              isbnFeedback.type === "success"
                ? styles.isbnFeedbackSuccess
                : isbnFeedback.type === "error"
                  ? styles.isbnFeedbackError
                  : styles.isbnFeedbackInfo,
            ]}
          >
            <Text
              style={[
                styles.isbnFeedbackText,
                isbnFeedback.type === "success"
                  ? styles.isbnFeedbackTextSuccess
                  : isbnFeedback.type === "error"
                    ? styles.isbnFeedbackTextError
                    : styles.isbnFeedbackTextInfo,
              ]}
            >
              {isbnFeedback.message}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={wideWeb ? styles.webDividerContainer : styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={wideWeb ? styles.webDividerText : styles.dividerText}>ou preencha manualmente</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.field}>
        <Text style={styles.sectionLabel}>Modalidade</Text>
        {wideWeb ? (
          <View style={styles.webModalitiesGrid}>
            {MODALITIES.map((item) => {
              const isSelected = modality === item.value;
              const theme = getModalityTheme(item.value, colors);
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Modalidade ${item.label}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSetModality(item.value)}
                  disabled={loading}
                  style={withPress([
                    styles.webModalityCard,
                    {
                      borderColor: isSelected ? theme.accent : colors.m3.outlineVariant,
                      backgroundColor: isSelected ? theme.bgSelected : colors.m3.surfaceContainerLow,
                    },
                  ])}
                >
                  <View style={styles.webModalityHeader}>
                    <View
                      style={[
                        styles.webModalityIconBadge,
                        {
                          backgroundColor: isSelected ? theme.iconBgSelected : theme.iconBgUnselected,
                        },
                      ]}
                    >
                      <AppIcon
                        name={item.icon}
                        size={18}
                        color={isSelected ? theme.iconColorSelected : theme.iconColorUnselected}
                      />
                    </View>
                    <View
                      style={[
                        styles.webModalityRadio,
                        { borderColor: isSelected ? theme.radioBorder : colors.m3.outlineVariant },
                      ]}
                    >
                      {isSelected ? (
                        <View style={[styles.webModalityRadioInner, { backgroundColor: theme.radioInner }]} />
                      ) : null}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.webModalityTitle,
                      isSelected && { color: theme.textSelected, fontWeight: tokens.fontWeight.bold },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={[
                      styles.webModalityDesc,
                      isSelected && { color: theme.textSelected, opacity: 0.85 },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.chipRow}>
            {MODALITIES.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                accessibilityLabel={`Modalidade ${item.label}`}
                tone={colors.badge[item.value]}
                selected={modality === item.value}
                onPress={() => onSetModality(item.value)}
                disabled={loading}
              />
            ))}
          </View>
        )}
      </View>

      <View style={wideWeb ? styles.webPhotoCard : styles.photoCard}>
        <AddPhotoCard
          photoUrl={photoUrl}
          onPress={onGoToPhotos}
          onRemovePhoto={() => onSetPhotoUrl("")}
        />
        <View style={styles.photoTexts}>
          <Text style={styles.sectionLabel}>Foto de capa</Text>
          <Text style={styles.hint}>
            {wideWeb
              ? "Foto nítida e bem iluminada do seu livro. Você poderá adicionar mais fotos na próxima etapa."
              : "Foto leve, com boa luz. Você pode ajustar na próxima etapa."}
          </Text>
        </View>
      </View>

      <View style={styles.fieldsContainer}>
        <TextField
          label="Título"
          value={title}
          onChangeText={onSetTitle}
          editable={!loading}
          placeholder="Ex: Dom Casmurro"
          error={fieldErrors.title}
        />

        {wideWeb && modality === "sale" ? (
          <View style={styles.webFieldsRow}>
            <View style={styles.webAuthorCol}>
              <TextField
                label="Autor"
                value={author}
                onChangeText={onSetAuthor}
                editable={!loading}
                placeholder="Ex: Machado de Assis"
                error={fieldErrors.author}
              />
            </View>
            <View style={styles.webPriceCol}>
              <TextField
                label="Preço (R$)"
                value={price}
                onChangeText={onSetPrice}
                editable={!loading}
                keyboardType="decimal-pad"
                placeholder="Ex: 25,00"
                error={fieldErrors.price}
              />
            </View>
          </View>
        ) : (
          <>
            <TextField
              label="Autor"
              value={author}
              onChangeText={onSetAuthor}
              editable={!loading}
              placeholder="Ex: Machado de Assis"
              error={fieldErrors.author}
            />

            {modality === "sale" ? (
              <TextField
                label="Preço (R$)"
                value={price}
                onChangeText={onSetPrice}
                editable={!loading}
                keyboardType="decimal-pad"
                placeholder="Ex: 25,00"
                error={fieldErrors.price}
              />
            ) : null}
          </>
        )}
      </View>

      <View style={styles.nextStepsNote}>
        <AppIcon name="info" size={16} color={colors.secondaryText} />
        <Text style={styles.hint}>Conservação e bairro vêm nas próximas etapas.</Text>
      </View>

      {error ? <InlineErrorCard textRef={errorRef} message={error} /> : null}
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    field: { gap: tokens.spacing[8] },
    isbnCard: {
      gap: tokens.spacing[8],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    webIsbnCard: {
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    isbnHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    webIsbnHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[16],
    },
    webIsbnTextsRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    webScanButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.action,
    },
    webScanButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.action,
      fontWeight: tokens.fontWeight.semiBold,
    },
    isbnTexts: { flex: 1, gap: tokens.spacing[4] },
    isbnTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
    },
    scanActionRow: {
      width: "100%",
    },
    isbnFeedback: {
      padding: tokens.spacing[8],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
    },
    isbnFeedbackSuccess: {
      backgroundColor: colors.m3.secondaryContainer,
      borderColor: colors.action,
    },
    isbnFeedbackInfo: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderColor: colors.m3.outlineVariant,
    },
    isbnFeedbackError: {
      backgroundColor: colors.errorContainer,
      borderColor: colors.error,
    },
    isbnFeedbackText: {
      ...tokens.typography.bodyMedium,
    },
    isbnFeedbackTextSuccess: {
      color: colors.actionDeep,
      fontWeight: tokens.fontWeight.semiBold,
    },
    isbnFeedbackTextInfo: {
      color: colors.secondaryText,
    },
    isbnFeedbackTextError: {
      color: colors.error,
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      marginVertical: tokens.spacing[4],
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
    },
    dividerText: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
      textAlign: "center",
    },
    webDividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      marginVertical: tokens.spacing[4],
    },
    webDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
    },
    webDividerText: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    webModalitiesGrid: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      width: "100%",
    },
    webModalityCard: {
      flex: 1,
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1.5,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[8],
    },
    webModalityCardSelected: {
      borderColor: colors.action,
      backgroundColor: colors.m3.secondaryContainer,
    },
    webModalityHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    webModalityIconBadge: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    webModalityIconBadgeSelected: {
      backgroundColor: colors.soft,
    },
    webModalityRadio: {
      width: 18,
      height: 18,
      borderRadius: tokens.radius.full,
      borderWidth: 2,
      borderColor: colors.m3.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    webModalityRadioSelected: {
      borderColor: colors.action,
    },
    webModalityRadioInner: {
      width: 10,
      height: 10,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.action,
    },
    webModalityTitle: {
      ...tokens.typography.titleMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
    },
    webModalityTitleSelected: {
      color: colors.actionDeep,
    },
    webModalityDesc: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      lineHeight: 16,
    },
    photoRow: { flexDirection: "row", gap: tokens.spacing[12], alignItems: "center" },
    photoCard: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      alignItems: "center",
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    fieldsContainer: {
      gap: tokens.spacing[16],
    },
    nextStepsNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
    },
    webPhotoCard: {
      flexDirection: "row",
      gap: tokens.spacing[16],
      alignItems: "center",
      padding: tokens.spacing[14],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    photoTexts: { flex: 1, gap: tokens.spacing[4] },
    webFieldsRow: {
      flexDirection: "row",
      gap: tokens.spacing[16],
      alignItems: "flex-start",
    },
    webAuthorCol: { flex: 1.6 },
    webPriceCol: { flex: 1 },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      color: colors.text,
    },
    hint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
  });
}
