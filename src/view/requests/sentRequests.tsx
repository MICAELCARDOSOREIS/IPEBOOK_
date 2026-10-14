import { useEffect } from "react";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useSentRequestsViewModel } from "@/viewmodel/useSentRequestsViewModel";
import { RequestListLayout } from "@/view/requests/requestListLayout";

export type SentRequestsProps = { sessionUserId: string; onBack?: () => void };

export function SentRequests({ sessionUserId, onBack }: SentRequestsProps) {
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
      renderExtra={() => null}
    />
  );
}

export type SentRequestsScreenProps = { onBack?: () => void; onRequireSignIn?: () => void };

export default function SentRequestsScreen({ onBack, onRequireSignIn }: SentRequestsScreenProps = {}) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return <SentRequests sessionUserId={authState.user.id} onBack={onBack} />;
}
