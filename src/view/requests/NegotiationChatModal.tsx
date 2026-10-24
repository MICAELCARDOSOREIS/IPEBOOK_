import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";

export type NegotiationChatModalProps = {
  visible: boolean;
  requestId: string;
  sessionUserId: string;
  counterpartName: string;
  onClose: () => void;
};

/**
 * Modal de chat interno da negociação (Spec 061 / ADR 0044).
 * Figma 06.02, 06.10 (falha de envio) e 06.16 (mensagem enviada).
 */
export function NegotiationChatModal({
  visible,
  requestId,
  sessionUserId,
  counterpartName,
  onClose,
}: NegotiationChatModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useNegotiationChatViewModel(requestId, sessionUserId);

  function formatTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  const renderItem = ({ item }: { item: NegotiationMessage }) => {
    const isMine = item.senderId === sessionUserId;
    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageRowMine : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.messageBubbleMine : styles.messageBubbleOther,
          ]}
          accessibilityRole="text"
          accessibilityLabel={`${isMine ? "Você" : counterpartName}: ${item.content}`}
        >
          <Text style={[styles.messageText, isMine ? styles.messageTextMine : styles.messageTextOther]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isMine ? styles.timeTextMine : styles.timeTextOther]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar conversa"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {counterpartName}
              </Text>
              <Text style={styles.headerSubtitle}>Negociação em Piripiri</Text>
            </View>
            <View style={styles.headerRightSpacer} />
          </View>

          {/* Dica de segurança comunitária */}
          <View style={styles.safetyBanner}>
            <Text style={styles.safetyBannerText}>
              🔒 Encontros sempre em locais públicos e movimentados de Piripiri.
            </Text>
          </View>

          {/* Conteúdo principal */}
          {state.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.action} />
              <Text style={styles.loadingText}>Carregando mensagens...</Text>
            </View>
          ) : state.error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{state.error}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Recarregar mensagens"
                onPress={() => void actions.reload()}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={state.messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>Inicie a conversa</Text>
                  <Text style={styles.emptySubtitle}>
                    Combine detalhes do encontro ou tire dúvidas sobre o livro.
                  </Text>
                </View>
              }
            />
          )}

          {/* Alerta de erro de envio (Figma 06.10) */}
          {state.sendError ? (
            <View style={styles.sendErrorBanner}>
              <Text style={styles.sendErrorText}>⚠️ {state.sendError}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tentar reenviar mensagem"
                onPress={() => void actions.retryLastMessage()}
                style={styles.retrySendButton}
              >
                <Text style={styles.retrySendButtonText}>Reenviar</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Barra inferior de digitação */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor={colors.secondaryText}
              value={state.inputText}
              onChangeText={actions.setInputText}
              maxLength={1000}
              multiline
              accessibilityLabel="Campo de mensagem"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar mensagem"
              onPress={() => void actions.sendMessage()}
              disabled={state.isSending || !state.inputText.trim()}
              style={[
                styles.sendButton,
                (!state.inputText.trim() || state.isSending) && styles.sendButtonDisabled,
              ]}
            >
              {state.isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendButtonText}>Enviar</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardContainer: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
      backgroundColor: colors.surface,
    },
    closeButton: {
      padding: tokens.spacing[8],
      minWidth: tokens.accessibility.touchTarget,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
    },
    closeButtonText: {
      fontSize: 20,
      color: colors.text,
      fontWeight: "bold",
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
    },
    headerSubtitle: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    headerRightSpacer: {
      width: tokens.accessibility.touchTarget,
    },
    safetyBanner: {
      backgroundColor: colors.soft,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    safetyBannerText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      textAlign: "center",
    },
    listContent: {
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[16],
      flexGrow: 1,
    },
    messageRow: {
      flexDirection: "row",
      marginVertical: 4,
    },
    messageRowMine: {
      justifyContent: "flex-end",
    },
    messageRowOther: {
      justifyContent: "flex-start",
    },
    messageBubble: {
      maxWidth: "80%",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.large,
    },
    messageBubbleMine: {
      backgroundColor: colors.action,
      borderBottomRightRadius: 2,
    },
    messageBubbleOther: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderBottomLeftRadius: 2,
    },
    messageText: {
      ...tokens.typography.bodyMedium,
      fontSize: 15,
      lineHeight: 20,
    },
    messageTextMine: {
      color: "#FFFFFF",
    },
    messageTextOther: {
      color: colors.text,
    },
    timeText: {
      ...tokens.typography.labelSmall,
      marginTop: 4,
      alignSelf: "flex-end",
    },
    timeTextMine: {
      color: "rgba(255, 255, 255, 0.75)",
    },
    timeTextOther: {
      color: colors.secondaryText,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: tokens.spacing[48],
    },
    emptyTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      marginBottom: 4,
    },
    emptySubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 260,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: tokens.spacing[8],
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: tokens.spacing[24],
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
      textAlign: "center",
      marginBottom: tokens.spacing[16],
    },
    retryButton: {
      backgroundColor: colors.surface,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
    },
    retryButtonText: {
      ...tokens.typography.bodyMedium,
      color: colors.action,
      fontWeight: "600",
    },
    sendErrorBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.errorContainer,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[4],
      borderTopWidth: 1,
      borderTopColor: colors.error,
    },
    sendErrorText: {
      ...tokens.typography.labelSmall,
      color: colors.error,
      flex: 1,
    },
    retrySendButton: {
      marginLeft: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
    },
    retrySendButtonText: {
      ...tokens.typography.labelSmall,
      fontWeight: "700",
      color: colors.error,
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      fontSize: 14,
    },
    sendButton: {
      marginLeft: tokens.spacing[8],
      backgroundColor: colors.action,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      minWidth: 64,
      minHeight: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonText: {
      color: "#FFFFFF",
      ...tokens.typography.labelMedium,
      fontWeight: "700",
    },
  });
}
