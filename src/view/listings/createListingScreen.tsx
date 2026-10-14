import { useEffect } from "react";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import CreateListing from "@/view/listings/createListing";

export type CreateListingScreenProps = {
  onCreated?: () => void;
  onCancel?: () => void;
  onRequireSignIn?: () => void;
};

export default function CreateListingScreen({
  onCreated,
  onCancel,
  onRequireSignIn,
}: CreateListingScreenProps = {}) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;

  return (
    <CreateListing sessionUserId={authState.user.id} onCreated={onCreated} onCancel={onCancel} />
  );
}
