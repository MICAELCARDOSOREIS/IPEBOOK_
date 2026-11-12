import { makeAuthViewModel, makeBookDetailViewModel } from "@/di/container";
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
  const [authState] = makeAuthViewModel();
  const [bookState] = makeBookDetailViewModel(listingId);

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
