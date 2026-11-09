import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import type { Book } from "@/model/entities/book";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { FilledButton } from "@/view/components/FilledButton";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { Tag } from "@/view/components/Tag";
import { withPress } from "@/view/pressFeedback";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ProposalSheetProps = {
  visible: boolean;
  onClose: () => void;
  targetBook: Book;
  userBooks?: readonly Book[];
  loadingBooks?: boolean;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (options: { initialMessage?: string; offeredBookId?: string }) => Promise<void>;
};

export function ProposalSheet({
  visible,
  onClose,
  targetBook,
  userBooks = [],
  loadingBooks = false,
  submitting = false,
  error = null,
  onSubmit,
}: ProposalSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [message, setMessage] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const isTrade = targetBook.modality === "trade";
  const availableUserBooks = useMemo(
    () => userBooks.filter((b) => b.status === "available" && b.id !== targetBook.id),
    [userBooks, targetBook.id],
  );

  const handleSubmit = async () => {
    await onSubmit({
      initialMessage: message.trim() || undefined,
      offeredBookId: isTrade && selectedBookId ? selectedBookId : undefined,
    });
  };

  const sheetTitle = isTrade ? "Proposta de Troca" : "Solicitar Negociação";

  return (
    <Modal
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
      aria-modal
    >
      <View style={[styles.scrim, wideWeb && styles.scrimWide]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar formulário de proposta"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={[styles.sheet, wideWeb && styles.sheetWide, { paddingBottom: Math.max(insets.bottom, tokens.spacing[16]) }]}>
          {wideWeb ? null : <View style={styles.dragHandle} />}

          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <AppIcon name="swap" size={20} color={colors.action} />
              </View>
              <Text accessibilityRole="header" style={styles.title}>
                {sheetTitle}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={8}
              onPress={onClose}
              style={withPress(styles.closeButton)}
            >
              <AppIcon name="close" size={20} color={colors.m3.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Resumo do livro alvo */}
            <View style={styles.targetBookCard}>
              <BookCover
                id={targetBook.id}
                title={targetBook.title}
                photoUrl={targetBook.photoUrl}
                variant="list"
              />
              <View style={styles.targetBookInfo}>
                <Text style={styles.targetBookTitle} numberOfLines={2}>
                  {targetBook.title}
                </Text>
                <Text style={styles.targetBookAuthor} numberOfLines={1}>
                  {targetBook.author}
                </Text>
                <View style={styles.tagWrapper}>
                  <Tag variant={targetBook.modality} />
                </View>
              </View>
            </View>

            {/* Campo de mensagem opcional */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Mensagem para o leitor (opcional)</Text>
                <Text style={styles.charCounter}>{message.length}/500</Text>
              </View>
              <TextInput
                value={message}
                onChangeText={(text) => setMessage(text.slice(0, 500))}
                placeholder="Escreva uma mensagem para quem anunciou (opcional)"
                placeholderTextColor={colors.m3.onSurfaceVariant}
                multiline
                numberOfLines={3}
                maxLength={500}
                style={styles.messageInput}
                accessibilityLabel="Mensagem inicial da proposta"
              />
            </View>

            {/* Se for troca, oferecer um livro em contrapartida */}
            {isTrade ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Oferecer um livro seu em troca (opcional)</Text>
                <Text style={styles.sectionHint}>
                  Escolha um dos seus livros disponíveis para propor uma troca direta.
                </Text>

                {loadingBooks ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.action} />
                    <Text style={styles.loadingText}>Carregando seus livros…</Text>
                  </View>
                ) : availableUserBooks.length === 0 ? (
                  <View style={styles.emptyBooksBox}>
                    <Text style={styles.emptyBooksText}>
                      Você não tem livros disponíveis cadastrados para oferecer agora. A proposta pode ser enviada sem contrapartida.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.booksList}>
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selectedBookId === null }}
                      accessibilityLabel="Nenhum livro de troca"
                      onPress={() => setSelectedBookId(null)}
                      style={withPress([
                        styles.bookOption,
                        selectedBookId === null && styles.bookOptionSelected,
                      ])}
                    >
                      <View style={[styles.radioCircle, selectedBookId === null && styles.radioCircleSelected]}>
                        {selectedBookId === null ? <View style={styles.radioDot} /> : null}
                      </View>
                      <Text style={styles.bookOptionTitle}>Nenhum livro específico (combinar no chat)</Text>
                    </Pressable>

                    {availableUserBooks.map((userBook) => {
                      const isSelected = selectedBookId === userBook.id;
                      return (
                        <Pressable
                          key={userBook.id}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: isSelected }}
                          accessibilityLabel={`Oferecer ${userBook.title}`}
                          onPress={() => setSelectedBookId(userBook.id)}
                          style={withPress([
                            styles.bookOption,
                            isSelected && styles.bookOptionSelected,
                          ])}
                        >
                          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                            {isSelected ? <View style={styles.radioDot} /> : null}
                          </View>
                          <BookCover
                            id={userBook.id}
                            title={userBook.title}
                            photoUrl={userBook.photoUrl}
                            variant="list"
                          />
                          <View style={styles.bookOptionText}>
                            <Text style={styles.bookOptionTitle} numberOfLines={1}>
                              {userBook.title}
                            </Text>
                            <Text style={styles.bookOptionAuthor} numberOfLines={1}>
                              {userBook.author}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : null}

            {error ? <InlineErrorCard message={error} /> : null}
          </ScrollView>

          {/* Botões de Ação */}
          <View style={styles.actions}>
            <FilledButton
              label={isTrade ? "Enviar proposta de troca" : "Confirmar interesse"}
              loading={submitting}
              loadingLabel="Enviando proposta…"
              onPress={() => void handleSubmit()}
            />
            <OutlinedButton
              label="Cancelar"
              disabled={submitting}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    scrim: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      justifyContent: "flex-end",
    },
    scrimWide: {
      justifyContent: "center",
      alignItems: "center",
      padding: tokens.spacing[24],
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: tokens.radius.extraLarge,
      borderTopRightRadius: tokens.radius.extraLarge,
      maxHeight: "90%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },
    sheetWide: {
      width: "100%",
      maxWidth: 540,
      borderRadius: tokens.radius.extraLarge,
    },
    dragHandle: {
      width: 36,
      height: 4,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.outlineVariant,
      alignSelf: "center",
      marginTop: tokens.spacing[8],
      marginBottom: tokens.spacing[4],
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    headerTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.nature.sprout,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...tokens.typography.titleMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.bold,
    },
    closeButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: tokens.radius.full,
    },
    content: {
      paddingHorizontal: tokens.spacing[16],
    },
    contentContainer: {
      paddingVertical: tokens.spacing[12],
      gap: tokens.spacing[16],
    },
    targetBookCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    targetBookInfo: {
      flex: 1,
      gap: tokens.spacing[4],
    },
    targetBookTitle: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurface,
    },
    targetBookAuthor: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    tagWrapper: {
      alignSelf: "flex-start",
      marginTop: tokens.spacing[2],
    },
    section: {
      gap: tokens.spacing[8],
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionLabel: {
      ...tokens.typography.labelMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurface,
    },
    sectionHint: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
    },
    charCounter: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
    },
    messageInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[12],
      color: colors.m3.onSurface,
      ...tokens.typography.bodyMedium,
      minHeight: 80,
      textAlignVertical: "top",
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[12],
    },
    loadingText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    emptyBooksBox: {
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.cardSmall,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    emptyBooksText: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
    },
    booksList: {
      gap: tokens.spacing[8],
    },
    bookOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      padding: tokens.spacing[10],
      borderRadius: tokens.radius.cardSmall,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.background,
    },
    bookOptionSelected: {
      borderColor: colors.action,
      backgroundColor: `${colors.nature.sprout}40`,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: tokens.radius.full,
      borderWidth: 2,
      borderColor: colors.m3.outline,
      alignItems: "center",
      justifyContent: "center",
    },
    radioCircleSelected: {
      borderColor: colors.action,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.action,
    },
    bookOptionText: {
      flex: 1,
      gap: 2,
    },
    bookOptionTitle: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.medium,
      color: colors.m3.onSurface,
    },
    bookOptionAuthor: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
    },
    errorBox: {
      padding: tokens.spacing[12],
      backgroundColor: colors.errorContainer,
      borderRadius: tokens.radius.cardSmall,
    },
    errorText: {
      ...tokens.typography.labelSmall,
      color: colors.error,
    },
    actions: {
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[8],
      gap: tokens.spacing[8],
    },
  });
}
