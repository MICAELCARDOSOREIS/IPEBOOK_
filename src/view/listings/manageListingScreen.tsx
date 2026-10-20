import { useEffect } from "react";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import ManageListing from "@/view/listings/manageListing";

export type ManageListingScreenProps = {
  bookId: string;
  onEdit?: (bookId: string) => void;
  onRemoved?: () => void;
  onBack?: () => void;
  onRequireSignIn?: () => void;
};

export default function ManageListingScreen({
  bookId,
  onEdit,
  onRemoved,
  onBack,
  onRequireSignIn,
}: ManageListingScreenProps) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;

  return (
    <ManageListing
      bookId={bookId}
      sessionUserId={authState.user.id}
      onEdit={onEdit}
      onRemoved={onRemoved}
      onBack={onBack}
    />
  );
}
