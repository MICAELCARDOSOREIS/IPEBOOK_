import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import ReportListingScreen from "@/view/listings/reportListingScreen";

export default function DenunciarLivro() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ReportListingScreen
        listingId={id}
        onBack={() => backOnce()}
        onNavigateToLogin={() => pushOnce("/entrar")}
      />
    </RequireAuth>
  );
}
