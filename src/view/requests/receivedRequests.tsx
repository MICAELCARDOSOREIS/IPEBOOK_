import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { RequestListLayout, createRequestStyles } from "@/view/requests/requestListLayout";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon } from "@/view/components/AppIcon";

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
  const { colors } = useTheme();
  const s = useMemo(() => createRequestStyles(colors), [colors]);

  return (
    <RequestListLayout
      title="Pedidos recebidos"
      emptyText="Você ainda não recebeu pedidos para os seus anúncios."
      items={state.items}
      loading={state.loading}
      error={state.error}
      onRetry={() => void actions.reload()}
      onBack={onBack}
      renderExtra={(item) => {
        const { request, requesterName, requesterPhotoUrl } = item;
        const busy = state.respondingId === request.id;
        return (
          <View>
            <View style={s.requesterRow}>
              <Avatar name={requesterName ?? COMMUNITY_MEMBER} photoUrl={requesterPhotoUrl ?? undefined} size={36} />
              <View style={s.requesterInfo}>
                <Text style={s.meta}>Pessoa interessada: {requesterName ?? COMMUNITY_MEMBER}</Text>
              </View>
            </View>
            {request.status === "pending" ? (
              <>
                <View style={s.hintBox}>
                  <Text style={s.hintText}>
                    Ao aceitar, seu anúncio fica Reservado e vocês combinam o encontro.
                  </Text>
                </View>
                <View style={s.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Aceitar"
                    accessibilityState={{ disabled: busy }}
                    disabled={busy}
                    onPress={() => void actions.accept(request.id)}
                    style={withPress(s.primary)}
                  >
                    <Text style={s.primaryText}>Aceitar</Text>
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
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Recusar"
                    accessibilityState={{ disabled: busy }}
                    disabled={busy}
                    onPress={() => void actions.reject(request.id)}
                    style={withPress(s.secondary)}
                  >
                    <Text style={s.secondaryText}>Recusar</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
            {request.status === "accepted" ? (
              <View style={s.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ver detalhes do encontro"
                  onPress={() => onNavigateToNegotiationDetail?.(request.id)}
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
