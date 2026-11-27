import { useEffect } from "react";
import { makeAuthViewModel } from "@/di/container";
import ManageListing from "@/view/listings/manageListing";

export type ManageListingScreenProps = {
  bookId: string;
  focusKey?: number;
  onEdit?: (bookId: string) => void;
  onViewPublicListing?: (bookId: string) => void;
  onOpenChat?: (requestId: string) => void;
  onRemoved?: () => void;
  onBack?: () => void;
  onRequireSignIn?: () => void;
};

export default function ManageListingScreen({
  bookId,
  focusKey,
  onEdit,
  onViewPublicListing,
  onOpenChat,
  onRemoved,
  onBack,
  onRequireSignIn,
}: ManageListingScreenProps) {
  const [authState] = makeAuthViewModel();

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
      focusKey={focusKey}
      onEdit={onEdit}
      onViewPublicListing={onViewPublicListing}
      onOpenChat={onOpenChat}
      onRemoved={onRemoved}
      onBack={onBack}
    />
  );
}
