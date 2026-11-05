import { makeAuthViewModel } from "@/di/container";
import DeleteAccount from "@/view/auth/deleteAccount";

export type DeleteAccountScreenProps = {
  onBack: () => void;
  onAccountDeleted: () => void;
  onNavigateToLogin?: () => void;
  onEditProfile?: () => void;
};

export default function DeleteAccountScreen({
  onBack,
  onAccountDeleted,
  onNavigateToLogin,
  onEditProfile,
}: DeleteAccountScreenProps) {
  const [authState] = makeAuthViewModel();

  return (
    <DeleteAccount
      sessionUserId={authState.user?.id ?? null}
      onBack={onBack}
      onEditProfile={onEditProfile}
      onAccountDeleted={onAccountDeleted}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}
