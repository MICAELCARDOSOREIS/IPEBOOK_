import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useSentRequestsViewModel } from "@/viewmodel/useSentRequestsViewModel";
import { RequestListLayout, createRequestStyles } from "@/view/requests/requestListLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useTheme } from "@/view/theme/ThemeProvider";

import { withPress } from "@/view/pressFeedback";
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
  const { colors } = useTheme();
  const s = useMemo(() => createRequestStyles(colors), [colors]);

  const guardedBack = onBack ? useGuardedPress(onBack) : undefined;
  const guardedNavigateToNegotiationDetail = onNavigateToNegotiationDetail
    ? useGuardedPress((id: string) => onNavigateToNegotiationDetail(id))
    : undefined;

  return (
    <RequestListLayout
      title="Meus pedidos"
      emptyText="Você ainda não solicitou nenhuma negociação."
      items={state.items}
      loading={state.loading}
      error={state.error}
      onRetry={() => void actions.reload()}
      onBack={guardedBack}
      renderExtra={({ request }) =>
        request.status === "accepted" ? (
          <View style={s.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver detalhes do encontro"
              onPress={() => guardedNavigateToNegotiationDetail?.(request.id)}
              style={withPress(s.primary)}
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

  const guardedBack = onBack ? useGuardedPress(onBack) : undefined;
  const guardedRequireSignIn = onRequireSignIn ? useGuardedPress(onRequireSignIn) : undefined;
  const guardedNavigateToNegotiationDetail = onNavigateToNegotiationDetail
    ? useGuardedPress((id: string) => onNavigateToNegotiationDetail(id))
    : undefined;

  useEffect(() => {
    if (!authState.loading && !authState.user) guardedRequireSignIn?.();
  }, [authState.loading, authState.user, guardedRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return (
    <SentRequests
      sessionUserId={authState.user.id}
      onBack={guardedBack}
      onNavigateToNegotiationDetail={guardedNavigateToNegotiationDetail}
    />
  );
}
