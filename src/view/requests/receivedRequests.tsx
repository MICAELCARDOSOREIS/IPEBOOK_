import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { RequestListLayout, requestStyles as s } from "@/view/requests/requestListLayout";

/** Sem perfil público, a tela não expõe o identificador interno (Spec 043, RN-02). */
export const COMMUNITY_MEMBER = "Pessoa da comunidade";

export type ReceivedRequestsProps = {
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToNegotiationDetail?: (requestId: string) => void;
};

export function ReceivedRequests({
  sessionUserId,
  onBack,
  onNavigateToNegotiationDetail,
}: ReceivedRequestsProps) {
  const [state, actions] = useReceivedRequestsViewModel(sessionUserId);

  return (
    <RequestListLayout
      title="Pedidos recebidos"
      emptyText="Você ainda não recebeu pedidos para os seus anúncios."
      items={state.items}
      loading={state.loading}
      error={state.error}
      onRetry={() => void actions.reload()}
      onBack={onBack}
      renderExtra={({ request, requesterName }) => {
        const busy = state.respondingId === request.id;
        return (
          <View>
            <Text style={s.meta}>Pessoa interessada: {requesterName ?? COMMUNITY_MEMBER}</Text>
            {request.status === "pending" ? (
              <>
                <Text style={s.meta}>
                  Ao aceitar, seu anúncio fica Reservado e vocês combinam o encontro.
                </Text>
                <View style={s.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: busy }}
                    disabled={busy}
                    onPress={() => void actions.accept(request.id)}
                    style={s.primary}
                  >
                    <Text style={s.primaryText}>Aceitar</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: busy }}
                    disabled={busy}
                    onPress={() => void actions.reject(request.id)}
                    style={s.secondary}
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
                  onPress={() => onNavigateToNegotiationDetail?.(request.id)}
                  style={s.primary}
                >
                  <Text style={s.primaryText}>Ver detalhes do encontro</Text>
                </Pressable>
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
};

export default function ReceivedRequestsScreen({
  onBack,
  onRequireSignIn,
  onNavigateToNegotiationDetail,
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
    />
  );
}
