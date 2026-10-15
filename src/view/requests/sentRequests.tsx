import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useSentRequestsViewModel } from "@/viewmodel/useSentRequestsViewModel";
import { RequestListLayout, requestStyles as s } from "@/view/requests/requestListLayout";

export type SentRequestsProps = {
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToNegotiationDetail?: (requestId: string) => void;
};

export function SentRequests({
  sessionUserId,
  onBack,
  onNavigateToNegotiationDetail,
}: SentRequestsProps) {
  const [state, actions] = useSentRequestsViewModel(sessionUserId);

  return (
    <RequestListLayout
      title="Meus pedidos"
      emptyText="Você ainda não solicitou nenhuma negociação."
      items={state.items}
      loading={state.loading}
      error={state.error}
      onRetry={() => void actions.reload()}
      onBack={onBack}
      renderExtra={({ request }) =>
        request.status === "accepted" ? (
          <View style={s.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onNavigateToNegotiationDetail?.(request.id)}
              style={s.primary}
            >
              <Text style={s.primaryText}>Ver detalhes do encontro</Text>
            </Pressable>
          </View>
        ) : null
      }
    />
  );
}

export type SentRequestsScreenProps = {
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onNavigateToNegotiationDetail?: (requestId: string) => void;
};

export default function SentRequestsScreen({
  onBack,
  onRequireSignIn,
  onNavigateToNegotiationDetail,
}: SentRequestsScreenProps = {}) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return (
    <SentRequests
      sessionUserId={authState.user.id}
      onBack={onBack}
      onNavigateToNegotiationDetail={onNavigateToNegotiationDetail}
    />
  );
}
