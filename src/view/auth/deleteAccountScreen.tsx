import { makeAuthViewModel } from "@/di/container";
import DeleteAccount from "@/view/auth/deleteAccount";
import { useHydrated } from "@/view/useHydrated";

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
  const hydrated = useHydrated();

  return (
    <DeleteAccount
      sessionUserId={authState.user?.id ?? null}
      // `!hydrated` mantém a primeira renderização do cliente igual ao HTML estático (Spec 136).
      sessionLoading={!authState.user && (!hydrated || authState.loading)}
      onBack={onBack}
      onEditProfile={onEditProfile}
      onAccountDeleted={onAccountDeleted}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}
