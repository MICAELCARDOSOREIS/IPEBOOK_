import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import ReportListing from "@/view/listings/reportListing";

export type ReportListingScreenProps = {
  listingId: string;
  onBack: () => void;
  onNavigateToLogin: () => void;
};

export default function ReportListingScreen({
  listingId,
  onBack,
  onNavigateToLogin,
}: ReportListingScreenProps) {
  const [authState] = useAuthViewModel();
  const [bookState] = useBookDetailViewModel(listingId);

  return (
    <ReportListing
      listingId={listingId}
      listingTitle={bookState.book?.title}
      sessionUserId={authState.user?.id ?? null}
      onBack={onBack}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}
