import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import DeleteAccount from "@/view/auth/deleteAccount";

export type DeleteAccountScreenProps = {
  onBack: () => void;
  onAccountDeleted: () => void;
  onNavigateToLogin: () => void;
};

export default function DeleteAccountScreen({
  onBack,
  onAccountDeleted,
  onNavigateToLogin,
}: DeleteAccountScreenProps) {
  const [authState] = useAuthViewModel();

  return (
    <DeleteAccount
      sessionUserId={authState.user?.id ?? null}
      onBack={onBack}
      onAccountDeleted={onAccountDeleted}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}
