import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { AppIcon } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";

export type ProfileSafetySheetProps = {
  visible: boolean;
  personName: string;
  listings: readonly Book[] | null;
  loadingListings: boolean;
  blocking: boolean;
  error: string | null;
  onLoadListings: () => void;
  onReportListing: (listingId: string) => void;
  onReportUser: () => void;
  onConfirmBlock: () => void;
  onClose: () => void;
};

/**
 * Folha "Denunciar ou bloquear" do perfil público (Spec 091): bloquear a pessoa (com confirmação) ou
 * denunciar um dos anúncios dela, que é onde a denúncia existe no app.
 */
export function ProfileSafetySheet({
  visible,
  personName,
  listings,
  loadingListings,
  blocking,
  error,
  onLoadListings,
  onReportListing,
  onReportUser,
  onConfirmBlock,
  onClose,
}: ProfileSafetySheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const [choosingListing, setChoosingListing] = useState(false);

  const close = () => {
    setChoosingListing(false);
    setConfirmingBlock(false);
    onClose();
  };

  const startReport = () => {
    setChoosingListing(true);
    if (listings === null) onLoadListings();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
        <View style={styles.scrim}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar ao tocar fora" onPress={close} style={styles.backdrop} />
          <View style={styles.sheet}>
            <View accessible={false} importantForAccessibility="no" style={styles.handle} />
            <Text accessibilityRole="header" style={styles.title}>
              {choosingListing ? "Qual anúncio denunciar?" : "Denunciar ou bloquear"}
            </Text>

            {choosingListing ? (
              <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                {loadingListings ? (
                  <ActivityIndicator color={colors.action} accessibilityLabel="Carregando anúncios" />
                ) : listings && listings.length > 0 ? (
                  listings.map((book) => (
                    <Pressable
                      key={book.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Denunciar o anúncio ${book.title}`}
                      onPress={() => {
                        close();
                        onReportListing(book.id);
                      }}
                      style={styles.row}
                    >
                      <AppIcon name="flag" size={20} color={colors.error} />
                      <Text numberOfLines={2} style={styles.rowText}>{book.title}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.hint}>
                    {error ?? `${personName} não tem anúncios ativos para denunciar.`}
                  </Text>
                )}
              </ScrollView>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Denunciar ${personName}`}
                  onPress={() => {
                    close();
                    onReportUser();
                  }}
                  style={styles.row}
                >
                  <AppIcon name="flag" size={20} color={colors.error} />
                  <View style={styles.rowTexts}>
                    <Text style={styles.rowText}>Denunciar {personName}</Text>
                    <Text style={styles.hint}>Conduta abusiva, golpe ou perfil falso.</Text>
                  </View>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Denunciar um anúncio de ${personName}`} onPress={startReport} style={styles.row}>
                  <AppIcon name="flag" size={20} color={colors.error} />
                  <View style={styles.rowTexts}>
                    <Text style={styles.rowText}>Denunciar um anúncio</Text>
                    <Text style={styles.hint}>Avise a equipe sobre um livro desta pessoa.</Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Bloquear ${personName}`}
                  onPress={() => setConfirmingBlock(true)}
                  style={styles.row}
                >
                  <AppIcon name="block" size={20} color={colors.error} />
                  <View style={styles.rowTexts}>
                    <Text style={styles.rowText}>Bloquear {personName}</Text>
                    <Text style={styles.hint}>Vocês deixam de trocar mensagens. Dá para desbloquear depois.</Text>
                  </View>
                </Pressable>
                {error ? (
                  <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
                ) : null}
              </>
            )}

            <Pressable accessibilityRole="button" accessibilityLabel="Cancelar" onPress={close} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Dialog
        visible={visible && confirmingBlock}
        title="Bloquear esta pessoa?"
        message={`${personName} não poderá enviar mensagens a você. Você pode desbloquear em Perfil > Pessoas bloqueadas.`}
        confirmLabel="Bloquear"
        cancelLabel="Cancelar"
        destructive
        loading={blocking}
        onConfirm={() => {
          onConfirmBlock();
          setConfirmingBlock(false);
        }}
        onCancel={() => setConfirmingBlock(false)}
      />
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFill },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: tokens.spacing[24],
      paddingBottom: tokens.spacing[24],
      gap: tokens.spacing[8],
    },
    handle: {
      alignSelf: "center",
      width: 32,
      height: 4,
      borderRadius: 2,
      marginTop: tokens.spacing[12],
      backgroundColor: colors.m3.onSurfaceVariant,
      opacity: 0.4,
    },
    title: { ...tokens.typography.titleMedium, color: colors.m3.onSurface, paddingVertical: tokens.spacing[8] },
    list: { maxHeight: 320 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: 56,
      paddingVertical: tokens.spacing[8],
    },
    rowTexts: { flex: 1, gap: 2 },
    rowText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface, flexShrink: 1 },
    hint: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    errorText: { ...tokens.typography.bodyMedium, color: colors.error },
    cancel: { minHeight: tokens.accessibility.touchTarget, alignItems: "center", justifyContent: "center" },
    cancelText: { ...tokens.typography.labelLarge, color: colors.m3.primary },
  });
}
