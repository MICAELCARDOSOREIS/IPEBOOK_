import { useEffect } from "react";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import EditListing from "@/view/listings/editListing";

export type EditListingScreenProps = {
  bookId: string;
  onSaved?: () => void;
  onCancel?: () => void;
  onRequireSignIn?: () => void;
};

export default function EditListingScreen({
  bookId,
  onSaved,
  onCancel,
  onRequireSignIn,
}: EditListingScreenProps) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;

  return (
    <EditListing
      bookId={bookId}
      sessionUserId={authState.user.id}
      onSaved={onSaved}
      onCancel={onCancel}
    />
  );
}
