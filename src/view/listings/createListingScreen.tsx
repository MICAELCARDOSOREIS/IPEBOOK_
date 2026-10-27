import { useEffect } from "react";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import CreateListing from "@/view/listings/createListing";

export type CreateListingScreenProps = {
  onCreated?: () => void;
  onCancel?: () => void;
  onRequireSignIn?: () => void;
  onViewMyListings?: () => void;
  onGoHome?: () => void;
  /** Id do rascunho a retomar (Spec 017); a rota fornece lendo o parâmetro de navegação. */
  initialDraftId?: string;
};

export default function CreateListingScreen({
  onCreated,
  onCancel,
  onRequireSignIn,
  onViewMyListings,
  onGoHome,
  initialDraftId,
}: CreateListingScreenProps = {}) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;

  return (
    <CreateListing
      sessionUserId={authState.user.id}
      initialDraftId={initialDraftId}
      onCreated={onCreated}
      onCancel={onCancel}
      onViewMyListings={onViewMyListings}
      onGoHome={onGoHome}
    />
  );
}
