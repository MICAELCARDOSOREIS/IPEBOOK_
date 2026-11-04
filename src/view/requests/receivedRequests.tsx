import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { RequestListLayout, createRequestStyles } from "@/view/requests/requestListLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Tag } from "@/view/components/Tag";

import { withPress } from "@/view/pressFeedback";
/** Sem perfil público, a tela não expõe o identificador interno (Spec 043, RN-02). */
export const COMMUNITY_MEMBER = "Pessoa da comunidade";

export type ReceivedRequestsProps = {
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToNegotiationDetail?: (requestId: string) => void;
  onOpenChat?: (requestId: string) => void;
};

export function ReceivedRequests({
  sessionUserId,
  onBack,
  onNavigateToNegotiationDetail,
  onOpenChat,
}: ReceivedRequestsProps) {
  const [state, actions] = useReceivedRequestsViewModel(sessionUserId);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { colors } = useTheme();
  const s = useMemo(() => createRequestStyles(colors), [colors]);

  const guardedBackPress = useGuardedPress(onBack);
  const guardedBack = onBack ? guardedBackPress : undefined;
  const guardedNavigateToNegotiationDetailPress = useGuardedPress((id: string) => onNavigateToNegotiationDetail?.(id));
  const guardedNavigateToNegotiationDetail = onNavigateToNegotiationDetail ? guardedNavigateToNegotiationDetailPress : undefined;
  const guardedOpenChatPress = useGuardedPress((id: string) => onOpenChat?.(id));
  const guardedOpenChat = onOpenChat ? guardedOpenChatPress : undefined;

  const handleResponse = async (requestId: string, response: "accept" | "reject") => {
    const succeeded = response === "accept"
      ? await actions.accept(requestId)
      : await actions.reject(requestId);

    if (succeeded) {
      setFeedbackMessage(response === "accept" ? "Pedido aceito. O anúncio foi reservado." : "Pedido recusado.");
    }
  };

  return (
    <RequestListLayout
      title="Pedidos recebidos"
      emptyText="Você ainda não recebeu pedidos para os seus anúncios."
      items={state.items}
      loading={state.loading}
      error={state.error}
      onRetry={() => void actions.reload()}
      onBack={guardedBack}
      showHeroDescription={false}
      showPendingSummary
      feedbackMessage={feedbackMessage}
      onDismissFeedback={() => setFeedbackMessage(null)}
      renderExtra={(item) => {
        const { request, requesterName, requesterPhotoUrl } = item;
        const offeredBook = item.offeredBook;
        const initialMessage = request.initialMessage?.trim();
        const busy = state.respondingId === request.id;
        return (
          <View style={s.receivedDetails}>
            <View style={s.requesterRow}>
              <Avatar name={requesterName ?? COMMUNITY_MEMBER} photoUrl={requesterPhotoUrl ?? undefined} size={36} />
              <View style={s.requesterInfo}>
                <Text style={s.meta}>Pessoa interessada: {requesterName ?? COMMUNITY_MEMBER}</Text>
              </View>
            </View>
            {initialMessage ? (
              <View style={s.proposalMessage}>
                <View style={s.proposalMessageHeading}>
                  <AppIcon name="chat" size={16} color={colors.action} />
                  <Text style={s.proposalMessageLabel}>Mensagem da proposta</Text>
                </View>
                <Text style={s.proposalMessageText}>{initialMessage}</Text>
              </View>
            ) : null}
            {offeredBook ? (
              <View style={s.offeredBookCard}>
                <BookCover
                  id={offeredBook.id}
                  title={offeredBook.title}
                  photoUrl={offeredBook.photoUrl}
                  variant="list"
                  width={42}
                />
                <View style={s.offeredBookInfo}>
                  <Text style={s.offeredBookLabel}>Livro oferecido em troca</Text>
                  <Text style={s.offeredBookTitle} numberOfLines={2}>{offeredBook.title}</Text>
                  <Text style={s.offeredBookAuthor} numberOfLines={1}>{offeredBook.author}</Text>
                </View>
                <Tag variant={offeredBook.modality} />
              </View>
            ) : null}
            {request.status === "pending" ? (
              <>
                <View style={s.hintBox}>
                  <Text style={s.hintText}>
                    Confira a mensagem e o livro oferecido, se houver. Ao aceitar, o anúncio fica reservado para vocês combinarem o encontro.
                  </Text>
                </View>
                <View style={s.pendingActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Aceitar"
                    accessibilityHint="Aceita o pedido e reserva este anúncio."
                    accessibilityState={{ disabled: busy, busy }}
                    disabled={busy}
                    onPress={() => void handleResponse(request.id, "accept")}
                    style={withPress([s.primary, s.fullWidthAction])}
                  >
                    <AppIcon name="check" size={18} color={colors.surface} />
                    <Text style={s.primaryText}>{busy ? "Respondendo…" : "Aceitar"}</Text>
                  </Pressable>
                  <View style={s.pendingSecondaryActions}>
                    {guardedOpenChat ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Conversar com ${requesterName ?? COMMUNITY_MEMBER}`}
                        onPress={() => guardedOpenChat(request.id)}
                        style={withPress([s.chatButton, s.flexAction])}
                      >
                        <AppIcon name="chat" size={18} color={colors.m3.onSecondaryContainer} />
                        <Text style={s.chatButtonText}>Conversar</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Recusar"
                      accessibilityState={{ disabled: busy, busy }}
                      disabled={busy}
                      onPress={() => void handleResponse(request.id, "reject")}
                      style={withPress([s.secondary, guardedOpenChat ? s.flexAction : s.fullWidthAction])}
                    >
                      <Text style={s.secondaryText}>Recusar</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            ) : null}
            {request.status === "accepted" ? (
              <View style={s.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ver detalhes do encontro"
                  onPress={() => guardedNavigateToNegotiationDetail?.(request.id)}
                  style={withPress(s.primary)}
                >
                  <Text style={s.primaryText}>Ver detalhes do encontro</Text>
                </Pressable>
                {onOpenChat ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Conversar com ${requesterName ?? COMMUNITY_MEMBER}`}
                    onPress={() => onOpenChat(request.id)}
                    style={withPress(s.chatButton)}
                  >
                    <AppIcon name="chat" size={18} color={colors.m3.onSecondaryContainer} />
                    <Text style={s.chatButtonText}>Conversar</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {state.respondErrorId === request.id ? (
              <Text accessibilityRole="alert" style={s.error}>{state.respondError}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

export type ReceivedRequestsScreenProps = {
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onNavigateToNegotiationDetail?: (requestId: string) => void;
  onOpenChat?: (requestId: string) => void;
};

export default function ReceivedRequestsScreen({
  onBack,
  onRequireSignIn,
  onNavigateToNegotiationDetail,
  onOpenChat,
}: ReceivedRequestsScreenProps = {}) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return (
    <ReceivedRequests
      sessionUserId={authState.user.id}
      onBack={onBack}
      onNavigateToNegotiationDetail={onNavigateToNegotiationDetail}
      onOpenChat={onOpenChat}
    />
  );
}
